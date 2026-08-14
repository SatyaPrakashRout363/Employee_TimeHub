const express = require('express');
const timeEntryStore = require('../services/timeEntryStore');
const { toDateKey, computeHours } = require('../utils/hours');

const router = express.Router();

router.get('/', (req, res) => {
  const { employeeId, date, from, to } = req.query;
  let entries = timeEntryStore.getAll();

  if (employeeId) entries = entries.filter((entry) => entry.employeeId === employeeId);
  if (date) entries = entries.filter((entry) => entry.date === date);
  if (from) entries = entries.filter((entry) => entry.date >= from);
  if (to) entries = entries.filter((entry) => entry.date <= to);

  res.json(entries);
});

router.get('/:id', (req, res) => {
  const entry = timeEntryStore.getById(req.params.id);
  if (!entry) return res.status(404).json({ error: 'Time entry not found' });
  res.json(entry);
});

router.post('/clock-in', (req, res) => {
  const { employeeId } = req.body || {};
  if (!employeeId) return res.status(400).json({ error: 'employeeId is required' });

  const openEntry = timeEntryStore
    .getAll()
    .find((entry) => entry.employeeId === employeeId && entry.clockOut == null);
  if (openEntry) {
    return res.status(409).json({ error: 'Employee already has an open session', entry: openEntry });
  }

  const clockIn = new Date().toISOString();
  const entry = timeEntryStore.create({
    employeeId,
    clockIn,
    clockOut: null,
    hoursWorked: null,
    date: toDateKey(clockIn),
  });
  res.status(201).json(entry);
});

router.post('/clock-out', (req, res) => {
  const { employeeId } = req.body || {};
  if (!employeeId) return res.status(400).json({ error: 'employeeId is required' });

  const openEntry = timeEntryStore
    .getAll()
    .find((entry) => entry.employeeId === employeeId && entry.clockOut == null);
  if (!openEntry) return res.status(404).json({ error: 'No open session for this employee' });

  const clockOut = new Date().toISOString();
  const updated = timeEntryStore.update(openEntry.id, {
    clockOut,
    hoursWorked: computeHours(openEntry.clockIn, clockOut),
  });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const removed = timeEntryStore.remove(req.params.id);
  if (!removed) return res.status(404).json({ error: 'Time entry not found' });
  res.status(204).end();
});

module.exports = router;
