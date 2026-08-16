import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmployeeDirectory from './EmployeeDirectory';

function jsonResponse(status, body) {
  return Promise.resolve({
    status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body),
  });
}

let employees;

function installFetchMock() {
  global.fetch = vi.fn((url, options = {}) => {
    const method = options.method || 'GET';
    const idMatch = url.match(/^\/api\/employees\/(.+)$/);

    if (url === '/api/employees' && method === 'GET') {
      return jsonResponse(200, employees);
    }
    if (idMatch && method === 'PUT') {
      const id = idMatch[1];
      const patch = JSON.parse(options.body);
      const index = employees.findIndex((e) => e.id === id);
      if (index === -1) return jsonResponse(404, { error: 'Not found' });
      employees[index] = { ...employees[index], ...patch };
      return jsonResponse(200, employees[index]);
    }
    if (idMatch && method === 'DELETE') {
      const id = idMatch[1];
      employees = employees.filter((e) => e.id !== id);
      return jsonResponse(204, null);
    }
    throw new Error(`Unhandled request: ${method} ${url}`);
  });
}

beforeEach(() => {
  employees = [
    { id: 'e_1', name: 'Ada Lovelace', department: 'Engineering' },
    { id: 'e_2', name: 'Grace Hopper', department: 'Research' },
  ];
  installFetchMock();
});

function rowFor(name) {
  return screen.getByText(new RegExp(name)).closest('li');
}

describe('EmployeeDirectory — edit employee', () => {
  it('loads and lists employees on mount', async () => {
    render(<EmployeeDirectory />);
    expect(await screen.findByText(/Ada Lovelace/)).toBeInTheDocument();
    expect(screen.getByText(/Grace Hopper/)).toBeInTheDocument();
  });

  it('clicking Edit shows an inline pre-filled form with Save/Cancel', async () => {
    render(<EmployeeDirectory />);
    await screen.findByText(/Ada Lovelace/);

    await userEvent.click(within(rowFor('Ada Lovelace')).getByRole('button', { name: 'Edit' }));

    const row = screen.getByDisplayValue('Ada Lovelace').closest('li');
    expect(within(row).getByDisplayValue('Ada Lovelace')).toBeInTheDocument();
    expect(within(row).getByDisplayValue('Engineering')).toBeInTheDocument();
    expect(within(row).getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(within(row).getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('only allows one row to be in edit mode at a time', async () => {
    render(<EmployeeDirectory />);
    await screen.findByText(/Ada Lovelace/);

    await userEvent.click(within(rowFor('Ada Lovelace')).getByRole('button', { name: 'Edit' }));
    expect(screen.getByDisplayValue('Ada Lovelace')).toBeInTheDocument();

    await userEvent.click(within(rowFor('Grace Hopper')).getByRole('button', { name: 'Edit' }));

    expect(screen.queryByDisplayValue('Ada Lovelace')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Grace Hopper')).toBeInTheDocument();
  });

  it('Save persists the change and refreshes the list', async () => {
    render(<EmployeeDirectory />);
    await screen.findByText(/Ada Lovelace/);

    await userEvent.click(within(rowFor('Ada Lovelace')).getByRole('button', { name: 'Edit' }));
    const nameInput = screen.getByDisplayValue('Ada Lovelace');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Ada L. Byron');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText(/Ada L\. Byron/)).toBeInTheDocument();
    expect(screen.queryByText(/^Ada Lovelace/)).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('Ada L. Byron')).not.toBeInTheDocument();

    const putCalls = global.fetch.mock.calls.filter(([, opts]) => opts?.method === 'PUT');
    expect(putCalls).toHaveLength(1);
    expect(putCalls[0][0]).toBe('/api/employees/e_1');
  });

  it('Cancel discards changes and makes no API call', async () => {
    render(<EmployeeDirectory />);
    await screen.findByText(/Ada Lovelace/);

    await userEvent.click(within(rowFor('Ada Lovelace')).getByRole('button', { name: 'Edit' }));
    const nameInput = screen.getByDisplayValue('Ada Lovelace');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Someone Else');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByText(/Ada Lovelace/)).toBeInTheDocument();
    expect(screen.queryByText(/Someone Else/)).not.toBeInTheDocument();

    const putCalls = global.fetch.mock.calls.filter(([, opts]) => opts?.method === 'PUT');
    expect(putCalls).toHaveLength(0);
  });

  it('blocks submitting an empty name and stays in edit mode with no API call', async () => {
    render(<EmployeeDirectory />);
    await screen.findByText(/Ada Lovelace/);

    await userEvent.click(within(rowFor('Ada Lovelace')).getByRole('button', { name: 'Edit' }));
    const nameInput = screen.getByDisplayValue('Ada Lovelace');
    await userEvent.clear(nameInput);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    const putCalls = global.fetch.mock.calls.filter(([, opts]) => opts?.method === 'PUT');
    expect(putCalls).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
});
