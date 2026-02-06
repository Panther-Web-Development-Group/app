import type { ReactNode } from "react"

export interface QuizQuestionOption {
  id: string
  label: string
  /** Only set when showing results after submit */
  isCorrect?: boolean
}

export interface QuizQuestion {
  id: string
  prompt: string
  options: QuizQuestionOption[]
}

export interface QuizAnswer {
  questionId: string
  optionId: string
}

/** Result for a single question after submit */
export interface QuizQuestionResult {
  questionId: string
  prompt: string
  selectedOptionId: string
  correctOptionId: string
  isCorrect: boolean
}

export interface QuizProps {
  /** Quiz title */
  title: string
  /** Optional description */
  description?: string | null
  /** Questions with options (order preserved) */
  questions: QuizQuestion[]
  /** Callback when user submits the quiz; receives array of { questionId, optionId } */
  onSubmit?: (answers: QuizAnswer[]) => void | Promise<void>
  /** After submit: optional results per question (for showing correct/incorrect) */
  results?: QuizQuestionResult[] | null
  /** After submit: number of correct answers (for score display) */
  correctCount?: number
  /** Whether the quiz has already been submitted */
  submitted?: boolean
  /** Disable interaction */
  disabled?: boolean
  /** Optional class for the root container */
  className?: string
  /** Optional footer (e.g. "Sign in to take the quiz") */
  footer?: ReactNode
}
