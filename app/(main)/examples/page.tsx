"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import { Poll } from "@/app/components/Poll"
import { Quiz } from "@/app/components/Quiz"
import type { PollOption, PollResult } from "@/app/components/Poll/types"
import type {
  QuizQuestion,
  QuizAnswer,
  QuizQuestionResult,
} from "@/app/components/Quiz/types"

// ——— Poll example (mock data + simulated vote) ———
const POLL_OPTIONS: PollOption[] = [
  { id: "opt-a", label: "React" },
  { id: "opt-b", label: "Vue" },
  { id: "opt-c", label: "Svelte" },
  { id: "opt-d", label: "Angular" },
]

const INITIAL_POLL_RESULTS: PollResult[] = [
  { optionId: "opt-a", label: "React", votes: 42 },
  { optionId: "opt-b", label: "Vue", votes: 28 },
  { optionId: "opt-c", label: "Svelte", votes: 18 },
  { optionId: "opt-d", label: "Angular", votes: 12 },
]

// ——— Quiz example (mock data + simulated submit) ———
const Q1_ID = "q1"
const Q2_ID = "q2"
const Q3_ID = "q3"
const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: Q1_ID,
    prompt: "What is the virtual DOM?",
    options: [
      { id: "q1-a", label: "A lightweight copy of the real DOM used for efficient updates" },
      { id: "q1-b", label: "A backup of the DOM stored on the server" },
      { id: "q1-c", label: "A security layer that protects the DOM" },
    ],
  },
  {
    id: Q2_ID,
    prompt: "Which hook runs after every render in React?",
    options: [
      { id: "q2-a", label: "useEffect" },
      { id: "q2-b", label: "useRender" },
      { id: "q2-c", label: "useAfter" },
    ],
  },
  {
    id: Q3_ID,
    prompt: "What does SSR stand for?",
    options: [
      { id: "q3-a", label: "Server-Side Rendering" },
      { id: "q3-b", label: "Static Site Regeneration" },
      { id: "q3-c", label: "Single Source Request" },
    ],
  },
]

/** questionId -> correct optionId (for grading) */
const QUIZ_CORRECT: Record<string, string> = {
  [Q1_ID]: "q1-a",
  [Q2_ID]: "q2-a",
  [Q3_ID]: "q3-a",
}

export default function ExamplesPage() {
  const [pollResults, setPollResults] = useState<PollResult[]>(INITIAL_POLL_RESULTS)
  const [pollHasVoted, setPollHasVoted] = useState(false)
  const [pollSelectedId, setPollSelectedId] = useState<string | null>(null)

  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizResults, setQuizResults] = useState<QuizQuestionResult[] | null>(null)
  const [quizCorrectCount, setQuizCorrectCount] = useState<number>(0)

  const handlePollVote = useCallback((optionId: string) => {
    setPollSelectedId(optionId)
    setPollHasVoted(true)
    setPollResults((prev) =>
      prev.map((r) =>
        r.optionId === optionId ? { ...r, votes: r.votes + 1 } : r
      )
    )
  }, [])

  const handleQuizSubmit = useCallback((answers: QuizAnswer[]) => {
    const results: QuizQuestionResult[] = answers.map((a) => {
      const question = QUIZ_QUESTIONS.find((q) => q.id === a.questionId)!
      const correctOptionId = QUIZ_CORRECT[a.questionId]
      const isCorrect = a.optionId === correctOptionId
      return {
        questionId: a.questionId,
        prompt: question.prompt,
        selectedOptionId: a.optionId,
        correctOptionId,
        isCorrect,
      }
    })
    setQuizResults(results)
    setQuizCorrectCount(results.filter((r) => r.isCorrect).length)
    setQuizSubmitted(true)
  }, [])

  return (
    <div className="mx-auto max-w-2xl space-y-12 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          Poll &amp; Quiz examples
        </h1>
        <p className="text-sm text-foreground/75">
          Example pages for the Poll and Quiz components. Voting and quiz
          submission are simulated (no backend).
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/"
            className="inline-block text-sm font-medium text-accent hover:underline"
          >
            ← Back to home
          </Link>
          <Link
            href="/examples/form-controls"
            className="inline-block text-sm font-medium text-accent hover:underline"
          >
            Form controls →
          </Link>
          <Link
            href="/examples/card-group"
            className="inline-block text-sm font-medium text-accent hover:underline"
          >
            CardGroup →
          </Link>
          <Link
            href="/examples/timeline"
            className="inline-block text-sm font-medium text-accent hover:underline"
          >
            Timeline →
          </Link>
          <Link
            href="/examples/rte"
            className="inline-block text-sm font-medium text-accent hover:underline"
          >
            RTE →
          </Link>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground/90">
          Poll example
        </h2>
        <Poll
          title="What’s your favorite front-end framework?"
          description="This is a demo poll. Your vote is simulated and won’t be stored."
          options={POLL_OPTIONS}
          results={pollResults}
          totalVotes={pollResults.reduce((s, r) => s + r.votes, 0)}
          hasVoted={pollHasVoted}
          selectedOptionId={pollSelectedId}
          onVote={handlePollVote}
          showResultsBeforeVote
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground/90">
          Quiz example
        </h2>
        <Quiz
          title="Quick front-end quiz"
          description="Three questions. Answers are checked locally after you submit."
          questions={QUIZ_QUESTIONS}
          onSubmit={handleQuizSubmit}
          results={quizResults}
          correctCount={quizCorrectCount}
          submitted={quizSubmitted}
        />
      </section>
    </div>
  )
}
