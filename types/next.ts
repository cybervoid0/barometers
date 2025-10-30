export type DynamicOptions = 'auto' | 'force-dynamic' | 'error' | 'force-static'

export type VoidSuccess = {
  success: true
}
export type PayloadSuccess<T = unknown> = {
  success: true
  data: T
}
export type Fail = {
  success: false
  error: string
}

export type ActionResult<T = void> =
  | ({ success: true } & (T extends void ? Record<never, never> : { data: T }))
  | { success: false; error: string; fieldErrors?: Record<string, string> }
