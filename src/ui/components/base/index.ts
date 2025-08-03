// Base UI Components
// ===================
// Exportación centralizada de todos los componentes base del Design System

export { Button } from './Button'
export type { ButtonProps } from './Button'

export { Card, CardHeader, CardContent, CardFooter, CardMedia } from './Card'
export type { CardProps, CardSectionProps } from './Card'

export { Input, Textarea, Select } from './Input'
export type { InputProps, TextareaProps, SelectProps } from './Input'

export { Checkbox } from './Checkbox'
export type { CheckboxProps } from './Checkbox'

export { Radio } from './Radio'
export type { RadioProps } from './Radio'

export { Switch } from './Switch'
export type { SwitchProps } from './Switch'

export { ToggleSwitch } from './ToggleSwitch'
export type { ToggleSwitchProps } from './ToggleSwitch'

// Re-export para compatibilidad
export { Button as BaseButton } from './Button'
export { Card as BaseCard } from './Card'