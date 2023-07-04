import {
  AccountStatus,
  FeeInfo,
  SagaStatus,
  UIERROR_CODE,
  WalletMap,
} from '@loopring-web/common-resources'
import { makeWalletLayer2, store, useAccount, useWalletLayer2 } from '../../index'
import {
  AccountStep,
  CheckActiveStatusProps,
  TOASTOPEN,
  ToastType,
  useOpenModals,
  TransErrorHelp,
} from '@loopring-web/component-lib'
import React from 'react'
import { connectProvides } from '@loopring-web/web3-provider'
import * as sdk from '@loopring-web/loopring-sdk'

export function isAccActivated() {
  return store.getState().account.readyState === AccountStatus.ACTIVATED
}

export const useCheckActiveStatus = <C extends FeeInfo>({
  // isFeeNotEnough,
  checkFeeIsEnough,
  chargeFeeTokenList,
  onDisconnect,
  isDepositing,
  setToastOpen,
}: // isShow,
{
  // isShow: boolean;
  isDepositing: boolean
  onDisconnect: () => void
  isFeeNotEnough: {
    isFeeNotEnough: boolean
    isOnLoading: boolean
  }
  setToastOpen: (state: TOASTOPEN) => void
  chargeFeeTokenList: C[]
  checkFeeIsEnough: (props?: { isRequiredAPI: true; intervalTime?: number }) => void
}): { checkActiveStatusProps: CheckActiveStatusProps<C> } => {
  const { account } = useAccount()
  const { status: walletLayer2Status, updateWalletLayer2 } = useWalletLayer2()
  // const { chainInfos } = onchainHashInfo.useOnChainInfo();
  // const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);

  const {
    setShowAccount,
    setShowActiveAccount,
    modals: { isShowAccount },
  } = useOpenModals()
  const [know, setKnow] = React.useState(false)
  const [knowDisable, setKnowDisable] = React.useState(true)
  const [isAddressContract, setIsAddressContract] = React.useState<undefined | boolean>(undefined)
  const [walletMap, setWalletMap] = React.useState(
    makeWalletLayer2(true).walletMap ?? ({} as WalletMap<any>),
  )
  const [isFeeNotEnough, setIsFeeNotEnough] = React.useState({
    isFeeNotEnough: true,
    isOnLoading: false,
  })

  const goUpdateAccount = () => {
    setShowAccount({ isShow: false })
    setShowActiveAccount({ isShow: true })
  }
  const onIKnowClick = () => {
    if (account.isContract) {
      setKnow(true)
    } else if (isFeeNotEnough.isFeeNotEnough) {
      setKnow(true)
    } else {
      goUpdateAccount()
    }
  }
  const walletLayer2Callback = React.useCallback(() => {
    const walletMap = makeWalletLayer2(true).walletMap ?? {}
    setWalletMap(walletMap)
    setIsFeeNotEnough((state) => ({
      ...state,
      isFeeNotEnough: walletMap
        ? chargeFeeTokenList.findIndex((item) => {
            if (walletMap[item.belong] && walletMap[item.belong]?.count) {
              return sdk
                .toBig(walletMap[item.belong]?.count ?? 0)
                .gte(sdk.toBig(item.fee.toString().replaceAll(sdk.SEP, '')))
            } else {
              return (
                item?.feeRaw !== undefined &&
                Number(item.fee.toString()) == 0 &&
                sdk.toBig((item.feeRaw ?? '').toString().replaceAll(sdk.SEP, '')).eq(0)
              )
            }
            return
          }) === -1
        : false,
    }))
    setKnowDisable(false)
  }, [chargeFeeTokenList])

  React.useEffect(() => {
    if (walletLayer2Callback && walletLayer2Status === SagaStatus.UNSET) {
      walletLayer2Callback()
      checkFeeIsEnough()
    }
  }, [walletLayer2Status])

  const init = React.useCallback(async () => {
    setKnowDisable(true)
    try {
      const isContract = await sdk.isContract(connectProvides.usedWeb3, account.accAddress)
      setIsAddressContract(isContract)
      updateWalletLayer2()
    } catch (error: any) {
      console.log('Web3 error', error)
      setToastOpen({
        open: true,
        type: ToastType.error,
        content: <TransErrorHelp error={{ code: UIERROR_CODE.TIME_OUT }} />,
      })
    }
  }, [account.accAddress, updateWalletLayer2])

  React.useEffect(() => {
    if (isShowAccount.isShow && isShowAccount.step === AccountStep.CheckingActive) {
      init()
      setKnow(false)
    }
  }, [isShowAccount.step, isShowAccount.isShow])

  const checkActiveStatusProps: CheckActiveStatusProps<C> = {
    know,
    knowDisable,
    onIKnowClick,
    isDepositing,
    goDisconnect: onDisconnect,
    account: { ...account, isContract: isAddressContract },
    chargeFeeTokenList,
    goSend: () => {
      setShowAccount({
        isShow: true,
        step: AccountStep.AddAssetGateway,
      })
    },
    walletMap,
    isFeeNotEnough,
  }
  return { checkActiveStatusProps }
}
