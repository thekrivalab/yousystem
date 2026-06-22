"use client";

import Link from 'next/link';
import { ArrowRight, Eye, EyeOff, Trophy } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useThemeStore } from '@/lib/theme-store';

type AuthMode = 'login' | 'register';

interface AuthFormProps {
  mode: AuthMode;
  loading: boolean;
  error: string | null;
  onSubmit: (payload: { name: string; email: string; password: string }) => Promise<void>;
  onGoogleSignIn?: () => Promise<void>;
}

export const getDeviceTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

export function AuthForm({ mode, loading, error, onSubmit, onGoogleSignIn }: AuthFormProps) {
  const { locale } = useThemeStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isLogin = mode === 'login';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      name,
      email,
      password,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, var(--bg-base) 0%, color-mix(in srgb, var(--bg-surface) 70%, var(--bg-base)) 100%)' }}>
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, var(--fg-base) 0, transparent 25%), radial-gradient(circle at 80% 80%, var(--fg-base) 0, transparent 22%)' }} />

      <div className="w-full max-w-md ui-card p-8 space-y-8 backdrop-blur-md shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--fg-base)] font-bold shadow-xl">
            <Trophy size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--fg-base)]">
              {isLogin
                ? (locale === 'pt' ? 'Bem-vindo de volta ao YouSystem' : locale === 'es' ? 'Bienvenido de nuevo a YouSystem' : 'Welcome back to YouSystem')
                : (locale === 'pt' ? 'Crie sua conta YouSystem' : locale === 'es' ? 'Crea tu cuenta de YouSystem' : 'Create your YouSystem account')}
            </h1>
            <p className="text-sm text-[var(--fg-subtle)] mt-1">
              {isLogin
                ? (locale === 'pt' ? 'Entre para acessar seu painel' : locale === 'es' ? 'Inicia sesión para acceder a tu panel' : 'Sign in to access your dashboard')
                : (locale === 'pt' ? 'Comece a organizar sua vida, conquistas e viagens' : locale === 'es' ? 'Empieza a organizar tu vida, logros y viajes' : 'Start organizing your life, milestones, and travels')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--fg-subtle)] uppercase tracking-wider">
                {locale === 'pt' ? 'Nome completo' : locale === 'es' ? 'Nombre completo' : 'Full Name'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={locale === 'pt' ? 'Seu nome' : locale === 'es' ? 'Tu nombre' : 'Your name'}
                className="ui-input py-3 transition-colors placeholder:text-zinc-600"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--fg-subtle)] uppercase tracking-wider">
              {locale === 'pt' ? 'Endereço de e-mail' : locale === 'es' ? 'Correo electrónico' : 'Email Address'}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={locale === 'pt' ? 'voce@exemplo.com' : locale === 'es' ? 'tu@ejemplo.com' : 'you@example.com'}
              className="ui-input py-3 transition-colors placeholder:text-zinc-600"
            />
          </div>

          <div className="space-y-1 relative">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-[var(--fg-subtle)] uppercase tracking-wider">
                {locale === 'pt' ? 'Senha' : locale === 'es' ? 'Contraseña' : 'Password'}
              </label>
              {isLogin && (
                <button type="button" className="text-xs text-[var(--fg-muted)] hover:text-[var(--fg-base)] transition-colors">
                  {locale === 'pt' ? 'Esqueceu?' : locale === 'es' ? '¿Olvidaste?' : 'Forgot?'}
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="ui-input py-3 pr-10 transition-colors placeholder:text-zinc-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg-subtle)] hover:text-[var(--fg-muted)]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full ui-button-primary py-3 justify-center mt-6 text-sm"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-[var(--bg-base)] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? (locale === 'pt' ? 'Entrar' : locale === 'es' ? 'Iniciar sesión' : 'Sign In') : (locale === 'pt' ? 'Criar conta' : locale === 'es' ? 'Crear cuenta' : 'Create Account')}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {onGoogleSignIn && (
          <button
            type="button"
            onClick={onGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm font-medium text-[var(--fg-base)] transition-colors hover:bg-[var(--bg-elevated)]"
            disabled={loading}
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[var(--border)] text-[10px] font-bold leading-none text-[var(--fg-base)]">
              G
            </span>
            {locale === 'pt' ? 'Entrar com Google' : locale === 'es' ? 'Entrar con Google' : 'Continue with Google'}
          </button>
        )}

        <p className="text-center text-xs text-[var(--fg-subtle)] mt-4">
          {isLogin ? (locale === 'pt' ? 'Ainda não tem uma conta? ' : locale === 'es' ? '¿Todavía no tienes una cuenta? ' : "Don't have an account? ") : (locale === 'pt' ? 'Já tem uma conta? ' : locale === 'es' ? '¿Ya tienes una cuenta? ' : 'Already have an account? ')}
          <Link
            href={isLogin ? '/register' : '/login'}
            className="text-[var(--fg-base)] hover:opacity-80 font-semibold transition-colors"
          >
            {isLogin ? (locale === 'pt' ? 'Crie agora' : locale === 'es' ? 'Crea una ahora' : 'Create one now') : (locale === 'pt' ? 'Entre aqui' : locale === 'es' ? 'Inicia sesión aquí' : 'Sign in here')}
          </Link>
        </p>
      </div>
    </div>
  );
}
