import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmployeeRow from './EmployeeRow';
import { updateEmployee } from '../api/employees';

vi.mock('../api/employees', () => ({
  updateEmployee: vi.fn(),
}));

const employee = { id: 'e_1', name: 'Ada Lovelace', department: 'Engineering' };

function renderRow(props = {}) {
  const handlers = {
    onEdit: vi.fn(),
    onCancel: vi.fn(),
    onSaved: vi.fn(),
    onSaveError: vi.fn(),
    onDelete: vi.fn(),
    ...props,
  };
  render(<EmployeeRow employee={employee} isEditing={false} {...handlers} />);
  return handlers;
}

beforeEach(() => {
  updateEmployee.mockReset();
});

describe('EmployeeRow (view mode)', () => {
  it('renders the name, department, and Edit/Delete buttons', () => {
    renderRow();
    expect(screen.getByText(/Ada Lovelace/)).toBeInTheDocument();
    expect(screen.getByText(/Engineering/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('calls onEdit with the employee id when Edit is clicked', async () => {
    const handlers = renderRow();
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(handlers.onEdit).toHaveBeenCalledWith('e_1');
  });

  it('calls onDelete with the employee id when Delete is clicked', async () => {
    const handlers = renderRow();
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(handlers.onDelete).toHaveBeenCalledWith('e_1');
  });
});

describe('EmployeeRow (edit mode)', () => {
  function renderEditing(props = {}) {
    const handlers = {
      onEdit: vi.fn(),
      onCancel: vi.fn(),
      onSaved: vi.fn(),
      onSaveError: vi.fn(),
      onDelete: vi.fn(),
      ...props,
    };
    render(<EmployeeRow employee={employee} isEditing {...handlers} />);
    return handlers;
  }

  it('shows an inline form pre-filled with the employee name and department', () => {
    renderEditing();
    expect(screen.getByDisplayValue('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Engineering')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onCancel and makes no API call when Cancel is clicked', async () => {
    const handlers = renderEditing();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(handlers.onCancel).toHaveBeenCalledTimes(1);
    expect(updateEmployee).not.toHaveBeenCalled();
  });

  it('saves the trimmed name and department and calls onSaved', async () => {
    updateEmployee.mockResolvedValue({ ...employee, name: 'Ada L.', department: 'Platform' });
    const handlers = renderEditing();
    const [nameInput] = screen.getAllByRole('textbox');
    const departmentInput = screen.getByPlaceholderText('Department');

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Ada L.');
    await userEvent.clear(departmentInput);
    await userEvent.type(departmentInput, 'Platform');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(updateEmployee).toHaveBeenCalledWith('e_1', { name: 'Ada L.', department: 'Platform' });
    expect(handlers.onSaved).toHaveBeenCalledTimes(1);
  });

  it('calls onSaveError with the error message when the save fails', async () => {
    updateEmployee.mockRejectedValue(new Error('Network error'));
    const handlers = renderEditing();

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(handlers.onSaveError).toHaveBeenCalledWith('Network error');
    expect(handlers.onSaved).not.toHaveBeenCalled();
  });

  it('blocks saving an empty name and makes no API call', async () => {
    const handlers = renderEditing();

    await userEvent.clear(screen.getByDisplayValue('Ada Lovelace'));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(updateEmployee).not.toHaveBeenCalled();
    expect(handlers.onSaved).not.toHaveBeenCalled();
  });
});
