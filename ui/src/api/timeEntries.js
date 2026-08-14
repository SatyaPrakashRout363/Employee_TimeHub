import { fetchJson } from './client';

export const listTimeEntries = (employeeId) =>
  fetchJson(`/time-entries?employeeId=${encodeURIComponent(employeeId)}`);
export const clockIn = (employeeId) =>
  fetchJson('/time-entries/clock-in', { method: 'POST', body: JSON.stringify({ employeeId }) });
export const clockOut = (employeeId) =>
  fetchJson('/time-entries/clock-out', { method: 'POST', body: JSON.stringify({ employeeId }) });
