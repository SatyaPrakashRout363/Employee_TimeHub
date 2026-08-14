import { fetchJson } from './client';

export const listLeaveRequests = (employeeId) =>
  fetchJson(`/leave-requests${employeeId ? `?employeeId=${encodeURIComponent(employeeId)}` : ''}`);
export const createLeaveRequest = (request) =>
  fetchJson('/leave-requests', { method: 'POST', body: JSON.stringify(request) });
export const approveLeaveRequest = (id) => fetchJson(`/leave-requests/${id}/approve`, { method: 'POST' });
export const rejectLeaveRequest = (id) => fetchJson(`/leave-requests/${id}/reject`, { method: 'POST' });
