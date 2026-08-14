const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/employees', require('./routes/employees'));
app.use('/api/time-entries', require('./routes/timeEntries'));
app.use('/api/leave-requests', require('./routes/leaveRequests'));
app.use('/api/timesheets', require('./routes/timesheets'));

app.listen(PORT, () => {
  console.log(`Employee TimeHub API listening on http://localhost:${PORT}`);
});
