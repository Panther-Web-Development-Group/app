"use client"
import { 
  useCallback, 
  useEffect, 
  useId, 
  useRef, 
  useState,
  type Dispatch,
  type SetStateAction 
} from "react"
import { createClient } from "@/app/supabase/services/client"
import { Button } from "@/app/components/Button"
import { Input } from "@/app/components/Form/Input"
import { Image as ImageIcon, X, Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/cn"

type MediaAsset = {
  id: string
  file_url: string
  filename: string
  alt_text?: string | null
  asset_type: "image" | "video" | "audio" | "document" | "other"
}

interface ImageSelectorProps {
  value?: string
  onValueChange?: Dispatch<SetStateAction<string | null>>
  className?: string
  disabled?: boolean
  placeholder?: string
  showPreview?: boolean
}

export function ImageSelector({
  value,
  onValueChange,
  className,
  disabled = false,
  placeholder = "Select an image",
  showPreview = true,
}: ImageSelectorProps) {
  const [open, setOpen] = useState(false)
  const [images, setImages] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonId = useId()
  const dialogId = useId()

  // Fetch images from Supabase
  const fetchImages = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("You must be signed in to select images")
        setLoading(false)
        return
      }

      let query = supabase
        .from("media_assets")
        .select("id, file_url, filename, alt_text, asset_type")
        .eq("owner_id", user.id)
        .eq("asset_type", "image")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(100)

      if (searchQuery.trim()) {
        query = query.ilike("filename", `%${searchQuery.trim()}%`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        setError(fetchError.message)
        setImages([])
      } else {
        setImages((data || []) as MediaAsset[])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch images")
      setImages([])
    } finally {
      setLoading(false)
    }
  }, [searchQuery])

  // Fetch images when dialog opens
  useEffect(() => {
    if (open) {
      fetchImages()
    }
  }, [open, fetchImages])

  // Close dialog on Escape key
  useEffect(() => {
    if (!open) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [open])

  // Close dialog when clicking outside
  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    // Use setTimeout to avoid immediate close on open
    setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside)
    }, 0)

    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  const handleSelect = useCallback(
    (url: string) => {
      onValueChange?.(url)
      setOpen(false)
      setSearchQuery("")
    },
    [onValueChange]
  )

  const handleClear = useCallback(() => {
    onValueChange?.(null)
    setOpen(false)
    setSearchQuery("")
  }, [onValueChange])

  const selectedImage = images.find((img) => img.file_url === value)

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <Button
        id={buttonId}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        variant="outline"
        className="w-full justify-start"
        icon={<ImageIcon className="h-4 w-4" />}
      >
        {value && showPreview ? (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <img
              src={value}
              alt={selectedImage?.alt_text || selectedImage?.filename || "Selected image"}
              className="h-5 w-5 rounded object-cover shrink-0"
            />
            <span className="truncate text-xs">
              {selectedImage?.filename || placeholder}
            </span>
          </div>
        ) : (
          <span className="text-xs">{placeholder}</span>
        )}
      </Button>

      {open && (
        <div
          id={dialogId}
          role="dialog"
          aria-labelledby={buttonId}
          className="absolute left-0 top-full z-50 mt-1.5 w-[480px] max-w-[calc(100vw-2rem)] rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg backdrop-blur-sm"
        >
          <div className="flex flex-col max-h-[450px]">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 px-2.5 py-2">
              <h3 className="text-xs font-semibold text-foreground">Select Image</h3>
              <div className="flex items-center gap-1">
                {value && (
                  <Button
                    type="button"
                    onClick={handleClear}
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                  >
                    Clear
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() => setOpen(false)}
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  aria-label="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="border-b border-zinc-200 dark:border-zinc-800 px-2.5 py-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                <Input
                  type="text"
                  placeholder="Search images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 h-8 text-xs"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-2.5">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-400 dark:text-zinc-500" />
                </div>
              ) : error ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{error}</p>
                </div>
              ) : images.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {searchQuery ? "No images found" : "No images available"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image) => {
                    const isSelected = image.file_url === value
                    return (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => handleSelect(image.file_url)}
                        className={cn(
                          "group relative aspect-square rounded border overflow-hidden transition-all",
                          isSelected
                            ? "border-2 border-primary ring-1 ring-primary/20"
                            : "border border-zinc-200 dark:border-zinc-800 hover:border-primary/50"
                        )}
                      >
                        <img
                          src={image.file_url}
                          alt={image.alt_text || image.filename}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                            <div className="rounded-full bg-primary p-1">
                              <ImageIcon className="h-2.5 w-2.5 text-primary-foreground" />
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-[10px] text-white truncate leading-tight">{image.filename}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
