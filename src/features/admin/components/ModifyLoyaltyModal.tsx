import { zodResolver } from '@hookform/resolvers/zod'
import { clsx } from 'clsx'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { GridLoader } from '@/common/components/GridLoader'
import Input from '@/common/components/Input'

const modifySchema = z.object({
	action: z.enum(['add', 'deduct']),
	points: z.number().min(1, 'Мінімум 1 бал'),
	reason: z.string().min(5, 'Мінімум 5 символів'),
})

type ModifyFormData = z.infer<typeof modifySchema>

interface ModifyLoyaltyModalProps {
	isOpen: boolean
	onClose: () => void
	onSubmit: (points: number, reason: string) => Promise<void>
	userName: string
}

const ModifyLoyaltyModal = ({
	isOpen,
	onClose,
	onSubmit,
	userName,
}: ModifyLoyaltyModalProps) => {
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ModifyFormData>({
		resolver: zodResolver(modifySchema),
		defaultValues: { action: 'add', points: 0, reason: '' },
	})

	const action = watch('action')

	const handleFormSubmit = async (data: ModifyFormData) => {
		const finalPoints = data.action === 'add' ? data.points : -data.points
		await onSubmit(finalPoints, data.reason)
		reset()
		onClose()
	}

	if (!isOpen) return null

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200'>
			<div className='w-full max-w-md rounded-2xl border border-white/10 bg-[#151515] p-6 shadow-2xl animate-in zoom-in-95 duration-200'>
				<div className='mb-6 flex items-center justify-between'>
					<div className='flex flex-col gap-1'>
						<h2 className='text-xl font-medium text-white'>
							Модифікація балів
						</h2>
						<p className='text-sm text-neutral-500'>{userName}</p>
					</div>
					<button
						type='button'
						onClick={onClose}
						className='rounded-lg p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white'
					>
						<X size={20} />
					</button>
				</div>

				<form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
					<div className='flex rounded-lg border border-white/5 bg-black/20 p-1'>
						<button
							type='button'
							onClick={() => setValue('action', 'add')}
							className={clsx(
								'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
								action === 'add'
									? 'bg-emerald-500/20 text-emerald-400'
									: 'text-neutral-500 hover:text-neutral-300',
							)}
						>
							Нарахувати
						</button>
						<button
							type='button'
							onClick={() => setValue('action', 'deduct')}
							className={clsx(
								'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
								action === 'deduct'
									? 'bg-rose-500/20 text-rose-400'
									: 'text-neutral-500 hover:text-neutral-300',
							)}
						>
							Списати
						</button>
					</div>

					<Input
						label='Кількість балів'
						type='number'
						placeholder='Наприклад: 100'
						error={errors.points?.message}
						{...register('points', { valueAsNumber: true })}
						className='bg-black/20'
					/>

					<Input
						label='Причина'
						placeholder='Опишіть причину зміни балансу'
						error={errors.reason?.message}
						{...register('reason')}
						className='bg-black/20'
					/>

					<div className='flex justify-end gap-3 pt-4'>
						<button
							type='button'
							onClick={onClose}
							className='rounded-lg px-4 py-2 text-sm font-medium text-neutral-400 transition-colors hover:text-white'
						>
							Скасувати
						</button>
						<button
							type='submit'
							disabled={isSubmitting}
							className='flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-50'
						>
							{isSubmitting ? (
								<GridLoader className='h-4 w-4 animate-spin' />
							) : (
								'Застосувати'
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default ModifyLoyaltyModal
