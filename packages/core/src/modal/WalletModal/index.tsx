// @ts-nocheck
import { useTranslation, WithTranslation, withTranslation } from 'react-i18next'
import {
  AccountStep,
  CommonConnectInProgress,
  ConfirmLinkCopy,
  ConnectFailed,
  ConnectReject,
  ConnectRejectSwitchNetwork,
  ConnectSuccess,
  InformationForCoinBase,
  ModalWalletConnect,
  ProviderMenu,
  Toast,
  ToastType,
  useOpenModals,
  useSettings,
  WalletConnectConnectInProgress,
  WalletConnectQRCode,
  WalletConnectStep,
  WrongNetworkGuide,
} from '@loopring-web/component-lib'
import React from 'react'
import {
  AccountStatus,
  Bridge,
  copyToClipBoard,
  GatewayItem,
  gatewayList as DefaultGatewayList,
  globalSetup,
  myLog,
  NetworkMap,
  SagaStatus,
  SoursURL,
  TOAST_TIME,
} from '@loopring-web/common-resources'
import { walletServices } from '@loopring-web/web3-provider'
import {
  CoinbaseCallback,
  gameStopCallback,
  metaMaskCallback,
  RootState,
  useAccount,
  useSelectNetwork,
  walletConnectCallback,
  walletConnectV1Callback,
} from '@loopring-web/core'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'

export const useGatewayList = ({
  setIsOpenUnknownProvider,
  setConnectProvider,
}: {
  setIsOpenUnknownProvider?: any
  setConnectProvider?: any
}) => {
  const { search } = useLocation()
  const { t } = useTranslation()
  const searchParams = new URLSearchParams(search)
  const { isMobile } = useSettings()
  const { setShowConnect } = useOpenModals()
  const { account, status: accountStatus } = useAccount()

  const [stateCheck, setStateCheck] = React.useState<boolean>(false)
  const [processingCallback, setProcessingCallback] = React.useState<
    { callback: () => Promise<void> } | undefined
  >(undefined)
  React.useEffect(() => {
    if (stateCheck && [SagaStatus.UNSET].findIndex((ele: string) => ele === accountStatus) !== -1) {
      myLog('clear cache connect done')
      setStateCheck(false)
      if (processingCallback !== undefined) {
        processingCallback.callback()
      }
    }
  }, [accountStatus, stateCheck])
  const gatewayList: GatewayItem[] = !isMobile
    ? [
        {
          ...DefaultGatewayList[0],
          handleSelect: React.useCallback(
            async (event, flag?) => {
              if (!flag && account.connectName === DefaultGatewayList[0].key) {
                setShowConnect({ isShow: false })
              } else {
                const isKnow = localStorage.getItem('useKnowCoinBaseWalletInstall')

                if (
                  !(isKnow === 'true') &&
                  !(window?.ethereum?._metamask && window?.ethereum?._metamask.requestBatch)
                ) {
                  setIsOpenUnknownProvider && setIsOpenUnknownProvider(true)
                }
                walletServices.sendDisconnect('', 'should new provider')
                setConnectProvider && setConnectProvider(DefaultGatewayList[0].key)
                setShowConnect({
                  isShow: true,
                  step: WalletConnectStep.Provider,
                  info: {
                    status: 'processing',
                  },
                })
                setProcessingCallback({ callback: metaMaskCallback })
                setStateCheck(true)
              }
            },
            [account.connectName, setShowConnect],
          ),
        },
        {
          ...DefaultGatewayList[1],
          handleSelect: React.useCallback(
            async (event, flag?) => {
              if (!flag && account.connectName === DefaultGatewayList[1].key) {
                setShowConnect({ isShow: false })
              } else {
                walletServices.sendDisconnect('', 'should new provider')
                setConnectProvider(DefaultGatewayList[1].key)
                setShowConnect({
                  isShow: false,
                })
                setProcessingCallback({ callback: walletConnectCallback })
                setStateCheck(true)
              }
            },
            [account.connectName, setShowConnect],
          ),
        },
      // {
      //   ...DefaultGatewayList[4],
      //   handleSelect: React.useCallback(
      //     async (event, flag?) => {
      //       if (!flag && account.connectName === DefaultGatewayList[4].key) {
      //         setShowConnect({ isShow: false })
      //       } else {
      //         walletServices.sendDisconnect('', 'should new provider')
      //         setConnectProvider(DefaultGatewayList[4].key)
      //         setShowConnect({
      //           isShow: true,
      //           step: WalletConnectStep.WalletConnectProcessing,
      //         })
      //         setProcessingCallback({ callback: walletConnectV1Callback })
      //         setStateCheck(true)
      //       }
      //     },
      //     [account.connectName, setShowConnect],
      //   ),
      // },
      {
        ...DefaultGatewayList[ 2 ],
        // imgSrc: SoursURL + `svg/gs-${theme.mode}.svg`,
        handleSelect: React.useCallback(
          async (event, flag?) => {
            walletServices.sendDisconnect('', 'should new provider')
            setConnectProvider(DefaultGatewayList[ 2 ].key)
            setShowConnect({
              isShow: true,
              step: WalletConnectStep.Provider,
              info: {
                status: 'processing',
              },
            })
              setProcessingCallback({ callback: gameStopCallback })
              setStateCheck(true)
            },
            [setShowConnect],
          ),
        },
        {
          ...DefaultGatewayList[3],
          handleSelect: React.useCallback(
            async (event, flag?) => {
              walletServices.sendDisconnect('', 'should new provider')
              setConnectProvider(DefaultGatewayList[3].key)
              setShowConnect({
                isShow: true,
                step: WalletConnectStep.Provider,
                info: {
                  status: 'processing',
                },
              })
              setProcessingCallback({ callback: CoinbaseCallback })
              setStateCheck(true)
            },
            [setShowConnect],
          ),
        },
      ]
    : [
        ...(window.ethereum
          ? [
              {
                ...DefaultGatewayList[0],
                key: t('labelConnectWithDapp'),
                imgSrc: SoursURL + 'svg/loopring.svg',
                handleSelect: React.useCallback(
                  async (event, flag?) => {
                    if (!flag && account.connectName === DefaultGatewayList[0].key) {
                      setShowConnect({ isShow: false })
                    } else {
                      walletServices.sendDisconnect('', 'should new provider')
                      setConnectProvider(DefaultGatewayList[0].key)
                      setShowConnect({
                        isShow: true,
                        step: WalletConnectStep.CommonProcessing,
                      })
                      setProcessingCallback({ callback: metaMaskCallback })
                      setStateCheck(true)
                    }
                  },
                  [account.connectName, setShowConnect],
                ),
              },
            ]
          : [
              {
                key: t('labelOpenInWalletApp'),
                keyi18n: 'labelOpenInWalletApp',
                imgSrc: SoursURL + 'svg/loopring.svg',
                handleSelect: React.useCallback(
                  async (event, flag?) => {
                    // setShowConnect({ isShow: false });
                    const token = searchParams.get('token')
                    const l2account = searchParams.get('l2account') || searchParams.get('owner')
                    copyToClipBoard(
                      Bridge +
                        `?${l2account ? `l2account=` + l2account : ''}&${
                          token ? `token=` + token : ''
                        }`,
                    )
                    setIsConfirmLinkCopy(true)
                  },
                  [searchParams],
                ),
              },
            ]),
        {
          ...DefaultGatewayList[1],
          handleSelect: React.useCallback(
            async (event, flag?) => {
              if (!flag && account.connectName === DefaultGatewayList[1].key) {
                setShowConnect({ isShow: false })
              } else {
                walletServices.sendDisconnect('', 'should new provider')
                setConnectProvider && setConnectProvider(DefaultGatewayList[1].key)
                setShowConnect({
                  isShow: true,
                  step: WalletConnectStep.CommonProcessing,
                })
                setProcessingCallback({ callback: walletConnectCallback })
                setStateCheck(true)
              }
            },
            [account.connectName, setShowConnect],
          ),
        },
        {
          ...DefaultGatewayList[3],
          handleSelect: React.useCallback(
            async (event, flag?) => {
              walletServices.sendDisconnect('', 'should new provider')
              setShowConnect({
                isShow: true,
                step: WalletConnectStep.WalletConnectProcessing,
              })
              setConnectProvider && setConnectProvider(DefaultGatewayList[3].key)
              setProcessingCallback({ callback: CoinbaseCallback })
              setStateCheck(true)
            },
            [setShowConnect],
          ),
        },
      ]
  return { gatewayList }
}
export const ModalWalletConnectPanel = withTranslation('common')(
  ({
    onClose,
    open,
    wait = globalSetup.wait,
    // step,
    t,
    ...rest
  }: {
    // step?:number,
    open: boolean
    wait?: number
    onClose?: (e: MouseEvent) => void
  } & WithTranslation) => {
    const { account, setShouldShow } = useAccount()
    const { defaultNetwork } = useSettings()
    const {
      modals: { isShowConnect, isWrongNetworkGuide },
      setShowConnect,
      setShowAccount,
      setShowWrongNetworkGuide,
    } = useOpenModals()

    const qrCodeUrl = useSelector((state: RootState) => state.account.qrCodeUrl)
    const [connectProvider, setConnectProvider] = React.useState<boolean>(() => {
      return account?.connectName ?? false
    })
    React.useEffect(() => {
      if (account?.connectName !== connectProvider) {
        setConnectProvider(account?.connectName)
      }
    }, [account?.connectName])

    const _onClose = React.useCallback(
      async (e: any) => {
        setShouldShow(false)
        setShowConnect({ isShow: false })
        if (account.readyState === 'UN_CONNECT') {
          walletServices.sendDisconnect('', 'should new provider')
        }
        if (onClose) {
          onClose(e)
        }
      },
      [account.readyState, onClose, setShouldShow, setShowConnect],
    )
    const [isOpenUnknownProvider, setIsOpenUnknownProvider] = React.useState(false)
    const { gatewayList } = useGatewayList({
      setConnectProvider,
      setIsOpenUnknownProvider,
    })
    const [isConfirmLinkCopy, setIsConfirmLinkCopy] = React.useState(false)
    const handleCloseDialog = React.useCallback((_event: any, state?: boolean) => {
      setIsOpenUnknownProvider(false)
      localStorage.setItem('useKnowCoinBaseWalletInstall', String(!!state))
    }, [])

    const [copyToastOpen, setCopyToastOpen] = React.useState(false)
    const onRetry = React.useCallback(async () => {
      const index = gatewayList.findIndex((item) => {
        return item.key === account.connectName
      })
      if (index !== -1 && gatewayList) {
        //@ts-ignore
        gatewayList[index].handleSelect(null, true)
      } else {
        walletServices.sendDisconnect('', 'should new provider')
        setShowConnect({ isShow: true, step: WalletConnectStep.Provider })
      }
    }, [gatewayList, account.connectName, setShowConnect])
    // useConnectHook({handleProcessing});
    const providerBack = React.useMemo(() => {
      return ['UN_CONNECT', 'ERROR_NETWORK'].includes(account.readyState)
        ? undefined
        : () => {
            setShowConnect({ isShow: false })
            switch (account.readyState) {
              case AccountStatus.ACTIVATED:
              case AccountStatus.LOCKED:
                setShowAccount({ isShow: true, step: AccountStep.HadAccount })
                break
              case AccountStatus.DEPOSITING:
                setShowAccount({
                  isShow: true,
                  step: AccountStep.Deposit_Submit,
                })
                break
              case AccountStatus.NO_ACCOUNT:
                setShowAccount({ isShow: true, step: AccountStep.NoAccount })
                break
            }
          }
    }, [account.readyState, setShowAccount, setShowConnect])
    const { NetWorkItems } = useSelectNetwork({ className: 'walletModal' })

    const walletList = React.useMemo(() => {
      return Object.values({
        [WalletConnectStep.Provider]: {
          view: (
            <ProviderMenu
              NetWorkItems={NetWorkItems}
              termUrl={'https://www.iubenda.com/terms-and-conditions/74969935'}
              gatewayList={gatewayList}
              providerName={connectProvider}
              status={isShowConnect?.info?.status}
              {...{ t, ...rest }}
            />
          ),
          height: 'auto',
          onBack: providerBack,
        },
        [WalletConnectStep.CommonProcessing]: {
          view: (
            <CommonConnectInProgress
              {...{
                t,
                ...rest,
                providerName: connectProvider,
                network: NetworkMap[defaultNetwork]?.label,
              }}
            />
          ),
        },
        [WalletConnectStep.WalletConnectProcessing]: {
          view: <WalletConnectConnectInProgress {...{ t, ...rest }} />,
        },
        [WalletConnectStep.WalletConnectQRCode]: {
          view: (
            <WalletConnectQRCode
              onCopy={() => {
                copyToClipBoard(qrCodeUrl)
                setCopyToastOpen(true)
              }}
              url={qrCodeUrl}
              {...{ t, ...rest }}
            />
          ),
          onBack: () => {
            setShowConnect({ isShow: true, step: WalletConnectStep.Provider })
          },
        },
        [WalletConnectStep.SuccessConnect]: {
          view: <ConnectSuccess providerName={connectProvider} {...{ t, ...rest }} />,
        },
        [WalletConnectStep.RejectConnect]: {
          view: (
            <ConnectReject
              {...{
                t,
                // error: isShowConnect.error,
                // errorOptions: { name: connectProvider },
                ...rest,
              }}
              providerName={connectProvider}
              NetWorkItems={NetWorkItems}
              btnInfo={{ btnTxt: 'labelRetry', callback: onRetry }}
            />
          ),
          onBack: () => {
            walletServices.sendDisconnect('', 'should new provider')
            setShowConnect({ isShow: true, step: WalletConnectStep.Provider })
          },
        },
        [WalletConnectStep.RejectSwitchNetwork]: {
          view: (
            <ConnectRejectSwitchNetwork
              {...{
                t,
                ...rest,
              }}
              providerName={connectProvider}
              NetWorkItems={NetWorkItems}
              btnInfo={{ btnTxt: 'labelRetry', callback: onRetry }}
            />
          ),
          // onBack: () => {
          //   walletServices.sendDisconnect('', 'should new provider')
          //   setShowConnect({ isShow: true, step: WalletConnectStep.Provider })
          // },
        },
        [WalletConnectStep.FailedConnect]: {
          view: (
            <ConnectFailed
              {...{
                t,
                error: isShowConnect.error,
                errorOptions: { name: connectProvider },
                ...rest,
              }}
              providerName={connectProvider}
              NetWorkItems={NetWorkItems}
              btnInfo={{ btnTxt: 'labelRetry', callback: onRetry }}
            />
          ),
          onBack: () => {
            walletServices.sendDisconnect('', 'should new provider')
            setShowConnect({ isShow: true, step: WalletConnectStep.Provider })
          },
        },
      })
    }, [
      gatewayList,
      account.connectName,
      t,
      rest,
      providerBack,
      connectProvider,
      qrCodeUrl,
      isShowConnect.error,
      onRetry,
      setShowConnect,
    ])
    return (
      <>
        <InformationForCoinBase open={isOpenUnknownProvider} handleClose={handleCloseDialog} />
        <ConfirmLinkCopy
          open={isConfirmLinkCopy}
          setCopyToastOpen={setCopyToastOpen}
          handleClose={() => setIsConfirmLinkCopy(false)}
        />
        <WrongNetworkGuide
          open={isWrongNetworkGuide.isShow}
          handleClose={() => {
            setShowWrongNetworkGuide({ isShow: false })
          }}
        />
        <ModalWalletConnect
          open={isShowConnect.isShow}
          onClose={_onClose}
          panelList={walletList}
          onBack={walletList[isShowConnect.step].onBack}
          step={isShowConnect.step}
        />
        <Toast
          alertText={t('labelCopyAddClip')}
          open={copyToastOpen}
          autoHideDuration={TOAST_TIME}
          onClose={() => {
            setCopyToastOpen(false)
          }}
          severity={ToastType.success}
        />
      </>
    )
  },
)
