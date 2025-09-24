import React from 'react';

interface FontSizeControlProps {
  fontSize: number;
  setFontSize: (size: number) => void;
}

const FONT_SIZES = [
    { label: 'K', size: 14, title: 'Kecil' },
    { label: 'S', size: 16, title: 'Sedang' },
    { label: 'B', size: 18, title: 'Besar' },
]

export const FontSizeControl: React.FC<FontSizeControlProps> = ({ fontSize, setFontSize }) => {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-tertiary)]">
      {FONT_SIZES.map(({label, size, title}) => (
        <button
            key={size}
            onClick={() => setFontSize(size)}
            className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-bold transition-colors ${
                fontSize === size 
                ? 'bg-[var(--accent-color)] text-[var(--bg-primary)]' 
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
            }`}
            aria-label={`Atur ukuran font ke ${title}`}
            title={`Ukuran font ${title}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
