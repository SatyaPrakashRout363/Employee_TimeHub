function toDateKey(isoString) {
  return isoString.slice(0, 10);
}

function computeHours(clockInIso, clockOutIso) {
  const ms = new Date(clockOutIso).getTime() - new Date(clockInIso).getTime();
  return Math.round((ms / 3600000) * 100) / 100;
}

module.exports = { toDateKey, computeHours };
