import { z } from 'zod'

export const resetPasswordSchema = z.object({
  email: z.string().email({ message: 'Correo invalido' }),
  password: z.string().min(8, { message: 'La contrasena debe tener al menos 8 caracteres' }),
  password_confirmation: z.string().min(8, { message: 'La confirmacion es obligatoria' }),
  token: z.string().min(1),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Las contrasenas no coinciden',
  path: ['password_confirmation'],
})

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
