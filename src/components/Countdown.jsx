import useCountdown from '../hooks/useCountdown.js';

const UNITS = [
  { key: 'days', label: 'Days' },
  { key: 'hours', label: 'Hrs' },
  { key: 'mins', label: 'Min' },
  { key: 'secs', label: 'Sec' },
];

export default function Countdown({ target }) {
  const parts = useCountdown(target);
  if (!parts) return null;

  return (
    <div className="countdown" aria-live="polite">
      {UNITS.map((unit) => (
        <div className="countdown__unit" key={unit.key}>
          <span className="countdown__value">{parts[unit.key]}</span>
          <span className="countdown__label">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}
