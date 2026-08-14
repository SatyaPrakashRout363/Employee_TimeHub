import { useEffect, useState } from 'react';
import { listEmployees } from '../api/employees';
import { getTimesheet } from '../api/timesheets';
import EmployeeSelect from '../components/EmployeeSelect';

function Timesheet() {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState('');
  const [period, setPeriod] = useState('day');
  const [sheet, setSheet] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    listEmployees().then(setEmployees).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!employeeId) return setSheet(null);
    getTimesheet(employeeId, period).then(setSheet).catch((e) => setError(e.message));
  }, [employeeId, period]);

  return (
    <section>
      <h2>Timesheet</h2>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <EmployeeSelect employees={employees} value={employeeId} onChange={setEmployeeId} />
      <select value={period} onChange={(e) => setPeriod(e.target.value)}>
        <option value="day">By day</option>
        <option value="week">By week</option>
      </select>

      {sheet && (
        <div style={{ marginTop: '1rem' }}>
          <p>
            <strong>Total hours:</strong> {sheet.totalHours}
          </p>
          <table>
            <thead>
              <tr>
                <th>{period === 'week' ? 'Week starting' : 'Date'}</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {sheet.buckets.map((bucket) => (
                <tr key={bucket.period}>
                  <td>{bucket.period}</td>
                  <td>{bucket.hoursWorked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Timesheet;
