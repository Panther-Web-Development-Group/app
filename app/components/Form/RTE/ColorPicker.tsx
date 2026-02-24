"use client"

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type FC,
  type PointerEvent as ReactPointerEvent,
} from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/cn"

const GAP = 6

type HSL = { h: number; s: number; l: number }
type RGB = { r: number; g: number; b: number }

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function normalizeHex(input: string) {
  let s = input.trim().toLowerCase()
  if (s.startsWith("#")) s = s.slice(1)
  if (s.length === 3) s = s.split("").map((c) => c + c).join("")
  if (!/^[0-9a-f]{6}$/.test(s)) return null
  return `#${s}`
}

function rgbToHex({ r, g, b }: RGB) {
  const to2 = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0")
  return `#${to2(r)}${to2(g)}${to2(b)}`
}

function hexToRgb(hex: string): RGB | null {
  const n = normalizeHex(hex)
  if (!n) return null
  const s = n.slice(1)
  const r = parseInt(s.slice(0, 2), 16)
  const g = parseInt(s.slice(2, 4), 16)
  const b = parseInt(s.slice(4, 6), 16)
  return { r, g, b }
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const hh = ((h % 360) + 360) % 360
  const ss = clamp(s, 0, 100) / 100
  const ll = clamp(l, 0, 100) / 100

  const c = (1 - Math.abs(2 * ll - 1)) * ss
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1))
  const m = ll - c / 2

  let rp = 0, gp = 0, bp = 0
  if (hh < 60) [rp, gp, bp] = [c, x, 0]
  else if (hh < 120) [rp, gp, bp] = [x, c, 0]
  else if (hh < 180) [rp, gp, bp] = [0, c, x]
  else if (hh < 240) [rp, gp, bp] = [0, x, c]
  else if (hh < 300) [rp, gp, bp] = [x, 0, c]
  else [rp, gp, bp] = [c, 0, x]

  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  }
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const rr = clamp(r, 0, 255) / 255
  const gg = clamp(g, 0, 255) / 255
  const bb = clamp(b, 0, 255) / 255

  const max = Math.max(rr, gg, bb)
  const min = Math.min(rr, gg, bb)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === rr) h = ((gg - bb) / delta) % 6
    else if (max === gg) h = (bb - rr) / delta + 2
    else h = (rr - gg) / delta + 4
    h *= 60
    if (h < 0) h += 360
  }

  const l = (max + min) / 2
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

// Common color presets similar to Google Docs/Notion
const PRESET_COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#B7B7B7", "#CCCCCC", "#D9D9D9", "#EFEFEF", "#F3F3F3", "#FFFFFF",
  "#980000", "#FF0000", "#FF9900", "#FFFF00", "#00FF00", "#00FFFF", "#4A86E8", "#0000FF", "#9900FF", "#FF00FF",
  "#E6B8AF", "#F4CCCC", "#FCE5CD", "#FFF2CC", "#D9EAD3", "#D0E0E3", "#C9DAF8", "#CFE2F3", "#D9D2E9", "#EAD1DC",
  "#DD7E6B", "#EA9999", "#F9CB9C", "#FFE599", "#B6D7A8", "#A2C4C9", "#A4C2F4", "#9FC5E8", "#B4A7D6", "#D5A6BD",
  "#CC4125", "#E06666", "#F6B26B", "#FFD966", "#93C47D", "#76A5AF", "#6D9EEB", "#6FA8DC", "#8E7CC3", "#C27BA0",
  "#A61C00", "#CC0000", "#E69138", "#F1C232", "#6AA84F", "#45818E", "#3C78D8", "#3D85C6", "#674EA7", "#A64D79",
  "#85200C", "#990000", "#B45F06", "#BF9000", "#38761D", "#134F5C", "#1155CC", "#0B5394", "#351C75", "#741B47",
  "#5B0F00", "#660000", "#783F04", "#7F6000", "#274E13", "#0C343D", "#1C4587", "#073763", "#20124D", "#4C1130",
]

const TOOLBAR_BUTTON_CLASSES = cn(
  "inline-flex h-8 px-2 items-center justify-center rounded-md border border-foreground/10 dark:border-foreground/20",
  "bg-background hover:bg-foreground/5 dark:hover:bg-foreground/10",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--pw-ring) focus-visible:ring-offset-1",
  "transition-colors active:scale-95"
)

export interface RTEColorPickerProps {
  value: string
  onValueChange: (color: string) => void
  defaultValue?: string
  disabled?: boolean
  className?: string
  triggerAriaLabel?: string
  children?: ReactNode
}

/**
 * Compact color picker for RTE toolbar. Shows a color swatch button that opens
 * a popover with preset colors and a custom color picker.
 */
export const RTEColorPicker: FC<RTEColorPickerProps> = ({
  value,
  onValueChange,
  defaultValue = "#000000",
  disabled,
  className,
  triggerAriaLabel = "Color",
  children,
}) => {
  const hex = normalizeHex(value) ?? normalizeHex(defaultValue) ?? "#000000"
  const [open, setOpen] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const generatedId = useId()
  const triggerId = `${generatedId}-trigger`
  const popoverId = `${generatedId}-popover`

  const rgb = useMemo(() => hexToRgb(hex) ?? { r: 0, g: 0, b: 0 }, [hex])
  const [hsl, setHsl] = useState<HSL>(() => rgbToHsl(rgb))

  useEffect(() => {
    setHsl(rgbToHsl(rgb))
  }, [rgb])

  const slCanvasRef = useRef<HTMLCanvasElement>(null)
  const hueCanvasRef = useRef<HTMLCanvasElement>(null)

  const drawHue = useCallback(() => {
    const canvas = hueCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width, height } = canvas
    const grad = ctx.createLinearGradient(0, 0, width, 0)
    for (let i = 0; i <= 360; i += 30) {
      grad.addColorStop(i / 360, rgbToHex(hslToRgb({ h: i, s: 100, l: 50 })))
    }
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)
  }, [])

  const drawSL = useCallback(() => {
    const canvas = slCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width, height } = canvas
    const img = ctx.createImageData(width, height)
    const data = img.data

    for (let y = 0; y < height; y++) {
      const l = 100 - (y / (height - 1)) * 100
      for (let x = 0; x < width; x++) {
        const s = (x / (width - 1)) * 100
        const { r, g, b } = hslToRgb({ h: hsl.h, s, l })
        const idx = (y * width + x) * 4
        data[idx] = r
        data[idx + 1] = g
        data[idx + 2] = b
        data[idx + 3] = 255
      }
    }

    ctx.putImageData(img, 0, 0)
  }, [hsl.h])

  useEffect(() => {
    if (!open || !showCustom) return
    const raf = requestAnimationFrame(() => {
      drawHue()
      drawSL()
    })
    return () => cancelAnimationFrame(raf)
  }, [open, showCustom, drawHue, drawSL])

  const slCursor = useMemo(() => {
    const s = clamp(hsl.s, 0, 100)
    const l = clamp(hsl.l, 0, 100)
    return {
      xPct: s,
      yPct: 100 - l,
    }
  }, [hsl.l, hsl.s])

  const hueCursor = useMemo(() => clamp(hsl.h, 0, 360), [hsl.h])

  const setFromHsl = useCallback(
    (next: HSL) => {
      const normalized: HSL = {
        h: clamp(Math.round(next.h), 0, 360),
        s: clamp(Math.round(next.s), 0, 100),
        l: clamp(Math.round(next.l), 0, 100),
      }
      setHsl(normalized)
      const newHex = rgbToHex(hslToRgb(normalized))
      onValueChange(newHex)
    },
    [onValueChange]
  )

  const pickSLFromEvent = useCallback(
    (e: PointerEvent, canvas: HTMLCanvasElement) => {
      const rect = canvas.getBoundingClientRect()
      const x = clamp(e.clientX - rect.left, 0, rect.width)
      const y = clamp(e.clientY - rect.top, 0, rect.height)
      const s = (x / rect.width) * 100
      const l = 100 - (y / rect.height) * 100
      setFromHsl({ ...hsl, s, l })
    },
    [hsl, setFromHsl]
  )

  const pickHueFromEvent = useCallback(
    (e: PointerEvent, canvas: HTMLCanvasElement) => {
      const rect = canvas.getBoundingClientRect()
      const x = clamp(e.clientX - rect.left, 0, rect.width)
      const h = (x / rect.width) * 360
      setFromHsl({ ...hsl, h })
    },
    [hsl, setFromHsl]
  )

  const onSLPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (disabled) return
      const canvas = slCanvasRef.current
      if (!canvas) return
      canvas.setPointerCapture(e.pointerId)
      pickSLFromEvent(e.nativeEvent, canvas)
    },
    [disabled, pickSLFromEvent]
  )

  const onSLPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (disabled) return
      if (e.buttons !== 1) return
      const canvas = slCanvasRef.current
      if (!canvas) return
      pickSLFromEvent(e.nativeEvent, canvas)
    },
    [disabled, pickSLFromEvent]
  )

  const onHuePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (disabled) return
      const canvas = hueCanvasRef.current
      if (!canvas) return
      canvas.setPointerCapture(e.pointerId)
      pickHueFromEvent(e.nativeEvent, canvas)
    },
    [disabled, pickHueFromEvent]
  )

  const onHuePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (disabled) return
      if (e.buttons !== 1) return
      const canvas = hueCanvasRef.current
      if (!canvas) return
      pickHueFromEvent(e.nativeEvent, canvas)
    },
    [disabled, pickHueFromEvent]
  )

  const handlePresetClick = useCallback(
    (color: string) => {
      const normalized = normalizeHex(color)
      if (normalized) {
        onValueChange(normalized)
        setOpen(false)
        setShowCustom(false)
      }
    },
    [onValueChange]
  )

  const [hexInput, setHexInput] = useState(hex)
  useEffect(() => {
    setHexInput(hex)
  }, [hex])

  // Position popover with fixed + portal (escapes overflow containers like RTE toolbar)
  useEffect(() => {
    if (!open || !popoverRef.current || !rootRef.current) return
    const popover = popoverRef.current
    const trigger = rootRef.current.querySelector(`#${triggerId}`) as HTMLElement
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const vh = window.innerHeight
    const viewportPad = 8
    popover.style.position = "fixed"
    popover.style.top = `${rect.bottom + GAP}px`
    popover.style.left = `${rect.left}px`
    const spaceBelow = vh - viewportPad - rect.bottom
    if (spaceBelow < 200 && rect.top - viewportPad > spaceBelow) {
      popover.style.top = "auto"
      popover.style.bottom = `${vh - rect.top + GAP}px`
    }
  }, [open, triggerId])

  // Close on outside click / Escape (popover may be in portal)
  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target instanceof Node ? e.target : null
      if (!target) return
      if (rootRef.current?.contains(target) || popoverRef.current?.contains(target)) return
      setOpen(false)
      setShowCustom(false)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        setShowCustom(false)
      }
    }

    const controller = new AbortController()
    const { signal } = controller
    document.addEventListener("mousedown", onPointerDown, { signal })
    document.addEventListener("touchstart", onPointerDown, { passive: true, signal })
    document.addEventListener("keydown", onKeyDown, { signal })
    return () => controller.abort()
  }, [open])

  return (
    <div
      ref={rootRef}
      className={cn("relative shrink-0", disabled ? "opacity-60" : "", className)}
      data-disabled={disabled ? "" : undefined}
    >
      <button
        type="button"
        id={triggerId}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={popoverId}
        aria-label={triggerAriaLabel}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={TOOLBAR_BUTTON_CLASSES}
      >
        {children && <span className="pointer-events-none mr-2">{children}</span>}
        <div
          className="h-5 w-5 rounded border border-foreground/20"
          style={{ backgroundColor: hex }}
          aria-hidden
        />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            id={popoverId}
            role="dialog"
            aria-labelledby={triggerId}
            className="z-9999 w-[280px] rounded-lg border border-foreground/10 dark:border-foreground/20 bg-background p-3 shadow-lg"
          >
          {!showCustom ? (
            <>
              <div className="grid grid-cols-10 gap-1 mb-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handlePresetClick(color)}
                    className={cn(
                      "h-6 w-6 rounded border border-foreground/20 hover:scale-110 transition-transform",
                      hex === normalizeHex(color) && "ring-2 ring-(--pw-ring) ring-offset-1"
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowCustom(true)}
                className="w-full rounded-md border border-foreground/10 dark:border-foreground/20 bg-background hover:bg-foreground/5 dark:hover:bg-foreground/10 px-3 py-1.5 text-xs font-medium text-foreground/90 transition-colors"
              >
                Custom color
              </button>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-foreground/70">Saturation / Lightness</div>
                  <div className="relative w-fit">
                    <canvas
                      ref={slCanvasRef}
                      width={240}
                      height={160}
                      onPointerDown={onSLPointerDown}
                      onPointerMove={onSLPointerMove}
                      className="block rounded-lg border border-foreground/10 dark:border-foreground/20 cursor-crosshair"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
                      style={{
                        left: `${(slCursor.xPct / 100) * 240}px`,
                        top: `${(slCursor.yPct / 100) * 160}px`,
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-foreground/70">Hue</div>
                  <div className="relative w-fit">
                    <canvas
                      ref={hueCanvasRef}
                      width={240}
                      height={14}
                      onPointerDown={onHuePointerDown}
                      onPointerMove={onHuePointerMove}
                      className="block rounded-lg border border-foreground/10 dark:border-foreground/20 cursor-ew-resize"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute top-1/2 h-5 w-1 -translate-y-1/2 rounded bg-foreground/80 shadow-[0_6px_18px_var(--pw-shadow)]"
                      style={{ left: `${(hueCursor / 360) * 240}px` }}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-foreground/70">Hex</div>
                  <input
                    type="text"
                    value={hexInput}
                    disabled={disabled}
                    onChange={(e) => {
                      const raw = e.target.value
                      setHexInput(raw)
                      const n = normalizeHex(raw)
                      if (n) onValueChange(n)
                    }}
                    onBlur={() => {
                      const n = normalizeHex(hexInput)
                      if (n) {
                        onValueChange(n)
                        setHexInput(n)
                      } else {
                        setHexInput(hex)
                      }
                    }}
                    className="h-8 w-full rounded-md border border-foreground/10 dark:border-foreground/20 bg-background/10 px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-(--pw-ring)"
                    aria-label="Hex color"
                    placeholder="#RRGGBB"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCustom(false)}
                className="mt-3 w-full rounded-md border border-foreground/10 dark:border-foreground/20 bg-background hover:bg-foreground/5 dark:hover:bg-foreground/10 px-3 py-1.5 text-xs font-medium text-foreground/90 transition-colors"
              >
                Back to presets
              </button>
            </>
          )}
          </div>,
          document.body
        )}
    </div>
  )
}
