export interface TimeBlock {
    startTime: number
    endTime: number | undefined
    is_free: boolean
}

export interface FormatedTimeBlock {
  startTime: string
  endTime: string
  is_free: boolean
}