import { useEffect, useState } from 'react';
import { listEmployees, createEmployee, deleteEmployee } from '../api/employees';
import EmployeeRow from '../components/EmployeeRow';

function EmployeeDirectory() {
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

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

  const handleSaved = () => {
    setEditingId(null);
    refresh();
  };

  const handleSaveError = (message) => {
    setEditingId(null);
    setError(message);
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
          <EmployeeRow
            key={employee.id}
            employee={employee}
            isEditing={editingId === employee.id}
            onEdit={setEditingId}
            onCancel={() => setEditingId(null)}
            onSaved={handleSaved}
            onSaveError={handleSaveError}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </section>
  );
}

export default EmployeeDirectory;
