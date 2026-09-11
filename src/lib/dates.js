import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
  subDays,
} from 'date-fns'

export function todayISO() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function toISO(date) {
  return format(date, 'yyyy-MM-dd')
}

export function fromISO(iso) {
  return parseISO(iso)
}

export function formatLong(iso) {
  return format(parseISO(iso), 'EEEE, MMM d')
}

export function formatMedium(iso) {
  return format(parseISO(iso), 'EEE, MMM d')
}

export function formatMonthTitle(date) {
  return format(date, 'MMMM yyyy')
}

export function weekDays(ref = new Date()) {
  const start = startOfWeek(ref, { weekStartsOn: 1 })
  const end = endOfWeek(ref, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

export function monthGrid(date) {
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  const gridStart = startOfWeek(start, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(end, { weekStartsOn: 1 })
  return eachDayOfInterval({ start: gridStart, end: gridEnd })
}

export function shiftMonth(date, delta) {
  return addMonths(date, delta)
}

export function weekdayLetter(date) {
  return format(date, 'EEEEE')
}

export function currentStreak(dateSet) {
  if (!dateSet.size) return 0
  const today = todayISO()
  let cursor = dateSet.has(today) ? parseISO(today) : subDays(parseISO(today), 1)
  if (!dateSet.has(toISO(cursor))) return 0

  let count = 0
  while (dateSet.has(toISO(cursor))) {
    count += 1
    cursor = subDays(cursor, 1)
  }
  return count
}
