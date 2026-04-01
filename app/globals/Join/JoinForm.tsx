"use client"

import { useState, type FormEvent } from "react"

type Errors = Partial<Record<"fullName" | "email" | "major" | "year" | "why", string>>

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const JoinForm = () => {
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [formKey, setFormKey] = useState(0)

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fullName = (form.elements.namedItem("fullName") as HTMLInputElement).value.trim()
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim()
    const major = (form.elements.namedItem("major") as HTMLInputElement).value.trim()
    const year = (form.elements.namedItem("year") as HTMLSelectElement).value
    const why = (form.elements.namedItem("why") as HTMLTextAreaElement).value.trim()

    const next: Errors = {}
    let valid = true
    if (!fullName) {
      next.fullName = "Full name is required."
      valid = false
    }
    if (!email) {
      next.email = "Email is required."
      valid = false
    } else if (!validateEmail(email)) {
      next.email = "Please enter a valid email."
      valid = false
    }
    if (!major) {
      next.major = "Major is required."
      valid = false
    }
    if (!year) {
      next.year = "Please select your year."
      valid = false
    }
    if (!why) {
      next.why = "Please tell us why you want to join."
      valid = false
    }

    setErrors(next)
    if (!valid) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="thank-you">
        <h1>Thank You</h1>
        <p>
          Your application has been submitted. We&apos;ll be in touch soon!
        </p>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setSubmitted(false)
            setErrors({})
            setFormKey((k) => k + 1)
          }}
        >
          Submit Another
        </button>
      </div>
    )
  }

  return (
    <form
      key={formKey}
      id="join-form"
      className="form"
      onSubmit={onSubmit}
      noValidate
    >
      <div className="form-group">
        <label className="form-label" htmlFor="fullName">
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          className="form-input"
          autoComplete="name"
        />
        <div id="fullName-error" className="form-error" role="alert">
          {errors.fullName}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="form-input"
          autoComplete="email"
        />
        <div id="email-error" className="form-error" role="alert">
          {errors.email}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="major">
          Major
        </label>
        <input id="major" name="major" type="text" className="form-input" />
        <div id="major-error" className="form-error" role="alert">
          {errors.major}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="year">
          Year
        </label>
        <select id="year" name="year" className="form-select" defaultValue="">
          <option value="" disabled>
            Select year
          </option>
          <option value="freshman">Freshman</option>
          <option value="sophomore">Sophomore</option>
          <option value="junior">Junior</option>
          <option value="senior">Senior</option>
          <option value="graduate">Graduate</option>
        </select>
        <div id="year-error" className="form-error" role="alert">
          {errors.year}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="why">
          Why do you want to join?
        </label>
        <textarea id="why" name="why" className="form-textarea" rows={5} />
        <div id="why-error" className="form-error" role="alert">
          {errors.why}
        </div>
      </div>
      <button type="submit" className="btn">
        Submit Application
      </button>
    </form>
  )
}
