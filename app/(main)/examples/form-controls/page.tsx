"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Input,
  InputGroup,
  Label,
  Password,
  TextArea,
  TextAreaGroup,
  Select,
  Checkbox,
  CheckboxGroup,
  RadioGroup,
  Switch,
  ToggleGroup,
  Rating,
  Slider,
  RangeSlider,
  NumberInput,
  DatePicker,
  TimePicker,
  DateTimePicker,
  ColorPicker,
  Field,
  Meter,
  Progress,
  CircularProgress,
  FileUpload,
} from "@/app/components/Form"

// Unique IDs for every form control (no duplicates)
const ID = {
  // Text inputs
  inputText: "ex-fc-input-text",
  inputEmail: "ex-fc-input-email",
  inputGroup: "ex-fc-input-group",
  password: "ex-fc-password",
  textarea: "ex-fc-textarea",
  textareaGroup: "ex-fc-textarea-group",

  // Select & choice
  select: "ex-fc-select",
  checkbox: "ex-fc-checkbox",
  checkboxGroup: "ex-fc-checkbox-group",
  radioGroup: "ex-fc-radio-group",
  toggleGroup: "ex-fc-toggle-group",

  // Toggles & rating
  switch: "ex-fc-switch",
  rating: "ex-fc-rating",

  // Numbers & range
  numberInput: "ex-fc-number",
  slider: "ex-fc-slider",
  rangeSlider: "ex-fc-range-slider",

  // Date & time
  datePicker: "ex-fc-date-picker",
  timePicker: "ex-fc-time-picker",
  dateTimePicker: "ex-fc-datetime-picker",

  // Other
  colorPicker: "ex-fc-color-picker",
  fileUpload: "ex-fc-file-upload",

  // Wrapper & display
  fieldDemo: "ex-fc-field-demo",
  meter: "ex-fc-meter",
  progress: "ex-fc-progress",
  circularProgress: "ex-fc-circular-progress",
} as const

export default function FormControlsExamplePage() {
  const [inputText, setInputText] = useState("")
  const [inputEmail, setInputEmail] = useState("")
  const [passwordVal, setPasswordVal] = useState("")
  const [textareaVal, setTextareaVal] = useState("")
  const [selectVal, setSelectVal] = useState<string | undefined>(undefined)
  const [checkboxVal, setCheckboxVal] = useState(false)
  const [checkboxGroupVal, setCheckboxGroupVal] = useState<string[]>([])
  const [radioVal, setRadioVal] = useState("")
  const [toggleVal, setToggleVal] = useState("center")
  const [switchVal, setSwitchVal] = useState(false)
  const [ratingVal, setRatingVal] = useState(0)
  const [numberVal, setNumberVal] = useState<number | null>(50)
  const [sliderVal, setSliderVal] = useState(60)
  const [rangeSliderVal, setRangeSliderVal] = useState([20, 80])
  const [dateVal, setDateVal] = useState<string | null>(null)
  const [timeVal, setTimeVal] = useState<string | null>(null)
  const [dateTimeVal, setDateTimeVal] = useState<string | null>(null)
  const [colorVal, setColorVal] = useState("#3b82f6")
  const [progressVal, setProgressVal] = useState(45)

  return (
    <div className="mx-auto max-w-2xl space-y-14 px-4 py-10">
      <header className="space-y-2">
        <h1 id="ex-fc-page-title" className="text-2xl font-bold text-foreground">
          Form controls
        </h1>
        <p id="ex-fc-page-desc" className="text-sm text-foreground/75">
          Example page for all form components. Every control has a unique ID for accessibility and testing.
        </p>
        <Link
          id="ex-fc-back-link"
          href="/examples"
          className="inline-block text-sm font-medium text-accent hover:underline"
        >
          ← Back to examples
        </Link>
      </header>

      {/* ——— Input ——— */}
      <section id="ex-fc-section-input" className="space-y-4" aria-labelledby="ex-fc-heading-input">
        <h2 id="ex-fc-heading-input" className="text-lg font-semibold text-foreground/90">
          Input
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Label htmlFor={ID.inputText} className="block text-sm font-medium text-foreground/80">
            Text
          </Label>
          <Input
            id={ID.inputText}
            type="text"
            placeholder="Type here…"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            aria-label="Text input"
            className="rounded-lg border border-(--pw-border) bg-background/10"
          />
          <Label htmlFor={ID.inputEmail} className="block text-sm font-medium text-foreground/80">
            Email
          </Label>
          <Input
            id={ID.inputEmail}
            type="email"
            placeholder="you@example.com"
            value={inputEmail}
            onChange={(e) => setInputEmail(e.target.value)}
            aria-label="Email input"
            className="rounded-lg border border-(--pw-border) bg-background/10"
          />
        </div>
        <InputGroup
          id={ID.inputGroup}
          label="Input with label & description"
          description="This is an InputGroup with inline description."
          placeholder="Type something…"
          className="max-w-sm"
        />
      </section>

      {/* ——— Password ——— */}
      <section id="ex-fc-section-password" className="space-y-4" aria-labelledby="ex-fc-heading-password">
        <h2 id="ex-fc-heading-password" className="text-lg font-semibold text-foreground/90">
          Password
        </h2>
        <Password
          id={ID.password}
          label="Password"
          placeholder="Enter password…"
          value={passwordVal}
          onChange={(e) => setPasswordVal(e.target.value)}
          description="Toggle visibility with the eye icon."
          className="max-w-sm"
        />
      </section>

      {/* ——— Textarea ——— */}
      <section id="ex-fc-section-textarea" className="space-y-4" aria-labelledby="ex-fc-heading-textarea">
        <h2 id="ex-fc-heading-textarea" className="text-lg font-semibold text-foreground/90">
          Textarea
        </h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor={ID.textarea} className="block text-sm font-medium text-foreground/80">
              Plain textarea
            </Label>
            <TextArea
              id={ID.textarea}
              placeholder="Multi-line…"
              value={textareaVal}
              onChange={(e) => setTextareaVal(e.target.value)}
              rows={3}
              className="mt-1.5 w-full rounded-lg border border-(--pw-border) bg-background/10"
            />
          </div>
          <TextAreaGroup
            id={ID.textareaGroup}
            label="TextAreaGroup"
            description="With label and description."
            placeholder="Type here…"
            rows={2}
            className="max-w-sm"
          />
        </div>
      </section>

      {/* ——— Select ——— */}
      <section id="ex-fc-section-select" className="space-y-4" aria-labelledby="ex-fc-heading-select">
        <h2 id="ex-fc-heading-select" className="text-lg font-semibold text-foreground/90">
          Select
        </h2>
        <Select
          id={ID.select}
          placeholder="Choose one…"
          value={selectVal}
          onValueChange={(v) => setSelectVal(Array.isArray(v) ? v[0] : v)}
          className="max-w-xs"
        >
          <Select.Option value="a" id="ex-fc-select-opt-a">
            Option A
          </Select.Option>
          <Select.Option value="b" id="ex-fc-select-opt-b">
            Option B
          </Select.Option>
          <Select.Option value="c" id="ex-fc-select-opt-c">
            Option C
          </Select.Option>
        </Select>
      </section>

      {/* ——— Checkbox & Radio ——— */}
      <section id="ex-fc-section-checkbox-radio" className="space-y-4" aria-labelledby="ex-fc-heading-checkbox-radio">
        <h2 id="ex-fc-heading-checkbox-radio" className="text-lg font-semibold text-foreground/90">
          Checkbox & Radio
        </h2>
        <div className="flex flex-wrap gap-8">
          <div className="space-y-2">
            <Checkbox
              id={ID.checkbox}
              checked={checkboxVal}
              onCheckedChange={setCheckboxVal}
              aria-label="Single checkbox"
            />
            <span className="ml-2 text-sm text-foreground/80">Single checkbox</span>
          </div>
          <div>
            <span id="ex-fc-checkbox-group-label" className="mb-2 block text-sm font-medium text-foreground/80">
              Checkbox group
            </span>
            <CheckboxGroup
              id={ID.checkboxGroup}
              value={checkboxGroupVal}
              onValueChange={setCheckboxGroupVal}
              aria-labelledby="ex-fc-checkbox-group-label"
            >
              <CheckboxGroup.Option id="ex-fc-cb-1" value="one" label="One" />
              <CheckboxGroup.Option id="ex-fc-cb-2" value="two" label="Two" />
              <CheckboxGroup.Option id="ex-fc-cb-3" value="three" label="Three" />
            </CheckboxGroup>
          </div>
          <div>
            <span id="ex-fc-radio-group-label" className="mb-2 block text-sm font-medium text-foreground/80">
              Radio group
            </span>
            <RadioGroup
              id={ID.radioGroup}
              value={radioVal}
              onValueChange={setRadioVal}
              aria-labelledby="ex-fc-radio-group-label"
            >
              <RadioGroup.Option id="ex-fc-radio-1" value="x" label="Option X" />
              <RadioGroup.Option id="ex-fc-radio-2" value="y" label="Option Y" />
              <RadioGroup.Option id="ex-fc-radio-3" value="z" label="Option Z" />
            </RadioGroup>
          </div>
        </div>
      </section>

      {/* ——— ToggleGroup & Switch & Rating ——— */}
      <section id="ex-fc-section-toggle-switch-rating" className="space-y-4" aria-labelledby="ex-fc-heading-toggle-switch-rating">
        <h2 id="ex-fc-heading-toggle-switch-rating" className="text-lg font-semibold text-foreground/90">
          ToggleGroup, Switch & Rating
        </h2>
        <div className="flex flex-wrap items-center gap-8">
          <div>
            <span id="ex-fc-toggle-label" className="mb-2 block text-sm font-medium text-foreground/80">
              ToggleGroup
            </span>
            <ToggleGroup
              id={ID.toggleGroup}
              options={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
                { value: "right", label: "Right" },
              ]}
              value={toggleVal}
              onValueChange={(v) => setToggleVal(Array.isArray(v) ? v[0] ?? "" : v ?? "")}
              aria-labelledby="ex-fc-toggle-label"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id={ID.switch}
              checked={switchVal}
              onCheckedChange={setSwitchVal}
              aria-label="Toggle switch"
            />
            <Label htmlFor={ID.switch} className="text-sm text-foreground/80">
              Switch
            </Label>
          </div>
          <div>
            <span className="mb-2 block text-sm font-medium text-foreground/80">
              Rating
            </span>
            <Rating
              id={ID.rating}
              value={ratingVal}
              onValueChange={setRatingVal}
              max={5}
              aria-label="Star rating"
            />
          </div>
        </div>
      </section>

      {/* ——— Number & Slider ——— */}
      <section id="ex-fc-section-number-slider" className="space-y-4" aria-labelledby="ex-fc-heading-number-slider">
        <h2 id="ex-fc-heading-number-slider" className="text-lg font-semibold text-foreground/90">
          Number & Slider
        </h2>
        <div className="flex flex-wrap gap-8">
          <NumberInput
            id={ID.numberInput}
            min={0}
            max={100}
            value={numberVal}
            onValueChange={setNumberVal}
            className="max-w-32"
          />
          <div className="min-w-48">
            <Label htmlFor={ID.slider} className="block text-sm font-medium text-foreground/80">
              Slider: {sliderVal}
            </Label>
            <Slider
              id={ID.slider}
              min={0}
              max={100}
              value={sliderVal}
              onValueChange={setSliderVal}
              className="mt-1"
            />
          </div>
          <div className="min-w-48">
            <Label htmlFor={ID.rangeSlider} className="block text-sm font-medium text-foreground/80">
              RangeSlider
            </Label>
            <RangeSlider
              id={ID.rangeSlider}
              min={0}
              max={100}
              value={rangeSliderVal as [number, number]}
              onValueChange={setRangeSliderVal}
              className="mt-1"
            />
          </div>
        </div>
      </section>

      {/* ——— Date, Time, DateTime ——— */}
      <section id="ex-fc-section-datetime" className="space-y-4" aria-labelledby="ex-fc-heading-datetime">
        <h2 id="ex-fc-heading-datetime" className="text-lg font-semibold text-foreground/90">
          Date, Time & DateTime
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor={ID.datePicker} className="block text-sm font-medium text-foreground/80">
              DatePicker
            </Label>
            <DatePicker
              id={ID.datePicker}
              value={dateVal}
              onValueChange={setDateVal}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor={ID.timePicker} className="block text-sm font-medium text-foreground/80">
              TimePicker
            </Label>
            <TimePicker
              id={ID.timePicker}
              value={timeVal}
              onValueChange={setTimeVal}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor={ID.dateTimePicker} className="block text-sm font-medium text-foreground/80">
              DateTimePicker
            </Label>
            <DateTimePicker
              id={ID.dateTimePicker}
              value={dateTimeVal}
              onValueChange={setDateTimeVal}
              className="mt-1.5"
            />
          </div>
        </div>
      </section>

      {/* ——— ColorPicker & FileUpload ——— */}
      <section id="ex-fc-section-color-file" className="space-y-4" aria-labelledby="ex-fc-heading-color-file">
        <h2 id="ex-fc-heading-color-file" className="text-lg font-semibold text-foreground/90">
          ColorPicker & FileUpload
        </h2>
        <div className="flex flex-wrap gap-8">
          <div>
            <Label htmlFor={ID.colorPicker} className="block text-sm font-medium text-foreground/80">
              ColorPicker
            </Label>
            <ColorPicker
              id={ID.colorPicker}
              value={colorVal}
              onValueChange={setColorVal}
              className="mt-1.5"
            />
          </div>
          <div>
            <FileUpload
              id={ID.fileUpload}
              label="File upload"
              accept="image/*"
              className="max-w-xs"
            />
          </div>
        </div>
      </section>

      {/* ——— Field wrapper ——— */}
      <section id="ex-fc-section-field" className="space-y-4" aria-labelledby="ex-fc-heading-field">
        <h2 id="ex-fc-heading-field" className="text-lg font-semibold text-foreground/90">
          Field wrapper
        </h2>
        <Field
          id={ID.fieldDemo}
          label="Field with label, description and control"
          description="Use Field to wrap any control with consistent label and description."
          htmlFor="ex-fc-field-control"
          required
          className="max-w-sm"
        >
          <Input
            id="ex-fc-field-control"
            type="text"
            placeholder="Wrapped by Field…"
            className="rounded-lg border border-(--pw-border) bg-background/10"
          />
        </Field>
        <Field
          id="ex-fc-field-with-error"
          label="Field with error"
          error="This is a validation error message."
          htmlFor="ex-fc-field-error-control"
          className="max-w-sm"
        >
          <Input
            id="ex-fc-field-error-control"
            type="text"
            defaultValue="Invalid value"
            className="rounded-lg border border-red-500/50 bg-background/10"
          />
        </Field>
      </section>

      {/* ——— Meter, Progress, CircularProgress ——— */}
      <section id="ex-fc-section-meter-progress" className="space-y-4" aria-labelledby="ex-fc-heading-meter-progress">
        <h2 id="ex-fc-heading-meter-progress" className="text-lg font-semibold text-foreground/90">
          Meter, Progress & CircularProgress
        </h2>
        <div className="space-y-6">
          <div>
            <Meter
              id={ID.meter}
              value={65}
              min={0}
              max={100}
              low={25}
              high={75}
              optimum={50}
              label="Meter (65 within range)"
              className="max-w-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ex-fc-progress-slider" className="block text-sm font-medium text-foreground/80">
              Progress (determinate): {progressVal}%
            </Label>
            <Slider
              id="ex-fc-progress-slider"
              min={0}
              max={100}
              value={progressVal}
              onValueChange={setProgressVal}
              className="max-w-xs"
            />
            <Progress
              id={ID.progress}
              value={progressVal}
              max={100}
              showValue
              className="max-w-xs"
            />
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <CircularProgress
                id={ID.circularProgress}
                value={70}
                max={100}
                size={64}
                className="mx-auto"
              />
              <span className="mt-2 block text-xs text-foreground/70">70%</span>
            </div>
            <div className="text-center">
              <CircularProgress
                id="ex-fc-circular-indeterminate"
                value={undefined}
                size={48}
                className="mx-auto"
              />
              <span className="mt-2 block text-xs text-foreground/70">Loading</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
