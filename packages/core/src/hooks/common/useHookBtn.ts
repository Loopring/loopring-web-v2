import React, { useEffect } from 'react'
import { AccountStatus, fnType, TradeBtnStatus } from '@loopring-web/common-resources'
import * as _ from 'lodash'
import { accountStaticCallBack, btnClickMap, btnLabel } from '../help'
import { useAccount, useSystem, useWalletLayer2 } from '../../stores'
import { useOpenModals, useSettings } from '@loopring-web/component-lib'
import { ChainId, toBig } from '@loopring-web/loopring-sdk'
import { LoopringAPI } from '../../api_wrapper'
import { useUpdateAccount } from '../../hooks/useractions'

export const useSubmitBtn = ({
  availableTradeCheck,
  isLoading,
  submitCallback,
  ...rest
}: {
  // [ key: string ]: any,
  submitCallback: (...props: any[]) => any
  availableTradeCheck: (...props: any[]) => {
    tradeBtnStatus: TradeBtnStatus
    label: string | undefined
  }
  isLoading: boolean
}) => {
  // let {calcTradeParams} = usePageTradePro();
  let { account,  } = useAccount()
  let { app, exchangeInfo } = useSystem()
  let { defaultNetwork } = useSettings()
  const { goUpdateAccount } = useUpdateAccount()
  const { setShowDeposit } = useOpenModals()

  const btnStatus = React.useMemo((): TradeBtnStatus | undefined => {
    if (account.readyState === AccountStatus.ACTIVATED) {
      if (isLoading) {
        // myLog("tradeBtnStatus", TradeBtnStatus.LOADING);
        return TradeBtnStatus.LOADING
      } else {
        const { tradeBtnStatus } = availableTradeCheck(rest)
        // myLog("tradeBtnStatus", tradeBtnStatus);
        return tradeBtnStatus
      }
    } else {
      return TradeBtnStatus.AVAILABLE
    }
  }, [account.readyState, availableTradeCheck, isLoading, rest])

  const btnStyle: Partial<React.CSSProperties> | undefined = React.useMemo(():
    | Partial<React.CSSProperties>
    | undefined => {
    if (account.readyState === AccountStatus.ACTIVATED) {
      return undefined
    } else {
      return { backgroundColor: 'var(--color-primary)' }
    }
  }, [account.readyState])

  const _btnLabelArray = Object.assign(_.cloneDeep(btnLabel), {
    [fnType.ACTIVATED]: [
      (rest: any) => {
        const { label } = availableTradeCheck(rest)
        return label
      },
    ],
  })
  const _btnLabel = React.useMemo((): string => {
    if (!exchangeInfo) {
      return '...'
    }
    return accountStaticCallBack(_btnLabelArray, [{
      ...rest,
      chainId: defaultNetwork,
      isEarn: app === 'earn',
      readyState: account.readyState,
    }])
  }, [_btnLabelArray, rest, app, defaultNetwork, account.readyState, exchangeInfo])

  const btnClickCallbackArray = Object.assign(_.cloneDeep(btnClickMap), {
    [fnType.ACTIVATED]: [submitCallback],
  })
  const onBtnClick = React.useCallback(
    (props?: any) => {
      accountStaticCallBack(btnClickCallbackArray, [{
        ...props,
        chainId: defaultNetwork,
        isEarn: app === 'earn',
        readyState: account.readyState,
        specialActivation: async () => {
          const feeInfo = await LoopringAPI?.globalAPI?.getActiveFeeInfo({
            accountId: account._accountIdNotActive,
          })
          const { userBalances } = await LoopringAPI?.globalAPI?.getUserBalanceForFee({
            accountId: account._accountIdNotActive!,
          })
          const found = Object.keys(feeInfo.fees).find((key) => {
            const fee = feeInfo.fees[key].fee
            const foundBalance = userBalances[feeInfo.fees[key].tokenId]
            return (foundBalance && toBig(foundBalance.total).gte(fee)) || toBig(fee).eq('0')
          })
          await goUpdateAccount({
            isFirstTime: true,
            isReset: false,
            // @ts-ignore
            feeInfo: {
              token: feeInfo.fees[found!].fee,
              belong: found!,
              fee: feeInfo.fees[found!].fee,
              feeRaw: feeInfo.fees[found!].fee,
            },
          })
        },
        specialActivationDeposit: async () => {
          setShowDeposit({isShow: true})
        },
        exchangeInfoLoaded: exchangeInfo ? true : false,
      }])
    },
    [btnClickCallbackArray, app, defaultNetwork, account],
  )

  return {
    btnStatus,
    onBtnClick,
    btnLabel: _btnLabel,
    btnStyle,
    isAccountActive: account.readyState === AccountStatus.ACTIVATED,
    // btnClickCallbackArray
  }
}
