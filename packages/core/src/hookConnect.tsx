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
  DoneIcon,
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
import { resetDepositData, resetTransferData, resetWithdrawData, useModalData, useSystem } from './stores'
import { checkAccount, networkUpdate, resetLayer12Data, useConnectHook } from './services'
import { REFRESH_RATE } from './defs'
import { createImageFromInitials, store, WalletConnectL2Btn } from './index'
import { useTranslation } from 'react-i18next'
import { Avatar, Box, Button, Modal, SelectChangeEvent, Typography } from '@mui/material'
import { updateAccountStatus } from './stores/account/reducer'
import styled from '@emotion/styled'
import { useWeb3Modal } from '@web3modal/ethers5/react'

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
    case 'SEPOLIA':
      return (
        <Avatar component={'span'} variant='circular'>
          <Box component={'img'} src={createImageFromInitials(24, 'Sepolia', '#56a7c9')}/> 
        </Avatar>
      )
    case 'TAIKO':
      return (
        <Avatar component={'span'} variant='circular'>
          <ChainTAIKOIcon sx={{ width: 20, height: 20 }} />
        </Avatar>
      )
    case 'TAIKOHEKLA':
      return (
        <Avatar component={'span'} variant='circular'>
          <Box component={'img'} src={createImageFromInitials(24, 'TAIKOHEKLA', '#E91898')}/> 
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
    account: { connectName, accAddress },
  } = useAccount()
  const [defaultNetwork, setDefaultNetwork] = React.useState<number | undefined>(_defaultNetwork)

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
  const { open } = useWeb3Modal()
  const NetWorkItems: JSX.Element = React.useMemo(() => {
    myLog('defaultNetwork NetWorkItems', defaultNetwork)
    
    return (
      <>
        {defaultNetwork && NetworkMap[defaultNetwork] && (
          <OutlineSelectItemStyle
            sx={{ cursor: 'pointer' }}
            onClick={() => open({ view: accAddress ? 'Networks' : 'Connect' })}
            disabled={disable(defaultNetwork)}
            className={`viewNetwork${defaultNetwork} ${
              NetworkMap[defaultNetwork]?.isTest ? 'provider-test' : ''
            }`}
            aria-label={NetworkMap[defaultNetwork].label}
            value={defaultNetwork}
          >
            <Typography component={'span'} display={'inline-flex'} alignItems={'center'}>
              <Icon label={MapChainId[defaultNetwork]} />
              <span className={'label'}>{t(NetworkMap[defaultNetwork].label)}</span>
            </Typography>
            <DropDownIcon sx={{marginLeft: 0.5}} />
          </OutlineSelectItemStyle>
        )}
      </>
    )
  }, [defaultNetwork, NetworkMap, connectName, connectProvides.usedProvide, accAddress])
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
const ViewAccountTemplateStyle = styled(Box)`
  &.inModal,
  &.inBlock {
    > .MuiTypography-root {
      font-size: ${({ theme }) => theme.fontDefault.body1};
      line-height: 1.2em;
      font-weight: 400;
    }
    > h1.MuiTypography-root {
      font-size: ${({ theme }) => theme.fontDefault.h5};
      line-height: 1.2em;
      font-weight: 500;
    }
  }
`
export const ViewAccountTemplate = React.memo(
  ({
    activeViewTemplate,
    className,
    size = 'large',
    onClickCompleteSignIn
  }: {
    activeViewTemplate: JSX.Element
    className?: string
    size?: string
    onClickCompleteSignIn?: () => void
  }) => {
    const { account } = useAccount()
    const { t } = useTranslation(['common', 'layout'])
    const { isMobile, defaultNetwork } = useSettings()
    const { app } = useSystem()
    const network = MapChainId[defaultNetwork] ?? MapChainId[1]

    const isTaikoEarn =
      [sdk.ChainId.TAIKO, sdk.ChainId.TAIKOHEKLA].includes(defaultNetwork) && app === 'earn'

    const viewTemplate = React.useMemo(() => {
      switch (account.readyState) {
        case AccountStatus.UN_CONNECT:
          return (
            <ViewAccountTemplateStyle
              flex={1}
              className={className}
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
              <WalletConnectL2Btn size={size} />
            </ViewAccountTemplateStyle>
          )
          break
        case AccountStatus.LOCKED:
          return (
            <ViewAccountTemplateStyle
              flex={1}
              className={className}
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
              <WalletConnectL2Btn size={size} />
            </ViewAccountTemplateStyle>
          )
          break
        case AccountStatus.NO_ACCOUNT:
          return (
            <ViewAccountTemplateStyle
              flex={1}
              className={className}
              display={'flex'}
              justifyContent={'center'}
              flexDirection={'column'}
              alignItems={'center'}
              maxWidth={isTaikoEarn ? 'calc(800px)' : 'calc(1200px - 32px)'}
              alignSelf={'center'}
            >
              <Typography
                marginY={3}
                variant={isMobile ? 'h4' : 'h1'}
                whiteSpace={'pre-line'}
                textAlign={'center'}
              >
                {isTaikoEarn
                  ? t('labelEarnDepositDes')
                  : t('describeTitleNoAccount', {
                      layer2: L1L2_NAME_DEFINED[network].layer2,
                      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                      l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                    })}
              </Typography>
              <WalletConnectL2Btn size={size} />
            </ViewAccountTemplateStyle>
          )
          break
        case AccountStatus.NOT_ACTIVE:
          return (
            <ViewAccountTemplateStyle
              flex={1}
              className={className}
              display={'flex'}
              justifyContent={'center'}
              flexDirection={'column'}
              alignItems={'center'}
              maxWidth={isTaikoEarn ? 'calc(800px)' : 'calc(1200px - 32px)'}
              alignSelf={'center'}
            >
              {isTaikoEarn ? (
                <>
                  <DoneIcon
                    style={{ color: 'var(--color-success)', width: '64px', height: '64px' }}
                  />
                  <Typography marginY={3} variant={isMobile ? 'h4' : 'h1'} textAlign={'center'}>
                    Your Loopring DeFi account has been created. 
                    Please sign to complete the process.
                  </Typography>
                  <Button
                    onClick={onClickCompleteSignIn}
                    sx={{ marginTop: 1.5 }}
                    variant={'contained'}
                    size={size}
                    color={'primary'}
                    fullWidth={true}
                    style={{ maxWidth: '280px' }}
                  >
                    Complete Sign in
                  </Button>
                </>
              ) : (
                <>
                  <Typography marginY={3} variant={isMobile ? 'h4' : 'h1'} textAlign={'center'}>
                    {t('describeTitleNotActive', {
                      layer2: 'Layer 2',
                      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                      l1ChainName: 'Ethereum',
                    })}
                  </Typography>
                  <WalletConnectL2Btn size={size} />
                </>
              )}
            </ViewAccountTemplateStyle>
          )
          break
        case AccountStatus.DEPOSITING:
          return (
            <ViewAccountTemplateStyle
              flex={1}
              className={className}
              display={'flex'}
              justifyContent={'center'}
              flexDirection={'column'}
              alignItems={'center'}
              maxWidth={isTaikoEarn ? 'calc(800px)' : 'calc(1200px - 32px)'}
              alignSelf={'center'}
            >
              <img
                className='loading-gif'
                alt={'loading'}
                width='60'
                src={`${SoursURL}images/loading-line.gif`}
              />
              <Typography marginY={3} variant={isMobile ? 'h4' : 'h1'} textAlign={'center'}>
                {isTaikoEarn
                  ? t('labelEarnDepositDes')
                  : t('describeTitleOpenAccounting', {
                      l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                    })}
              </Typography>
            </ViewAccountTemplateStyle>
          )
          break
        case AccountStatus.ERROR_NETWORK:
          return (
            <ViewAccountTemplateStyle
              flex={1}
              className={className}
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
            </ViewAccountTemplateStyle>
          )
          break
        case AccountStatus.ACTIVATED:
          return activeViewTemplate
        default:
          break
      }
    }, [account.readyState, account.connectName, isMobile, t, activeViewTemplate, isTaikoEarn])

    return (
      <>
        {viewTemplate}
      </>
    )
  },
)
