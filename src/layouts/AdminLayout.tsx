import { Suspense } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
	LayoutDashboard,
	Film,
	Calendar,
	Users,
	ArrowLeft,
	Settings,
	Armchair,
	Cpu,
	Tag,
	Ticket,
	Sword,
} from 'lucide-react'
import { GridLoader } from '../common/components/GridLoader'

const MENU_ITEMS = [
	{ icon: LayoutDashboard, label: 'Дашборд', href: '/admin' },
	{ icon: Film, label: 'Фільми', href: '/admin/movies' },
	{ icon: Calendar, label: 'Сеанси', href: '/admin/sessions' },
	{ icon: Users, label: 'Користувачі', href: '/admin/users' },
	{ icon: Armchair, label: 'Зали', href: '/admin/halls' },
	{ icon: Cpu, label: 'Технології', href: '/admin/technologies' },
	{ icon: Tag, label: 'Тарифи', href: '/admin/pricings' },
	{
		icon: Ticket,
		label: 'Активність користувачів',
		href: '/admin/user-activity',
	},
	{ icon: Sword, label: 'Жанри', href: '/admin/genres' },
	{ icon: Settings, label: 'Налаштування', href: '/profile' },
]

const AdminLayout = () => {
	const location = useLocation()

	return (
		<div className='flex min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-[var(--color-primary)]/30'>
			<aside className='fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/5 bg-[var(--bg-card)]'>
				<div className='flex h-16 items-center px-6 border-b border-white/5'>
					<Link to='/' className='text-xl font-bold tracking-tighter uppercase text-white'>
						Cinema<span className='text-[var(--color-primary)]'>.</span>{' '}
						<span className='text-xs text-[var(--text-muted)] ml-1'>Admin</span>
					</Link>
				</div>

				<nav className='flex flex-col gap-1 p-4'>
					{MENU_ITEMS.map(item => {
						const isActive = location.pathname === item.href
						return (
							<Link
								key={item.href}
								to={item.href}
								className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
									isActive
										? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20'
										: 'text-[var(--text-muted)] hover:bg-white/5 hover:text-white'
								}`}
							>
								<item.icon size={18} />
								{item.label}
							</Link>
						)
					})}
				</nav>

				<div className='absolute bottom-4 left-0 w-full px-4'>
					<Link
						to='/profile'
						className='flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-white/5 hover:text-white'
					>
						<ArrowLeft size={18} />
						Назад у Профіль
					</Link>
				</div>
			</aside>

			<main className='ml-64 flex-1 p-8'>
				<Suspense
					fallback={
						<div className='flex h-[50vh] w-full items-center justify-center'>
							<GridLoader className='animate-spin text-[var(--color-primary)] h-10 w-10' />
						</div>
					}
				>
					<Outlet />
				</Suspense>
			</main>
		</div>
	)
}

export default AdminLayout
