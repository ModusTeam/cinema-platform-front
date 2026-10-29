import * as z from 'zod'

export const profileSchema = z
  .object({
    firstName: z.string().min(1, "Ім'я обов'язкове").max(50),
    lastName: z.string().min(1, "Прізвище обов'язкове").max(50),
    email: z.string().email(),
    oldPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmNewPassword: z.string().optional(),
  })
  .refine(
    data => {
      if (data.newPassword && data.newPassword.length > 0) {
        return data.oldPassword && data.oldPassword.length > 0
      }
      return true
    },
    {
      message: 'Введіть поточний пароль для підтвердження змін',
      path: ['oldPassword'],
    },
  )
  .refine(
    data => {
      if (data.newPassword && data.newPassword.length > 0) {
        return data.newPassword === data.confirmNewPassword
      }
      return true
    },
    {
      message: 'Паролі не співпадають',
      path: ['confirmNewPassword'],
    },
  )
  .refine(
    data => {
      if (data.newPassword && data.newPassword.length > 0) {
        return data.newPassword.length >= 6
      }
      return true
    },
    {
      message: 'Мінімум 6 символів',
      path: ['newPassword'],
    },
  )

export type ProfileFormData = z.infer<typeof profileSchema>

export const dateOfBirthSchema = z.object({
  dateOfBirth: z
    .string()
    .min(1, 'Оберіть дату народження')
    .refine(value => !Number.isNaN(new Date(value).getTime()), {
      message: 'Оберіть коректну дату',
    })
    .refine(value => new Date(value) <= new Date(), {
      message: 'Дата народження не може бути в майбутньому',
    })
    .refine(value => new Date(value).getFullYear() >= 1900, {
      message: 'Оберіть коректну дату народження',
    }),
})

export type DateOfBirthFormData = z.infer<typeof dateOfBirthSchema>
