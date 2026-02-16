import { z } from 'zod'

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Correo invalido' }),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
