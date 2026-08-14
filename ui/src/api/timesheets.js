import { fetchJson } from './client';

export const getTimesheet = (employeeId, period) =>
  fetchJson(`/timesheets?employeeId=${encodeURIComponent(employeeId)}&period=${period}`);
