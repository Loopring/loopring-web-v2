import { useDispatch, useSelector } from 'react-redux'
import { Layer1ActionHistory } from '@loopring-web/common-resources'
import { ChainId } from '@loopring-web/loopring-sdk'
import { circleUpdateLayer1ActionHistory, clearOneItem, setOneItem } from './reducer'

export const useLayer1Store = (): {
  layer1ActionHistory: {
    [ChainId.MAINNET]: Layer1ActionHistory
    [ChainId.GOERLI]: Layer1ActionHistory
    [ChainId.SEPOLIA]: Layer1ActionHistory
    [ChainId.TAIKOHEKLA]: Layer1ActionHistory
    [ChainId.TAIKO]: Layer1ActionHistory
    [ChainId.BASE]: Layer1ActionHistory
    [ChainId.BASESEPOLIA]: Layer1ActionHistory
  }
  setOneItem: (props: { domain: string; uniqueId: string; chainId?: ChainId }) => void
  clearOneItem: (props: { domain: string; uniqueId: string; chainId?: ChainId }) => void
  circleUpdateLayer1ActionHistory: (props: { chainId?: ChainId }) => void
} => {
  const { chainId } = useSelector((state: any) => state.system)

  const layer1ActionHistory = useSelector((state: any) => state.localStore.layer1ActionHistory)

  const dispatch = useDispatch()

  return {
    layer1ActionHistory,
    setOneItem: (props: { domain: string; uniqueId: string; chainId?: ChainId }) =>
      dispatch(setOneItem({ ...props, chainId: props.chainId ?? chainId })),
    clearOneItem: (props: { domain: string; uniqueId: string; chainId?: ChainId }) =>
      dispatch(clearOneItem({ ...props, chainId: props.chainId ?? chainId })),
    circleUpdateLayer1ActionHistory: (props: { chainId?: ChainId }) =>
      dispatch(circleUpdateLayer1ActionHistory({ chainId: props.chainId ?? chainId })),
  }
}
