export type DynamicOptions = 'auto' | 'force-dynamic' | 'error' | 'force-static'
export type ActionResult<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: string
    }
