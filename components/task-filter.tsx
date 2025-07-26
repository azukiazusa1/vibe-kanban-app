"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface TaskFilterProps {
  onFilterChange: (filter: string) => void;
}

export function TaskFilter({ onFilterChange }: TaskFilterProps) {
  const [filter, setFilter] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilter(value);
    onFilterChange(value);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center space-x-2">
        <Label htmlFor="task-filter" className="sr-only">
          タスクをフィルタリング
        </Label>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="task-filter"
            type="text"
            placeholder="タスクをタイトルで検索..."
            value={filter}
            onChange={handleInputChange}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
}
