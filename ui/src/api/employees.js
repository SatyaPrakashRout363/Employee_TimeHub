import { fetchJson } from './client';

export const listEmployees = () => fetchJson('/employees');
export const createEmployee = (employee) =>
  fetchJson('/employees', { method: 'POST', body: JSON.stringify(employee) });
export const deleteEmployee = (id) => fetchJson(`/employees/${id}`, { method: 'DELETE' });
