"use client"

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FC,
  type PointerEvent as ReactPointerEvent,
} from "react"
import type { ColorPickerProps } from "./types"
import { cn } from "@/lib/cn"
import { NumberInput } from "../Number"
import { ChevronDown, Plus, Sparkles, X } from "lucide-react"

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

function generatePalette(base: HSL): string[] {
  const baseHex = rgbToHex(hslToRgb(base))
  const lighter1 = rgbToHex(hslToRgb({ ...base, l: clamp(base.l + 15, 0, 100) }))
  const lighter2 = rgbToHex(hslToRgb({ ...base, l: clamp(base.l + 30, 0, 100) }))
  const darker1 = rgbToHex(hslToRgb({ ...base, l: clamp(base.l - 15, 0, 100) }))
  const complement = rgbToHex(hslToRgb({ ...base, h: (base.h + 180) % 360 }))
  const triad = rgbToHex(hslToRgb({ ...base, h: (base.h + 120) % 360 }))
  return Array.from(new Set([baseHex, lighter1, lighter2, darker1, complement, triad]))
}

export const ColorPicker: FC<ColorPickerProps> = ({
  className,
  name,
  disabled,
  value: valueProp,
  defaultValue = "#7dd3ff",
  onValueChange,
  paletteName,
  paletteValue: paletteProp,
  defaultPaletteValue = [],
  onPaletteChange,
  enablePalettes = true,
  ...divProps
}) => {
  const isControlled = valueProp !== undefined
  const [uncontrolledHex, setUncontrolledHex] = useState<string>(normalizeHex(defaultValue) ?? "#7dd3ff")
  const hex = normalizeHex(isControlled ? (valueProp as string) : uncontrolledHex) ?? "#7dd3ff"
  const [hexInput, setHexInput] = useState(hex)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHexInput(hex)
  }, [hex])
  const generatedId = useId()
  const triggerId = `${generatedId}-trigger`
  const popoverId = `${generatedId}-popover`


  const paletteControlled = paletteProp !== undefined
  const [uncontrolledPalette, setUncontrolledPalette] = useState<string[]>(
    (defaultPaletteValue ?? []).map((c) => normalizeHex(c)).filter(Boolean) as string[]
  )
  const palette = useMemo(() => (paletteControlled ? (paletteProp as string[]) : uncontrolledPalette) ?? [], [paletteControlled, paletteProp, uncontrolledPalette])

  const emitHex = useCallback(
    (next: string) => {
      const n = normalizeHex(next)
      if (!n) return
      if (!isControlled) setUncontrolledHex(n)
      onValueChange?.(n)
    },
    [isControlled, onValueChange, setUncontrolledHex]
  )

  const emitPalette = useCallback(
    (next: string[]) => {
      const normalized = next.map((c) => normalizeHex(c)).filter(Boolean) as string[]
      if (!paletteControlled) setUncontrolledPalette(normalized)
      onPaletteChange?.(normalized)
    },
    [onPaletteChange, paletteControlled]
  )

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
    drawHue()
  }, [drawHue])

  useEffect(() => {
    drawSL()
  }, [drawSL])

  // Redraw canvases when popover opens (they're unmounted when closed, so refs are null until open)
  useEffect(() => {
    if (!open) return
    const raf = requestAnimationFrame(() => {
      drawHue()
      drawSL()
    })
    return () => cancelAnimationFrame(raf)
  }, [open, drawHue, drawSL])

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
      emitHex(rgbToHex(hslToRgb(normalized)))
    },
    [emitHex]
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

  const addToPalette = useCallback(() => {
    if (!enablePalettes) return
    const next = Array.from(new Set([...palette, hex]))
    emitPalette(next)
  }, [emitPalette, enablePalettes, hex, palette])

  const removeFromPalette = useCallback(
    (color: string) => {
      emitPalette(palette.filter((c) => c !== color))
    },
    [emitPalette, palette]
  )

  const generate = useCallback(() => {
    if (!enablePalettes) return
    emitPalette(generatePalette(hsl))
  }, [emitPalette, enablePalettes, hsl])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const el = rootRef.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false)
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
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
      {...divProps}
      ref={rootRef}
      className={cn("relative", disabled ? "opacity-60" : "", className)}
      data-disabled={disabled ? "" : undefined}
    >
      {!disabled && name ? <input type="hidden" name={name} value={hex} /> : null}
      {!disabled && paletteName
        ? palette.map((c) => <input key={c} type="hidden" name={paletteName} value={c} />)
        : null}

      <button
        type="button"
        id={triggerId}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={popoverId}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          "inline-flex h-10 w-full items-center gap-3 rounded-lg border border-(--pw-border) bg-background/10 px-3 text-left outline-none transition-colors",
          "focus-visible:ring-2 focus-visible:ring-(--pw-ring)",
          disabled ? "cursor-not-allowed" : "cursor-pointer hover:bg-background/15"
        )}
      >
        <div
          className="h-6 w-6 shrink-0 rounded-md border border-(--pw-border) shadow-[0_4px_12px_var(--pw-shadow)]"
          style={{ background: hex }}
          aria-hidden
        />
        <span className="min-w-0 flex-1 truncate text-sm text-foreground/90">{hex}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-foreground/70 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={popoverId}
          role="dialog"
          aria-labelledby={triggerId}
          className="absolute left-0 top-full z-50 mt-1.5 w-full min-w-[320px] max-w-[calc(100vw-2rem)] rounded-lg border border-(--pw-border) bg-secondary/20 p-4 shadow-[0_10px_40px_var(--pw-shadow)] backdrop-blur-md"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4 items-start">
              <div className="space-y-2 shrink-0">
                <div className="text-xs font-semibold text-foreground/70">Saturation / Lightness</div>
                <div className="relative w-fit">
                  <canvas
                    ref={slCanvasRef}
                    width={240}
                    height={160}
                    onPointerDown={onSLPointerDown}
                    onPointerMove={onSLPointerMove}
                    className={cn(
                      "block rounded-lg border border-(--pw-border) bg-background/10",
                      disabled ? "cursor-not-allowed" : "cursor-crosshair"
                    )}
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
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-foreground/70">Hue</div>
                  <div className="relative w-fit">
                    <canvas
                      ref={hueCanvasRef}
                      width={240}
                      height={14}
                      onPointerDown={onHuePointerDown}
                      onPointerMove={onHuePointerMove}
                      className={cn(
                        "block rounded-lg border border-(--pw-border)",
                        disabled ? "cursor-not-allowed" : "cursor-ew-resize"
                      )}
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute top-1/2 h-5 w-1 -translate-y-1/2 rounded bg-foreground/80 shadow-[0_6px_18px_var(--pw-shadow)]"
                      style={{ left: `${(hueCursor / 360) * 240}px` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-rows-3 gap-0.5 flex-1 min-w-0">
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-foreground/70">RGB</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <NumberInput
                      value={rgb.r}
                      min={0}
                      max={255}
                      step={1}
                      spinnerPosition="top-bottom"
                      onValueChange={(n) => {
                        if (typeof n !== "number") return
                        emitHex(rgbToHex({ ...rgb, r: clamp(n, 0, 255) }))
                      }}
                      inputClassName="h-8 text-xs px-2"
                      className="w-full"
                      aria-label="Red"
                    />
                    <NumberInput
                      value={rgb.g}
                      min={0}
                      max={255}
                      step={1}
                      spinnerPosition="top-bottom"
                      onValueChange={(n) => {
                        if (typeof n !== "number") return
                        emitHex(rgbToHex({ ...rgb, g: clamp(n, 0, 255) }))
                      }}
                      inputClassName="h-8 text-xs px-2"
                      className="w-full"
                      aria-label="Green"
                    />
                    <NumberInput
                      value={rgb.b}
                      min={0}
                      max={255}
                      step={1}
                      spinnerPosition="top-bottom"
                      onValueChange={(n) => {
                        if (typeof n !== "number") return
                        emitHex(rgbToHex({ ...rgb, b: clamp(n, 0, 255) }))
                      }}
                      inputClassName="h-8 text-xs px-2"
                      className="w-full"
                      aria-label="Blue"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-foreground/70">HSL</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <NumberInput
                      value={hsl.h}
                      min={0}
                      max={360}
                      step={1}
                      spinnerPosition="top-bottom"
                      onValueChange={(n) => {
                        if (typeof n !== "number") return
                        setFromHsl({ ...hsl, h: n })
                      }}
                      inputClassName="h-8 text-xs px-2"
                      className="w-full"
                      aria-label="Hue"
                    />
                    <NumberInput
                      value={hsl.s}
                      min={0}
                      max={100}
                      step={1}
                      spinnerPosition="top-bottom"
                      onValueChange={(n) => {
                        if (typeof n !== "number") return
                        setFromHsl({ ...hsl, s: n })
                      }}
                      inputClassName="h-8 text-xs px-2"
                      className="w-full"
                      aria-label="Saturation"
                    />
                    <NumberInput
                      value={hsl.l}
                      min={0}
                      max={100}
                      step={1}
                      spinnerPosition="top-bottom"
                      onValueChange={(n) => {
                        if (typeof n !== "number") return
                        setFromHsl({ ...hsl, l: n })
                      }}
                      inputClassName="h-8 text-xs px-2"
                      className="w-full"
                      aria-label="Lightness"
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
                      if (n) emitHex(n)
                    }}
                    onBlur={() => {
                      const n = normalizeHex(hexInput)
                      if (n) {
                        emitHex(n)
                        setHexInput(n)
                      } else {
                        setHexInput(hex)
                      }
                    }}
                    className={cn(
                      "h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none",
                      "transition-colors",
                      "focus-visible:ring-2 focus-visible:ring-(--pw-ring)",
                      disabled ? "cursor-not-allowed opacity-60" : "hover:bg-background/15"
                    )}
                    aria-label="Hex"
                    placeholder="#RRGGBB"
                  />
                  <div className="text-[11px] text-foreground/60">#RRGGBB</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 shrink-0 rounded-lg border border-(--pw-border) shadow-[0_10px_30px_var(--pw-shadow)]"
                style={{ background: hex }}
                aria-hidden
              />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">Color</div>
                <div className="text-xs text-foreground/70">{hex}</div>
              </div>
            </div>

          {enablePalettes ? (
            <div className="rounded-lg border border-(--pw-border) bg-background/5 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-foreground">Palette</div>
                  <div className="text-xs text-foreground/70">Save and generate color sets.</div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={addToPalette}
                    className={cn(
                      "inline-flex h-9 items-center gap-2 rounded-lg border border-(--pw-border) bg-background/10 px-3 text-xs font-semibold text-foreground/80",
                      disabled ? "cursor-not-allowed opacity-60" : "hover:bg-background/20"
                    )}
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={generate}
                    className={cn(
                      "inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3 text-xs font-semibold text-accent-foreground",
                      disabled ? "cursor-not-allowed opacity-60" : "hover:opacity-90"
                    )}
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate
                  </button>
                </div>
              </div>

              {palette.length === 0 ? (
                <div className="mt-3 text-sm text-foreground/70">No palette colors yet.</div>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {palette.map((c) => (
                    <div key={c} className="group relative">
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => emitHex(c)}
                        className={cn(
                          "h-10 w-10 rounded-lg border border-(--pw-border) shadow-[0_10px_30px_var(--pw-shadow)]",
                          disabled ? "cursor-not-allowed" : "cursor-pointer"
                        )}
                        style={{ background: c }}
                        aria-label={`Pick ${c}`}
                        title={c}
                      />
                      {!disabled ? (
                        <button
                          type="button"
                          onClick={() => removeFromPalette(c)}
                          className="absolute -right-2 -top-2 hidden h-6 w-6 items-center justify-center rounded-full border border-(--pw-border) bg-background/80 text-foreground/70 shadow-[0_10px_30px_var(--pw-shadow)] group-hover:flex"
                          aria-label={`Remove ${c}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
        </div>
      ) : null}
    </div>
  )
}

