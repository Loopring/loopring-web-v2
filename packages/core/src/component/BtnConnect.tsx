import { withTranslation } from 'react-i18next'
import { accountStaticCallBack, btnClickMap, btnLabel, isCoinbaseSmartWallet, LoopringAPI, store, useAccount, useSystem, useUpdateAccount } from '../index'
import {
  Button,
  useSettings,
  ButtonProps,
  useOpenModals,
  AccountStep,
} from '@loopring-web/component-lib'
import React from 'react'
import _ from 'lodash'

import {
  coinbaseSmartWalletChains,
  fnType,
  i18n,
  L1L2_NAME_DEFINED,
  LoadingIcon,
  MapChainId,
  SagaStatus,
} from '@loopring-web/common-resources'
import { ChainId, NetworkWallet, toBig } from '@loopring-web/loopring-sdk'
import { useAppKit } from '@reown/appkit/react'

export const WalletConnectL2Btn = withTranslation(['common'], {
  withRef: true,
})(({ t, btnLabelProps = {}, btnClickMapProps = {}, className, size = 'large', width }: any) => {
  const { status: accountStatus, account } = useAccount()
  const { defaultNetwork } = useSettings()
  const { app, exchangeInfo } = useSystem()

  const network = MapChainId[defaultNetwork] ?? MapChainId[1]

  const _btnLabel = Object.assign(_.cloneDeep(btnLabel), {
    [fnType.ERROR_NETWORK]: [
      function () {
        return `labelWrongNetwork`
      },
    ],
    ...btnLabelProps,
  })


  const labelUI = React.useMemo(() => {
    if (!exchangeInfo || ![SagaStatus.UNSET, SagaStatus.DONE].includes(accountStatus))
      return <LoadingIcon style={{ width: 18, height: 18, color: 'var(--color-text-button)' }} />
    return t(
      accountStaticCallBack(_btnLabel, [
        {
          chainId: defaultNetwork,
          isEarn: app === 'earn',
          readyState: account.readyState,
        },
      ]),
      {
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      },
    )
  }, [accountStatus, account.readyState, i18n.language, defaultNetwork, app, exchangeInfo])

  const _btnClickMap = Object.assign(_.cloneDeep({ ...btnClickMap, ...btnClickMapProps }), {})
  const { setShowDeposit, setShowAccount } = useOpenModals()
  const { goUpdateAccount } = useUpdateAccount()
  return (
    <Button
      variant={'contained'}
      size={size}
      color={'primary'}
      fullWidth={true}
      style={{ maxWidth: '280px' }}
      className={className}
      sx={{
        width: width
      }}
      onClick={() => {
        accountStaticCallBack(_btnClickMap, [{
          chainId: defaultNetwork,
          isEarn: app === 'earn',
          readyState: account.readyState,
          specialActivation: async () => {
            setShowAccount({
              isShow: true,
              step: AccountStep.UpdateAccount_Approve_WaitForAuth
            })
            const {account} = store.getState()
            const [walletType, coinbaseSW] = await Promise.all([
              LoopringAPI?.walletAPI?.getWalletType({
                wallet: account.accAddress,
                network: MapChainId[defaultNetwork] as NetworkWallet,
              }),
              isCoinbaseSmartWallet(account.accAddress, defaultNetwork as ChainId),
            ])

            const isActivationSupported =
              !walletType?.walletType?.isContract ||
              (coinbaseSW && coinbaseSmartWalletChains.includes(defaultNetwork))
            if (!isActivationSupported) {
              setShowAccount({
                isShow: true,
                step: AccountStep.UpdateAccount_SmartWallet_NotSupported_Alert
              })
              return 
            }
            
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
            const {account} = store.getState()
            const [walletType, coinbaseSW] = await Promise.all([
              LoopringAPI?.walletAPI?.getWalletType({
                wallet: account.accAddress,
                network: MapChainId[defaultNetwork] as NetworkWallet,
              }),
              isCoinbaseSmartWallet(account.accAddress, defaultNetwork as ChainId),
            ])

            const isActivationSupported =
              !walletType?.walletType?.isContract ||
              (coinbaseSW && coinbaseSmartWalletChains.includes(defaultNetwork))
            if (!isActivationSupported) {
              setShowAccount({
                isShow: true,
                step: AccountStep.UpdateAccount_SmartWallet_NotSupported_Alert
              })
              return 
            }
            setShowDeposit({isShow: true})
          },
          exchangeInfoLoaded: exchangeInfo ? true : false
        }])
      }}
    >
      {labelUI}
    </Button>
  )
}) as (props: ButtonProps & { [key: string]: any }) => JSX.Element

export const BtnConnectL1 = withTranslation(['common', 'layout'], {
  withRef: true,
})(({ t }: any) => {
  const {
    status: accountStatus,
    account: { readyState },
  } = useAccount()
  const {
    exchangeInfo
  } = useSystem()
  const labelUI = React.useMemo(() => {
    if (!exchangeInfo || accountStatus !== SagaStatus.UNSET) return <LoadingIcon style={{ width: 18, height: 18, color: 'var(--color-text-button)' }} />
    return t(
      accountStatus === SagaStatus.UNSET
        ? accountStaticCallBack(Object.assign(_.cloneDeep(btnLabel)))
        : 'labelConnectWallet',
      {
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      },
    )
  }, [accountStatus, exchangeInfo])
  
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const modal = useAppKit()

  return (
    <>
      <Button
        variant={'contained'}
        size={'large'}
        color={'primary'}
        fullWidth={true}
        style={{ maxWidth: '280px' }}
        onClick={() => {
          modal.open()
        }}
      >
        {labelUI}
      </Button>
    </>
  )
}) as typeof Button
