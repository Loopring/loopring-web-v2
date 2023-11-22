import React from 'react'
import {
  OutlineSelect,
  OutlineSelectItem,
  setShowAccount,
  useOpenModals,
  useSettings,
  WalletConnectStep,
} from '@loopring-web/component-lib'
import {
  AvaiableNetwork,
  ConnectProviders,
  connectProvides,
  ErrorType,
  ProcessingStep,
  ProcessingType,
} from '@loopring-web/web3-provider'
import {
  AccountStatus,
  ChainETHEREUMIcon,
  ChainGOERLIIcon,
  ChainTAIKOIcon,
  DropDownIcon,
  L1L2_NAME_DEFINED,
  MapChainId,
  myLog,
  NetworkMap,
  SagaStatus,
  SoursURL,
  ThemeType,
  UIERROR_CODE,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import { accountReducer, useAccount } from './stores/account'
import { resetDepositData, resetTransferData, resetWithdrawData, useModalData } from './stores'
import { checkAccount, networkUpdate, resetLayer12Data, useConnectHook } from './services'
import { REFRESH_RATE } from './defs'
import { store, WalletConnectL2Btn } from './index'
import { useTranslation } from 'react-i18next'
import { Avatar, Box, SelectChangeEvent, Typography } from '@mui/material'
import { updateAccountStatus } from './stores/account/reducer'
import styled from '@emotion/styled'

export const OutlineSelectStyle = styled(OutlineSelect)`
  &.walletModal {
    background: var(--field-opacity);
    height: var(--row-height);
  }

  .MuiAvatar-root {
    background: var(--color-white);
    margin-right: ${({ theme }) => theme.unit}px;
    width: 20px;
    height: 20px;
    position: relative;

    svg {
      position: absolute;
      width: 18px;
      height: 18px;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }

  &.test .MuiSelect-outlined .label {
    display: inline-flex;

    &:after {
      color: var(--network-text);
      content: ' test';
      padding-left: 0.5em;
      display: inline-flex;
      font-size: var(body2);
    }
  }

  .MuiSelect-outlined.MuiSelect-outlined {
    padding-right: ${({ theme }) => theme.unit * 3}px;
    padding-left: ${({ theme }) => theme.unit * 3}px;
    display: inline-flex;
    align-items: center;
  }

  &.mobile .MuiSelect-outlined.MuiSelect-outlined {
    padding-left: 0px;
    padding-right: ${({ theme }) => theme.unit * 2}px;
  }

  &.header {
    .MuiSelect-outlined {
      //.MuiAvatar-root {
      //  display: none;
      //}
    }

    &.mobile {
      .MuiAvatar-root {
        display: flex;
      }

      .label {
        display: none;
      }

      padding-left: 0;
      padding-right: ${({ theme }) => theme.unit * 4}px;
      position: relative;
    }
  }
` as typeof OutlineSelect
export const OutlineSelectItemStyle = styled(OutlineSelectItem)`
  .MuiAvatar-root {
    width: 24px;
    height: 24px;

    svg {
      width: 20px;
      height: 20px;
    }

    background: var(--color-white);
    margin-right: ${({ theme }) => theme.unit}px;
  }

  &.provider-test .label {
    &:after {
      content: ' test';
      padding-left: 0.5em;
      display: inline-flex;
      font-size: var(body2);
      color: var(--network-text);
    }
  }
` as typeof OutlineSelectItem
const Icon = ({ label = '' }: { label: string }) => {
  switch (label) {
    case 'GOERLI':
      return (
        <Avatar component={'span'} variant='circular'>
          <ChainGOERLIIcon sx={{ width: 20, height: 20 }} />
        </Avatar>
      )
    case 'ETHEREUM':
      return (
        <Avatar component={'span'} variant='circular'>
          <ChainETHEREUMIcon sx={{ width: 20, height: 20 }} />
        </Avatar>
      )
    case 'TAIKO':
      return (
        <Avatar component={'span'} variant='circular'>
          <ChainTAIKOIcon sx={{ width: 20, height: 20 }} />
        </Avatar>
      )
    default:
      const child = label.split(' ')?.map((item) => item[0])
      return <Avatar component={'span'} variant='circular' children={child} />
  }
}
const onConnect = async (accAddress: string, chainId: any) => {
  const {
    settings: { defaultNetwork },
    account: { readyState, accAddress: _accAddress },
  } = store.getState()
  if (
    _accAddress?.toLowerCase() === accAddress?.toUpperCase() &&
    defaultNetwork.toString() == chainId.toString() &&
    [
      AccountStatus.NO_ACCOUNT,
      AccountStatus.DEPOSITING,
      AccountStatus.NOT_ACTIVE,
      AccountStatus.LOCKED,
    ].includes(readyState as AccountStatus)
  ) {
    myLog('After connect >>,onChinId change')
  } else {
    myLog('After connect >>,network part start: step1 networkUpdate')
    store.dispatch(updateAccountStatus({ _chainId: chainId }))
    const networkFlag = await networkUpdate(chainId)
    if (networkFlag) {
      resetLayer12Data()
      checkAccount(accAddress, chainId !== 'unknown' ? chainId : undefined)
    }
    store.dispatch(resetWithdrawData(undefined))
    store.dispatch(resetTransferData(undefined))
    store.dispatch(resetDepositData(undefined))
  }
}
const onDisConnect = async () => {
  resetLayer12Data()
  store.dispatch(resetWithdrawData(undefined))
  store.dispatch(resetTransferData(undefined))
  store.dispatch(resetDepositData(undefined))
}
export const callSwitchChain = async (_chainId: string | number) => {
  const { defaultNetwork, themeMode } = store.getState().settings
  if (Number(defaultNetwork) !== Number(_chainId)) {
    try {
      await connectProvides.sendChainIdChange(defaultNetwork, themeMode === ThemeType.dark)
    } catch (error) {
      throw { code: UIERROR_CODE.ERROR_SWITCH_ETHEREUM }
    }
    if (Number(defaultNetwork) !== Number(await connectProvides?.usedWeb3?.eth?.getChainId())) {
      throw { code: UIERROR_CODE.ERROR_SWITCH_ETHEREUM }
    }
  }
}
export const useSelectNetwork = ({ className }: { className?: string }) => {
  const { t } = useTranslation()
  const { defaultNetwork: _defaultNetwork, isMobile } = useSettings()
  const {
    account: { connectName },
  } = useAccount()
  const [defaultNetwork, setDefaultNetwork] = React.useState<number | undefined>()

  const handleOnNetworkSwitch = React.useCallback(
    async (value: sdk.ChainId) => {
      myLog('defaultNetwork', value)
      const account = store.getState().account
      setDefaultNetwork((state) => {
        if (Number(value) !== Number(state)) {
          if (account.readyState !== AccountStatus.UN_CONNECT) {
            if (connectProvides?.usedWeb3 && connectProvides.usedProvide) {
              onConnect(account.accAddress, value)
            } else {
              onDisConnect()
              return state
            }
          } else {
            networkUpdate(Number(value))
          }
        }
        return value
      })
    },
    [defaultNetwork],
  )
  React.useEffect(() => {
    setDefaultNetwork((state) => {
      if (_defaultNetwork && state !== _defaultNetwork) {
        networkUpdate()
        return Number(_defaultNetwork)
      } else {
        return state
      }
    })
  }, [_defaultNetwork])

  const disable = React.useCallback(
    (id: any) => {
      myLog(connectName, ConnectProviders.WalletConnect)
      if (connectName == ConnectProviders.GameStop.toString()) {
        return ![1, 5].includes(Number(id))
      } else if (
        (connectProvides.usedProvide as any)?.session &&
        (connectProvides.usedProvide as any)?.namespace
      ) {
        // @ts-ignore
        const optionalChains = connectProvides.usedProvide?.session?.namespaces[
          (connectProvides.usedProvide as any).namespace
        ]?.chains ?? [`${(connectProvides.usedProvide as any).namespace}:${defaultNetwork}`]
        return !optionalChains.includes(
          `${(connectProvides.usedProvide as any).namespace}:${Number(id)}`,
        )
      }
      return false
    },
    [connectName, connectProvides.usedProvide, defaultNetwork],
  )
  const NetWorkItems: JSX.Element = React.useMemo(() => {
    myLog('defaultNetwork NetWorkItems', defaultNetwork)
    return (
      <>
        {defaultNetwork && (
          <OutlineSelectStyle
            aria-label={NetworkMap[defaultNetwork]?.label}
            IconComponent={DropDownIcon}
            labelId='network-selected'
            id='network-selected'
            className={`${className} ${NetworkMap[defaultNetwork]?.isTest ? 'test ' : ''} ${
              isMobile ? 'mobile' : ''
            }`}
            value={defaultNetwork}
            autoWidth
            onChange={(event: SelectChangeEvent<any>) => handleOnNetworkSwitch(event.target.value)}
          >
            {AvaiableNetwork.reduce((prew, id, index) => {
              if (NetworkMap[id]) {
                prew.push(
                  <OutlineSelectItemStyle
                    disabled={disable(id)}
                    className={`viewNetwork${id} ${NetworkMap[id]?.isTest ? 'provider-test' : ''}`}
                    aria-label={NetworkMap[id].label}
                    value={id}
                    key={'viewNetwork' + NetworkMap[id] + index}
                  >
                    <Typography component={'span'} display={'inline-flex'} alignItems={'center'}>
                      <Icon label={MapChainId[id]} />
                      <span className={'label'}>{t(NetworkMap[id].label)}</span>
                    </Typography>
                  </OutlineSelectItemStyle>,
                )
              }
              return prew
            }, [] as JSX.Element[])}
          </OutlineSelectStyle>
        )}
      </>
    )
  }, [defaultNetwork, NetworkMap, connectName, connectProvides.usedProvide])
  React.useEffect(() => {}, [])

  return {
    NetWorkItems,
    handleOnNetworkSwitch,
  }
}

export function useConnect(_props: { state: keyof typeof SagaStatus }) {
  const {
    account,
    shouldShow,
    resetAccount,
    statusUnset: statusAccountUnset,
    setShouldShow,
    status: accountStatus,
  } = useAccount()
  // const {updateWalletLayer2, resetLayer2} = useWalletLayer2()

  const { resetWithdrawData, resetTransferData, resetDepositData } = useModalData()

  const { setShowConnect } = useOpenModals()
  const [stateAccount, setStateAccount] = React.useState<keyof typeof SagaStatus>('DONE')
  React.useEffect(() => {
    if (stateAccount === SagaStatus.PENDING && accountStatus === SagaStatus.DONE) {
      setStateAccount('DONE')
      statusAccountUnset()
    }
  }, [stateAccount, accountStatus])
  const handleConnect = React.useCallback(
    async ({
      accounts,
      chainId,
    }: {
      accounts: string
      provider: any
      chainId: sdk.ChainId | 'unknown'
    }) => {
      const accAddress = accounts[0]
      await onConnect(accAddress, chainId)
      setShouldShow(false)
      setShowConnect({
        isShow: !!shouldShow ?? false,
        step: WalletConnectStep.SuccessConnect,
      })
      await sdk.sleep(REFRESH_RATE)
      setShowConnect({ isShow: false, step: WalletConnectStep.SuccessConnect })
    },
    [
      resetWithdrawData,
      resetTransferData,
      resetDepositData,
      setShouldShow,
      setShowConnect,
      shouldShow,
    ],
  )

  const handleAccountDisconnect = React.useCallback(
    async ({ reason, code }: { reason?: string; code?: number }) => {
      myLog('handleAccountDisconnect:', account, reason, code)
      resetAccount({ shouldUpdateProvider: true })
      setStateAccount(SagaStatus.PENDING)
      onDisConnect()
    },
    [account],
  )

  const handleProcessing = React.useCallback(
    ({ opts, type }: { type: ProcessingType; opts: any }) => {
      if (type == ProcessingType.nextStep) {
        if (opts.step !== undefined && opts.step == ProcessingStep.showQrcode) {
          store.dispatch(accountReducer.updateAccountStatus({ qrCodeUrl: opts.QRcode }))
          setShowConnect({
            isShow: false,
          })
        } else {
          const { qrCodeUrl } = opts
          if (qrCodeUrl) {
            store.dispatch(accountReducer.updateAccountStatus({ qrCodeUrl }))
            setShowConnect({
              isShow: true,
              step: WalletConnectStep.WalletConnectQRCode,
            })
          }
        }
      }
      // const { qrCodeUrl } = opts;
    },
    [setShowConnect],
  )

  const handleError = React.useCallback(
    (props: { type: keyof typeof ErrorType; opts?: any }) => {
      if (!!account.accAddress) {
        myLog('try to resetAccount...')
        resetAccount()
      }

      statusAccountUnset()
      setShowAccount({ isShow: false })
      if (props?.opts?.error?.code === -32002) {
      } else if (
        props?.opts?.connectName === ConnectProviders.WalletConnect &&
        props?.opts?.error &&
        props?.opts?.error?.code === UIERROR_CODE.ERROR_WALLECTCONNECT_MANUALLY_CLOSE
      ) {
        setShowConnect({ isShow: false })
      } else {
      }
    },
    [
      account._chainId,
      account.accAddress,
      shouldShow,
      statusAccountUnset,
      setShowConnect,
      resetAccount,
    ],
  )

  useConnectHook({
    handleAccountDisconnect,
    handleProcessing,
    handleError,
    handleConnect,
  })
}

export const ViewAccountTemplate = React.memo(
  ({ activeViewTemplate }: { activeViewTemplate: JSX.Element }) => {
    const { account } = useAccount()
    const { t } = useTranslation(['common', 'layout'])
    const { isMobile, defaultNetwork } = useSettings()
    const network = MapChainId[defaultNetwork] ?? MapChainId[1]

    const viewTemplate = React.useMemo(() => {
      switch (account.readyState) {
        case AccountStatus.UN_CONNECT:
          return (
            <Box
              flex={1}
              display={'flex'}
              justifyContent={'center'}
              flexDirection={'column'}
              alignItems={'center'}
              maxWidth={'calc(1200px - 32px)'}
              alignSelf={'center'}
            >
              <Typography
                maxWidth={'1156px'}
                marginY={3}
                variant={isMobile ? 'h4' : 'h1'}
                textAlign={'center'}
              >
                {t('describeTitleConnectToWallet', {
                  layer2: L1L2_NAME_DEFINED[network].layer2,
                  l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                })}
              </Typography>
              <WalletConnectL2Btn />
            </Box>
          )
          break
        case AccountStatus.LOCKED:
          return (
            <Box
              flex={1}
              display={'flex'}
              justifyContent={'center'}
              flexDirection={'column'}
              alignItems={'center'}
              maxWidth={'calc(1200px - 32px)'}
              alignSelf={'center'}
            >
              <Typography marginY={3} variant={isMobile ? 'h4' : 'h1'} textAlign={'center'}>
                {t('describeTitleLocked')}
              </Typography>
              <WalletConnectL2Btn />
            </Box>
          )
          break
        case AccountStatus.NO_ACCOUNT:
          return (
            <Box
              flex={1}
              display={'flex'}
              justifyContent={'center'}
              flexDirection={'column'}
              alignItems={'center'}
              maxWidth={'calc(1200px - 32px)'}
              alignSelf={'center'}
            >
              <Typography
                marginY={3}
                variant={isMobile ? 'h4' : 'h1'}
                whiteSpace={'pre-line'}
                textAlign={'center'}
              >
                {t('describeTitleNoAccount', {
                  layer2: L1L2_NAME_DEFINED[network].layer2,
                  loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                  l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                })}
              </Typography>
              <WalletConnectL2Btn />
            </Box>
          )
          break
        case AccountStatus.NOT_ACTIVE:
          return (
            <Box
              flex={1}
              display={'flex'}
              justifyContent={'center'}
              flexDirection={'column'}
              alignItems={'center'}
              maxWidth={'calc(1200px - 32px)'}
              alignSelf={'center'}
            >
              <Typography marginY={3} variant={isMobile ? 'h4' : 'h1'} textAlign={'center'}>
                {t('describeTitleNotActive', {
                  layer2: 'Layer 2',
                  loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                  l1ChainName: 'Ethereum',
                })}
              </Typography>
              <WalletConnectL2Btn />
            </Box>
          )
          break
        case AccountStatus.DEPOSITING:
          return (
            <Box
              flex={1}
              display={'flex'}
              justifyContent={'center'}
              flexDirection={'column'}
              alignItems={'center'}
              maxWidth={'calc(1200px - 32px)'}
              alignSelf={'center'}
            >
              <img
                className='loading-gif'
                alt={'loading'}
                width='60'
                src={`${SoursURL}images/loading-line.gif`}
              />
              <Typography marginY={3} variant={isMobile ? 'h4' : 'h1'} textAlign={'center'}>
                {t('describeTitleOpenAccounting', {
                  l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                })}
              </Typography>
            </Box>
          )
          break
        case AccountStatus.ERROR_NETWORK:
          return (
            <Box
              flex={1}
              display={'flex'}
              justifyContent={'center'}
              flexDirection={'column'}
              alignItems={'center'}
              maxWidth={'calc(1200px - 32px)'}
              alignSelf={'center'}
            >
              <Typography marginY={3} variant={isMobile ? 'h4' : 'h1'} textAlign={'center'}>
                {t('describeTitleOnErrorNetwork', {
                  connectName: account.connectName,
                })}
              </Typography>
            </Box>
          )
          break
        case AccountStatus.ACTIVATED:
          return activeViewTemplate
        default:
          break
      }
    }, [account.readyState, account.connectName, isMobile, t, activeViewTemplate])

    return <>{viewTemplate}</>
  },
)
