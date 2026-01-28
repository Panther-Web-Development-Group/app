"use client"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type FC,
  type PropsWithChildren,
} from "react"
import type { RadioGroupOptionProps, RadioGroupProps } from "./types"
import { cn } from "@/lib/cn"
import { Radio } from "../Radio"

type RadioGroupContextValue = {
  name?: string
  disabled?: boolean
  value?: string
  setValue: (next: string) => void
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

const RadioGroupRoot: FC<PropsWithChildren<RadioGroupProps>> = ({
  className,
  value: valueProp,
  defaultValue,
  onValueChange,
  name,
  disabled,
  children,
  ...divProps
}) => {
  const isControlled = typeof valueProp === "string"
  const [uncontrolledValue, setUncontrolledValue] = useState<string | undefined>(defaultValue)
  const value = isControlled ? (valueProp as string) : uncontrolledValue

  const setValue = useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolledValue(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange]
  )

  const ctx = useMemo<RadioGroupContextValue>(
    () => ({ name, disabled, value, setValue }),
    [name, disabled, value, setValue]
  )

  return (
    <div role="radiogroup" {...divProps} className={cn(className)}>
      <RadioGroupContext.Provider value={ctx}>
        {children}
      </RadioGroupContext.Provider>
    </div>
  )
}

const RadioGroupOption: FC<RadioGroupOptionProps> = (props) => {
  const {
    value: optionValue,
    disabled: optionDisabled,
    onCheckedChange,
    onChange,
    ...radioProps
  } = props

  const ctx = useContext(RadioGroupContext)
  if (!ctx) {
    throw new Error("RadioGroup.Option must be used within a RadioGroup")
  }

  const { value, setValue, name, disabled: groupDisabled } = ctx
  const checked = value === optionValue
  const disabled = groupDisabled || optionDisabled

  const handleCheckedChange = useCallback(
    (nextChecked: boolean) => {
      if (nextChecked) setValue(optionValue)
      onCheckedChange?.(nextChecked)
    },
    [onCheckedChange, optionValue, setValue]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e)
    },
    [onChange]
  )

  return (
    <Radio
      {...radioProps}
      name={name}
      value={optionValue}
      checked={checked}
      disabled={disabled}
      onCheckedChange={handleCheckedChange}
      onChange={handleChange}
    />
  )
}

export const RadioGroup = Object.assign(RadioGroupRoot, {
  Option: RadioGroupOption,
})

