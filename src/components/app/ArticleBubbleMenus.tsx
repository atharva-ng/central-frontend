"use client"

import { useState } from "react"
import { type Editor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import {
  Check,
  ExternalLink,
  Pencil,
  Trash2,
  Type,
  Unlink,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ── Image bubble menu ───────────────────────────────────────────────────────

export function ImageBubbleMenu({ editor }: { editor: Editor | null }) {
  const [editingAlt, setEditingAlt] = useState(false)
  const [altText, setAltText] = useState("")

  if (!editor) return null

  function startEditAlt() {
    if (!editor) return
    const current = (editor.getAttributes("image").alt as string) ?? ""
    setAltText(current)
    setEditingAlt(true)
  }

  function applyAlt() {
    if (!editor) return
    editor
      .chain()
      .focus()
      .updateAttributes("image", { alt: altText.trim() })
      .run()
    setEditingAlt(false)
  }

  function cancelAlt() {
    setEditingAlt(false)
    setAltText("")
  }

  function deleteImage() {
    if (!editor) return
    editor.chain().focus().deleteSelection().run()
    setEditingAlt(false)
  }

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="image-bubble-menu"
      shouldShow={({ editor }) => editor.isActive("image")}
      options={{ placement: "top", offset: 10 }}
    >
      <div
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-lg",
          "data-[state=closed]:opacity-0"
        )}
      >
        {editingAlt ? (
          <>
            <Input
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  applyAlt()
                }
                if (e.key === "Escape") cancelAlt()
              }}
              placeholder="Alt text describing the image…"
              className="h-7 w-64 text-xs"
              autoFocus
            />
            <IconBtn
              icon={Check}
              label="Apply alt text"
              onClick={applyAlt}
              variant="primary"
            />
            <IconBtn icon={X} label="Cancel" onClick={cancelAlt} />
          </>
        ) : (
          <>
            <IconBtn icon={Type} label="Edit alt text" onClick={startEditAlt} />
            <Sep />
            <IconBtn
              icon={Trash2}
              label="Delete image"
              onClick={deleteImage}
              variant="destructive"
            />
          </>
        )}
      </div>
    </BubbleMenu>
  )
}

// ── Link bubble menu ────────────────────────────────────────────────────────

export function LinkBubbleMenu({ editor }: { editor: Editor | null }) {
  const [editingUrl, setEditingUrl] = useState(false)
  const [url, setUrl] = useState("")

  if (!editor) return null

  function startEditUrl() {
    if (!editor) return
    const current = (editor.getAttributes("link").href as string) ?? ""
    setUrl(current)
    setEditingUrl(true)
  }

  function applyUrl() {
    if (!editor) return
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url.trim() })
        .run()
    }
    setEditingUrl(false)
  }

  function removeLink() {
    if (!editor) return
    editor.chain().focus().extendMarkRange("link").unsetLink().run()
    setEditingUrl(false)
  }

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="link-bubble-menu"
      shouldShow={({ editor }) =>
        editor.isActive("link") && !editor.isActive("image")
      }
      options={{ placement: "bottom", offset: 8 }}
    >
      <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-lg">
        {editingUrl ? (
          <>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  applyUrl()
                }
                if (e.key === "Escape") setEditingUrl(false)
              }}
              placeholder="https://"
              className="h-7 w-64 text-xs font-mono"
              autoFocus
            />
            <IconBtn
              icon={Check}
              label="Apply URL"
              onClick={applyUrl}
              variant="primary"
            />
            <IconBtn
              icon={X}
              label="Cancel"
              onClick={() => setEditingUrl(false)}
            />
          </>
        ) : (
          <>
            <LinkPreview editor={editor} />
            <Sep />
            <IconBtn icon={Pencil} label="Edit link" onClick={startEditUrl} />
            <IconBtn
              icon={Unlink}
              label="Remove link"
              onClick={removeLink}
              variant="destructive"
            />
          </>
        )}
      </div>
    </BubbleMenu>
  )
}

function LinkPreview({ editor }: { editor: Editor }) {
  const href = (editor.getAttributes("link").href as string) ?? ""
  const display = href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors max-w-[220px]"
    >
      <span className="truncate font-mono">{display || "—"}</span>
      <ExternalLink className="size-3 shrink-0" />
    </a>
  )
}

// ── Shared building blocks ──────────────────────────────────────────────────

type Variant = "default" | "primary" | "destructive"

function IconBtn({
  icon: Icon,
  label,
  onClick,
  variant = "default",
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  variant?: Variant
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "size-7 rounded-full inline-flex items-center justify-center transition-colors",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "destructive" &&
          "text-destructive hover:bg-destructive/10",
        variant === "default" &&
          "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="size-3.5" />
    </button>
  )
}

function Sep() {
  return <span className="w-px h-4 bg-border mx-0.5" />
}
