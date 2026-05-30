import { api } from '@/lib/axios'
import type { PaginatedResult } from '@/shared/types/common.types'

interface CreateHallRequest {
	name: string
	rows: number
	seatsPerRow: number
	seatTypeId: string
	technologyIds: string[]
}

interface UpdateHallRequest {
	hallId: string
	name: string
}

interface UpdateHallTechnologiesRequest {
	hallId: string
	technologyIds: string[]
}

export interface HallSummaryDto {
	id: string
	name: string
	capacity: number
	totalCapacity?: number
	technologies?: { id: string; name: string }[]
}

interface BatchChangeSeatTypeRequest {
	hallId: string
	seatIds: string[]
	newSeatTypeId: string
}

export const hallsService = {
	getAll: async (): Promise<HallSummaryDto[]> => {
		const { data } = await api.get<PaginatedResult<HallSummaryDto>>('/halls', {
			params: { pageNumber: 1, pageSize: 100 },
		})
		return data.items.map(item => ({
			...item,
			capacity: item.totalCapacity || item.capacity || 0,
		}))
	},

	create: async (
		name: string,
		rows: number,
		seatsPerRow: number,
		seatTypeId: string,
		technologyIds: string[],
	) => {
		const payload: CreateHallRequest = {
			name,
			rows,
			seatsPerRow,
			seatTypeId,
			technologyIds,
		}
		const { data } = await api.post('/halls', payload)
		return data
	},

	batchChangeSeatType: async (
		hallId: string,
		seatIds: string[],
		newSeatTypeId: string,
	) => {
		const payload: BatchChangeSeatTypeRequest = {
			hallId,
			seatIds,
			newSeatTypeId,
		}
		await api.put('/seats/batch-change-type', payload)
	},

	update: async (id: string, name: string) => {
		const payload: UpdateHallRequest = {
			hallId: id,
			name,
		}
		await api.put(`/halls/${id}`, payload)
	},

	updateTechnologies: async (id: string, technologyIds: string[]) => {
		const payload: UpdateHallTechnologiesRequest = {
			hallId: id,
			technologyIds,
		}
		await api.put(`/halls/${id}/technologies`, payload)
	},

	delete: async (id: string) => {
		await api.delete(`/halls/${id}`)
	},
}
