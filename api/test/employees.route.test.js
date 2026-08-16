const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const dataFile = path.join(os.tmpdir(), `employees-route-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
fs.writeFileSync(dataFile, '[]');
process.env.EMPLOYEES_DATA_FILE = dataFile;

const app = require('../app');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}/api/employees`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(dataFile, { force: true });
});

async function create(body) {
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

test('POST /api/employees creates an employee and GET /api/employees lists it', async () => {
  const { status, body } = await create({ name: 'Grace Hopper', department: 'Engineering' });
  assert.equal(status, 201);
  assert.equal(body.name, 'Grace Hopper');

  const list = await (await fetch(baseUrl)).json();
  assert.ok(list.some((e) => e.id === body.id));
});

test('POST /api/employees without a name returns 400', async () => {
  const { status, body } = await create({ department: 'Engineering' });
  assert.equal(status, 400);
  assert.ok(body.error);
});

test('PUT /api/employees/:id updates name and department and persists the change', async () => {
  const { body: created } = await create({ name: 'Original Name', department: 'Sales' });

  const putRes = await fetch(`${baseUrl}/${created.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Updated Name', department: 'Marketing' }),
  });
  const updated = await putRes.json();

  assert.equal(putRes.status, 200);
  assert.equal(updated.id, created.id);
  assert.equal(updated.name, 'Updated Name');
  assert.equal(updated.department, 'Marketing');

  const fetched = await (await fetch(`${baseUrl}/${created.id}`)).json();
  assert.equal(fetched.name, 'Updated Name');
  assert.equal(fetched.department, 'Marketing');
});

test('PUT /api/employees/:id for an unknown id returns 404', async () => {
  const res = await fetch(`${baseUrl}/does-not-exist`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'x' }),
  });
  assert.equal(res.status, 404);
});

test('DELETE /api/employees/:id removes the employee', async () => {
  const { body: created } = await create({ name: 'Temp Employee' });

  const delRes = await fetch(`${baseUrl}/${created.id}`, { method: 'DELETE' });
  assert.equal(delRes.status, 204);

  const getRes = await fetch(`${baseUrl}/${created.id}`);
  assert.equal(getRes.status, 404);
});
