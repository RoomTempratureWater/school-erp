"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { promoteStudents } from "./actions";
import { Check, Loader2, UserCheck, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type StudentWithExamResults = {
  id: number;
  grNo: string;
  firstName: string;
  lastName: string;
  standard: string;
  division: string;
  totalMarks?: number;
  maxMarks?: number;
  percentage?: number;
  isFail?: boolean;
};

export default function PromotionTable({
  students,
  academicYearId,
  allStandards,
  allDivisions,
}: {
  students: StudentWithExamResults[];
  academicYearId: number;
  allStandards: string[];
  allDivisions: string[];
}) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [promotionData, setPromotionData] = useState<Record<number, { standard: string; division: string; status: "PROMOTED" | "RE_EXAM" | "DETAINED" }>>(
    Object.fromEntries(
      students.map((s) => {
        // Auto-fill logic: If not fail, promote to next standard. If fail, set to re-exam.
        const currentStd = parseInt(s.standard, 10);
        let nextStd = s.standard;
        let status: "PROMOTED" | "RE_EXAM" | "DETAINED" = "PROMOTED";
        
        if (s.isFail) {
          status = "RE_EXAM";
          nextStd = s.standard;
        } else if (!isNaN(currentStd)) {
          nextStd = (currentStd + 1).toString();
        }
        
        return [s.id, { standard: nextStd, division: s.division, status }];
      })
    )
  );

  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const toggleAll = () => {
    if (selectedIds.size === students.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(students.map((s) => s.id)));
    }
  };

  const toggleOne = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const updateTarget = (id: number, field: "standard" | "division" | "status", value: string) => {
    setPromotionData((prev) => {
      const updated = { ...prev[id], [field]: value as any };
      
      if (field === "status") {
        const student = students.find(s => s.id === id)!;
        if (value === "PROMOTED") {
          const currentStd = parseInt(student.standard, 10);
          if (!isNaN(currentStd)) updated.standard = (currentStd + 1).toString();
        } else {
          updated.standard = student.standard;
        }
      }
      
      return { ...prev, [id]: updated };
    });
  };

  const handlePromote = async () => {
    if (selectedIds.size === 0) return;

    const dataToSubmit = Array.from(selectedIds).map((id) => {
      const student = students.find((s) => s.id === id)!;
      return {
        studentId: id,
        fromStandard: student.standard,
        fromDivision: student.division,
        toStandard: promotionData[id].standard,
        toDivision: promotionData[id].division,
        status: promotionData[id].status,
      };
    });

    startTransition(async () => {
      const result = await promoteStudents(academicYearId, dataToSubmit);
      if (result.success) {
        setSuccess(true);
        setSelectedIds(new Set());
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert(result.error);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm sticky top-[72px] z-40">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
            {selectedIds.size} Students Selected
          </Badge>
          {success && (
            <span className="text-green-600 flex items-center gap-1 text-sm font-medium animate-in fade-in slide-in-from-left-2">
              <Check className="size-4" /> Promotion successful!
            </span>
          )}
        </div>
        <Button 
          onClick={handlePromote} 
          disabled={selectedIds.size === 0 || isPending}
          className="bg-primary hover:bg-primary/90 text-white shadow-lg transition-all active:scale-95"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <UserCheck className="mr-2 h-4 w-4" />
              Promote Selected
            </>
          )}
        </Button>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="w-[50px]">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    checked={selectedIds.size === students.length && students.length > 0}
                    onChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Enrollment & Name</TableHead>
                <TableHead>Current Class</TableHead>
                <TableHead>Exam Context</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[200px]">Promotion Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground h-40">
                    No students found for the selected criteria.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((s) => (
                  <TableRow key={s.id} className={selectedIds.has(s.id) ? "bg-primary/5" : "hover:bg-slate-50/50"}>
                    <TableCell>
                      <input
                        type="checkbox"
                        className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        checked={selectedIds.has(s.id)}
                        onChange={() => toggleOne(s.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground font-mono">{s.grNo}</span>
                        <span className="font-semibold text-slate-900">{s.firstName} {s.lastName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                        {s.standard}-{s.division}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {s.percentage !== undefined ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold">{s.percentage.toFixed(1)}%</span>
                            {s.isFail ? (
                              <Badge className="bg-red-50 text-red-700 border-red-100 text-[10px] h-4">FAIL</Badge>
                            ) : (
                              <Badge className="bg-green-50 text-green-700 border-green-100 text-[10px] h-4">PASS</Badge>
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-tight">
                            Latest Exam Result
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No Marks Found</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <select
                        value={promotionData[s.id].status}
                        onChange={(e) => updateTarget(s.id, "status", e.target.value)}
                        className={`w-full rounded-md border border-input px-2 py-1.5 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                          promotionData[s.id].status === "PROMOTED" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                          promotionData[s.id].status === "RE_EXAM" ? "bg-amber-50 text-amber-800 border-amber-200" :
                          "bg-red-50 text-red-800 border-red-200"
                        }`}
                      >
                        <option value="PROMOTED">Promoted</option>
                        <option value="RE_EXAM">Re-Exam</option>
                        <option value="DETAINED">Detained</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <select
                            value={promotionData[s.id].standard}
                            onChange={(e) => updateTarget(s.id, "standard", e.target.value)}
                            disabled={promotionData[s.id].status !== "PROMOTED"}
                            className="w-full rounded-md border border-input bg-white px-2 py-1.5 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                          >
                            {allStandards.map((std) => (
                              <option key={std} value={std}>{std}</option>
                            ))}
                            {/* Option for next level if not in current distinct list */}
                            {!allStandards.includes((parseInt(s.standard) + 1).toString()) && (
                              <option value={(parseInt(s.standard) + 1).toString()}>
                                {(parseInt(s.standard) + 1).toString()}
                              </option>
                            )}
                          </select>
                        </div>
                        <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                        <div className="w-16">
                          <select
                            value={promotionData[s.id].division}
                            onChange={(e) => updateTarget(s.id, "division", e.target.value)}
                            className="w-full rounded-md border border-input bg-white px-2 py-1.5 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            {allDivisions.map((div) => (
                              <option key={div} value={div}>{div}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
