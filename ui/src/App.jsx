import { useState } from 'react';
import EmployeeDirectory from './views/EmployeeDirectory';
import ClockInOut from './views/ClockInOut';
import Timesheet from './views/Timesheet';
import LeaveRequests from './views/LeaveRequests';

const TABS = [
  { id: 'directory', label: 'Employee Directory', component: EmployeeDirectory },
  { id: 'clock', label: 'Clock In/Out', component: ClockInOut },
  { id: 'timesheet', label: 'Timesheet', component: Timesheet },
  { id: 'leave', label: 'Leave Requests', component: LeaveRequests },
];

function App() {
  const [tab, setTab] = useState('directory');
  const Active = TABS.find((t) => t.id === tab).component;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
      <h1>Employee TimeHub</h1>
      <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{ fontWeight: tab === t.id ? 'bold' : 'normal' }}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <Active />
    </div>
  );
}

export default App;
