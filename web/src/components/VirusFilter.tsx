
interface Props {
  options: string[];
  value: string | null;
  onChange: (v: string | null) => void;
}

export default function VirusFilter({ options, value, onChange }: Props) {
  return (
    <div className="virus-filter" role="tablist" aria-label="Virus species filter">
      <button
        className={value === null ? "active" : ""}
        onClick={() => onChange(null)}
        role="tab"
        aria-selected={value === null}
      >
        {"All"}
      </button>
      {options.map((opt) => (
        <button
          key={opt}
          className={value === opt ? "active" : ""}
          onClick={() => onChange(opt)}
          role="tab"
          aria-selected={value === opt}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
