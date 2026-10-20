export interface HallBuilderData {
  rows: number
  cols: number
  technologyIds: string[]
  primarySeatTypeId: string
  seatConfig: Array<{
    gridX: number
    gridY: number
    seatTypeId: string
  }>
}
