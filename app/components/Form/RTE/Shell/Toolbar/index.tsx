"use client"

import type { FC } from "react"
import { Children } from "react"
import { cn } from "@/lib/cn"
import type { ShellToolbarProps } from "./types"
import { ShellToolbarItem } from "./Item"
import {
  Bold,
  Underline,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
} from "lucide-react"
import { useRTE } from "../../Context"
import {
  formatBold,
  formatUnderline,
  formatItalic,
  formatStrikethrough,
  formatCode,
  formatOrderedList,
  formatUnorderedList,
  formatQuote,
} from "../../actions/format"
import { BlockTypeSelect } from "./BlockTypeSelect"
import { FontFaceSelect } from "./FontFaceSelect"
import { FontSizeNumber } from "./FontSizeNumber"
import { ToolbarBackgroundColor, ToolbarForegroundColor } from "./ToolbarColorPickers"
import { AlignmentButtons } from "./AlignmentButtons"
import { IndentButtons } from "./IndentButtons"
import { LinkButton } from "./LinkButton"
import { OverflowMenu } from "./OverflowMenu"
import { BlocksDropdown } from "./BlocksDropdown"

function ToolbarDivider() {
  return (
    <div
      className="h-6 w-px bg-foreground/10 dark:bg-foreground/20 shrink-0"
      role="separator"
      aria-hidden
    />
  )
}

export const ShellToolbar: FC<ShellToolbarProps> = ({ children, className }) => {
  const { enabledToolbarItems = [] } = useRTE()

  return (
    <div
      className={cn(
        "toolbar flex min-w-0 max-w-full flex-wrap items-center gap-x-1 gap-y-1.5",
        "border-b border-foreground/10 dark:border-foreground/20",
        "bg-background/50 backdrop-blur-sm z-1000 px-2 py-1.5",
        className
      )}
      role="toolbar"
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* 1. Block type */}
      <BlockTypeSelect />
      <ToolbarDivider />

      {/* 2. Font */}
      <FontFaceSelect />
      <FontSizeNumber />
      <ToolbarDivider />

      {/* 3. Colors */}
      <ToolbarBackgroundColor />
      <ToolbarForegroundColor />
      <ToolbarDivider />

      {/* 4. Core format */}
      {enabledToolbarItems.includes("bold") && (
        <ShellToolbarItem
          id="bold"
          type="command"
          dispatcher={formatBold}
          icon={<Bold className="h-4 w-4" />}
          description="Bold"
        />
      )}
      {enabledToolbarItems.includes("italic") && (
        <ShellToolbarItem
          id="italic"
          type="command"
          dispatcher={formatItalic}
          icon={<Italic className="h-4 w-4" />}
          description="Italic"
        />
      )}
      {enabledToolbarItems.includes("underline") && (
        <ShellToolbarItem
          id="underline"
          type="command"
          dispatcher={formatUnderline}
          icon={<Underline className="h-4 w-4" />}
          description="Underline"
        />
      )}
      {enabledToolbarItems.includes("strikethrough") && (
        <ShellToolbarItem
          id="strikethrough"
          type="command"
          dispatcher={formatStrikethrough}
          icon={<Strikethrough className="h-4 w-4" />}
          description="Strikethrough"
        />
      )}
      {enabledToolbarItems.includes("code") && (
        <ShellToolbarItem
          id="code"
          type="command"
          dispatcher={formatCode}
          icon={<Code className="h-4 w-4" />}
          description="Code"
        />
      )}
      <ToolbarDivider />

      {/* 5. Link */}
      <LinkButton />
      <ToolbarDivider />

      {/* 6. List */}
      {enabledToolbarItems.includes("list") && (
        <ShellToolbarItem
          id="list"
          type="command"
          dispatcher={formatUnorderedList}
          icon={<List className="h-4 w-4" />}
          description="Bullet list"
        />
      )}
      {enabledToolbarItems.includes("listOrdered") && (
        <ShellToolbarItem
          id="listOrdered"
          type="command"
          dispatcher={formatOrderedList}
          icon={<ListOrdered className="h-4 w-4" />}
          description="Numbered list"
        />
      )}
      <ToolbarDivider />

      {/* 7. Alignment */}
      <AlignmentButtons />
      <ToolbarDivider />

      {/* 8. Quote */}
      {enabledToolbarItems.includes("quote") && (
        <ShellToolbarItem
          id="quote"
          type="command"
          dispatcher={formatQuote}
          icon={<Quote className="h-4 w-4" />}
          description="Quote"
        />
      )}
      <ToolbarDivider />

      {/* 9. Others (Indent, blocks, custom, overflow) */}
      <IndentButtons />
      <BlocksDropdown />
      {Children.count(children) > 0 && <ToolbarDivider />}
      {children}
      <ToolbarDivider />
      <OverflowMenu />
    </div>
  )
}
