import { useEffect, useState } from 'react';
import { listEmployees } from '../api/employees';
import {
  listLeaveRequests,
  createLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
} from '../api/leaveRequests';
import EmployeeSelect from '../components/EmployeeSelect';
import StatusBadge from '../components/StatusBadge';

function LeaveRequests() {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    listEmployees().then(setEmployees).catch((e) => setError(e.message));
  }, []);

  const refresh = () => listLeaveRequests().then(setRequests).catch((e) => setError(e.message));

  useEffect(() => {
    refresh();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createLeaveRequest({ employeeId, startDate, endDate, reason });
      setStartDate('');
      setEndDate('');
      setReason('');
      refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDecision = async (id, decision) => {
    setError('');
    try {
      if (decision === 'approve') await approveLeaveRequest(id);
      else await rejectLeaveRequest(id);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const employeeName = (id) => employees.find((e) => e.id === id)?.name || id;
  const visible = statusFilter ? requests.filter((r) => r.status === statusFilter) : requests;

  return (
    <section>
      <h2>Leave Requests</h2>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <EmployeeSelect employees={employees} value={employeeId} onChange={setEmployeeId} />
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        <input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
        <button type="submit" disabled={!employeeId}>
          Request Leave
        </button>
      </form>

      <label>
        Filter by status:{' '}
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </label>

      <ul>
        {visible.map((request) => (
          <li key={request.id} style={{ marginTop: '0.5rem' }}>
            {employeeName(request.employeeId)} — {request.startDate} to {request.endDate} (
            {request.reason || 'No reason given'}) <StatusBadge status={request.status} />{' '}
            {request.status === 'pending' && (
              <>
                <button onClick={() => handleDecision(request.id, 'approve')}>Approve</button>
                <button onClick={() => handleDecision(request.id, 'reject')}>Reject</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default LeaveRequests;
