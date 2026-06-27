"use client";

import { CATEGORY_ICONS } from "@/config/icons";
import { cn } from "@/lib/utils";

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  emojis?: string[];
}

export function EmojiPicker({
  value,
  onChange,
  emojis = CATEGORY_ICONS,
}: EmojiPickerProps) {
  return (
    <div className="grid max-h-40 grid-cols-10 gap-1 overflow-y-auto rounded-md border border-input p-2">
      {emojis.map((emoji) => (
        <button
          type="button"
          key={emoji}
          onClick={() => onChange(emoji)}
          className={cn(
            "grid h-8 w-8 place-items-center rounded-md text-lg transition-colors hover:bg-accent",
            value === emoji && "bg-accent ring-2 ring-ring",
          )}
          aria-label={`Select icon ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
