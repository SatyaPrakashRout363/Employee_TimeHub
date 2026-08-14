import { useEffect, useState } from 'react';
import { listEmployees } from '../api/employees';
import { listTimeEntries, clockIn, clockOut } from '../api/timeEntries';
import EmployeeSelect from '../components/EmployeeSelect';

function ClockInOut() {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState('');
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    listEmployees().then(setEmployees).catch((e) => setError(e.message));
  }, []);

  const refreshEntries = (id) => {
    if (!id) return setEntries([]);
    listTimeEntries(id).then(setEntries).catch((e) => setError(e.message));
  };

  useEffect(() => {
    refreshEntries(employeeId);
  }, [employeeId]);

  const openEntry = entries.find((entry) => entry.clockOut == null);

  const handleClockIn = async () => {
    setError('');
    try {
      await clockIn(employeeId);
      refreshEntries(employeeId);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClockOut = async () => {
    setError('');
    try {
      await clockOut(employeeId);
      refreshEntries(employeeId);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <h2>Clock In / Out</h2>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <EmployeeSelect employees={employees} value={employeeId} onChange={setEmployeeId} />
      {employeeId && (
        <div style={{ margin: '1rem 0' }}>
          {openEntry ? (
            <button onClick={handleClockOut}>Clock Out</button>
          ) : (
            <button onClick={handleClockIn}>Clock In</button>
          )}
        </div>
      )}
      <table>
        <thead>
          <tr>
            <th>Clock In</th>
            <th>Clock Out</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{new Date(entry.clockIn).toLocaleString()}</td>
              <td>{entry.clockOut ? new Date(entry.clockOut).toLocaleString() : 'Open'}</td>
              <td>{entry.hoursWorked ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default ClockInOut;
