"use client";

import { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Plus,
  X,
  Pencil,
  Trash2,
  Search,
  Filter,
  Wallet,
  PiggyBank,
  BarChart3,
} from 'lucide-react';
import { useLifeOSStore } from '@/lib/store';
import { useThemeStore } from '@/lib/theme-store';
import { Transaction, FinancialGoal } from '@/lib/types';
import { safeAverage, safeCurrency, safePercentage } from '@/lib/calculations';

export default function FinancePage() {
  const { locale } = useThemeStore();
  const financialGoals = useLifeOSStore((s) => s.financialGoals);
  const transactions = useLifeOSStore((s) => s.transactions);
  const addTransaction = useLifeOSStore((s) => s.addTransaction);
  const updateTransaction = useLifeOSStore((s) => s.updateTransaction);
  const removeTransaction = useLifeOSStore((s) => s.removeTransaction);
  const addFinancialGoal = useLifeOSStore((s) => s.addFinancialGoal);
  const updateFinancialGoal = useLifeOSStore((s) => s.updateFinancialGoal);
  const removeFinancialGoal = useLifeOSStore((s) => s.removeFinancialGoal);

  const [modal, setModal] = useState<'tx' | 'goal' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [viewFilter, setViewFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Transaction form state
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txCategory, setTxCategory] = useState('personal');

  // Goal form state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('0');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [goalColor, setGoalColor] = useState('#6366f1');

  const currencyLocale = locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-ES' : 'en-US';
  const currencyCode = locale === 'pt' ? 'BRL' : 'USD';
  const income = transactions.filter((t) => t.type === 'income').reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const expenses = transactions.filter((t) => t.type === 'expense').reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const balance = income - expenses;
  const savingsRate = income > 0 ? safePercentage(balance, income) : 0;
  const averageTransaction = safeAverage(transactions.map((t) => Math.abs(t.amount)));
  const goalProgressAverage = safeAverage(financialGoals.map((goal) => safePercentage(goal.current, goal.target)));

  const expenseCategoryTotals = transactions
    .filter((t) => t.type === 'expense')
    .reduce<Record<string, number>>((acc, transaction) => {
      const key = transaction.category.trim().toLowerCase() || 'uncategorized';
      acc[key] = (acc[key] ?? 0) + Math.abs(transaction.amount);
      return acc;
    }, {});

  const topExpenseCategory = Object.entries(expenseCategoryTotals).sort((a, b) => b[1] - a[1])[0];
  const categories = Array.from(new Set(transactions.map((t) => t.category).filter(Boolean))).sort();

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesQuery = query.trim() === ''
      || [transaction.title, transaction.category, transaction.notes ?? '']
        .join(' ')
        .toLowerCase()
        .includes(query.trim().toLowerCase());

    const matchesType = viewFilter === 'all' || transaction.type === viewFilter;
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;

    return matchesQuery && matchesType && matchesCategory;
  });

  const resetTxForm = () => {
    setTxTitle('');
    setTxAmount('');
    setTxType('expense');
    setTxCategory('personal');
    setEditingId(null);
  };

  const resetGoalForm = () => {
    setGoalTitle('');
    setGoalTarget('');
    setGoalCurrent('0');
    setGoalDeadline('');
    setGoalColor('#6366f1');
    setEditingId(null);
  };

  const handleEditTx = (e: React.MouseEvent, tx: Transaction) => {
    e.stopPropagation();
    setTxTitle(tx.title);
    setTxAmount(tx.amount.toString());
    setTxType(tx.type);
    setTxCategory(tx.category);
    setEditingId(tx.id);
    setModal('tx');
  };

  const handleEditGoal = (e: React.MouseEvent, goal: FinancialGoal) => {
    e.stopPropagation();
    setGoalTitle(goal.title);
    setGoalTarget(goal.target.toString());
    setGoalCurrent(goal.current.toString());
    setGoalDeadline(goal.deadline);
    setGoalColor(goal.color);
    setEditingId(goal.id);
    setModal('goal');
  };

  const handleTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateTransaction(editingId, { title: txTitle, amount: Number(txAmount), type: txType, category: txCategory });
    } else {
      addTransaction({ title: txTitle, amount: Number(txAmount), type: txType, category: txCategory });
    }
    resetTxForm();
    setModal(null);
  };

  const handleGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateFinancialGoal(editingId, { title: goalTitle, target: Number(goalTarget), current: Number(goalCurrent), deadline: goalDeadline, color: goalColor });
    } else {
      addFinancialGoal({ title: goalTitle, target: Number(goalTarget), current: Number(goalCurrent), deadline: goalDeadline, category: 'savings', color: goalColor });
    }
    resetGoalForm();
    setModal(null);
  };

  return (
    <div className="min-h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-2">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--fg-base)]">
              {locale === 'pt' ? 'Finanças' : locale === 'es' ? 'Finanzas' : 'Finance'}
            </h1>
            <p className="text-[var(--fg-subtle)] max-w-2xl">
              {locale === 'pt'
                ? 'Monitore saldo, receitas, despesas e conquistas financeiras com uma visão mais prática.'
                : locale === 'es'
                  ? 'Monitorea saldo, ingresos, gastos y logros financieros con una vista más práctica.'
                  : 'Track balance, income, expenses, and financial milestones with a more actionable view.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { resetGoalForm(); setModal('goal'); }} className="ui-button-soft text-[var(--fg-muted)] hover:text-[var(--fg-base)] bg-[var(--bg-elevated)]/50 hover:bg-[var(--bg-elevated)]">
              <Plus size={16} /> {locale === 'pt' ? 'Nova conquista' : locale === 'es' ? 'Nuevo logro' : 'New milestone'}
            </button>
            <button onClick={() => { resetTxForm(); setModal('tx'); }} className="ui-button-primary">
              <Plus size={16} /> {locale === 'pt' ? 'Transação' : locale === 'es' ? 'Transacción' : 'Transaction'}
            </button>
          </div>
        </header>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          <div className="ui-card p-6 bg-emerald-950/20 ring-emerald-500/20">
            <p className="text-sm text-emerald-400 font-medium mb-1">{locale === 'pt' ? 'Saldo' : locale === 'es' ? 'Saldo' : 'Balance'}</p>
            <h2 className="text-4xl font-bold text-[var(--fg-base)] mb-1">{safeCurrency(balance, currencyLocale, currencyCode)}</h2>
            <div className="flex items-center gap-2 text-xs text-emerald-500">
              <TrendingUp size={14} /> {locale === 'pt' ? 'Período rastreado' : locale === 'es' ? 'Período rastreado' : 'Tracked period'}
            </div>
          </div>
          <div className="ui-card p-6">
            <p className="text-sm text-[var(--fg-subtle)] font-medium mb-1">{locale === 'pt' ? 'Receita' : locale === 'es' ? 'Ingresos' : 'Income'}</p>
            <h2 className="text-3xl font-bold text-emerald-400">{safeCurrency(income, currencyLocale, currencyCode)}</h2>
          </div>
          <div className="ui-card p-6">
            <p className="text-sm text-[var(--fg-subtle)] font-medium mb-1">{locale === 'pt' ? 'Despesas' : locale === 'es' ? 'Gastos' : 'Expenses'}</p>
            <h2 className="text-3xl font-bold text-rose-400">{safeCurrency(expenses, currencyLocale, currencyCode)}</h2>
          </div>
          <div className="ui-card p-6">
            <p className="text-sm text-[var(--fg-subtle)] font-medium mb-1">{locale === 'pt' ? 'Taxa de economia' : locale === 'es' ? 'Tasa de ahorro' : 'Savings rate'}</p>
            <h2 className="text-3xl font-bold text-[var(--fg-base)]">{savingsRate}%</h2>
            <p className="text-xs text-[var(--fg-subtle)] mt-2">{locale === 'pt' ? 'Saldo ÷ receita' : locale === 'es' ? 'Saldo ÷ ingresos' : 'Balance ÷ income'}</p>
          </div>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="ui-card p-5 flex items-start gap-4 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <Wallet size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-[var(--fg-subtle)] mb-1">{locale === 'pt' ? 'Média por transação' : locale === 'es' ? 'Promedio por transacción' : 'Average transaction'}</p>
              <p className="text-xl font-semibold text-[var(--fg-base)]">{safeCurrency(averageTransaction, currencyLocale, currencyCode)}</p>
            </div>
          </div>
          <div className="ui-card p-5 flex items-start gap-4 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <PiggyBank size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-[var(--fg-subtle)] mb-1">{locale === 'pt' ? 'Conquistas financeiras' : locale === 'es' ? 'Logros financieros' : 'Financial milestones'}</p>
              <p className="text-xl font-semibold text-[var(--fg-base)]">{goalProgressAverage}%</p>
            </div>
          </div>
          <div className="ui-card p-5 flex items-start gap-4 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <BarChart3 size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-[var(--fg-subtle)] mb-1">{locale === 'pt' ? 'Maior gasto' : locale === 'es' ? 'Mayor gasto' : 'Top expense'}</p>
              <p className="text-xl font-semibold text-[var(--fg-base)] truncate">
                {topExpenseCategory ? topExpenseCategory[0] : (locale === 'pt' ? 'Nenhum ainda' : locale === 'es' ? 'Ninguno aún' : 'None yet')}
              </p>
              <p className="text-xs text-[var(--fg-subtle)] mt-1">{topExpenseCategory ? safeCurrency(topExpenseCategory[1], currencyLocale, currencyCode) : '—'}</p>
            </div>
          </div>
        </div>

        {/* Goals */}
        <div className="ui-card p-6">
          <h3 className="text-lg font-semibold text-[var(--fg-base)] mb-4">{locale === 'pt' ? 'Conquistas financeiras' : locale === 'es' ? 'Logros financieros' : 'Financial milestones'}</h3>
          <div className="space-y-5">
            {financialGoals.map((goal) => {
              const perc = safePercentage(goal.current, goal.target);
              return (
                <div key={goal.id}>
                  <div className="flex justify-between items-center mb-1 group relative gap-3">
                    <span className="text-sm font-medium text-[var(--fg-muted)] truncate">{goal.title}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-medium text-[var(--fg-base)]">
                        {safeCurrency(goal.current, currencyLocale, currencyCode)} <span className="text-[var(--fg-subtle)] font-normal">/ {safeCurrency(goal.target, currencyLocale, currencyCode)}</span>
                      </span>
                      <div className="hidden group-hover:flex gap-1 ml-2">
                        <button onClick={(e) => handleEditGoal(e, goal)} className="p-1 rounded-md hover:bg-[var(--bg-surface)] text-[var(--fg-subtle)] hover:text-blue-400 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => removeFinancialGoal(goal.id)} className="p-1 rounded-md hover:bg-[var(--bg-surface)] text-[var(--fg-subtle)] hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-2 gap-3">
                    <span className="text-xs text-[var(--fg-subtle)]">
                      {locale === 'pt' ? 'Prazo' : locale === 'es' ? 'Fecha límite' : 'Deadline'}: {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                    <span className="text-xs font-bold" style={{ color: goal.color }}>{perc}%</span>
                  </div>
                  <div className="h-2 w-full bg-[var(--border)] rounded-full overflow-hidden">
                    <div className="h-full transition-all" style={{ width: `${perc}%`, backgroundColor: goal.color }} />
                  </div>
                </div>
              );
            })}

            {financialGoals.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[var(--border)] p-6 text-sm text-[var(--fg-subtle)]">
                {locale === 'pt'
                  ? 'Adicione sua primeira conquista financeira para começar a acompanhar progresso real.'
                  : locale === 'es'
                    ? 'Agrega tu primer logro financiero para empezar a seguir el progreso real.'
                    : 'Add your first financial milestone to start tracking real progress.'}
              </div>
            )}
          </div>
        </div>

        {/* Transactions */}
        <div className="ui-card p-6 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--fg-base)] mb-1">{locale === 'pt' ? 'Transações' : locale === 'es' ? 'Transacciones' : 'Transactions'}</h3>
              <p className="text-sm text-[var(--fg-subtle)]">{locale === 'pt' ? 'Pesquise, filtre e revise o fluxo de caixa com rapidez.' : locale === 'es' ? 'Busca, filtra y revisa el flujo de caja rápidamente.' : 'Search, filter, and review cash flow quickly.'}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', 'income', 'expense'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setViewFilter(type)}
                  className="px-3 py-2 rounded-xl text-xs font-medium transition-colors border"
                  style={{
                    backgroundColor: viewFilter === type ? 'var(--bg-elevated)' : 'transparent',
                    borderColor: 'var(--border)',
                    color: viewFilter === type ? 'var(--fg-base)' : 'var(--fg-muted)'
                  }}
                >
                  {type === 'all' ? (locale === 'pt' ? 'Tudo' : locale === 'es' ? 'Todo' : 'All') : type === 'income' ? (locale === 'pt' ? 'Receitas' : locale === 'es' ? 'Ingresos' : 'Income') : (locale === 'pt' ? 'Despesas' : locale === 'es' ? 'Gastos' : 'Expenses')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr] gap-3">
            <label className="relative block">
              <span className="sr-only">Search</span>
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-subtle)]" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={locale === 'pt' ? 'Pesquisar transações' : locale === 'es' ? 'Buscar transacciones' : 'Search transactions'}
                className="ui-input pl-10"
              />
            </label>
            <label className="relative block">
              <span className="sr-only">Filter</span>
              <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-subtle)]" />
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="ui-input pl-10">
                <option value="all">{locale === 'pt' ? 'Todas as categorias' : locale === 'es' ? 'Todas las categorías' : 'All categories'}</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-2">
            {filteredTransactions.slice(0, 20).map((transaction) => (
              <div key={transaction.id} className="group flex items-center justify-between gap-4 p-3 bg-[var(--bg-surface)] ring-1 ring-inset ring-[var(--border)] rounded-xl hover:bg-[var(--bg-elevated)]/50 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${transaction.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {transaction.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--fg-base)] truncate">{transaction.title}</p>
                    <p className="text-xs text-[var(--fg-subtle)] capitalize truncate">{transaction.category} • {new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`font-semibold ${transaction.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{safeCurrency(Math.abs(transaction.amount), currencyLocale, currencyCode)}
                  </span>
                  <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => handleEditTx(e, transaction)} className="p-1.5 rounded-md hover:bg-[var(--bg-surface)] text-[var(--fg-subtle)] hover:text-blue-400 transition-colors" aria-label={locale === 'pt' ? 'Editar transação' : locale === 'es' ? 'Editar transacción' : 'Edit transaction'}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => removeTransaction(transaction.id)} className="p-1.5 rounded-md hover:bg-[var(--bg-surface)] text-[var(--fg-subtle)] hover:text-red-400 transition-colors" aria-label={locale === 'pt' ? 'Excluir transação' : locale === 'es' ? 'Eliminar transacción' : 'Delete transaction'}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredTransactions.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-sm text-[var(--fg-subtle)] text-center">
                {locale === 'pt'
                  ? 'Nenhuma transação encontrada com esses filtros.'
                  : locale === 'es'
                    ? 'No se encontraron transacciones con estos filtros.'
                    : 'No transactions match the current filters.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      {modal === 'tx' && (
        <div className="ui-modal-overlay">
          <div className="ui-modal-content space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--fg-base)]">
                {editingId ? (locale === 'pt' ? 'Editar transação' : locale === 'es' ? 'Editar transacción' : 'Edit Transaction') : (locale === 'pt' ? 'Nova transação' : locale === 'es' ? 'Nueva transacción' : 'New Transaction')}
              </h2>
              <button onClick={() => { resetTxForm(); setModal(null); }}><X size={20} className="text-[var(--fg-subtle)] hover:text-[var(--fg-base)]" /></button>
            </div>
            <form onSubmit={handleTx} className="space-y-4">
              <div>
                <label className="ui-label">{locale === 'pt' ? 'Descrição' : locale === 'es' ? 'Descripción' : 'Description'}</label>
                <input type="text" required value={txTitle} onChange={e => setTxTitle(e.target.value)} placeholder="e.g. Salary" className="ui-input" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="ui-label">{locale === 'pt' ? 'Valor (R$)' : locale === 'es' ? 'Monto ($)' : 'Amount ($)'}</label>
                  <input type="number" required min={0} value={txAmount} onChange={e => setTxAmount(e.target.value)} className="ui-input" />
                </div>
                <div>
                  <label className="ui-label">{locale === 'pt' ? 'Tipo' : locale === 'es' ? 'Tipo' : 'Type'}</label>
                  <select value={txType} onChange={(e: any) => setTxType(e.target.value)} className="ui-input">
                    <option value="income">{locale === 'pt' ? 'Receita' : locale === 'es' ? 'Ingresos' : 'Income'}</option>
                    <option value="expense">{locale === 'pt' ? 'Despesa' : locale === 'es' ? 'Gasto' : 'Expense'}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="ui-label">{locale === 'pt' ? 'Categoria' : locale === 'es' ? 'Categoría' : 'Category'}</label>
                <input type="text" value={txCategory} onChange={e => setTxCategory(e.target.value)} placeholder="e.g. food, travel, work" className="ui-input" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => { resetTxForm(); setModal(null); }} className="ui-button-ghost">{locale === 'pt' ? 'Cancelar' : locale === 'es' ? 'Cancelar' : 'Cancel'}</button>
                <button type="submit" className="ui-button-primary">{editingId ? (locale === 'pt' ? 'Salvar' : locale === 'es' ? 'Guardar' : 'Save') : (locale === 'pt' ? 'Adicionar transação' : locale === 'es' ? 'Agregar transacción' : 'Add Transaction')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {modal === 'goal' && (
        <div className="ui-modal-overlay">
          <div className="ui-modal-content space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--fg-base)]">
                {editingId ? (locale === 'pt' ? 'Editar conquista financeira' : locale === 'es' ? 'Editar logro financiero' : 'Edit Financial Milestone') : (locale === 'pt' ? 'Nova conquista financeira' : locale === 'es' ? 'Nuevo logro financiero' : 'New Financial Milestone')}
              </h2>
              <button onClick={() => { resetGoalForm(); setModal(null); }}><X size={20} className="text-[var(--fg-subtle)] hover:text-[var(--fg-base)]" /></button>
            </div>
            <form onSubmit={handleGoal} className="space-y-4">
              <div>
                <label className="ui-label">{locale === 'pt' ? 'Nome da conquista' : locale === 'es' ? 'Nombre del logro' : 'Milestone Name'}</label>
                <input type="text" required value={goalTitle} onChange={e => setGoalTitle(e.target.value)} placeholder={locale === 'pt' ? 'Ex.: Reserva de emergência' : locale === 'es' ? 'Ej.: Fondo de emergencia' : 'e.g. Emergency fund'} className="ui-input" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="ui-label">{locale === 'pt' ? 'Objetivo (R$)' : locale === 'es' ? 'Objetivo ($)' : 'Target ($)'}</label>
                  <input type="number" required min={1} value={goalTarget} onChange={e => setGoalTarget(e.target.value)} className="ui-input" />
                </div>
                <div>
                  <label className="ui-label">{locale === 'pt' ? 'Atual (R$)' : locale === 'es' ? 'Actual ($)' : 'Current ($)'}</label>
                  <input type="number" min={0} value={goalCurrent} onChange={e => setGoalCurrent(e.target.value)} className="ui-input" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="ui-label">{locale === 'pt' ? 'Prazo' : locale === 'es' ? 'Fecha límite' : 'Deadline'}</label>
                  <input type="date" required value={goalDeadline} onChange={e => setGoalDeadline(e.target.value)} className="ui-input" />
                </div>
                <div>
                  <label className="ui-label">{locale === 'pt' ? 'Cor' : locale === 'es' ? 'Color' : 'Color'}</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={goalColor} onChange={e => setGoalColor(e.target.value)} className="w-10 h-9 rounded-lg border border-zinc-800 bg-transparent cursor-pointer" />
                    <span className="text-[var(--fg-subtle)] text-xs">{goalColor}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => { resetGoalForm(); setModal(null); }} className="ui-button-ghost">{locale === 'pt' ? 'Cancelar' : locale === 'es' ? 'Cancelar' : 'Cancel'}</button>
                <button type="submit" className="ui-button-primary">{editingId ? (locale === 'pt' ? 'Salvar' : locale === 'es' ? 'Guardar' : 'Save') : (locale === 'pt' ? 'Criar conquista' : locale === 'es' ? 'Crear logro' : 'Create Milestone')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
