"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Bold, Italic, Underline, List, ListOrdered } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimpleTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SimpleTextEditor({
  value,
  onChange,
  placeholder = "Write your message here...",
  className,
}: SimpleTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const beforeText = value.substring(0, start)
    const afterText = value.substring(end)

    const newText = `${beforeText}${before}${selectedText}${after}${afterText}`
    onChange(newText)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const formatBold = () => {
    insertText("**", "**")
  }

  const formatItalic = () => {
    insertText("*", "*")
  }

  const formatUnderline = () => {
    insertText("<u>", "</u>")
  }

  const formatBulletList = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const lineStart = value.lastIndexOf("\n", start - 1) + 1
    const lineEnd = value.indexOf("\n", start)
    const lineEndPos = lineEnd === -1 ? value.length : lineEnd
    const line = value.substring(lineStart, lineEndPos)

    const newLine = line.trim().startsWith("- ") ? line.trim().slice(2) : `- ${line.trim()}`
    const newText = `${value.substring(0, lineStart)}${newLine}${value.substring(lineEndPos)}`
    onChange(newText)

    setTimeout(() => {
      textarea.focus()
      const newCursorPos = lineStart + newLine.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const formatNumberedList = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const lineStart = value.lastIndexOf("\n", start - 1) + 1
    const lineEnd = value.indexOf("\n", start)
    const lineEndPos = lineEnd === -1 ? value.length : lineEnd
    const line = value.substring(lineStart, lineEndPos)

    const newLine = /^\d+\.\s/.test(line.trim())
      ? line.trim().replace(/^\d+\.\s/, "")
      : `1. ${line.trim()}`
    const newText = `${value.substring(0, lineStart)}${newLine}${value.substring(lineEndPos)}`
    onChange(newText)

    setTimeout(() => {
      textarea.focus()
      const newCursorPos = lineStart + newLine.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  return (
    <div className={cn("border border-border rounded-md overflow-hidden", className)}>
      <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={formatBold}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={formatItalic}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={formatUnderline}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={formatBulletList}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={formatNumberedList}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[200px] p-4 bg-background text-sm text-foreground border-0 resize-none focus:outline-none focus:ring-0"
      />
    </div>
  )
}

