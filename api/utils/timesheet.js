function getWeekKey(dateKey) {
  const date = new Date(`${dateKey}T00:00:00Z`);
  const dayOfWeek = (date.getUTCDay() + 6) % 7;
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() - dayOfWeek);
  return monday.toISOString().slice(0, 10);
}

function aggregate(entries, period) {
  const completed = entries.filter((entry) => entry.hoursWorked != null);
  const buckets = new Map();

  completed.forEach((entry) => {
    const key = period === 'week' ? getWeekKey(entry.date) : entry.date;
    buckets.set(key, (buckets.get(key) || 0) + entry.hoursWorked);
  });

  return Array.from(buckets.entries())
    .map(([key, hours]) => ({ period: key, hoursWorked: Math.round(hours * 100) / 100 }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

module.exports = { aggregate };
