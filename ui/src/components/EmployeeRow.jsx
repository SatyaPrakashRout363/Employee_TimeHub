import { useState } from 'react';
import { updateEmployee } from '../api/employees';

function EmployeeRow({ employee, isEditing, onEdit, onCancel, onSaved, onSaveError, onDelete }) {
  const [name, setName] = useState(employee.name);
  const [department, setDepartment] = useState(employee.department || '');
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setName(employee.name);
    setDepartment(employee.department || '');
    onEdit(employee.id);
  };

  const cancelEdit = () => {
    setName(employee.name);
    setDepartment(employee.department || '');
    onCancel();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setSaving(true);
    try {
      await updateEmployee(employee.id, { name: trimmedName, department });
      onSaved();
    } catch (err) {
      onSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (isEditing) {
    return (
      <li>
        <form onSubmit={handleSave} style={{ display: 'inline' }}>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
          <input
            placeholder="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
          <button type="submit" disabled={saving}>
            Save
          </button>
          <button type="button" onClick={cancelEdit} disabled={saving}>
            Cancel
          </button>
        </form>
      </li>
    );
  }

  return (
    <li>
      {employee.name} — {employee.department || 'No department'}{' '}
      <button onClick={startEdit}>Edit</button>{' '}
      <button onClick={() => onDelete(employee.id)}>Delete</button>
    </li>
  );
}

export default EmployeeRow;
