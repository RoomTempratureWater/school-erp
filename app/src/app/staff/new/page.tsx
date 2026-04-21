import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { createStaff } from "./actions";

export default function NewStaffPage() {
  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 w-full">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Staff</h1>
            <p className="text-muted-foreground mt-1">
              Create a new staff member profile.
            </p>
          </div>
          <Link href="/staff">
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Staff Details</CardTitle>
            <CardDescription>
              Enter the staff member's information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createStaff} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium">First Name</label>
                  <Input name="firstName" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Last Name</label>
                  <Input name="lastName" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Employee ID</label>
                  <Input name="employeeId" required placeholder="E.g. EMP-101" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Role</label>
                  <select
                    name="role"
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="TEACHING">Teaching</option>
                    <option value="NON_TEACHING">Non-Teaching</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Phone Number</label>
                  <Input name="phone" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-medium">Address</label>
                  <Textarea name="address" rows={2} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-medium">Job Description</label>
                  <Textarea
                    name="jobDescription"
                    placeholder="Outline roles and responsibilities..."
                    rows={3}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-medium">Do's and Don'ts</label>
                  <Textarea
                    name="dosAndDonts"
                    placeholder="Guidelines expected for this role..."
                    rows={3}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-medium">Achievements</label>
                  <Textarea
                    name="achievements"
                    placeholder="Notable awards or contributions..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Link href="/staff">
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button type="submit">Create Staff Member</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
