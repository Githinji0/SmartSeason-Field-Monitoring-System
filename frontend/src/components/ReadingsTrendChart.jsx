const CHART_HEIGHT = 180;

function getPathPoints(readings) {
  if (!readings.length) {
    return "";
  }

  const values = readings.map((reading) => Number(reading.value));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return readings
    .map((reading, index) => {
      const x = readings.length === 1 ? 24 : (index / (readings.length - 1)) * 100;
      const normalized = (Number(reading.value) - min) / range;
      const y = 20 + (1 - normalized) * 120;
      return `${x},${y}`;
    })
    .join(" ");
}

export default function ReadingsTrendChart({ readings, title }) {
  const chronologicalReadings = [...readings].reverse();
  const points = getPathPoints(chronologicalReadings);

  if (!chronologicalReadings.length) {
    return (
      <div className="readings-chart-empty">
        <p>No readings available for the selected filters.</p>
      </div>
    );
  }

  const latestValue = chronologicalReadings[chronologicalReadings.length - 1]?.value;
  const firstValue = chronologicalReadings[0]?.value;

  return (
    <div className="readings-chart-wrap">
      <div className="readings-chart-summary">
        <div>
          <p className="readings-chart-label">{title}</p>
          <h3>{latestValue}</h3>
        </div>
        <span className="readings-chart-delta">
          {chronologicalReadings.length > 1 ? `${firstValue} → ${latestValue}` : "Single reading"}
        </span>
      </div>

      <svg
        className="readings-chart"
        viewBox="0 0 100 160"
        role="img"
        aria-label="Readings trend chart"
      >
        <defs>
          <linearGradient id="readingsLineGradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#2f7d4a" />
            <stop offset="100%" stopColor="#7fbf7d" />
          </linearGradient>
        </defs>
        {[40, 80, 120].map((line) => (
          <line key={line} x1="0" y1={line} x2="100" y2={line} className="readings-chart-gridline" />
        ))}
        <polyline
          fill="none"
          stroke="url(#readingsLineGradient)"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
          vectorEffect="non-scaling-stroke"
        />
        {chronologicalReadings.map((reading, index) => {
          const x = chronologicalReadings.length === 1 ? 24 : (index / (chronologicalReadings.length - 1)) * 100;
          const values = chronologicalReadings.map((item) => Number(item.value));
          const min = Math.min(...values);
          const max = Math.max(...values);
          const range = max - min || 1;
          const normalized = (Number(reading.value) - min) / range;
          const y = 20 + (1 - normalized) * 120;

          return <circle key={reading.id} cx={x} cy={y} r="2.5" className="readings-chart-point" />;
        })}
      </svg>
    </div>
  );
}