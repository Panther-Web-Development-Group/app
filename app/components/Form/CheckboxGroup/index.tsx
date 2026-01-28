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
import type { CheckboxGroupOptionProps, CheckboxGroupProps } from "./types"
import { cn } from "@/lib/cn"
import { Checkbox } from "../Checkbox"

type CheckboxGroupContextValue = {
  name?: string
  disabled?: boolean
  value: string[]
  setValue: (next: string[]) => void
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null)

const CheckboxGroupRoot: FC<PropsWithChildren<CheckboxGroupProps>> = ({
  className,
  value: valueProp,
  defaultValue,
  onValueChange,
  name,
  disabled,
  children,
  ...divProps
}) => {
  const isControlled = Array.isArray(valueProp)
  const [uncontrolledValue, setUncontrolledValue] = useState<string[]>(defaultValue ?? [])
  const value = isControlled ? (valueProp as string[]) : uncontrolledValue

  const setValue = useCallback(
    (next: string[]) => {
      if (!isControlled) setUncontrolledValue(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange]
  )

  const ctx = useMemo<CheckboxGroupContextValue>(
    () => ({ name, disabled, value, setValue }),
    [name, disabled, value, setValue]
  )

  return (
    <div role="group" {...divProps} className={cn(className)}>
      <CheckboxGroupContext.Provider value={ctx}>
        {children}
      </CheckboxGroupContext.Provider>
    </div>
  )
}

const CheckboxGroupOption: FC<CheckboxGroupOptionProps> = (props) => {
  const {
    value: optionValue,
    disabled: optionDisabled,
    onCheckedChange,
    onChange,
    ...checkboxProps
  } = props

  const ctx = useContext(CheckboxGroupContext)
  if (!ctx) throw new Error("CheckboxGroup.Option must be used within a CheckboxGroup")

  const { value, setValue, name, disabled: groupDisabled } = ctx
  const checked = value.includes(optionValue)
  const disabled = groupDisabled || optionDisabled

  const handleCheckedChange = useCallback(
    (nextChecked: boolean) => {
      const next = nextChecked
        ? Array.from(new Set([...value, optionValue]))
        : value.filter((v) => v !== optionValue)

      setValue(next)
      onCheckedChange?.(nextChecked)
    },
    [onCheckedChange, optionValue, setValue, value]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // keep option-level onChange available
      onChange?.(e)
    },
    [onChange]
  )

  return (
    <Checkbox
      {...checkboxProps}
      name={name}
      value={optionValue}
      checked={checked}
      disabled={disabled}
      onCheckedChange={handleCheckedChange}
      onChange={handleChange}
    />
  )
}

export const CheckboxGroup = Object.assign(CheckboxGroupRoot, {
  Option: CheckboxGroupOption,
})

