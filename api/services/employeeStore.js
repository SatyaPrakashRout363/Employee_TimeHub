const path = require('path');
const { createStore } = require('../utils/store');

module.exports = createStore(path.join(__dirname, '..', 'data', 'employees.json'), 'e');
