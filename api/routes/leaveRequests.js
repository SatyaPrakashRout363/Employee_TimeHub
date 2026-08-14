const express = require('express');
const leaveRequestStore = require('../services/leaveRequestStore');

const router = express.Router();

router.get('/', (req, res) => {
  const { employeeId, status } = req.query;
  let requests = leaveRequestStore.getAll();

  if (employeeId) requests = requests.filter((r) => r.employeeId === employeeId);
  if (status) requests = requests.filter((r) => r.status === status);

  res.json(requests);
});

router.get('/:id', (req, res) => {
  const request = leaveRequestStore.getById(req.params.id);
  if (!request) return res.status(404).json({ error: 'Leave request not found' });
  res.json(request);
});

router.post('/', (req, res) => {
  const { employeeId, startDate, endDate, reason } = req.body || {};
  if (!employeeId || !startDate || !endDate) {
    return res.status(400).json({ error: 'employeeId, startDate and endDate are required' });
  }

  const request = leaveRequestStore.create({
    employeeId,
    startDate,
    endDate,
    reason: reason || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
    decidedAt: null,
  });
  res.status(201).json(request);
});

router.put('/:id', (req, res) => {
  const existing = leaveRequestStore.getById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Leave request not found' });
  if (existing.status !== 'pending') {
    return res.status(409).json({ error: 'Only pending requests can be edited' });
  }

  const updated = leaveRequestStore.update(req.params.id, req.body || {});
  res.json(updated);
});

router.post('/:id/approve', (req, res) => {
  const updated = leaveRequestStore.update(req.params.id, {
    status: 'approved',
    decidedAt: new Date().toISOString(),
  });
  if (!updated) return res.status(404).json({ error: 'Leave request not found' });
  res.json(updated);
});

router.post('/:id/reject', (req, res) => {
  const updated = leaveRequestStore.update(req.params.id, {
    status: 'rejected',
    decidedAt: new Date().toISOString(),
  });
  if (!updated) return res.status(404).json({ error: 'Leave request not found' });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const removed = leaveRequestStore.remove(req.params.id);
  if (!removed) return res.status(404).json({ error: 'Leave request not found' });
  res.status(204).end();
});

module.exports = router;
