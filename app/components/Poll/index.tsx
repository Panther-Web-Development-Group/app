"use client"

import { useCallback, useState } from "react"
import { cn } from "@/lib/cn"
import { Button } from "@/app/components/Button"
import { RadioGroup } from "@/app/components/Form/RadioGroup"
import type { PollProps } from "./types"

export function Poll({
  title,
  description,
  options,
  totalVotes: totalVotesProp,
  results,
  hasVoted = false,
  selectedOptionId,
  onVote,
  disabled = false,
  closed = false,
  showResultsBeforeVote = false,
  className,
  footer,
}: PollProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(hasVoted)

  const totalVotes =
    totalVotesProp ??
    (results?.reduce((sum, r) => sum + r.votes, 0) ?? 0)
  const showResults =
    closed || hasSubmitted || (showResultsBeforeVote && (results?.length ?? 0) > 0)
  const canVote = !closed && !hasSubmitted && !disabled && options.length >= 2

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const optionId = selectedId ?? selectedOptionId
      if (!optionId || !onVote) return
      setIsSubmitting(true)
      try {
        await onVote(optionId)
        setHasSubmitted(true)
      } finally {
        setIsSubmitting(false)
      }
    },
    [selectedId, selectedOptionId, onVote]
  )

  const resultsMap = new Map(
    results?.map((r) => [r.optionId, r]) ?? []
  )
  const optionWithVotes = options.map((opt) => ({
    ...opt,
    votes: resultsMap.get(opt.id)?.votes ?? 0,
  }))

  return (
    <section
      className={cn(
        "rounded-lg border border-(--pw-border) bg-secondary/20 overflow-hidden",
        className
      )}
      aria-label={`Poll: ${title}`}
    >
      <div className="p-5 space-y-4">
        <header>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-foreground/75">{description}</p>
          ) : null}
        </header>

        {canVote ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <RadioGroup
              name="poll-option"
              value={selectedId ?? selectedOptionId ?? ""}
              onValueChange={(v) => setSelectedId(v)}
              disabled={disabled}
              className="space-y-2"
              aria-label="Poll options"
            >
              {options.map((opt) => (
                <div
                  key={opt.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border border-(--pw-border) bg-background/10 px-4 py-3 transition-colors",
                    (selectedId === opt.id || selectedOptionId === opt.id)
                      ? "border-accent/50 bg-accent/10"
                      : "hover:bg-background/20"
                  )}
                >
                  <RadioGroup.Option value={opt.id} label={opt.label} />
                </div>
              ))}
            </RadioGroup>
            <Button
              type="submit"
              disabled={!selectedId && !selectedOptionId}
              loading={isSubmitting}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
              variant="ghost"
            >
              Submit vote
            </Button>
          </form>
        ) : null}

        {showResults && (results?.length ?? 0) > 0 ? (
          <div className="space-y-3 pt-2 border-t border-(--pw-border)">
            <h3 className="text-sm font-semibold text-foreground/80">
              {closed ? "Results" : hasSubmitted ? "Results" : "Current results"}
            </h3>
            <ul className="space-y-2" role="list">
              {optionWithVotes.map((opt) => {
                const pct =
                  totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0
                const isSelected =
                  hasSubmitted && (selectedOptionId === opt.id || selectedId === opt.id)
                return (
                  <li key={opt.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span
                        className={cn(
                          "font-medium",
                          isSelected
                            ? "text-accent"
                            : "text-foreground/80"
                        )}
                      >
                        {opt.label}
                        {isSelected ? " (your vote)" : ""}
                      </span>
                      <span className="text-foreground/70">
                        {opt.votes} {opt.votes === 1 ? "vote" : "votes"}
                        {totalVotes > 0 ? ` (${pct}%)` : ""}
                      </span>
                    </div>
                    <div
                      className="h-2 w-full rounded-full bg-background/20 overflow-hidden"
                      role="presentation"
                    >
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          isSelected ? "bg-accent" : "bg-secondary"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
            {totalVotes > 0 ? (
              <p className="text-xs text-foreground/60">
                Total: {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
              </p>
            ) : null}
          </div>
        ) : null}

        {footer ? (
          <div className="pt-2 border-t border-(--pw-border) text-sm text-foreground/70">
            {footer}
          </div>
        ) : null}
      </div>
    </section>
  )
}
