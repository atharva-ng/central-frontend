"use client"

import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import CharacterCount from "@tiptap/extension-character-count"
import { marked } from "marked"
import { useEffect, useMemo } from "react"
import type { ArticleImage } from "@/lib/article-data"

const PROSE_CLASSES =
  "prose prose-sm max-w-none focus:outline-none " +
  "prose-headings:tracking-tight prose-headings:font-semibold " +
  "prose-h1:text-3xl prose-h1:leading-tight prose-h1:mb-6 " +
  "prose-h2:text-xl prose-h2:mt-10 prose-h3:text-base " +
  "prose-p:leading-relaxed prose-p:text-foreground " +
  "prose-strong:text-foreground prose-strong:font-medium " +
  "prose-a:text-primary prose-a:no-underline hover:prose-a:underline " +
  "prose-img:rounded-lg prose-img:my-6 prose-img:cursor-pointer " +
  // ProseMirror adds .ProseMirror-selectednode to clicked images
  "[&_img.ProseMirror-selectednode]:outline-2 [&_img.ProseMirror-selectednode]:outline-primary " +
  "[&_img.ProseMirror-selectednode]:outline-offset-2 " +
  "[&_a]:cursor-pointer " +
  "[&_[data-placeholder-image]]:bg-muted [&_[data-placeholder-image]]:border " +
  "[&_[data-placeholder-image]]:border-dashed [&_[data-placeholder-image]]:border-border " +
  "[&_[data-placeholder-image]]:rounded-lg [&_[data-placeholder-image]]:py-12 " +
  "[&_[data-placeholder-image]]:text-center [&_[data-placeholder-image]]:text-sm " +
  "[&_[data-placeholder-image]]:text-muted-foreground [&_[data-placeholder-image]]:not-italic"

interface UseArticleEditorOpts {
  markdown: string
  images: ArticleImage[]
  editable: boolean
  onUpdate?: (html: string) => void
}

export function useArticleEditor({
  markdown,
  images,
  editable,
  onUpdate,
}: UseArticleEditorOpts): Editor | null {
  const html = useMemo(() => {
    let md = markdown
    for (const img of images) {
      const token = img.position === "thumbnail" ? "{{IMAGE_THUMBNAIL}}" : "{{IMAGE_MID_ARTICLE}}"
      const replacement = img.s3_key
        ? `\n<img src="${img.s3_key}" alt="${img.alt}" />\n`
        : `\n<p data-placeholder-image="${img.position}">⏳ ${img.position === "thumbnail" ? "Thumbnail" : "Mid-article image"} generating…</p>\n`
      md = md.replace(token, replacement)
    }
    return marked.parse(md, { async: false }) as string
  }, [markdown, images])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Image.configure({ HTMLAttributes: { class: "rounded-lg my-6 w-full" } }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "underline underline-offset-4" },
      }),
      Placeholder.configure({ placeholder: "Start writing…" }),
      CharacterCount,
    ],
    content: html,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onUpdate?.(editor.getHTML()),
    editorProps: {
      attributes: { class: PROSE_CLASSES },
    },
  })

  // Re-sync content when external markdown changes
  useEffect(() => {
    if (editor && editor.getHTML() !== html && !editor.isFocused) {
      editor.commands.setContent(html, { emitUpdate: false })
    }
  }, [html, editor])

  // Toggle editable
  useEffect(() => {
    if (editor) editor.setEditable(editable)
  }, [editable, editor])

  return editor
}

export function ArticleEditorContent({ editor }: { editor: Editor | null }) {
  return <EditorContent editor={editor} />
}
