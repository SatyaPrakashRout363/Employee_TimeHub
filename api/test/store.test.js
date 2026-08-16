const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { createStore } = require('../utils/store');

const createdFiles = [];

function tempFile() {
  const file = path.join(os.tmpdir(), `store-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
  fs.writeFileSync(file, '[]');
  createdFiles.push(file);
  return file;
}

test.after(() => {
  for (const file of createdFiles) {
    fs.rmSync(file, { force: true });
  }
});

test('getAll returns an empty array for a fresh store', () => {
  const store = createStore(tempFile(), 'e');
  assert.deepEqual(store.getAll(), []);
});

test('create assigns a prefixed id, persists the record, and returns it', () => {
  const file = tempFile();
  const store = createStore(file, 'e');

  const created = store.create({ name: 'Ada', department: 'Engineering' });

  assert.match(created.id, /^e_/);
  assert.equal(created.name, 'Ada');
  assert.deepEqual(store.getAll(), [created]);
  assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf-8')), [created]);
});

test('getById finds an existing record and returns null for an unknown id', () => {
  const store = createStore(tempFile(), 'e');
  const created = store.create({ name: 'Ada' });

  assert.deepEqual(store.getById(created.id), created);
  assert.equal(store.getById('missing'), null);
});

test('update merges a partial patch, keeps the original id, and returns the updated record', () => {
  const store = createStore(tempFile(), 'e');
  const created = store.create({ name: 'Ada', department: 'Engineering' });

  const updated = store.update(created.id, { department: 'Platform' });

  assert.equal(updated.id, created.id);
  assert.equal(updated.name, 'Ada');
  assert.equal(updated.department, 'Platform');
});

test('update ignores an id field inside the patch, keeping the original record id', () => {
  const store = createStore(tempFile(), 'e');
  const created = store.create({ name: 'Ada' });

  const updated = store.update(created.id, { id: 'e_hijacked', name: 'Ada Lovelace' });

  assert.equal(updated.id, created.id);
  assert.equal(updated.name, 'Ada Lovelace');
});

test('update returns null when the id does not exist and leaves the store unchanged', () => {
  const store = createStore(tempFile(), 'e');
  store.create({ name: 'Ada' });

  const result = store.update('missing', { name: 'x' });

  assert.equal(result, null);
  assert.equal(store.getAll().length, 1);
});

test('remove deletes an existing record and returns true', () => {
  const store = createStore(tempFile(), 'e');
  const created = store.create({ name: 'Ada' });

  assert.equal(store.remove(created.id), true);
  assert.deepEqual(store.getAll(), []);
});

test('remove returns false for an unknown id and leaves the store unchanged', () => {
  const store = createStore(tempFile(), 'e');
  store.create({ name: 'Ada' });

  assert.equal(store.remove('missing'), false);
  assert.equal(store.getAll().length, 1);
});
