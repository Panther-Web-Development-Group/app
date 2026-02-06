import type { ReactNode } from "react"

export interface PollOption {
  id: string
  label: string
}

export interface PollResult {
  optionId: string
  label: string
  votes: number
}

export interface PollProps {
  /** Poll title */
  title: string
  /** Optional description */
  description?: string | null
  /** Choices (id + label) */
  options: PollOption[]
  /** Total vote count; used with results for percentage display */
  totalVotes?: number
  /** Per-option vote counts; when provided (and hasVoted/closed), results view is shown */
  results?: PollResult[] | null
  /** Whether the current user has already voted */
  hasVoted?: boolean
  /** Option id the current user selected (when hasVoted) */
  selectedOptionId?: string | null
  /** Callback when user submits a vote; pass the chosen option id */
  onVote?: (optionId: string) => void | Promise<void>
  /** Disable voting (e.g. poll closed or not authenticated) */
  disabled?: boolean
  /** Poll is closed (show results only, no vote UI) */
  closed?: boolean
  /** Show results even before voting (e.g. public poll) */
  showResultsBeforeVote?: boolean
  /** Optional class for the root container */
  className?: string
  /** Optional content below the poll (e.g. "Sign in to vote") */
  footer?: ReactNode
}
