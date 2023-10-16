import { TradingInterval } from '@loopring-web/loopring-sdk'
import { MainIndicator, SubIndicator } from '@loopring-web/component-lib'

export const timeIntervalData = [
  {
    id: TradingInterval.min1,
    i18nKey: 'labelProTime1m',
  },
  {
    id: TradingInterval.min5,
    i18nKey: 'labelProTime5m',
  },
  {
    id: TradingInterval.min15,
    i18nKey: 'labelProTime15m',
  },
  {
    id: TradingInterval.min30,
    i18nKey: 'labelProTime30m',
  },
  {
    id: TradingInterval.hr1,
    i18nKey: 'labelProTime1H',
  },
  {
    id: TradingInterval.hr2,
    i18nKey: 'labelProTime2H',
  },
  {
    id: TradingInterval.hr4,
    i18nKey: 'labelProTime4H',
  },
  {
    id: TradingInterval.hr12,
    i18nKey: 'labelProTime12H',
  },
  {
    id: TradingInterval.d1,
    i18nKey: 'labelProTime1D',
  },
  {
    id: TradingInterval.w1,
    i18nKey: 'labelProTime1W',
  },
]

export const SubIndicatorList = [
  {
    id: SubIndicator.VOLUME,
  },
  {
    id: SubIndicator.MACD,
  },
  {
    id: SubIndicator.RSI,
  },
  {
    id: SubIndicator.SAR,
  },
]

export const chartFearturesList = [
  {
    id: MainIndicator.MA,
    label: 'MA',
    params: { period: 7 },
  },
  {
    id: MainIndicator.EMA,
    label: 'EMA',
    params: { period: 7 },
  },
  {
    id: MainIndicator.BOLL,
    label: 'BOLL',
    params: {},
  },
]
