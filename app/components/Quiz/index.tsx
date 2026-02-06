"use client"

import { useCallback, useState } from "react"
import { cn } from "@/lib/cn"
import { Button } from "@/app/components/Button"
import { RadioGroup } from "@/app/components/Form/RadioGroup"
import type {
  QuizProps,
  QuizAnswer,
  QuizQuestion,
  QuizQuestionResult,
} from "./types"

export function Quiz({
  title,
  description,
  questions,
  onSubmit,
  results,
  correctCount,
  submitted = false,
  disabled = false,
  className,
  footer,
}: QuizProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(submitted)

  const totalQuestions = questions.length
  const answeredCount = Object.keys(answers).length
  const canSubmit =
    !hasSubmitted &&
    !disabled &&
    totalQuestions > 0 &&
    answeredCount === totalQuestions

  const handleQuestionChange = useCallback((questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!canSubmit || !onSubmit) return
      const answerList: QuizAnswer[] = Object.entries(answers).map(
        ([questionId, optionId]) => ({ questionId, optionId })
      )
      setIsSubmitting(true)
      try {
        await onSubmit(answerList)
        setHasSubmitted(true)
      } finally {
        setIsSubmitting(false)
      }
    },
    [answers, canSubmit, onSubmit]
  )

  const resultsByQuestion = new Map<string, QuizQuestionResult>(
    results?.map((r) => [r.questionId, r]) ?? []
  )

  return (
    <section
      className={cn(
        "rounded-lg border border-(--pw-border) bg-secondary/20 overflow-hidden",
        className
      )}
      aria-label={`Quiz: ${title}`}
    >
      <div className="p-5 space-y-6">
        <header>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-foreground/75">{description}</p>
          ) : null}
        </header>

        {!hasSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((q, index) => (
              <QuizQuestionBlock
                key={q.id}
                question={q}
                index={index + 1}
                value={answers[q.id] ?? ""}
                onValueChange={(optionId) =>
                  handleQuestionChange(q.id, optionId)
                }
                disabled={disabled}
              />
            ))}
            <div className="flex items-center gap-4 pt-2">
              <Button
                type="submit"
                disabled={!canSubmit}
                loading={isSubmitting}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
                variant="ghost"
              >
                Submit quiz
              </Button>
              {totalQuestions > 0 && answeredCount < totalQuestions ? (
                <span className="text-sm text-foreground/60">
                  {answeredCount} of {totalQuestions} answered
                </span>
              ) : null}
            </div>
          </form>
        ) : (
          <QuizResults
            questions={questions}
            results={results}
            resultsByQuestion={resultsByQuestion}
            correctCount={correctCount}
            totalQuestions={totalQuestions}
          />
        )}

        {footer && !hasSubmitted ? (
          <div className="pt-2 border-t border-(--pw-border) text-sm text-foreground/70">
            {footer}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function QuizQuestionBlock({
  question,
  index,
  value,
  onValueChange,
  disabled,
}: {
  question: QuizQuestion
  index: number
  value: string
  onValueChange: (optionId: string) => void
  disabled: boolean
}) {
  const name = `quiz-q-${question.id}`
  return (
    <fieldset
      className="space-y-3 rounded-lg border border-(--pw-border) bg-background/10 p-4"
      aria-label={`Question ${index}: ${question.prompt}`}
    >
      <legend className="text-sm font-semibold text-foreground">
        {index}. {question.prompt}
      </legend>
      <RadioGroup
        name={name}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        className="space-y-2"
      >
        {question.options.map((opt) => (
          <div
            key={opt.id}
            className={cn(
              "flex items-center gap-3 rounded-lg border border-(--pw-border) bg-background/5 px-3 py-2 transition-colors",
              value === opt.id && "border-accent/50 bg-accent/10"
            )}
          >
            <RadioGroup.Option value={opt.id} label={opt.label} />
          </div>
        ))}
      </RadioGroup>
    </fieldset>
  )
}

function QuizResults({
  questions,
  results,
  resultsByQuestion,
  correctCount,
  totalQuestions,
}: {
  questions: QuizQuestion[]
  results: QuizQuestionResult[] | null | undefined
  resultsByQuestion: Map<string, QuizQuestionResult>
  correctCount: number | undefined
  totalQuestions: number
}) {
  const score =
    correctCount !== undefined
      ? correctCount
      : results?.filter((r) => r.isCorrect).length ?? 0

  return (
    <div className="space-y-4 pt-2">
      <div className="rounded-lg border border-(--pw-border) bg-background/10 p-4">
        <h3 className="text-sm font-semibold text-foreground/80">Your score</h3>
        <p className="mt-1 text-2xl font-bold text-foreground">
          {score} / {totalQuestions}
        </p>
        <p className="mt-1 text-sm text-foreground/70">
          {score === totalQuestions
            ? "Perfect!"
            : score >= totalQuestions / 2
              ? "Good job!"
              : "Keep practicing."}
        </p>
      </div>

      {(results?.length ?? 0) > 0 ? (
        <ul className="space-y-4" role="list">
          {questions.map((q) => {
            const r = resultsByQuestion.get(q.id)
            if (!r) return null
            const selectedOption = q.options.find((o) => o.id === r.selectedOptionId)
            const correctOption = q.options.find((o) => o.id === r.correctOptionId)
            return (
              <li
                key={q.id}
                className={cn(
                  "rounded-lg border p-4",
                  r.isCorrect
                    ? "border-success/50 bg-success/10"
                    : "border-danger/30 bg-danger/5"
                )}
              >
                <p className="text-sm font-semibold text-foreground">{q.prompt}</p>
                <div className="mt-2 space-y-1 text-sm">
                  <p className="text-foreground/80">
                    Your answer: {selectedOption?.label ?? "—"}
                    {!r.isCorrect && (
                      <span className="ml-1 text-danger font-medium">(incorrect)</span>
                    )}
                  </p>
                  {!r.isCorrect && correctOption ? (
                    <p className="text-foreground/70">
                      Correct: {correctOption.label}
                    </p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
