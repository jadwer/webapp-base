import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es obligatorio' }),
  email: z.string().email({ message: 'Correo inválido' }),
  password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
  passwordConfirmation: z.string().min(8, { message: 'La confirmación es obligatoria' }),
  // Honeypot anti-bots: campo invisible que un humano jamas llena; el
  // backend descarta en silencio los registros que lo traigan con valor.
  website: z.string().optional(),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordConfirmation'],
})

export type RegisterFormData = z.infer<typeof registerSchema>
