"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createColumn } from "@/app/actions/board";

const PRESET_COLORS = [
  "#ef4444", // red-500
  "#f59e0b", // amber-500
  "#10b981", // emerald-500
  "#3b82f6", // blue-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#64748b", // slate-500
  "#6b7280", // gray-500
];

interface ColumnCreationFormProps {
  boardId: string;
}

export function ColumnCreationForm({ boardId }: ColumnCreationFormProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleStartAdding = () => {
    setIsAdding(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setTitle("");
    setSelectedColor(PRESET_COLORS[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      await createColumn(boardId, title.trim(), selectedColor);
      handleCancel();
      router.refresh();
    } catch (error) {
      console.error("Failed to create column:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (!isAdding) {
    return (
      <div className="flex-shrink-0 w-80">
        <Button
          variant="ghost"
          className="w-full h-12 border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 text-muted-foreground hover:text-foreground"
          onClick={handleStartAdding}
        >
          <Plus className="h-4 w-4 mr-2" />
          新しいカラムを追加
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-80 bg-muted/50 rounded-lg p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="カラム名を入力"
          className="w-full"
          disabled={isSubmitting}
          maxLength={50}
        />
        
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">カラー</div>
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-6 h-6 rounded-full border-2 ${
                  selectedColor === color ? "border-foreground" : "border-transparent"
                } hover:scale-110 transition-transform`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
                disabled={isSubmitting}
              />
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            type="submit"
            size="sm"
            disabled={!title.trim() || isSubmitting}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-1" />
            {isSubmitting ? "追加中..." : "追加"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}