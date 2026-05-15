// Base UI Components
// ===================
// Exportación centralizada de todos los componentes base del Design System

export { Button } from './Button'
export type { ButtonProps } from './Button'

export { Card, CardHeader, CardContent, CardFooter, CardMedia } from './Card'
export type { CardProps, CardSectionProps } from './Card'

// Input/Textarea/Select moved to @lwm/primitives (deuda B5 break cycle).
// Re-exported here to keep `@lwm/ui` barrel surface unchanged for consumers.
export { Input, Textarea, Select } from '@lwm/primitives'
export type { InputProps, TextareaProps, SelectProps } from '@lwm/primitives'

export { Checkbox } from './Checkbox'
export type { CheckboxProps } from './Checkbox'

export { Radio } from './Radio'
export type { RadioProps } from './Radio'

export { Switch } from './Switch'
export type { SwitchProps } from './Switch'

export { ToggleSwitch } from './ToggleSwitch'
export type { ToggleSwitchProps } from './ToggleSwitch'

export { Badge } from './Badge'
export type { BadgeProps } from './Badge'

export { Alert } from './Alert'
export type { AlertProps } from './Alert'

export { ErrorAlert } from './ErrorAlert'
export type { ErrorAlertProps } from './ErrorAlert'

export { Toast } from './Toast'
export type { ToastProps, ToastType } from './Toast'

export { ToastContainer } from './ToastContainer'
export type { ToastContainerProps } from './ToastContainer'

export { default as Modal } from './Modal'
export type { ModalProps } from './Modal'

export { default as ConfirmModal } from './ConfirmModal'
export type { ConfirmModalHandle, ConfirmModalOptions } from './ConfirmModal'

export { default as DataTable } from './DataTable'
export type { DataTableProps, DataTableColumn } from './DataTable'

// Re-export para compatibilidad
export { Button as BaseButton } from './Button'
export { Card as BaseCard } from './Card'