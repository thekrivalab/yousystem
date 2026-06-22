import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useRoutineStore } from '../lib/routine-store';
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';

const categoryColors: Record<string, string> = {
  health:    '#34d399',
  spiritual: '#fbbf24',
  work:      '#818cf8',
  learning:  '#60a5fa',
  rest:      '#c084fc',
  social:    '#f472b6',
  personal:  '#d4d4d8',
};

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAY_TYPE_LABEL: Record<string, string> = {
  weekday: 'Segunda a Sexta',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

function isoDate(d: Date) {
  return d.toISOString().split('T')[0];
}

export default function RoutineScreen() {
  const {
    blocks, logs,
    getBlocksForDate, getLog, getDayType,
    toggleComplete, setNotes,
  } = useRoutineStore();

  const [selectedDate, setSelectedDate] = useState(isoDate(new Date()));
  const [notesDraft, setNotesDraft] = useState('');

  const dayBlocks = useMemo(() => getBlocksForDate(selectedDate), [selectedDate, blocks]);
  const log = useMemo(() => getLog(selectedDate), [selectedDate, logs]);
  const dayType = getDayType(selectedDate);
  const completedCount = dayBlocks.filter(b => log.completedIds.includes(b.id)).length;
  const totalCount = dayBlocks.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  function shiftDate(days: number) {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + days);
    setSelectedDate(isoDate(d));
  }

  const displayDate = new Date(selectedDate + 'T12:00:00');
  const isToday = selectedDate === isoDate(new Date());

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Rotina Diária</Text>
            <Text style={styles.subtitle}>{DAY_TYPE_LABEL[dayType]}</Text>
          </View>
        </View>

        {/* Date Selector */}
        <View style={styles.dateSelector}>
          <TouchableOpacity onPress={() => shiftDate(-1)} style={styles.iconButton}>
            <ChevronLeft size={24} color="#a1a1aa" />
          </TouchableOpacity>

          <View style={styles.dateCard}>
            <View>
              <Text style={styles.dateText}>
                {DAY_LABELS[displayDate.getDay()]} · {displayDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              </Text>
              {isToday && <Text style={styles.todayText}>Hoje</Text>}
            </View>
            <View style={styles.progressContainer}>
              <Text style={styles.pctText}>{pct}%</Text>
              <Text style={styles.countText}>{completedCount}/{totalCount}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => shiftDate(1)} style={styles.iconButton}>
            <ChevronRight size={24} color="#a1a1aa" />
          </TouchableOpacity>
        </View>

        {/* Blocks */}
        <View style={styles.blocksContainer}>
          {dayBlocks.length === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🕊️</Text>
              <Text style={styles.emptyTitle}>Sem blocos hoje</Text>
            </View>
          )}

          {dayBlocks.map((block) => {
            const done = log.completedIds.includes(block.id);
            return (
              <TouchableOpacity
                key={block.id}
                onPress={() => toggleComplete(selectedDate, block.id)}
                style={[styles.blockCard, done && styles.blockCardDone]}
              >
                <View style={styles.checkCol}>
                  {done ? <CheckCircle2 size={24} color="#34d399" /> : <Circle size={24} color="#52525b" />}
                </View>
                
                <View style={styles.timeCol}>
                  <Text style={styles.timeText}>{block.time}</Text>
                  <View style={[styles.catDot, { backgroundColor: categoryColors[block.category] }]} />
                </View>

                <View style={styles.contentCol}>
                  <Text style={[styles.blockTitle, done && styles.textDone]}>{block.icon} {block.title}</Text>
                  {block.description && (
                    <Text style={styles.blockDesc}>{block.description}</Text>
                  )}
                </View>

                <View style={styles.endCol}>
                  <Text style={[styles.catBadgeText, { color: categoryColors[block.category] }]}>
                    {block.category.toUpperCase()}
                  </Text>
                  {block.durationMin > 0 && <Text style={styles.durationText}>{block.durationMin}m</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  scrollContent: { padding: 20, paddingBottom: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, marginTop: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fafafa' },
  subtitle: { fontSize: 14, color: '#a1a1aa', marginTop: 4 },
  
  dateSelector: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 },
  iconButton: { padding: 8 },
  dateCard: { flex: 1, backgroundColor: '#18181b', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: 12, fontWeight: 'bold', color: '#a1a1aa', textTransform: 'uppercase' },
  todayText: { fontSize: 12, fontWeight: 'bold', color: '#34d399', marginTop: 4 },
  progressContainer: { alignItems: 'flex-end' },
  pctText: { fontSize: 20, fontWeight: 'bold', color: '#fafafa' },
  countText: { fontSize: 12, color: '#a1a1aa' },

  blocksContainer: { gap: 12 },
  emptyCard: { backgroundColor: '#18181b', borderRadius: 16, padding: 32, alignItems: 'center' },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#fafafa' },

  blockCard: { backgroundColor: '#18181b', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderColor: '#27272a', borderWidth: 1 },
  blockCardDone: { opacity: 0.6, borderColor: 'rgba(52, 211, 153, 0.3)' },
  
  checkCol: { marginRight: 16 },
  timeCol: { alignItems: 'center', width: 45, marginRight: 12 },
  timeText: { fontSize: 12, fontWeight: 'bold', color: '#a1a1aa', fontFamily: 'monospace' },
  catDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },
  
  contentCol: { flex: 1 },
  blockTitle: { fontSize: 15, fontWeight: '600', color: '#fafafa' },
  textDone: { textDecorationLine: 'line-through', color: '#a1a1aa' },
  blockDesc: { fontSize: 12, color: '#a1a1aa', marginTop: 2 },
  
  endCol: { alignItems: 'flex-end', marginLeft: 12 },
  catBadgeText: { fontSize: 10, fontWeight: 'bold' },
  durationText: { fontSize: 12, color: '#71717a', marginTop: 4 },
});
