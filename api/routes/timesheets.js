const express = require('express');
const timeEntryStore = require('../services/timeEntryStore');
const { aggregate } = require('../utils/timesheet');

const router = express.Router();

router.get('/', (req, res) => {
  const { employeeId, period, from, to } = req.query;
  if (!employeeId) return res.status(400).json({ error: 'employeeId is required' });

  let entries = timeEntryStore.getAll().filter((entry) => entry.employeeId === employeeId);
  if (from) entries = entries.filter((entry) => entry.date >= from);
  if (to) entries = entries.filter((entry) => entry.date <= to);

  const buckets = aggregate(entries, period === 'week' ? 'week' : 'day');
  const totalHours = Math.round(buckets.reduce((sum, b) => sum + b.hoursWorked, 0) * 100) / 100;

  res.json({ employeeId, period: period === 'week' ? 'week' : 'day', buckets, totalHours });
});

module.exports = router;
