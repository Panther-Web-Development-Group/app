"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Editor, getEditorStateAsJSON } from "@/app/components/Editor"
import { updatePost, getPostById, createPost } from "@/lib/supabase/server/actions/posts"
import { Save, X, Eye } from "lucide-react"
import Link from "next/link"
import { EditorState, LexicalEditor } from "lexical"
import { Button } from "@/app/components/Button"

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

  // Generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  useEffect(() => {
    if (!isNew) {
      loadPost()
    }
  }, [id, isNew])

  const loadPost = async () => {
    setLoading(true)
    try {
      const result = await getPostById(id)
      if (result.error) {
        setError(result.error)
        return
      }
      if (result.data) {
        setTitle(result.data.title)
        setSlug(result.data.slug)
        setExcerpt(result.data.excerpt || "")
        setFeaturedImage(result.data.featured_image || "")
        setIsPublished(result.data.is_published || false)
        // Set editor content - if it's Lexical JSON, use it directly; if HTML, convert
        if (result.data.content) {
          if (typeof result.data.content === "string") {
            setEditorState(result.data.content)
          } else if (result.data.content.root) {
            // Lexical JSON format
            setEditorState(JSON.stringify(result.data.content))
          } else if (result.data.content.html) {
            setEditorState(result.data.content.html)
          } else {
            setEditorState(null)
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load post")
    } finally {
      setLoading(false)
    }
  }

  const handleEditorChange = async (
    state: EditorState,
    editor: LexicalEditor,
    html: string
  ) => {
    editorRef.current = editor
    // Store the Lexical JSON state
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
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {isNew ? "Create Post" : "Edit Post"}
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {isNew ? "Create a new blog post" : "Edit your blog post"}
          </p>
        </div>
        <Link
          href="/admin/posts"
          className="flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
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

      <div className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          >
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (isNew && !slug) {
                setSlug(generateSlug(e.target.value))
              }
            }}
            className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
            placeholder="Post title"
          />
        </div>

        <div>
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          >
            Slug *
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
            placeholder="post-slug"
          />
        </div>

        <div>
          <label
            htmlFor="excerpt"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          >
            Excerpt
          </label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
            placeholder="Brief description of the post"
          />
        </div>

        <div>
          <label
            htmlFor="featured-image"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          >
            Featured Image URL
          </label>
          <input
            id="featured-image"
            type="url"
            value={featuredImage}
            onChange={(e) => setFeaturedImage(e.target.value)}
            className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Content *
          </label>
          <Editor
            initialContent={editorState}
            onChange={handleEditorChange}
            placeholder="Write your post content here..."
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-zinc-600 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-zinc-600"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Published</span>
          </label>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            variant="ghost"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
