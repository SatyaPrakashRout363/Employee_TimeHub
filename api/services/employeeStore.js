const path = require('path');
const { createStore } = require('../utils/store');

const dataFile = process.env.EMPLOYEES_DATA_FILE || path.join(__dirname, '..', 'data', 'employees.json');

module.exports = createStore(dataFile, 'e');
