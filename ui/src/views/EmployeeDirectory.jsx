import { useEffect, useState } from 'react';
import { listEmployees, createEmployee, deleteEmployee } from '../api/employees';

function EmployeeDirectory() {
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');

  const refresh = () => listEmployees().then(setEmployees).catch((e) => setError(e.message));

  useEffect(() => {
    refresh();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createEmployee({ name, department });
      setName('');
      setDepartment('');
      refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEmployee(id);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <h2>Employee Directory</h2>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <form onSubmit={handleAdd} style={{ marginBottom: '1rem' }}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />
        <button type="submit">Add Employee</button>
      </form>
      <ul>
        {employees.map((employee) => (
          <li key={employee.id}>
            {employee.name} — {employee.department || 'No department'}{' '}
            <button onClick={() => handleDelete(employee.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default EmployeeDirectory;
