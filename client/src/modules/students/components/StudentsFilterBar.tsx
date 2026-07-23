import { Card } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Button } from "@/core/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { Search, Filter, Calendar, ArrowUpDown } from "lucide-react";

interface StudentsFilterBarProps {
  q: string;
  setQ: (val: string) => void;
  selectedGender: string;
  setSelectedGender: (val: string) => void;
  selectedProgram: string;
  setSelectedProgram: (val: string) => void;
  selectedDept: string;
  setSelectedDept: (val: string) => void;
  selectedYear: string;
  setSelectedYear: (val: string) => void;
  duesFilter: string;
  setDuesFilter: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  sortOrder: "asc" | "desc";
  toggleSortOrder: () => void;
  departments: any[];
  academicYears: any[];
  setPage: (p: number) => void;
}

export function StudentsFilterBar({
  q,
  setQ,
  selectedGender,
  setSelectedGender,
  selectedProgram,
  setSelectedProgram,
  selectedDept,
  setSelectedDept,
  selectedYear,
  setSelectedYear,
  duesFilter,
  setDuesFilter,
  sortBy,
  setSortBy,
  sortOrder,
  toggleSortOrder,
  departments,
  academicYears,
  setPage,
}: StudentsFilterBarProps) {
  return (
    <Card className="p-4">
      <div className="grid gap-3 md:grid-cols-8">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search name, UID, reg no, email…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Gender Filter */}
        <div>
          <Select
            value={selectedGender}
            onValueChange={(val) => {
              setSelectedGender(val);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hostels</SelectItem>
              <SelectItem value="boys">Boys Hostel</SelectItem>
              <SelectItem value="girls">Girls Hostel</SelectItem>
              <SelectItem value="co-ed">Co-Ed Hostel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Program Filter */}
        <div>
          <Select
            value={selectedProgram}
            onValueChange={(val) => {
              setSelectedProgram(val);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              <SelectItem value="UG">UG (Undergraduate)</SelectItem>
              <SelectItem value="PG">PG (Postgraduate)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Department Filter */}
        <div>
          <Select
            value={selectedDept}
            onValueChange={(val) => {
              setSelectedDept(val);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d._id} value={d._id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Academic Year Batch Filter */}
        <div>
          <Select
            value={selectedYear}
            onValueChange={(val) => {
              setSelectedYear(val);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <Calendar className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Academic Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {academicYears.map((y) => (
                <SelectItem key={y._id} value={y._id}>
                  {y.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dues Status Filter */}
        <div>
          <Select
            value={duesFilter}
            onValueChange={(val) => {
              setDuesFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Dues Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dues Status</SelectItem>
              <SelectItem value="with_dues">With Pending Dues</SelectItem>
              <SelectItem value="no_dues">No Dues (Paid)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Controls */}
        <div className="flex gap-1.5">
          <Select
            value={sortBy}
            onValueChange={(val) => {
              setSortBy(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fullName">Full Name</SelectItem>
              <SelectItem value="registrationNumber">Reg Number</SelectItem>
              <SelectItem value="department">Department</SelectItem>
              <SelectItem value="academicYear">Academic Batch</SelectItem>
              <SelectItem value="dues">Dues Amount</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortOrder}
            title={`Sort Order: ${sortOrder.toUpperCase()}`}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
