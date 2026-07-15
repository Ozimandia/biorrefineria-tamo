export default function UnitToggle({ unidad, onChange }) {
  return (
    <div className="unit-toggle">
      <span className={`unit-label ${unidad === 'kg' ? 'active' : ''}`}>kg</span>
      <label className="switch">
        <input
          type="checkbox"
          checked={unidad === 't'}
          onChange={() => onChange(unidad === 'kg' ? 't' : 'kg')}
        />
        <span className="slider" />
      </label>
      <span className={`unit-label ${unidad === 't' ? 'active' : ''}`}>t</span>
    </div>
  );
}
