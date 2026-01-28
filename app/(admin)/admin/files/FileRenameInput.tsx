"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/app/components/Button"
import { Input } from "@/app/components/Form/Input"
import { Pencil, Check, X } from "lucide-react"

interface FileRenameInputProps {
  id: string
  currentFilename: string
  renameAction: (formData: FormData) => Promise<void>
}

export function FileRenameInput({ id, currentFilename, renameAction }: FileRenameInputProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [filename, setFilename] = useState(currentFilename)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    setFilename(currentFilename)
  }, [currentFilename])

  const handleStartEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setFilename(currentFilename)
    setIsEditing(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedFilename = filename.trim()
    if (!trimmedFilename || trimmedFilename === currentFilename) {
      handleCancel()
      return
    }

    const formData = new FormData()
    formData.append("id", id)
    formData.append("filename", trimmedFilename)
    await renameAction(formData)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          ref={inputRef}
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              handleCancel()
            }
          }}
          className="h-8 flex-1 rounded-lg border border-(--pw-border) bg-background/10 px-2 text-sm text-foreground"
        />
        <Button
          type="submit"
          className="h-8 w-8 rounded-lg border border-(--pw-border) bg-background/10 p-0 text-foreground/80 hover:bg-background/20"
          variant="ghost"
          aria-label="Save"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          onClick={handleCancel}
          className="h-8 w-8 rounded-lg border border-(--pw-border) bg-background/10 p-0 text-foreground/80 hover:bg-background/20"
          variant="ghost"
          aria-label="Cancel"
        >
          <X className="h-4 w-4" />
        </Button>
      </form>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="text-sm font-semibold text-foreground">{currentFilename}</div>
      <Button
        type="button"
        onClick={handleStartEdit}
        className="h-6 w-6 rounded border border-(--pw-border) bg-background/10 p-0 text-foreground/60 hover:bg-background/20 hover:text-foreground/80"
        variant="ghost"
        aria-label="Rename file"
      >
        <Pencil className="h-3 w-3" />
      </Button>
    </div>
  )
}
