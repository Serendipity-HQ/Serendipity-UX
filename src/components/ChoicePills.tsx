"use client";

export function ChoicePills({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
}) {
  function toggle(option: string) {
    onChange(selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => toggle(option)}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            selected.includes(option)
              ? "border-moss bg-moss text-paper"
              : "border-line bg-paper-soft text-muted hover:border-moss hover:text-ink"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
