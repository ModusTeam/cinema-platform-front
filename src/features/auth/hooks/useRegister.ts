import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authService } from '@/features/auth/api/auth.service'
import { useToast } from '../../../common/components/Toast/ToastContext'

const registerSchema = z
  .object({
    firstName: z.string().min(2, "Ім'я занадто коротке"),
    lastName: z.string().min(2, 'Прізвище занадто коротке'),
    email: z
      .string()
      .min(1, 'Введіть email')
      .refine(val => val.includes('@'), 'Невірний формат email'),
    password: z.string().min(6, 'Пароль має бути мінімум 6 символів'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Паролі не співпадають',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

export const useRegister = () => {
  const navigate = useNavigate()
  const toast = useToast()

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const mutation = useMutation({
    mutationFn: (data: RegisterFormData) =>
      authService.register(
        data.email,
        data.password,
        data.firstName,
        data.lastName,
      ),
    onSuccess: () => {
      toast.success('Реєстрація успішна! Тепер увійдіть у свій акаунт.')
      navigate('/auth/login')
    },
    onError: (error: any) => {
      console.error(error)
      const message =
        error.response?.data?.detail ||
        error.response?.data?.title ||
        error.message ||
        'Помилка реєстрації'
      toast.error(message)
    },
  })

  const onSubmit = (data: RegisterFormData) => {
    mutation.mutate(data)
  }

  return {
    form,
    isSubmitting: mutation.isPending,
    onSubmit,
  }
}
