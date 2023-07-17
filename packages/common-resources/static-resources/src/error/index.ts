export * from './errorMap'

export type ErrorType = {
  id: string
  messageKey: string
  options?: any
}
export type ErrorWithCodeType = {
  id: string
  code: number
  message: string
  messageKey?: string
  options?: any
}

export class CustomError extends Error {
  constructor(error: ErrorType) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(error.id)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError)
    }

    this.name = error.id
    this.message = error.id
    this._date = Date.now()
    this._messageKey = error.messageKey
    this._options = error.options
    // Custom debugging information
    // this.foo = foo
    // this.date = new Date()
  }

  private _options: any

  get options(): any {
    return this._options
  }

  private _date: number

  get date(): number {
    return this._date
  }

  private _messageKey: string

  get messageKey(): string {
    return this._messageKey
  }
}

export class CustomErrorWithCode extends Error {
  constructor(error: ErrorWithCodeType) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(error.id)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError)
    }

    this.name = error.id
    this._code = error.code
    this.message = error.message
    this._date = Date.now()
    this._messageKey = error.messageKey ?? error.message
    // this._options = error.options;
    // Custom debugging information          '
    // this.foo = foo
    // this.date = new Date()
  }
  private _code: number

  get code(): number {
    return this._code
  }

  private _options: any

  get options(): any {
    return this._options
  }

  private _date: number

  get date(): number {
    return this._date
  }

  private _messageKey: string

  get messageKey(): string {
    return this._messageKey
  }
}
