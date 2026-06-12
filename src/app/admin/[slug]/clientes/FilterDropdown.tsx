"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function FilterDropdown({ currentSort }: { currentSort: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = [
    { value: 'recientes', label: 'Más recientes' },
    { value: 'antiguos', label: 'Más antiguo' },
    { value: 'mas-visitas', label: 'Más visitas' },
    { value: 'menos-visitas', label: 'Menos visitas' },
  ];

  const currentLabel = options.find(o => o.value === currentSort)?.label || "Más recientes";

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '6px 16px',
          borderRadius: '9999px',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          transition: 'all 0.2s'
        }}
      >
        <span style={{ color: 'var(--text-secondary)' }}>Filtrar:</span>
        <span>{currentLabel}</span>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '0.5rem',
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          zIndex: 50,
          minWidth: '180px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}>
          {options.map(opt => (
            <Link
              key={opt.value}
              href={`?sort=${opt.value}`}
              onClick={() => setIsOpen(false)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '0.875rem',
                backgroundColor: currentSort === opt.value ? 'var(--bg-secondary)' : 'transparent',
                color: currentSort === opt.value ? 'var(--accent-success)' : 'var(--text-primary)',
                transition: 'background-color 0.2s'
              }}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
