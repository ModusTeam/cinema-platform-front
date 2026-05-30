/// <reference types="node" />

// migration.ts
// Run with: bun migration.ts
// Optional dry run: bun migration.ts --dry-run

import { existsSync } from 'node:fs'
import {
	mkdir,
	readdir,
	readFile,
	rename,
	rm,
	writeFile,
} from 'node:fs/promises'
import path from 'node:path'

type MoveRule = {
	from: string
	to: string
}

const root = process.cwd()
const dryRun = process.argv.includes('--dry-run')

const moveRules: MoveRule[] = [
	// services -> feature api
	[
		'src/services/accountService.ts',
		'src/features/account/api/account.service.ts',
	],
	[
		'src/services/adminAchievementsService.ts',
		'src/features/admin/api/admin-achievements.service.ts',
	],
	[
		'src/services/adminLoyaltyService.ts',
		'src/features/admin/api/admin-loyalty.service.ts',
	],
	[
		'src/services/adminOrdersService.ts',
		'src/features/admin/api/admin-orders.service.ts',
	],
	[
		'src/services/adminPricingsService.ts',
		'src/features/admin/api/admin-pricings.service.ts',
	],
	[
		'src/services/adminSessionsService.ts',
		'src/features/admin/api/admin-sessions.service.ts',
	],
	[
		'src/services/adminStatsService.ts',
		'src/features/admin/api/admin-stats.service.ts',
	],
	[
		'src/services/adminTicketsService.ts',
		'src/features/admin/api/admin-tickets.service.ts',
	],
	[
		'src/services/adminUsersService.ts',
		'src/features/admin/api/admin-users.service.ts',
	],
	['src/services/authService.ts', 'src/features/auth/api/auth.service.ts'],
	[
		'src/services/bookingService.ts',
		'src/features/booking/api/booking.service.ts',
	],
	['src/services/genresService.ts', 'src/features/admin/api/genres.service.ts'],
	['src/services/hallsService.ts', 'src/features/halls/api/halls.service.ts'],
	[
		'src/services/moviesService.ts',
		'src/features/movies/api/movies.service.ts',
	],
	[
		'src/services/ordersService.ts',
		'src/features/account/api/orders.service.ts',
	],
	[
		'src/services/seatTypesService.ts',
		'src/features/halls/api/seat-types.service.ts',
	],
	[
		'src/services/signalrService.ts',
		'src/features/booking/api/signalr.service.ts',
	],
	[
		'src/services/technologiesService.ts',
		'src/features/halls/api/technologies.service.ts',
	],

	// types -> feature model, except generic common types
	['src/types/account.ts', 'src/features/account/model/account.types.ts'],
	['src/types/auth.ts', 'src/features/auth/model/auth.types.ts'],
	['src/types/common.ts', 'src/shared/types/common.types.ts'],
	['src/types/hall.ts', 'src/features/halls/model/hall.types.ts'],
	['src/types/movie.ts', 'src/features/movies/model/movie.types.ts'],
	['src/types/order.ts', 'src/features/account/model/order.types.ts'],
].map(([from, to]) => ({ from, to }))

const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx'])

const toPosix = (value: string) => value.replace(/\\/g, '/')

const withoutExtension = (value: string) => value.replace(/\.(tsx?|jsx?)$/, '')

const normalizeRel = (value: string) =>
	toPosix(path.normalize(value)).replace(/^\.\//, '')

const moduleAliases = new Map<string, string>()

for (const rule of moveRules) {
	moduleAliases.set(
		withoutExtension(normalizeRel(rule.from)),
		`@/${withoutExtension(normalizeRel(rule.to)).replace(/^src\//, '')}`,
	)
}

async function walk(dir: string): Promise<string[]> {
	if (!existsSync(dir)) {
		return []
	}

	const entries = await readdir(dir, { withFileTypes: true })
	const files: string[] = []

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name)

		if (entry.isDirectory()) {
			if (entry.name === 'node_modules' || entry.name === 'dist') {
				continue
			}

			files.push(...(await walk(fullPath)))
			continue
		}

		if (entry.isFile() && sourceExtensions.has(path.extname(entry.name))) {
			files.push(fullPath)
		}
	}

	return files
}

function resolveSpecifier(filePath: string, specifier: string) {
	if (specifier.startsWith('@/')) {
		return normalizeRel(path.join('src', specifier.slice(2)))
	}

	if (specifier.startsWith('./') || specifier.startsWith('../')) {
		const fileDir = path.dirname(path.relative(root, filePath))

		return normalizeRel(path.join(fileDir, specifier))
	}

	return null
}

function rewriteImports(filePath: string, source: string) {
	let changed = false

	const next = source.replace(
		/((?:from\s+|import\s*\(\s*)['"])([^'"]+)(['"])/g,
		(match, prefix: string, specifier: string, suffix: string) => {
			const resolved = resolveSpecifier(filePath, specifier)

			if (!resolved) {
				return match
			}

			const alias = moduleAliases.get(withoutExtension(resolved))

			if (!alias) {
				return match
			}

			changed = true

			return `${prefix}${alias}${suffix}`
		},
	)

	return { changed, source: next }
}

async function rewriteSourceImports() {
	const srcDir = path.join(root, 'src')
	const files = await walk(srcDir)
	let changedCount = 0

	for (const file of files) {
		const source = await readFile(file, 'utf8')
		const result = rewriteImports(file, source)

		if (!result.changed) {
			continue
		}

		changedCount += 1

		if (!dryRun) {
			await writeFile(file, result.source)
		}

		console.log(
			`${dryRun ? '[dry-run] would update' : 'updated'} ${toPosix(
				path.relative(root, file),
			)}`,
		)
	}

	console.log(`Import files changed: ${changedCount}`)
}

async function moveFiles() {
	let movedCount = 0

	for (const rule of moveRules) {
		const from = path.join(root, rule.from)
		const to = path.join(root, rule.to)

		if (!existsSync(from)) {
			console.log(`skip missing ${rule.from}`)
			continue
		}

		if (existsSync(to)) {
			throw new Error(`Target already exists: ${rule.to}`)
		}

		movedCount += 1

		if (!dryRun) {
			await mkdir(path.dirname(to), { recursive: true })
			await rename(from, to)
		}

		console.log(
			`${dryRun ? '[dry-run] would move' : 'moved'} ${rule.from} -> ${rule.to}`,
		)
	}

	console.log(`Files moved: ${movedCount}`)
}

async function removeLegacyDirsIfEmpty() {
	for (const dir of ['src/services', 'src/types']) {
		const fullPath = path.join(root, dir)

		if (!existsSync(fullPath)) {
			continue
		}

		if (!dryRun) {
			await rm(fullPath, { recursive: true })
		}

		console.log(`${dryRun ? '[dry-run] would remove' : 'removed'} ${dir}`)
	}
}

async function main() {
	console.log(
		dryRun ? 'Starting migration dry run...' : 'Starting migration...',
	)

	await rewriteSourceImports()
	await moveFiles()
	await removeLegacyDirsIfEmpty()

	console.log('Done.')
	console.log('Recommended verification: bun run lint && bun run build')
}

main().catch(error => {
	console.error(error)
	process.exitCode = 1
})
