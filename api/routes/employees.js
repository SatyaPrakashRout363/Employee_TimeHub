const express = require('express');
const employeeStore = require('../services/employeeStore');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(employeeStore.getAll());
});

router.get('/:id', (req, res) => {
  const employee = employeeStore.getById(req.params.id);
  if (!employee) return res.status(404).json({ error: 'Employee not found' });
  res.json(employee);
});

router.post('/', (req, res) => {
  const { name, department } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });

  const employee = employeeStore.create({
    name,
    department: department || '',
    createdAt: new Date().toISOString(),
  });
  res.status(201).json(employee);
});

router.put('/:id', (req, res) => {
  const updated = employeeStore.update(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: 'Employee not found' });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const removed = employeeStore.remove(req.params.id);
  if (!removed) return res.status(404).json({ error: 'Employee not found' });
  res.status(204).end();
});

module.exports = router;
