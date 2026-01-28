import { 
  InputHTMLAttributes, 
  ReactNode 
} from "react"
import { ClassValue } from "clsx"

export type DescriptionType = "text" | "tooltip"

export type FileUploadProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  className?: ClassValue,
  label?: ReactNode,
  labelClassName?: ClassValue,
  labelIcon?: ReactNode,
  labelIconClassName?: ClassValue,
  labelName?: string,
  /** Show a visual required indicator when `required` is true (default: true). */
  showRequired?: boolean,
  description?: ReactNode,
  descriptionClassName?: ClassValue,
  descriptionType?: DescriptionType,
  icon?: ReactNode,
  iconClassName?: ClassValue,
  inputClassName?: ClassValue,
  collapseOnBlur?: boolean, // default: true
  /** Callback when file(s) are selected */
  onChange?: (files: File[] | null) => void,
  /** Current file value (for controlled component) - supports single or multiple files */
  value?: File | File[] | null,
  /** Allow multiple file selection */
  multiple?: boolean,
  /** Accepted media types for preview (default: image/*, video/*, audio/*) */
  mediaTypes?: string[],
  /** Maximum file size in bytes */
  maxSize?: number,
  /** Show file size in preview */
  showFileSize?: boolean,
}
