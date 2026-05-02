"use client"

import { useState } from "react"
import { type Editor } from "@tiptap/react"
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Redo2,
  Undo2,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface ArticleToolbarProps {
  editor: Editor | null
  disabled?: boolean
}

export function ArticleToolbar({ editor, disabled }: ArticleToolbarProps) {
  if (!editor) {
    return <div className="h-7" aria-hidden />
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-border bg-card p-0.5",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      <Btn
        icon={Bold}
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <Btn
        icon={Italic}
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <Btn
        icon={Strikethrough}
        label="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />

      <Sep />

      <Btn
        icon={Heading2}
        label="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <Btn
        icon={Heading3}
        label="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />

      <Sep />

      <Btn
        icon={List}
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <Btn
        icon={ListOrdered}
        label="Ordered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <Btn
        icon={Quote}
        label="Quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />

      <Sep />

      <LinkEditPopover editor={editor} />

      <Sep />

      <Btn
        icon={Undo2}
        label="Undo"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      />
      <Btn
        icon={Redo2}
        label="Redo"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      />
    </div>
  )
}

function LinkEditPopover({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const isActive = editor.isActive("link")

  function handleOpenChange(next: boolean) {
    if (next) {
      const current = editor.getAttributes("link").href as string | undefined
      setUrl(current ?? "")
    }
    setOpen(next)
  }

  function apply() {
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run()
    }
    setOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      apply()
    }
    if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        className={cn(
          "size-7 rounded-full inline-flex items-center justify-center transition-colors",
          isActive
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        aria-label="Link"
        title="Link"
      >
        <Link2 className="size-3.5" />
      </PopoverTrigger>
      <PopoverContent side="bottom" sideOffset={8} className="w-72 flex flex-col gap-3 p-3">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Link URL
        </span>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://"
          className="h-8 text-xs font-mono"
          autoFocus
        />
        <div className="flex items-center justify-between gap-2">
          {isActive ? (
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().extendMarkRange("link").unsetLink().run()
                setOpen(false)
              }}
              className="text-xs text-destructive hover:opacity-70 transition-opacity"
            >
              Remove link
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-7 text-xs"
              onClick={apply}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function Btn({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: LucideIcon
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "size-7 rounded-full inline-flex items-center justify-center transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        disabled && "opacity-30 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground"
      )}
    >
      <Icon className="size-3.5" />
    </button>
  )
}

function Sep() {
  return <span className="w-px h-4 bg-border mx-0.5" />
}
