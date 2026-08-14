const fs = require('fs');

function readAll(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw || '[]');
}

function writeAll(filePath, records) {
  fs.writeFileSync(filePath, JSON.stringify(records, null, 2));
}

function generateId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function createStore(filePath, idPrefix) {
  return {
    getAll() {
      return readAll(filePath);
    },
    getById(id) {
      return readAll(filePath).find((record) => record.id === id) || null;
    },
    create(record) {
      const all = readAll(filePath);
      const withId = { id: generateId(idPrefix), ...record };
      all.push(withId);
      writeAll(filePath, all);
      return withId;
    },
    update(id, patch) {
      const all = readAll(filePath);
      const index = all.findIndex((record) => record.id === id);
      if (index === -1) return null;
      all[index] = { ...all[index], ...patch, id };
      writeAll(filePath, all);
      return all[index];
    },
    remove(id) {
      const all = readAll(filePath);
      const index = all.findIndex((record) => record.id === id);
      if (index === -1) return false;
      all.splice(index, 1);
      writeAll(filePath, all);
      return true;
    },
    save(all) {
      writeAll(filePath, all);
    },
  };
}

module.exports = { createStore };
