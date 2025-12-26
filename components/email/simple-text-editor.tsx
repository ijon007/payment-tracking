"use client";

import {
  ListBullets,
  ListNumbers,
  TextB,
  TextItalic,
  TextUnderline,
} from "@phosphor-icons/react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SimpleTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SimpleTextEditor({
  value,
  onChange,
  placeholder = "Write your message here...",
  className,
}: SimpleTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after = "") => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    const newText = `${beforeText}${before}${selectedText}${after}${afterText}`;
    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos =
        start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatBold = () => {
    insertText("**", "**");
  };

  const formatItalic = () => {
    insertText("*", "*");
  };

  const formatUnderline = () => {
    insertText("<u>", "</u>");
  };

  const formatBulletList = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = value.indexOf("\n", start);
    const lineEndPos = lineEnd === -1 ? value.length : lineEnd;
    const line = value.substring(lineStart, lineEndPos);

    const newLine = line.trim().startsWith("- ")
      ? line.trim().slice(2)
      : `- ${line.trim()}`;
    const newText = `${value.substring(0, lineStart)}${newLine}${value.substring(lineEndPos)}`;
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = lineStart + newLine.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatNumberedList = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = value.indexOf("\n", start);
    const lineEndPos = lineEnd === -1 ? value.length : lineEnd;
    const line = value.substring(lineStart, lineEndPos);

    const newLine = /^\d+\.\s/.test(line.trim())
      ? line.trim().replace(/^\d+\.\s/, "")
      : `1. ${line.trim()}`;
    const newText = `${value.substring(0, lineStart)}${newLine}${value.substring(lineEndPos)}`;
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = lineStart + newLine.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-border",
        className
      )}
    >
      <div className="flex items-center gap-1 border-border border-b bg-muted/30 p-2">
        <Button
          className="h-7 w-7"
          onClick={formatBold}
          size="icon"
          title="Bold"
          type="button"
          variant="ghost"
        >
          <TextB className="h-4 w-4" />
        </Button>
        <Button
          className="h-7 w-7"
          onClick={formatItalic}
          size="icon"
          title="Italic"
          type="button"
          variant="ghost"
        >
          <TextItalic className="h-4 w-4" />
        </Button>
        <Button
          className="h-7 w-7"
          onClick={formatUnderline}
          size="icon"
          title="Underline"
          type="button"
          variant="ghost"
        >
          <TextUnderline className="h-4 w-4" />
        </Button>
        <div className="mx-1 h-6 w-px bg-border" />
        <Button
          className="h-7 w-7"
          onClick={formatBulletList}
          size="icon"
          title="Bullet List"
          type="button"
          variant="ghost"
        >
          <ListBullets className="h-4 w-4" />
        </Button>
        <Button
          className="h-7 w-7"
          onClick={formatNumberedList}
          size="icon"
          title="Numbered List"
          type="button"
          variant="ghost"
        >
          <ListNumbers className="h-4 w-4" />
        </Button>
      </div>
      <textarea
        className="min-h-[200px] w-full resize-none border-0 bg-background p-4 text-foreground text-sm focus:outline-none focus:ring-0"
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        ref={textareaRef}
        value={value}
      />
    </div>
  );
}
