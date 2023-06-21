import { NFTWholeINFO } from '@loopring-web/common-resources'
import { ReactEventHandler } from 'react'

export type NftImageProps = {
  onError: ReactEventHandler<any>
} & Partial<HTMLImageElement> &
  Partial<NFTWholeINFO>
