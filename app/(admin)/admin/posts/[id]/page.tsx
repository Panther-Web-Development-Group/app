"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { RTERoot } from "@/app/components/Form/RTE"
import { getEditorStateAsJSON } from "@/app/components/Form/RTE/actions/editorState"
import { updatePost, getPostById, createPost } from "@/lib/supabase/server/actions/posts"
import { Save, X, Eye } from "lucide-react"
import Link from "next/link"
import { EditorState, LexicalEditor } from "lexical"
import { Button } from "@/app/components/Button"
import { Checkbox } from "@/app/components/Form/Checkbox"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { TextAreaGroup } from "@/app/components/Form/TextAreaGroup"
import { TitleWithSlug } from "@/app/(admin)/admin/pages/[id]/TitleWithSlug"
import { ImageSelector } from "@/app/(admin)/admin/ImageSelector"

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const isNew = id === "new"

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [featuredImage, setFeaturedImage] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editorState, setEditorState] = useState<string | null>(null)
  const editorRef = useRef<LexicalEditor | null>(null)

  // Slug behavior: when locked, slug is read-only and always auto-generated from Title
  // when unlocked, slug is user-editable and stops auto-updating
  const [slugLocked, setSlugLocked] = useState<boolean>(isNew ? true : false)

  const loadPost = useCallback(async () => {
    setLoading(true)
    try {
      const { error, data } = await getPostById(id)
      if (error) {
        setError(error)
        return
      }
      if (data) {
        setTitle(data.title)
        setSlug(data.slug)
        setExcerpt(data.excerpt || "")
        setFeaturedImage(data.featured_image || "")
        setIsPublished(data.is_published || false)
        // Set editor content - handle Lexical JSON, HTML string, or object with html property
        const c = data.content as unknown
        if (!c) {
          setEditorState(null)
        } else if (typeof c === "string") {
          setEditorState(c)
        } else if (typeof c === "object" && c && "root" in c) {
          setEditorState(JSON.stringify(c))
        } else if (
          typeof c === "object" &&
          c &&
          "html" in c &&
          typeof (c as { html?: unknown }).html === "string"
        ) {
          setEditorState((c as { html: string }).html)
        } else {
          setEditorState(null)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load post")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (!isNew) loadPost()
  }, [loadPost, isNew])

  const handleEditorChange = async (
    _state: EditorState,
    editor: LexicalEditor,
  ) => {
    editorRef.current = editor
    const json = await getEditorStateAsJSON(editor)
    setEditorState(json)
  }

  const handleSave = async (publish: boolean = false) => {
    if (!title.trim() || !slug.trim()) {
      setError("Title and slug are required")
      return
    }

    if (!editorRef.current) {
      setError("Editor content is required")
      return
    }

    setSaving(true)
    setError(null)

    try {
      if (!editorRef.current) {
        setError("Editor content is required")
        return
      }

      // Get the Lexical JSON state
      const contentJson = await getEditorStateAsJSON(editorRef.current)
      const content = JSON.parse(contentJson)

      const postData = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || undefined,
        featured_image: featuredImage.trim() || undefined,
        content,
        is_published: publish || isPublished,
      }

      let result
      if (isNew) {
        result = await createPost(postData)
      } else {
        result = await updatePost({
          id,
          ...postData,
        })
      }

      if (result.error) {
        setError(result.error)
      } else {
        router.push("/admin/posts")
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save post")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-50"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            {isNew ? "Create Post" : "Edit Post"}
          </h2>
          <p className="mt-2 text-foreground/75">
            {isNew ? "Create a new blog post" : "Edit your blog post"}
          </p>
        </div>
        <Link
          href="/admin/posts"
          className="inline-flex items-center gap-2 rounded-lg border border-(--pw-border) bg-secondary/20 px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary/30"
        >
          <X className="h-4 w-4" />
          Cancel
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="space-y-6 rounded-lg border border-(--pw-border) bg-background/50 p-6">
        <TitleWithSlug
          title={title}
          slug={slug}
          slugLocked={slugLocked}
          onTitleChange={setTitle}
          onSlugChange={setSlug}
          onSlugLockedChange={setSlugLocked}
          titlePlaceholder="Post title"
          slugPlaceholder="post-slug"
          titleLabel="Title"
          slugLabel="Slug"
        />

        <TextAreaGroup
          label="Excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          placeholder="Brief description of the post"
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/80">
            Featured Image
          </label>
          <ImageSelector
            value={featuredImage}
            onValueChange={setFeaturedImage}
            placeholder="Select a featured image"
            className="mt-1"
          />
        </div>

        <div>
          <RTERoot
            label="Content"
            required
            labelClassName="mb-2 block text-sm font-medium text-foreground/80"
            contentMinHeightClassName="min-h-[220px]"
            initialContent={editorState}
            onChange={handleEditorChange}
            placeholder="Write your post content here..."
          />
        </div>

        <div className="flex items-center gap-4">
          <Checkbox
            checked={isPublished}
            onCheckedChange={setIsPublished}
            label="Published"
          />
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-(--pw-border)">
          <Button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            variant="ghost"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            variant="ghost"
          >
            <Eye className="h-4 w-4" />
            {saving ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>
    </div>
  )
}
