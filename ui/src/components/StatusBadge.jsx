const COLORS = {
  pending: '#b8860b',
  approved: '#1a7f37',
  rejected: '#c62828',
};

function StatusBadge({ status }) {
  return (
    <span
      style={{
        color: 'white',
        background: COLORS[status] || '#555',
        borderRadius: '10px',
        padding: '2px 10px',
        fontSize: '0.8rem',
        textTransform: 'capitalize',
      }}
    >
      {status}
    </span>
  );
}

export default StatusBadge;
