import { api } from '@/lib/axios'
import { loyaltyApi } from '@/lib/loyaltyApi'

import type {
	Achievement,
	AchievementDto,
	AchievementsPreviewData,
	AchievementsResponseDto,
	AchievementsTabData,
} from './achievements.types'

const isNotFoundError = (error: unknown) => {
	if (
		typeof error === 'object' &&
		error !== null &&
		'response' in error &&
		typeof error.response === 'object' &&
		error.response !== null &&
		'status' in error.response
	) {
		return error.response.status === 404
	}

	return false
}

const normalizeStatus = (status?: string): Achievement['status'] => {
	const value = status?.toLowerCase()

	if (value === 'unlocked' || value === 'completed') return 'unlocked'
	if (value === 'in-progress' || value === 'in_progress') return 'in-progress'
	return 'locked'
}

const normalizeRarity = (rarity?: string): Achievement['rarity'] => {
	const value = rarity?.toLowerCase()

	if (value === 'rare' || value === 'epic' || value === 'legendary') {
		return value
	}

	return 'common'
}

const normalizeAchievement = (
	item: AchievementDto,
	index: number,
): Achievement => ({
	id: item.id || `achievement-${index + 1}`,
	title: item.title || item.name || 'Досягнення',
	description: item.description || 'Опис буде доступний пізніше.',
	status: normalizeStatus(item.status),
	rarity: normalizeRarity(item.rarity),
	progress: item.progress ?? item.currentProgress ?? 0,
	total: item.total ?? item.targetValue,
	pointsReward: item.pointsReward ?? item.rewardPoints,
	category: item.category,
})

const getItemsFromResponse = (data: AchievementsResponseDto | AchievementDto[]) => {
	if (Array.isArray(data)) return data
	return data.items || data.achievements || data.data || []
}

const getUserAchievements = async (): Promise<Achievement[]> => {
	try {
		const { data } = await loyaltyApi.get<AchievementsResponseDto | AchievementDto[]>(
			'/achievements/me',
			{
				params: { includeLocked: true },
			},
		)

		return getItemsFromResponse(data).map(normalizeAchievement)
	} catch (error) {
		if (!isNotFoundError(error)) {
			throw error
		}
	}

	const { data } = await api.get<AchievementsResponseDto | AchievementDto[]>(
		'/achievements/me',
		{
			params: { includeLocked: true },
		},
	)

	return getItemsFromResponse(data).map(normalizeAchievement)
}

export const achievementsAdapter = {
	getAchievementsPreview: async (): Promise<AchievementsPreviewData> => {
		const achievements = await getUserAchievements()
		const unlocked = achievements.filter(item => item.status === 'unlocked')

		return {
			totalUnlocked: unlocked.length,
			totalAvailable: achievements.length,
			items: achievements.slice(0, 3),
		}
	},
	getAchievementsTabData: async (): Promise<AchievementsTabData> => {
		const achievements = await getUserAchievements()

		return {
			summary: {
				unlocked: achievements.filter(item => item.status === 'unlocked').length,
				inProgress: achievements.filter(item => item.status === 'in-progress')
					.length,
				locked: achievements.filter(item => item.status === 'locked').length,
				total: achievements.length,
			},
			achievements,
		}
	},
}
