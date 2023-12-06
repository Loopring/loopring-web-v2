import React from 'react'
import {
  accountReducer,
  accountStaticCallBack,
  makeVaultLayer2,
  store,
  useAccount,
  useSystem,
  useTokenPrices,
  useWalletLayer2,
  VaultAccountInfoStatus,
  volumeToCountAsBigNumber,
  WalletConnectL2Btn,
} from '@loopring-web/core'
import {
  Button,
  VaultDataAssetsItem,
  setShowWrongNetworkGuide,
  useOpenModals,
  useSettings,
  VaultAssetsTableProps,
  AccountStep,
} from '@loopring-web/component-lib'
import {
  AccountStatus,
  EmptyValueTag,
  fnType,
  globalSetup,
  L1L2_NAME_DEFINED,
  MapChainId,
  myLog,
  RouterPath,
  SagaStatus,
  SoursURL,
  TokenType,
  TradeBtnStatus,
  VaultAction,
  VaultKey,
} from '@loopring-web/common-resources'

import * as sdk from '@loopring-web/loopring-sdk'
import _ from 'lodash'
import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { VaultAccountStatus } from '@loopring-web/loopring-sdk'
import { useRouteMatch } from 'react-router-dom'
import { useHistory } from 'react-router-dom'

const VaultPath = `${RouterPath.vault}/:item`

export const useGetVaultAssets = <R extends VaultDataAssetsItem>({
  vaultAccountInfo: _vaultAccountInfo,
}: {
  vaultAccountInfo: VaultAccountInfoStatus
}): VaultAssetsTableProps<R> & {
  totalAsset: string
  onActionBtnClick: (key: VaultAction) => void
  setShowNoVaultAccount: (props: any) => void
  [key: string]: any
} => {
  let match: any = useRouteMatch(VaultPath)
  const history = useHistory()
  const { t } = useTranslation(['common'])

  const {
    vaultAccountInfoStatus,
    vaultAccountInfo,
    activeInfo,
    joinBtnStatus,
    joinBtnLabel,
    onJoinPop,
    onSwapPop,
    onBorrowPop,
    onRedeemPop,
  } = _vaultAccountInfo
  const [assetsRawData, setAssetsRawData] = React.useState<R[]>([])
  const [totalAsset, setTotalAsset] = React.useState<string>(EmptyValueTag)
  const { account } = useAccount()
  const { allowTrade, forexMap } = useSystem()
  const { status: tokenPriceStatus } = useTokenPrices()

  const {
    setShowNoVaultAccount,
    setShowAccount,
    modals: {
      isShowNoVaultAccount: { isShow: showNoVaultAccount, whichBtn, ...btnProps },
    },
  } = useOpenModals()

  const { isMobile, defaultNetwork, hideL2Assets, hideSmallBalances, setHideSmallBalances } =
    useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const btnClickCallbackArray = {
    [fnType.ERROR_NETWORK]: [
      function () {
        store.dispatch(accountReducer.changeShowModel({ _userOnModel: false }))
        store.dispatch(setShowWrongNetworkGuide({ isShow: true }))
      },
    ],
    [fnType.UN_CONNECT]: [
      function (key: VaultAction) {
        setShowNoVaultAccount({ isShow: true, whichBtn: key })
      },
    ],
    [fnType.NO_ACCOUNT]: [
      function (key: VaultAction) {
        setShowNoVaultAccount({ isShow: true, whichBtn: key })
      },
    ],
    [fnType.DEPOSITING]: [
      function (key: VaultAction) {
        setShowNoVaultAccount({ isShow: true, whichBtn: key })
      },
    ],
    [fnType.NOT_ACTIVE]: [
      function (key: VaultAction) {
        setShowNoVaultAccount({ isShow: true, whichBtn: key })
      },
    ],
    [fnType.LOCKED]: [
      function (key: VaultAction) {
        setShowNoVaultAccount({ isShow: true, whichBtn: key })
      },
    ],
    [fnType.ACTIVATED]: [
      (
        accountStatus: sdk.VaultAccountStatus,
        activeInfo: {
          hash: string
          isInActive: true
        },
        key: any,
      ) => {
        if (
          [sdk.VaultAccountStatus.IN_STAKING].includes(accountStatus as any) ||
          activeInfo?.hash
        ) {
          switch (key) {
            case VaultAction.VaultJoin:
              onJoinPop({})
              // setShowVaultJoin({ isShow: true, info: { isActiveAccount: false } })
              break
            case VaultAction.VaultExit:
              onRedeemPop({ isShow: true })
              break
            case VaultAction.VaultLoan:
              // debugger
              onBorrowPop({ isShow: true })
              break
            case VaultAction.VaultSwap:
              onSwapPop({})
              break
          }
        } else {
          setShowNoVaultAccount({ isShow: true, whichBtn: VaultAction.VaultJoin })
        }
      },
      [vaultAccountInfo?.accountStatus, activeInfo?.hash],
    ],
  }
  const onActionBtnClick = (props: string) => {
    accountStaticCallBack(btnClickCallbackArray, [props])
  }

  React.useEffect(() => {
    if (match?.params?.item == VaultKey.VAULT_DASHBOARD) {
      setShowAccount({
        isShow: true,
        step: AccountStep.VaultRedeem_Success,
        info: {
          profit: 10,
          usdValue: 10,
          usdDebt: 10,
          usdEquity: 10,
          forexMap: 10,
          profitPercent: 10,
        },
      })
      if ([sdk.VaultAccountStatus.IN_STAKING].includes(vaultAccountInfo?.accountStatus as any)) {
        setShowNoVaultAccount({
          isShow: false,
          des: '',
          title: '',
        })
      } else if (
        [sdk.VaultAccountStatus.IN_REDEEM].includes(vaultAccountInfo?.accountStatus as any)
      ) {
        setShowNoVaultAccount({
          isShow: true,
          des: 'labelRedeemDesMessage',
          title: 'labelRedeemTitle',
        })
      } else {
        setShowNoVaultAccount({
          isShow: true,
          whichBtn: VaultAction.VaultJoin,
          des: 'labelJoinDesMessage',
          title: 'labelJoinTitle',
        })
      }
    }
  }, [vaultAccountInfo?.accountStatus, match?.params?.item])
  const dialogBtn = React.useMemo(() => {
    switch (account.readyState) {
      case AccountStatus.UN_CONNECT:
      case AccountStatus.LOCKED:
      case AccountStatus.NO_ACCOUNT:
      case AccountStatus.NOT_ACTIVE:
        return <WalletConnectL2Btn />
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
        if (sdk.VaultAccountStatus.IN_REDEEM === vaultAccountInfo?.accountStatus) {
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
            </Box>
          )
        } else if (
          [sdk.VaultAccountStatus.UNDEFINED, sdk.VaultAccountStatus.FREE].includes(
            (vaultAccountInfo?.accountStatus ?? '') as any,
          ) ||
          vaultAccountInfo == undefined ||
          vaultAccountInfo?.accountStatus == undefined
        ) {
          return (
            <Button
              size={'medium'}
              className={'vaultInProcessing'}
              onClick={() => {
                setShowNoVaultAccount({ isShow: false, whichBtn: undefined })
                onJoinPop(true)
              }}
              loading={'false'}
              variant={'contained'}
              fullWidth={true}
              sx={{ minWidth: 'var(--walletconnect-width)' }}
              // @ts-ignore
              loading={(joinBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false') as any}
              disabled={
                joinBtnStatus === TradeBtnStatus.DISABLED ||
                joinBtnStatus === TradeBtnStatus.LOADING
              }
            >
              {joinBtnLabel}
            </Button>
          )
        } else if (
          activeInfo?.hash ||
          (vaultAccountInfo?.accountStatus &&
            sdk.VaultAccountStatus.IN_STAKING !== vaultAccountInfo?.accountStatus)
        ) {
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
              <Typography marginY={3} variant={'body1'} textAlign={'center'}>
                {t('labelVaultAccountWait', {
                  l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                })}
              </Typography>
            </Box>
          )
        } else {
          return (
            <Button
              size={'medium'}
              className={'vaultInProcessing'}
              onClick={() => {
                setShowNoVaultAccount({ isShow: false, whichBtn: undefined })
              }}
              loading={'false'}
              variant={'contained'}
              fullWidth={true}
              sx={{ minWidth: 'var(--walletconnect-width)' }}
            >
              {t('labelVaultCloseBtn')}
            </Button>
          )
        }
        break
      default:
        break
    }
  }, [
    account.readyState,
    account.connectName,
    activeInfo?.hash,
    vaultAccountInfo?.accountStatus,
    isMobile,
    joinBtnStatus,
    joinBtnLabel,
  ])
  const { status: walletL2Status } = useWalletLayer2()
  const getAssetsRawData = () => {
    // debugger
    const {
      // vaultLayer2: { vaultAccountInfo },
      tokenMap: {
        // tokenMap: erc20TokenMap,
        idIndex: erc20IdIndex,
      },
      // tokenPrices: { tokenPrices },
      tokenPrices: { tokenPrices },
      invest: {
        vaultMap: { tokenMap, idIndex: vaultIdIndex },
      },
    } = store.getState()
    const walletMap = makeVaultLayer2({ needFilterZero: true }).vaultLayer2Map ?? {}
    if (
      tokenMap &&
      !!Object.keys(tokenMap).length &&
      !!Object.keys(walletMap ?? {}).length
      // &&
      // !!tokenPriceList.length
    ) {
      let totalAssets = sdk.toBig(0)
      let data: Array<any> = Object.keys(tokenMap ?? {}).reduce((pre, key, _index) => {
        let item: any = undefined
        // tokenInfo
        let tokenInfo = {
          ...tokenMap[key],
          token: key,
          erc20Symbol: erc20IdIndex[tokenMap[key].tokenId],
        }
        if (walletMap && walletMap[key]) {
          tokenInfo = {
            ...tokenInfo,
            detail: walletMap[key],
            erc20Symbol: erc20IdIndex[tokenMap[key].tokenId],
          }
          let tokenValueDollar = sdk.toBig(0)

          const totalAmount = volumeToCountAsBigNumber(
            tokenInfo.erc20Symbol,
            tokenInfo.detail?.detail?.total ?? 0,
          )
          const price = tokenPrices?.[tokenInfo.erc20Symbol] || 0
          if (totalAmount && price) {
            tokenValueDollar = totalAmount?.times(price)
          }
          const isSmallBalance = tokenValueDollar.lt(1)
          item = {
            token: {
              type: TokenType.vault,
              value: tokenInfo.token,
            },
            amount: totalAmount?.toString() || EmptyValueTag,
            available: Number(tokenInfo.detail?.count) || EmptyValueTag,
            smallBalance: isSmallBalance,
            tokenValueDollar: tokenValueDollar.toString(),
            name: tokenInfo.token,
            erc20Symbol: erc20IdIndex[tokenMap[key].tokenId],
          }
        } else {
          item = {
            ...tokenInfo,
            token: {
              type: TokenType.vault,
              value: key,
            },
            amount: EmptyValueTag,
            available: EmptyValueTag,
            locked: 0,
            smallBalance: true,
            tokenValueDollar: 0,
            name: key,
            tokenValueYuan: 0,
            erc20Symbol: erc20IdIndex[tokenMap[key].tokenId],
          }
        }
        if (item) {
          const token = item.token.value
          let precision = tokenMap[item.token.value].precision

          pre.push({
            ...item,
            precision: precision,
          })
          totalAssets = totalAssets.plus(sdk.toBig(item.tokenValueDollar))
        }
        pre?.sort((a, b) => {
          const deltaDollar = b.tokenValueDollar - a.tokenValueDollar
          const deltaAmount = sdk.toBig(b.amount).minus(a.amount).toNumber()
          const deltaName = b.token.value < a.token.value ? 1 : -1
          return deltaDollar !== 0 ? deltaDollar : deltaAmount !== 0 ? deltaAmount : deltaName
        })
        return pre
      }, [] as Array<any>)
      setAssetsRawData(data)
      setTotalAsset(totalAssets.toString())
    } else {
      setAssetsRawData([])
      setTotalAsset(EmptyValueTag)
    }
  }
  const startWorker = _.debounce(getAssetsRawData, globalSetup.wait)
  React.useEffect(() => {
    if (
      showNoVaultAccount === true &&
      vaultAccountInfoStatus === SagaStatus.UNSET &&
      vaultAccountInfo?.accountStatus &&
      tokenPriceStatus === SagaStatus.UNSET &&
      walletL2Status === SagaStatus.UNSET &&
      whichBtn &&
      vaultAccountInfo?.accountStatus === VaultAccountStatus.IN_STAKING
    ) {
      onActionBtnClick(whichBtn)
    }
    // enableBtn()
  }, [
    whichBtn,
    walletL2Status,
    vaultAccountInfo?.accountStatus,
    activeInfo,
    assetsRawData,
    tokenPriceStatus,
  ])
  const walletLayer2Callback = React.useCallback(() => {
    startWorker()
  }, [])
  React.useEffect(() => {
    if (vaultAccountInfoStatus === SagaStatus.UNSET) {
      walletLayer2Callback()
    }
  }, [vaultAccountInfoStatus])
  const onRowClick = React.useCallback(
    ({ row }: { row: R }) => {
      if ([sdk.VaultAccountStatus.IN_STAKING].includes(vaultAccountInfo?.accountStatus ?? '')) {
        onSwapPop({ symbol: row?.token?.value })
      } else {
        setShowNoVaultAccount({ isShow: true, whichBtn: VaultAction.VaultJoin })
      }
    },
    [vaultAccountInfo?.accountStatus],
  )
  myLog('assetsRawData', assetsRawData)
  return {
    btnProps,
    onBtnClose: () => {
      setShowNoVaultAccount({ isShow: false, whichBtn: undefined })
      if ([sdk.VaultAccountStatus.IN_STAKING].includes(vaultAccountInfo?.accountStatus ?? '')) {
      } else if (match.params.item == VaultKey.VAULT_DASHBOARD) {
        history.push(`${RouterPath.vault}/${VaultKey.VAULT_HOME}`)
      }
    },
    forexMap,
    rawData: assetsRawData as R[],
    hideAssets: hideL2Assets,
    allowTrade,
    setHideSmallBalances,
    hideSmallBalances,
    showFilter: true,
    totalAsset,
    showNoVaultAccount,
    whichBtn,
    setShowNoVaultAccount,
    onActionBtnClick,
    dialogBtn,
    actionRow: ({ row }) => {
      return (
        <Button
          onClick={() => {
            onRowClick({ row })
          }}
        >
          {t('labelTrade')}
        </Button>
      )
    },
    onRowClick: (_, row) => {
      onRowClick({ row })
    },
  }
}
