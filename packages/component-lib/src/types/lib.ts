export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never }
export type XOR<T, U> = T | U extends { [key: string]: any }
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U

// export type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>
