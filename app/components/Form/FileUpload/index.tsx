"use client"
import { 
  useId, 
  useMemo, 
  useState,
  useCallback,
  useRef,
  useEffect,
  type FC 
} from "react"
import type { FileUploadProps } from "./types"
import { cn } from "@/lib/cn"
import { Label } from "../Label"
import { Button } from "@/app/components/Button"
import { Tooltip } from "@/app/components/Tooltip"
import { InfoIcon, Upload, X, File as FileIcon, Plus } from "lucide-react"
import { Video } from "@/app/components/Video"
import { Audio } from "@/app/components/Audio"
import { Image } from "@/app/components/Image"
import { Input } from "@/app/components/Form/Input"

const DEFAULT_MEDIA_TYPES = ["image/*", "video/*", "audio/*"]

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
}

const isMediaType = (file: File, mediaTypes: string[]): boolean => {
  return mediaTypes.some(type => {
    if (type.endsWith("/*")) {
      const baseType = type.slice(0, -2)
      return file.type.startsWith(baseType)
    }
    return file.type === type
  })
}

const getMediaType = (file: File): "image" | "video" | "audio" | null => {
  if (file.type.startsWith("image/")) return "image"
  if (file.type.startsWith("video/")) return "video"
  if (file.type.startsWith("audio/")) return "audio"
  return null
}

type FileWithPreview = {
  file: File
  previewUrl: string | null
  mediaType: "image" | "video" | "audio" | null
  isMedia: boolean
}

export const FileUpload: FC<FileUploadProps> = (props) => {
  const {
    className,

    // Label props
    label,
    labelClassName,
    labelIcon,
    labelIconClassName,
    labelName,
    showRequired = true,

    // Description props
    description,
    descriptionClassName,
    descriptionType = "text",

    // Icon props
    icon,
    iconClassName,
    inputClassName,

    collapseOnBlur = true,

    id: idProp,
    onFocus,
    onBlur,
    onChange,
    value,
    accept,
    multiple = false,
    mediaTypes = DEFAULT_MEDIA_TYPES,
    maxSize,
    showFileSize = true,
    disabled,
    ...inputProps
  } = props

  const generatedId = useId()
  const inputId = idProp ?? generatedId
  const descriptionId = `${inputId}-description`
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isFocused, setIsFocused] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([])
  const [error, setError] = useState<string | null>(null)

  // Normalize value prop to array
  const normalizeValue = useCallback((val: File | File[] | null | undefined): File[] => {
    if (!val) return []
    return Array.isArray(val) ? val : [val]
  }, [])

  // Update selectedFiles when value prop changes (controlled component)
  useEffect(() => {
    if (value !== undefined) {
      const files = normalizeValue(value)
      const filesWithPreview: FileWithPreview[] = files.map(file => {
        const isMedia = isMediaType(file, mediaTypes)
        const mediaType = getMediaType(file)
        const previewUrl = isMedia ? URL.createObjectURL(file) : null
        return { file, previewUrl, mediaType, isMedia }
      })
      setTimeout(() => setSelectedFiles(filesWithPreview), 0)
    }
  }, [value, mediaTypes, normalizeValue])

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      selectedFiles.forEach(({ previewUrl }) => {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl)
        }
      })
    }
  }, [selectedFiles])

  const tooltipText = useMemo(() => {
    if (descriptionType !== "tooltip") return undefined
    return description
  }, [description, descriptionType])

  const showInlineDescription = useMemo(() => {
    return descriptionType !== "tooltip" && !!description && (!collapseOnBlur || isFocused)
  }, [description, descriptionType, collapseOnBlur, isFocused])

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    onFocus?.(e)
  }, [onFocus])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    onBlur?.(e)
  }, [onBlur])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setError(null)

    if (files.length === 0) {
      setSelectedFiles([])
      onChange?.(null)
      return
    }

    // Validate files
    const validFiles: FileWithPreview[] = []
    const errors: string[] = []

    files.forEach(file => {
      // Check file size if maxSize is specified
      if (maxSize && file.size > maxSize) {
        errors.push(`${file.name}: File size exceeds maximum of ${formatFileSize(maxSize)}`)
        return
      }

      const isMedia = isMediaType(file, mediaTypes)
      const mediaType = getMediaType(file)
      const previewUrl = isMedia ? URL.createObjectURL(file) : null
      validFiles.push({ file, previewUrl, mediaType, isMedia })
    })

    if (errors.length > 0) {
      setError(errors.join("\n"))
    }

    if (multiple) {
      // Add to existing files
      setSelectedFiles(prev => [...prev, ...validFiles])
      onChange?.([...selectedFiles.map(f => f.file), ...validFiles.map(f => f.file)])
    } else {
      // Replace existing files
      // Cleanup old preview URLs
      selectedFiles.forEach(({ previewUrl }) => {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
      })
      setSelectedFiles(validFiles)
      onChange?.(validFiles.length > 0 ? validFiles.map(f => f.file) : null)
    }

    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [onChange, maxSize, mediaTypes, multiple, selectedFiles])

  const handleRemove = useCallback((index: number) => {
    const fileToRemove = selectedFiles[index]
    if (fileToRemove.previewUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl)
    }
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    onChange?.(newFiles.length > 0 ? newFiles.map(f => f.file) : null)
  }, [onChange, selectedFiles])

  const handleRemoveAll = useCallback(() => {
    selectedFiles.forEach(({ previewUrl }) => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    })
    setSelectedFiles([])
    onChange?.(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [onChange, selectedFiles])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const hasFiles = selectedFiles.length > 0

  return (
    <div className={cn("space-y-1.5", className)}>
      {label || labelIcon || labelName ? (
        <Label
          htmlFor={inputId}
          name={labelName}
          icon={labelIcon}
          iconClassName={cn("text-foreground/70", labelIconClassName)}
          className={cn("block text-sm font-semibold text-foreground/80", labelClassName)}
        >
          {label ? (
            <span className="inline-flex items-center gap-1">
              <span>{label}</span>
              {showRequired && inputProps.required ? (
                <span aria-hidden className="text-red-500">
                  *
                </span>
              ) : null}
            </span>
          ) : null}
          {tooltipText ? (
            <Tooltip content={tooltipText}>
              <Button
                type="button"
                variant="ghost"
                className="ml-1 h-5 w-5 p-0 rounded border border-(--pw-border) bg-background/10 text-foreground/70 hover:bg-background/20"
                aria-label="More info"
              >
                <InfoIcon className="h-4 w-4" />
              </Button>
            </Tooltip>
          ) : null}
        </Label>
      ) : null}

      <div className="space-y-3">
        {/* File Input (hidden) */}
        <Input
          {...inputProps}
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleFileChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-required={inputProps.required ? true : undefined}
          aria-describedby={showInlineDescription ? descriptionId : undefined}
          className="hidden"
        />

        {/* Upload Area / Preview */}
        {!hasFiles ? (
          <div
            onClick={!disabled ? handleClick : undefined}
            className={cn(
              "relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-(--pw-border) bg-background/10 p-8 text-center transition-colors",
              disabled 
                ? "cursor-not-allowed opacity-60" 
                : "cursor-pointer hover:bg-background/15 hover:border-accent/50",
              inputClassName
            )}
          >
            {icon || <Upload className="h-8 w-8 text-foreground/50" />}
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Click to upload or drag and drop
              </p>
              {accept && (
                <p className="text-xs text-foreground/60">
                  Accepted: {accept}
                </p>
              )}
              {maxSize && (
                <p className="text-xs text-foreground/60">
                  Max size: {formatFileSize(maxSize)}
                </p>
              )}
              {multiple && (
                <p className="text-xs text-foreground/60">
                  You can select multiple files
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Files Grid */}
            <div className={cn(
              "grid gap-4",
              multiple 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1"
            )}>
              {selectedFiles.map((fileWithPreview, index) => {
                const { file, previewUrl, mediaType, isMedia } = fileWithPreview

                return (
                  <div 
                    key={`${file.name}-${index}`} 
                    className="group relative rounded-lg border border-(--pw-border) bg-background/10 overflow-hidden transition-all hover:border-accent/50 hover:shadow-sm"
                  >
                    {/* Media Preview */}
                    {isMedia && previewUrl && mediaType === "image" && (
                      <>
                        <div className="relative bg-background/5 flex items-center justify-center overflow-hidden min-h-[120px] max-h-[200px]">
                          <Image
                            src={previewUrl}
                            alt={file.name}
                            className="w-full h-auto max-h-[200px] object-contain"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-3 space-y-1">
                          <p className="text-xs font-medium text-foreground truncate" title={file.name}>
                            {file.name}
                          </p>
                          {showFileSize && (
                            <p className="text-xs text-foreground/60">
                              {formatFileSize(file.size)}
                            </p>
                          )}
                        </div>
                        {!disabled && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleRemove(index)}
                            className="absolute top-2 right-2 h-7 w-7 p-0 rounded-full bg-background/90 hover:bg-background text-foreground shadow-sm border border-(--pw-border)/50 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove file"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </>
                    )}

                    {isMedia && previewUrl && mediaType === "video" && (
                      <>
                        <div className="relative aspect-video bg-background/5 flex items-center justify-center overflow-hidden">
                          <Video
                            src={previewUrl}
                            useNativeControls={true}
                            className="w-full h-full"
                          />
                        </div>
                        <div className="p-3 space-y-1">
                          <p className="text-xs font-medium text-foreground truncate" title={file.name}>
                            {file.name}
                          </p>
                          {showFileSize && (
                            <p className="text-xs text-foreground/60">
                              {formatFileSize(file.size)}
                            </p>
                          )}
                        </div>
                        {!disabled && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleRemove(index)}
                            className="absolute top-2 right-2 h-7 w-7 p-0 rounded-full bg-background/90 hover:bg-background text-foreground shadow-sm border border-(--pw-border)/50 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            aria-label="Remove file"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </>
                    )}

                    {isMedia && previewUrl && mediaType === "audio" && (
                      <>
                        <div className="relative aspect-square bg-background/5 flex items-center justify-center p-4">
                          <div className="flex flex-col items-center gap-2 text-foreground/50">
                            <svg
                              className="w-12 h-12"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="p-3 space-y-1">
                          <p className="text-xs font-medium text-foreground truncate" title={file.name}>
                            {file.name}
                          </p>
                          {showFileSize && (
                            <p className="text-xs text-foreground/60">
                              {formatFileSize(file.size)}
                            </p>
                          )}
                        </div>
                        {!disabled && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleRemove(index)}
                            className="absolute top-2 right-2 h-7 w-7 p-0 rounded-full bg-background/90 hover:bg-background text-foreground shadow-sm border border-(--pw-border)/50 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            aria-label="Remove file"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </>
                    )}

                    {/* Non-media file info */}
                    {!isMedia && (
                      <>
                        <div className="relative aspect-square bg-background/5 flex items-center justify-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-accent/20 text-accent">
                            <FileIcon className="h-8 w-8" />
                          </div>
                        </div>
                        <div className="p-3 space-y-1">
                          <p className="text-xs font-medium text-foreground truncate" title={file.name}>
                            {file.name}
                          </p>
                          {showFileSize && (
                            <p className="text-xs text-foreground/60">
                              {formatFileSize(file.size)} • {file.type || "Unknown type"}
                            </p>
                          )}
                        </div>
                        {!disabled && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleRemove(index)}
                            className="absolute top-2 right-2 h-7 w-7 p-0 rounded-full bg-background/90 hover:bg-background text-foreground shadow-sm border border-(--pw-border)/50 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove file"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Action Buttons */}
            {!disabled && (
              <div className="flex gap-2">
                {multiple && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClick}
                    className="flex-1 h-10 rounded-lg border border-(--pw-border) bg-background/10 px-4 text-sm font-semibold text-foreground hover:bg-background/20"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add more files
                  </Button>
                )}
                {!multiple && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClick}
                    className="flex-1 h-10 rounded-lg border border-(--pw-border) bg-background/10 px-4 text-sm font-semibold text-foreground hover:bg-background/20"
                  >
                    Change file
                  </Button>
                )}
                {hasFiles && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleRemoveAll}
                    className="h-10 rounded-lg border border-(--pw-border) bg-background/10 px-4 text-sm font-semibold text-foreground/80 hover:bg-background/20"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-500 whitespace-pre-line">
            {error}
          </div>
        )}
      </div>

      {showInlineDescription ? (
        <div
          id={descriptionId}
          className={cn("text-xs leading-5 text-foreground/70", descriptionClassName)}
        >
          {description}
        </div>
      ) : null}
    </div>
  )
}
