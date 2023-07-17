import { InvestMapType } from '../constant'

export type InvestAdvice = {
  type: InvestMapType
  banner: string
  titleI18n: string
  desI18n: string
  router: string
  notification: string
  enable: boolean
  project?: string
  market?: string
}
