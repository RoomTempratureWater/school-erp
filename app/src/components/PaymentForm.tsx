"use client";

import { useState } from "react";
import StudentSearchDropdown from "@/components/StudentSearchDropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AcademicYear {
  id: number;
  name: string;
  isCurrent: boolean;
}

interface FeeCategory {
  id: number;
  name: string;
  amount: number;
  academicYearId: number;
  academicYearName: string;
}

interface Props {
  academicYears: AcademicYear[];
  categories: FeeCategory[];
  currentYearId: number | null;
  action: (formData: FormData) => Promise<void>;
}

export default function PaymentForm({ academicYears, categories, currentYearId, action }: Props) {
  const [selectedYearId, setSelectedYearId] = useState<string>(
    currentYearId ? String(currentYearId) : (academicYears[0] ? String(academicYears[0].id) : "")
  );

  const filteredCategories = selectedYearId
    ? categories.filter(c => c.academicYearId === parseInt(selectedYearId, 10))
    : categories;

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Student</label>
        <StudentSearchDropdown
          name="grNo"
          placeholder="Search by name or enrollment…"
          required
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">School Year</label>
        <select
          value={selectedYearId}
          onChange={(e) => setSelectedYearId(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {academicYears.map(ay => (
            <option key={ay.id} value={ay.id}>
              {ay.name} {ay.isCurrent ? "(Current)" : ""}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Fee Category</label>
        <select
          name="feeCategoryId"
          required
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {filteredCategories.length === 0 ? (
            <option value="" disabled>No fee categories for this year</option>
          ) : (
            filteredCategories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} - INR {c.amount.toLocaleString()}
              </option>
            ))
          )}
        </select>
        {filteredCategories.length === 0 && (
          <p className="text-[11px] text-amber-600 mt-1">No fee templates configured for the selected year. Create them in School Year Setup.</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Amount Paid</label>
          <Input name="amount" type="number" required />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Method</label>
          <select name="paymentMethod" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CHEQUE">Cheque</option>
            <option value="BANK_TRANSFER">Bank Tx</option>
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Reference (e.g. UTR)</label>
        <Input name="reference" />
      </div>
      <Button type="submit" className="w-full mt-2">Log Payment</Button>
    </form>
  );
}
