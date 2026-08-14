function EmployeeSelect({ employees, value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select employee…</option>
      {employees.map((employee) => (
        <option key={employee.id} value={employee.id}>
          {employee.name}
        </option>
      ))}
    </select>
  );
}

export default EmployeeSelect;
