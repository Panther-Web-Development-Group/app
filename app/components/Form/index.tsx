"use client"
import {
  type FC
} from "react"
import { FormProvider, useForm } from "react-hook-form"
import { cn } from "@/lib/cn"
import type { FormProps } from "./types"

export const Form: FC<FormProps> = ({ className, children, ...props }) => {
  const methods = useForm()
  return (
    <FormProvider {...methods}>
      <form {...props} className={cn(className)}>
        {children}
      </form>
    </FormProvider>
  )
}

// Barrel exports
export { Checkbox } from "./Checkbox"
export type { CheckboxProps } from "./Checkbox/types"

export { CheckboxGroup } from "./CheckboxGroup"
export type { CheckboxGroupProps, CheckboxGroupOptionProps } from "./CheckboxGroup/types"

export { Radio } from "./Radio"
export type { RadioProps } from "./Radio/types"

export { RadioGroup } from "./RadioGroup"
export type { RadioGroupProps, RadioGroupOptionProps } from "./RadioGroup/types"

export { Input } from "./Input"
export type { InputProps } from "./Input/types"

export { Label } from "./Label"
export type { LabelProps } from "./Label/types"

export { InputGroup } from "./InputGroup"
export type { InputGroupProps } from "./InputGroup/types"

export { TextArea } from "./TextArea"
export type { TextAreaProps } from "./TextArea/types"

export { TextAreaGroup } from "./TextAreaGroup"
export type { TextAreaGroupProps } from "./TextAreaGroup/types"

export { Select } from "./Select"
export type {
  SelectProps,
  SelectTriggerProps,
  SelectContentProps,
  SelectOptionProps,
  SelectGroupProps,
  SelectShowMultipleType,
} from "./Select/types"

export { Combobox } from "./Combobox"
export type {
  ComboboxProps,
  ComboboxInputProps,
  ComboboxContentProps,
  ComboboxOptionProps,
} from "./Combobox/types"

export { Switch } from "./Switch"
export type { SwitchProps } from "./Switch/types"

export { EditableList } from "./EditableList"
export type { EditableListProps } from "./EditableList/types"

export { Slider, RangeSlider, VerticalSlider } from "./Slider"
export type { SliderProps, RangeSliderProps, SliderOrientation } from "./Slider/types"

export { Tags } from "./Tags"
export type { TagsProps } from "./Tags/types"

export { NumberInput } from "./Number"
export type { NumberInputProps } from "./Number/types"

export { DatePicker, DateRangePicker } from "./DatePicker"
export type { DatePickerProps, DateRangePickerProps } from "./DatePicker/types"

export { ColorPicker } from "./ColorPicker"
export type { ColorPickerProps } from "./ColorPicker/types"

export { Editor, getEditorStateAsJSON, getEditorStateAsHTML } from "./Editor"

export { FileUpload } from "./FileUpload"
export type { FileUploadProps } from "./FileUpload/types"