import React from 'react';

// Simple horizontal stepper for order tracking
export default function OrderProgress({ currentStatus = 'placed', statusHistory = [] }) {
  const steps = ['placed', 'confirmed', 'shipped', 'delivered'];

  const statusIndex = steps.indexOf(currentStatus);

  const getTimestampFor = (status) => {
    if (!Array.isArray(statusHistory)) return null;
    const entry = statusHistory.find(s => s.status === status);
    return entry ? new Date(entry.timestamp).toLocaleString() : null;
  };

  return (
    <div style={styles.container}>
      {steps.map((step, idx) => {
        const done = idx <= statusIndex;
        return (
          <div key={step} style={styles.stepWrap}>
            <div style={{ ...styles.circle, ...(done ? styles.circleDone : {}) }}>{idx + 1}</div>
            <div style={styles.label}>{step.charAt(0).toUpperCase() + step.slice(1)}</div>
            <div style={styles.time}>{getTimestampFor(step) || (idx === 0 ? '' : '')}</div>
            {idx < steps.length - 1 && <div style={{ ...styles.bar, ...(done ? styles.barDone : {}) }} />}
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px',
    gap: '8px'
  },
  stepWrap: {
    position: 'relative',
    flex: 1,
    textAlign: 'center'
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    background: '#e9ecef',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    color: '#6c757d',
    marginBottom: 8
  },
  circleDone: {
    background: '#27ae60',
    color: 'white'
  },
  bar: {
    position: 'absolute',
    left: '50%',
    right: '-50%',
    top: 22,
    height: 6,
    background: '#e9ecef',
    zIndex: -1
  },
  barDone: {
    background: '#27ae60'
  },
  label: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: 600
  },
  time: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 6
  }
};
