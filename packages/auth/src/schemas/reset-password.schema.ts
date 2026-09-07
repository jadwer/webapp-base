import { z } from 'zod'

export const resetPasswordSchema = z.object({
  email: z.string().email({ message: 'Correo inválido' }),
  password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
  password_confirmation: z.string().min(8, { message: 'La confirmación es obligatoria' }),
  token: z.string().min(1),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Las contraseñas no coinciden',
  path: ['password_confirmation'],
})

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
