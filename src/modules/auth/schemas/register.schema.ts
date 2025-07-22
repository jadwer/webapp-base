import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es obligatorio' }),
  email: z.string().email({ message: 'Correo inválido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
  password_confirmation: z.string().min(6, { message: 'La confirmación es obligatoria' }),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Las contraseñas no coinciden',
  path: ['password_confirmation'],
})

export type RegisterFormData = z.infer<typeof registerSchema>
