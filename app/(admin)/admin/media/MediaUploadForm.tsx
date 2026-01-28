"use client"

import { useState } from "react"
import { FileUpload } from "@/app/components/Form"
import { Button } from "@/app/components/Button"
import { uploadMediaAssets } from "./actions"
import { useRouter } from "next/navigation"

export function MediaUploadForm() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successCount, setSuccessCount] = useState(0)
  const router = useRouter()

  const handleFileChange = (selectedFiles: File[] | null) => {
    setFiles(selectedFiles || [])
    setError(null)
    setSuccessCount(0)
  }

  const handleUpload = async () => {
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)
    setSuccessCount(0)

    try {
      let success = 0
      let errors: string[] = []

      // Upload files one by one
      for (const file of files) {
        const formData = new FormData()
        formData.append("file", file)

        const result = await uploadMediaAssets(formData)

        if (result.error) {
          errors.push(`${file.name}: ${result.error}`)
        } else {
          success++
        }
      }

      if (errors.length > 0) {
        setError(errors.join("\n"))
      }

      if (success > 0) {
        setSuccessCount(success)
        // Reset form and refresh page after a short delay
        setTimeout(() => {
          setFiles([])
          setSuccessCount(0)
          router.refresh()
        }, 1500)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload files")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-(--pw-border) bg-secondary/20 p-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Upload Media</h3>
        <p className="mt-1 text-sm text-foreground/70">
          Upload images, videos, or audio files. You can select multiple files at once.
        </p>
      </div>

      <FileUpload
        label="Select Media Files"
        accept="image/*,video/*,audio/*"
        onChange={handleFileChange}
        value={files}
        multiple={true}
        maxSize={100 * 1024 * 1024} // 100MB
        showFileSize={true}
        disabled={uploading}
      />

      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-500 whitespace-pre-line">
          {error}
        </div>
      )}

      {successCount > 0 && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-500">
          Successfully uploaded {successCount} file{successCount !== 1 ? "s" : ""}!
        </div>
      )}

      <div className="flex justify-end gap-2">
        {files.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setFiles([])
              setError(null)
              setSuccessCount(0)
            }}
            disabled={uploading}
            className="rounded-lg border border-(--pw-border) bg-background/10 px-4 py-2 text-sm font-semibold text-foreground/80 hover:bg-background/20"
          >
            Clear
          </Button>
        )}
        <Button
          type="button"
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          variant="default"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          {uploading ? `Uploading... (${files.length} files)` : `Upload ${files.length > 0 ? `${files.length} file${files.length !== 1 ? "s" : ""}` : ""}`}
        </Button>
      </div>
    </div>
  )
}
