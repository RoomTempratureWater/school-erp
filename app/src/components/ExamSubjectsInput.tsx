"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ExamSubjectsInput() {
  const [subjects, setSubjects] = useState<{ name: string; maxMarks: string }[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [newMaxMarks, setNewMaxMarks] = useState("100");

  const addSubject = () => {
    if (!newSubject || !newMaxMarks) return;
    setSubjects([...subjects, { name: newSubject, maxMarks: newMaxMarks }]);
    setNewSubject("");
  };

  const removeSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <input type="hidden" name="subjects" value={JSON.stringify(subjects)} />
      
      <div className="flex gap-2 items-end">
        <div className="space-y-1 flex-1">
          <label className="text-xs font-medium text-foreground">Subject Name</label>
          <Input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="e.g. Mathematics" />
        </div>
        <div className="space-y-1 w-24">
          <label className="text-xs font-medium text-foreground">Max Marks</label>
          <Input type="number" value={newMaxMarks} onChange={(e) => setNewMaxMarks(e.target.value)} />
        </div>
        <Button type="button" onClick={addSubject} variant="secondary">Add</Button>
      </div>

      {subjects.length > 0 && (
        <div className="bg-slate-50 border rounded-md p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">Added Subjects</p>
          {subjects.map((sub, i) => (
            <div key={i} className="flex justify-between items-center text-sm bg-white border px-3 py-1.5 rounded">
              <span className="font-semibold">{sub.name} <span className="text-muted-foreground font-normal ml-1">(Max: {sub.maxMarks})</span></span>
              <button type="button" onClick={() => removeSubject(i)} className="text-red-500 hover:underline text-xs">Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
