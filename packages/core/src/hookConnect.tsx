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
  SUBMIT_PANEL_AUTO_CLOSE,
  ThemeType,
  UIERROR_CODE,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import { accountReducer, useAccount } from './stores/account'
import { useModalData } from './stores'
import { checkAccount, networkUpdate, resetLayer12Data, useConnectHook } from './services'
import { REFRESH_RATE } from './defs'
import { store, WalletConnectL2Btn } from './index'
import { useTranslation } from 'react-i18next'
import { Avatar, Box, SelectChangeEvent, Typography } from '@mui/material'
import { updateAccountStatus } from './stores/account/reducer'
import styled from '@emotion/styled'
import EthereumProvider from '@walletconnect/ethereum-provider'

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

    svg {
      width: 20px;
      height: 20px;
      right: -50%;
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
export const useSelectNetwork = ({ className }: { className?: string }) => {
  const { t } = useTranslation()
  const { defaultNetwork, setDefaultNetwork, themeMode, isMobile } = useSettings()
  const { setShowConnect } = useOpenModals()
  const {
    account: { connectName },
  } = useAccount()
  // const { account } = useAccount();
  React.useEffect(() => {
    const account = store.getState().account
    if (account.readyState === AccountStatus.UN_CONNECT) {
      // const networkFlag =
      networkUpdate()
    }
  }, [])

  const handleOnNetworkSwitch = async (value: sdk.ChainId) => {
    const account = store.getState().account
    if (value !== defaultNetwork) {
      setDefaultNetwork(value)
    }
    if (account.readyState !== AccountStatus.UN_CONNECT) {
      // await walletServices.sendDisconnect();
      setShowConnect({
        isShow: true,
        step: WalletConnectStep.CommonProcessing,
      })
      myLog(connectProvides)
      try {
        await connectProvides.sendChainIdChange(value, themeMode === ThemeType.dark)
      } catch (error) {
        const chainId = await connectProvides?.usedWeb3?.eth?.getChainId()
        setDefaultNetwork(chainId ?? defaultNetwork)
        if (
          connectProvides?.usedWeb3 &&
          (error as any)?.code == 4001 &&
          window?.ethereum?.isConnected() &&
          !(connectProvides?.usedProvide as EthereumProvider)?.isWalletConnect
        ) {
          setShowConnect({
            isShow: true,
            step: WalletConnectStep.RejectSwitchNetwork,
          })
          await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE)
        }

        setShowConnect({
          isShow: false,
          step: WalletConnectStep.RejectSwitchNetwork,
        })
      }
    } else {
      networkUpdate()
    }
  }

  const NetWorkItems: JSX.Element = React.useMemo(() => {
    return (
      <>
        <OutlineSelectStyle
          aria-label={NetworkMap[defaultNetwork]?.label}
          IconComponent={DropDownIcon}
          labelId='network-selected'
          id='network-selected'
          className={`${className} ${NetworkMap[defaultNetwork]?.isTest ? 'test ' : ''} ${
            isMobile ? 'mobile' : ''
          }`}
          value={!defaultNetwork ? sdk.ChainId.MAINNET : defaultNetwork}
          autoWidth
          onChange={(event: SelectChangeEvent<any>) => handleOnNetworkSwitch(event.target.value)}
        >
          {AvaiableNetwork.reduce((prew, id, index) => {
            if (NetworkMap[id]) {
              prew.push(
                <OutlineSelectItemStyle
                  disabled={
                    ![1, 5].includes(Number(id)) &&
                    [ConnectProviders.GameStop].includes(connectName)
                  }
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
      </>
    )
  }, [defaultNetwork, NetworkMap, connectName])
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
      myLog('After connect >>,network part start: step1 networkUpdate')
      store.dispatch(updateAccountStatus({ _chainId: chainId }))
      const networkFlag = await networkUpdate()
      const currentProvide = connectProvides.usedProvide
      myLog(
        'After connect >>,network part done: step2 check account,',
        connectProvides.usedWeb3,
        currentProvide,
      )

      if (networkFlag) {
        resetLayer12Data()
        checkAccount(accAddress, chainId !== 'unknown' ? chainId : undefined)
      }

      resetWithdrawData()
      resetTransferData()
      resetDepositData()

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
      // const {};

      myLog('handleAccountDisconnect:', account, reason, code)
      resetAccount({ shouldUpdateProvider: true })
      setStateAccount(SagaStatus.PENDING)
      resetLayer12Data()

      resetWithdrawData()
      resetTransferData()
      resetDepositData()
      // await sleep(REFRESH_RATE)
    },
    [account, resetAccount, resetDepositData, resetTransferData, resetWithdrawData],
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
        // setShowConnect({
        //   isShow: true,
        //   step: WalletConnectStep.RejectConnect,
        // });
      } else {
        // setShowConnect({
        //   isShow: true,
        //   step: WalletConnectStep.FailedConnect,
        //   error: {
        //     ...props.opts.error,
        //   } as sdk.RESULT_INFO,
        // })
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
            >
              <Typography marginY={3} variant={isMobile ? 'h4' : 'h1'} textAlign={'center'}>
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
