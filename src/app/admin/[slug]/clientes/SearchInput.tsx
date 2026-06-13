"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }
      // router.push with scroll: false to prevent jumping
      router.push(`?${params.toString()}`, { scroll: false });
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [query, router, searchParams]);

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      backgroundColor: 'var(--bg-secondary)', 
      border: '1px solid var(--border-color)', 
      padding: '8px 16px', 
      borderRadius: '20px',
      gap: '8px'
    }}>
      <input 
        type="text" 
        placeholder="Buscar cliente..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          color: 'var(--text-primary)', 
          outline: 'none', 
          width: '140px', 
          fontSize: '0.875rem' 
        }}
      />
      <span style={{ fontSize: '1.1rem' }}>🔍</span>
    </div>
  );
}
