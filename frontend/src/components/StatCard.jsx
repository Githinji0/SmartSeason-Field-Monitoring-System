export default function StatCard({ label, value, icon: Icon }) {
  return (
    <article className="stat-card">
      {Icon ? (
        <div className="stat-icon-wrap" aria-hidden="true">
          <Icon className="stat-icon" />
        </div>
      ) : null}
      <p className="stat-label">{label}</p>
      <h3 className="stat-value">{value}</h3>
    </article>
  );
}
