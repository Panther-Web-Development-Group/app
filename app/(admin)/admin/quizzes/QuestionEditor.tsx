"use client"

import { useCallback, useState, type FC, type ChangeEvent } from "react"
import { InputGroup } from "@/app/components/Form/InputGroup"
import { QuizOptionsEditor } from "./QuizOptionsEditor"
import { Button } from "@/app/components/Button"
import { Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/cn"

type Question = {
  id: string
  prompt: string
  options: string[]
  correctIndex: number | null
}

type QuestionEditorProps = {
  className?: string
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const QuestionEditor: FC<QuestionEditorProps> = ({ className }) => {
  const [questions, setQuestions] = useState<Question[]>([])

  const addQuestion = useCallback(() => {
    setQuestions((prev) => [
      ...prev,
      {
        id: generateId(),
        prompt: "",
        options: [],
        correctIndex: null,
      },
    ])
  }, [])

  const removeQuestion = useCallback((id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }, [])

  const updateQuestion = useCallback(
    (id: string, updates: Partial<Omit<Question, "id">>) => {
      setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)))
    },
    []
  )

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground/80">Questions</h4>
          <p className="text-xs text-foreground/70">Add questions with options and correct answers.</p>
        </div>
        <Button
          type="button"
          onClick={addQuestion}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-(--pw-border) bg-background/10 px-3 text-xs font-semibold text-foreground/80 hover:bg-background/20"
          variant="ghost"
        >
          <Plus className="h-4 w-4" />
          Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="rounded-lg border border-(--pw-border) bg-background/5 p-6 text-center">
          <p className="text-sm text-foreground/70">No questions yet. Click "Add Question" to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, qIdx) => (
            <div
              key={q.id}
              className="rounded-lg border border-(--pw-border) bg-secondary/20 p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="mb-1 text-xs font-semibold text-foreground/70">Question {qIdx + 1}</div>
                  <InputGroup
                    name={`question_prompt_${q.id}`}
                    placeholder="What is 2 + 2?"
                    value={q.prompt}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateQuestion(q.id, { prompt: e.target.value })}
                    className="w-full"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => removeQuestion(q.id)}
                  className="h-9 w-9 rounded-lg border border-(--pw-border) bg-background/10 text-foreground/80 hover:bg-background/20"
                  variant="ghost"
                  aria-label={`Remove question ${qIdx + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-foreground/70">Options</div>
                <QuizOptionsEditor
                  name={`question_options_${q.id}`}
                  placeholder="Enter option text…"
                  addLabel="Add option"
                  value={q.options}
                  onValueChange={(options) => updateQuestion(q.id, { options })}
                  correctIndex={q.correctIndex !== null ? q.correctIndex - 1 : null}
                  onCorrectIndexChange={(idx) => updateQuestion(q.id, { correctIndex: idx !== null ? idx + 1 : null })}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden inputs for form submission */}
      {questions.map((q) => (
        <div key={q.id} className="hidden">
          <input type="hidden" name="question_ids" value={q.id} />
          <input type="hidden" name={`question_prompt_${q.id}`} value={q.prompt} />
          <input type="hidden" name={`question_correct_index_${q.id}`} value={q.correctIndex ?? ""} />
          {q.options.map((opt, optIdx) => (
            <input
              key={`${q.id}-${optIdx}`}
              type="hidden"
              name={`question_options_${q.id}`}
              value={opt}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
