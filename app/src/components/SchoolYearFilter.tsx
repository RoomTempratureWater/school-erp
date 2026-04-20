"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface AcademicYear {
  id: number;
  name: string;
  isCurrent: boolean;
}

interface Props {
  academicYears: AcademicYear[];
  currentYearId: number | null;
}

export default function SchoolYearFilter({ academicYears, currentYearId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeYearId = searchParams.get("yearId") || (currentYearId ? String(currentYearId) : "");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const val = e.target.value;
    if (val) {
      params.set("yearId", val);
    } else {
      params.delete("yearId");
    }
    // keep other params, just update yearId
    router.push(`/fees?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">School Year</label>
      <select
        value={activeYearId}
        onChange={handleChange}
        className="flex h-9 w-full min-w-[140px] rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="">All Years</option>
        {academicYears.map((ay) => (
          <option key={ay.id} value={ay.id}>
            {ay.name} {ay.isCurrent ? "(Current)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
