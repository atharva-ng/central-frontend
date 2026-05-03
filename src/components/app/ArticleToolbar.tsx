"use client"

import { useRef, useState } from "react"
import { type Editor } from "@tiptap/react"
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  Image as ImageIcon,
  List,
  ListOrdered,
  Quote,
  Link2,
  Redo2,
  Undo2,
  Upload,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"
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
      <ImageInsertPopover editor={editor} />

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

// 8 MB cap — anything larger gets rejected with a toast. Data URLs scale with
// the file, so this also keeps the editor doc size sane.
const MAX_IMAGE_BYTES = 8 * 1024 * 1024

function ImageInsertPopover({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [alt, setAlt] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  function reset() {
    setUrl("")
    setAlt("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    setOpen(next)
  }

  function insertFromUrl() {
    const trimmed = url.trim()
    if (!trimmed) return
    editor
      .chain()
      .focus()
      .setImage({ src: trimmed, alt: alt.trim() || undefined })
      .run()
    reset()
    setOpen(false)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Pick an image file")
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image too large — keep it under 8 MB")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      editor
        .chain()
        .focus()
        .setImage({ src: dataUrl, alt: alt.trim() || file.name })
        .run()
      reset()
      setOpen(false)
    }
    reader.onerror = () => toast.error("Couldn't read that file")
    reader.readAsDataURL(file)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      insertFromUrl()
    }
    if (e.key === "Escape") setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        className="size-7 rounded-full inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Insert image"
        title="Insert image"
      >
        <ImageIcon className="size-3.5" />
      </PopoverTrigger>
      <PopoverContent side="bottom" sideOffset={8} className="w-80 flex flex-col gap-3 p-3">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Insert image
        </span>

        {/* Upload from computer */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 h-9 rounded-md border border-dashed border-border bg-muted/30 text-sm hover:bg-muted hover:border-foreground/30 transition-colors"
        >
          <Upload className="size-3.5" />
          Upload from computer
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Divider */}
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            or paste URL
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://…"
          className="h-8 text-xs font-mono"
        />
        <Input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Alt text (optional)"
          className="h-8 text-xs"
        />
        <div className="flex items-center justify-end gap-1.5">
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
            disabled={!url.trim()}
            onClick={insertFromUrl}
          >
            Insert URL
          </Button>
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
