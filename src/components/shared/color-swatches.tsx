"use client";

import { Check } from "lucide-react";

import { SWATCH_COLORS } from "@/config/colors";
import { cn } from "@/lib/utils";

interface ColorSwatchesProps {
  value: string;
  onChange: (color: string) => void;
  colors?: string[];
}

export function ColorSwatches({
  value,
  onChange,
  colors = SWATCH_COLORS,
}: ColorSwatchesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          type="button"
          key={color}
          onClick={() => onChange(color)}
          className={cn(
            "grid h-7 w-7 place-items-center rounded-full ring-offset-2 ring-offset-background transition-transform hover:scale-110",
            value === color && "ring-2 ring-ring",
          )}
          style={{ backgroundColor: color }}
          aria-label={`Select color ${color}`}
        >
          {value === color && <Check className="h-3.5 w-3.5 text-white" />}
        </button>
      ))}
    </div>
  );
}
