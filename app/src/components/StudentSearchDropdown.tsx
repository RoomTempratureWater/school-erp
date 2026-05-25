"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface StudentResult {
  id: number;
  grNo: string;
  label: string;
  firstName: string;
  lastName: string;
  standard: string;
  division: string;
}

interface Props {
  /** Name of the hidden input that holds grNo */
  name: string;
  /** Default GR number (pre-selected) */
  defaultValue?: string;
  /** Default display label to show in input */
  defaultLabel?: string;
  /** Placeholder text */
  placeholder?: string;
  required?: boolean;
}

export default function StudentSearchDropdown({
  name,
  defaultValue = "",
  defaultLabel = "",
  placeholder = "Search by name or enrollment…",
  required = false,
}: Props) {
  const [query, setQuery] = useState(defaultLabel);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStudents = useCallback(async (q: string) => {
    if (q.length < 1) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/students/search?q=${encodeURIComponent(q)}`);
      const data: StudentResult[] = await res.json();
      setResults(data);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelected(""); // clear selection when typing

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchStudents(val), 250);
  };

  const handleSelect = (student: StudentResult) => {
    setSelected(student.grNo);
    setQuery(student.label);
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={selected} />

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder={placeholder}
          required={required && !selected}
          autoComplete="off"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pr-8"
        />
        {/* Search icon */}
        <svg
          className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-white p-3 text-xs text-muted-foreground shadow-lg text-center">
          Searching…
        </div>
      )}

      {/* Dropdown results */}
      {open && !loading && results.length > 0 && (
        <ul className="absolute top-full left-0 right-0 z-50 mt-1 max-h-56 overflow-auto rounded-md border bg-white shadow-lg py-1 scrollbar-thin">
          {results.map((s) => (
            <li
              key={s.id}
              onMouseDown={() => handleSelect(s)}
              className={`flex items-center gap-3 cursor-pointer px-3 py-2 text-sm transition-colors hover:bg-primary/5 ${
                selected === s.grNo ? "bg-primary/10 font-medium" : ""
              }`}
            >
              <div className="size-7 rounded-full bg-slate-100 border flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                {s.firstName[0]}{s.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{s.firstName} {s.lastName}</div>
                <div className="text-[11px] text-muted-foreground">{s.grNo} · {s.standard} {s.division}</div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* No results */}
      {open && !loading && query.length >= 1 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-white p-3 text-xs text-muted-foreground shadow-lg text-center">
          No students found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
