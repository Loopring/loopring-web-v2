import { TFunction, withTranslation, WithTranslation } from 'react-i18next'
import React from 'react'

import {
  AccountStatus,
  EmptyValueTag,
  fnType,
  getValuePrecisionThousand,
  i18n,
  L1L2_NAME_DEFINED,
  LockIcon,
  MapChainId,
  MarketType,
  myLog,
  SagaStatus,
  SoursURL,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import { Avatar, Box, Divider, Typography } from '@mui/material'
import {
  AccountStep,
  AvatarCoin,
  Button,
  useOpenModals,
  useSettings,
} from '@loopring-web/component-lib'
import _ from 'lodash'
import {
  accountStaticCallBack,
  btnClickMap,
  btnLabel,
  useAccount,
  usePageTradePro,
  useTokenMap,
  ViewAccountTemplate,
  volumeToCount,
  volumeToCountAsBigNumber,
} from '@loopring-web/core'

import { HeaderHeight } from '../../index'
import * as sdk from '@loopring-web/loopring-sdk'

// const OtherView = React.memo(({ t }: { market: MarketType; t: TFunction }) => {
//   const { status: accountStatus, account } = useAccount()
//   const [label, setLabel] = React.useState('')
//   const { defaultNetwork } = useSettings()
//   const network = MapChainId[defaultNetwork] ?? MapChainId[1]
//   const _btnLabel = Object.assign(_.cloneDeep(btnLabel), {
//     [fnType.NO_ACCOUNT]: [
//       function () {
//         return `depositAndActiveBtn`
//       },
//     ],
//     [fnType.ERROR_NETWORK]: [
//       function () {
//         return `labelWrongNetwork`
//       },
//     ],
//   })
//
//   React.useEffect(() => {
//     if (accountStatus === SagaStatus.UNSET) {
//       setLabel(accountStaticCallBack(_btnLabel))
//     }
//   }, [accountStatus, account.readyState, i18n.language])
//   const _btnClickMap = Object.assign(_.cloneDeep(btnClickMap), {})
//   const BtnConnect = React.useMemo(() => {
//     return (
//       <Button
//         style={{ height: 28, fontSize: '1.4rem' }}
//         variant={'contained'}
//         size={'small'}
//         color={'primary'}
//         onClick={() => {
//           accountStaticCallBack(_btnClickMap, [])
//         }}
//       >
//         {t(label, {
//           loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
//           l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
//           l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
//           ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
//         })}
//       </Button>
//     )
//   }, [label])
//   const viewTemplate = React.useMemo(() => {
//     switch (account.readyState) {
//       case AccountStatus.UN_CONNECT:
//         return (
//           <Box
//             flex={1}
//             height={'100%'}
//             display={'flex'}
//             justifyContent={'center'}
//             alignItems={'center'}
//             flexDirection={'column'}
//           >
//             <Typography
//               lineHeight={1.5}
//               paddingX={2}
//               color={'text.primary'}
//               marginBottom={2}
//               variant={'body1'}
//               textOverflow={'ellipsis'}
//               whiteSpace={'pre-line'}
//               textAlign={'center'}
//               overflow={'hidden'}
//               display={'flex'}
//               sx={{ wordBreak: 'break-word', lineClamp: 4 }}
//             >
//               {t('describeTitleConnectToWallet', {
//                 layer2: L1L2_NAME_DEFINED[network].layer2,
//                 l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
//               })}
//             </Typography>
//             {BtnConnect}
//           </Box>
//         )
//
//         break
//       case AccountStatus.LOCKED:
//         return (
//           <Box
//             flex={1}
//             height={'100%'}
//             display={'flex'}
//             justifyContent={'center'}
//             alignItems={'center'}
//             flexDirection={'column'}
//           >
//             <Typography
//               lineHeight={2}
//               paddingX={2}
//               color={'text.primary'}
//               marginBottom={2}
//               variant={'body1'}
//               whiteSpace={'pre-line'}
//               textAlign={'center'}
//             >
//               {t('describeTitleLocked')}
//             </Typography>
//             {BtnConnect}
//           </Box>
//         )
//         break
//       case AccountStatus.NO_ACCOUNT:
//         return (
//           <Box
//             flex={1}
//             height={'100%'}
//             display={'flex'}
//             justifyContent={'center'}
//             alignItems={'center'}
//             flexDirection={'column'}
//           >
//             <Typography
//               lineHeight={2}
//               paddingX={2}
//               color={'text.primary'}
//               marginBottom={2}
//               variant={'body1'}
//               whiteSpace={'pre-line'}
//               textAlign={'center'}
//             >
//               {t('describeTitleNoAccount', {
//                 layer2: L1L2_NAME_DEFINED[network].layer2,
//                 l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
//               })}
//             </Typography>
//             {BtnConnect}
//           </Box>
//         )
//         break
//       case AccountStatus.NOT_ACTIVE:
//         return (
//           <Box
//             flex={1}
//             height={'100%'}
//             display={'flex'}
//             justifyContent={'center'}
//             alignItems={'center'}
//             flexDirection={'column'}
//           >
//             <Typography
//               lineHeight={2}
//               paddingX={2}
//               color={'text.primary'}
//               marginBottom={2}
//               variant={'body1'}
//               whiteSpace={'pre-line'}
//               textAlign={'center'}
//             >
//               {t('describeTitleNotActive', {
//                 layer2: L1L2_NAME_DEFINED[network].layer2,
//                 l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
//               })}
//             </Typography>
//             {BtnConnect}
//           </Box>
//         )
//         break
//       case AccountStatus.DEPOSITING:
//         return (
//           <Box
//             flex={1}
//             height={'100%'}
//             display={'flex'}
//             justifyContent={'center'}
//             alignItems={'center'}
//             flexDirection={'column'}
//           >
//             <Typography
//               lineHeight={2}
//               paddingX={2}
//               color={'text.primary'}
//               marginBottom={2}
//               variant={'body1'}
//               whiteSpace={'pre-line'}
//               textAlign={'center'}
//             >
//               {t('describeTitleOpenAccounting', {
//                 layer2: L1L2_NAME_DEFINED[network].layer2,
//                 l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
//               })}
//             </Typography>
//             {BtnConnect}
//           </Box>
//         )
//         break
//       case AccountStatus.ERROR_NETWORK:
//         return (
//           <Box
//             flex={1}
//             height={'100%'}
//             display={'flex'}
//             justifyContent={'center'}
//             alignItems={'center'}
//             flexDirection={'column'}
//           >
//             <Typography
//               lineHeight={2}
//               paddingX={2}
//               color={'text.primary'}
//               marginBottom={2}
//               variant={'body1'}
//               whiteSpace={'pre-line'}
//               textAlign={'center'}
//             >
//               {t('describeTitleOnErrorNetwork', {
//                 connectName: account.connectName,
//               })}
//             </Typography>
//           </Box>
//         )
//         break
//       default:
//         break
//     }
//   }, [t, account.readyState, BtnConnect])
//
//   return <>{viewTemplate}</>
//
//   // const swapBtnClickArray = Object.assign(_.cloneDeep(btnClickMap), {
//   //     [ fnType.ACTIVATED ]: [swapCalculatorCallback]
//   // })
// })
const AssetsValue = React.memo(({ symbol }: { symbol: string }) => {
  const {
    pageTradePro: {
      tradeCalcProData: { walletMap },
    },
  } = usePageTradePro()
  const { tokenMap } = useTokenMap()
  if (walletMap && walletMap[symbol]?.detail) {
    const total = getValuePrecisionThousand(
      volumeToCountAsBigNumber(symbol, sdk.toBig(walletMap[symbol].detail.total ?? 0)),
      undefined,
      undefined,
      tokenMap[symbol].precision,
      false,
      { floor: true, isFait: true },
    )

    const locked = Number(walletMap[symbol].detail.locked)
      ? volumeToCount(symbol, walletMap[symbol].detail.locked)
      : 0

    return (
      <Box display={'flex'} flexDirection={'column'} alignItems={'flex-end'}>
        <Typography variant={'body1'} color={'text.primary'}>
          {total}
        </Typography>
        {locked ? (
          <Typography
            variant={'body2'}
            color={'text.secondary'}
            display={'inline-flex'}
            marginTop={1 / 2}
          >
            <LockIcon fontSize={'small'} /> : {locked}
          </Typography>
        ) : (
          EmptyValueTag
        )}
      </Box>
    )
  } else {
    return <Box>{EmptyValueTag}</Box>
  }
})
const UnLookView = React.memo(
  ({
    t,
    market,
    assetBtnStatus,
  }: {
    assetBtnStatus: TradeBtnStatus
    market: MarketType
    t: TFunction
  }) => {
    // const {pageTradePro: {tradeCalcProData}} = usePageTradePro();
    //@ts-ignore
    const [, coinA, coinB] = market.match(/(\w+)-(\w+)/i)
    const { coinJson } = useSettings()
    const tokenAIcon: any = coinJson[coinA]
    const tokenBIcon: any = coinJson[coinB]
    const { setShowAccount } = useOpenModals()

    return (
      <Box paddingBottom={2}>
        <Typography
          height={HeaderHeight}
          lineHeight={`${HeaderHeight}px`}
          paddingX={2}
          variant={'body1'}
          component={'h4'}
        >
          {t('labelAssetsTitle')}
        </Typography>
        <Divider />
        <Box paddingX={2} display={'flex'} flex={1} flexDirection={'column'} justifyContent={''}>
          <Box
            height={44}
            marginTop={1}
            display={'flex'}
            flexDirection={'row'}
            alignItems={'center'}
            justifyContent={'space-between'}
          >
            <Box
              component={'span'}
              display={'flex'}
              flexDirection={'row'}
              alignItems={'center'}
              className={'logo-icon'}
              height={'var(--withdraw-coin-size)'}
              justifyContent={'flex-start'}
              marginRight={1 / 2}
            >
              {tokenAIcon ? (
                <AvatarCoin
                  imgx={tokenAIcon.x}
                  imgy={tokenAIcon.y}
                  imgheight={tokenAIcon.h}
                  imgwidth={tokenAIcon.w}
                  size={16}
                  variant='circular'
                  style={{ marginLeft: '-8px' }}
                  alt={coinA}
                  src={
                    'data:image/svg+xml;utf8,' +
                    '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                  }
                />
              ) : (
                <Avatar
                  variant='circular'
                  alt={coinA}
                  style={{
                    width: 'var(--withdraw-coin-size)',
                    height: 'var(--withdraw-coin-size)',
                  }}
                  src={SoursURL + 'images/icon-default.png'}
                />
              )}
              <Typography variant={'body1'}>{coinA}</Typography>
            </Box>
            <AssetsValue symbol={coinA} />
          </Box>
          <Box
            height={44}
            marginTop={1}
            display={'flex'}
            flexDirection={'row'}
            alignItems={'center'}
            justifyContent={'space-between'}
          >
            <Box
              component={'span'}
              display={'flex'}
              flexDirection={'row'}
              alignItems={'center'}
              className={'logo-icon'}
              height={'var(--withdraw-coin-size)'}
              justifyContent={'flex-start'}
              marginRight={1 / 2}
            >
              {tokenBIcon ? (
                <AvatarCoin
                  imgx={tokenBIcon.x}
                  imgy={tokenBIcon.y}
                  imgheight={tokenBIcon.h}
                  imgwidth={tokenBIcon.w}
                  size={16}
                  variant='circular'
                  style={{ marginLeft: '-8px' }}
                  alt={coinB}
                  src={
                    'data:image/svg+xml;utf8,' +
                    '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                  }
                />
              ) : (
                <Avatar
                  variant='circular'
                  alt={coinB}
                  style={{
                    width: 'var(--withdraw-coin-size)',
                    height: 'var(--withdraw-coin-size)',
                  }}
                  src={SoursURL + 'images/icon-default.png'}
                />
              )}
              <Typography variant={'body1'}>{coinB}</Typography>
            </Box>
            <AssetsValue symbol={coinB} />
          </Box>
          <Box
            display={'flex'}
            flexDirection={'row'}
            alignItems={'center'}
            marginTop={2}
            justifyContent={'center'}
          >
            <Box marginRight={1}>
              <Button
                style={{ height: 28, fontSize: '1.4rem' }}
                variant={'contained'}
                size={'small'}
                color={'primary'}
                disabled={assetBtnStatus === TradeBtnStatus.LOADING}
                onClick={() =>
                  setShowAccount({
                    isShow: true,
                    step: AccountStep.AddAssetGateway,
                    // info: { symbol: coinA },
                  })
                }
              >
                {t('labelAddAssetBtn')}
              </Button>
            </Box>
            <Box marginLeft={1}>
              <Button
                style={{ height: 28, fontSize: '1.4rem' }}
                variant={'outlined'}
                size={'small'}
                disabled={assetBtnStatus === TradeBtnStatus.LOADING}
                onClick={() =>
                  setShowAccount({
                    isShow: true,
                    step: AccountStep.SendAssetGateway,
                    // info: { symbol: coinA },
                  })
                }
              >
                {t('labelSendAssetBtn')}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    )
  },
)

export const WalletInfo = withTranslation(['common', 'layout'])(
  (
    props: {
      assetBtnStatus: TradeBtnStatus
      market: MarketType
    } & WithTranslation,
  ) => {
    return (
      <Box
        paddingX={2}
        flex={1}
        display={'flex'}
        justifyContent={'stretch'}
        flexDirection={'column'}
        alignItems={'center'}
      >
        <ViewAccountTemplate
          className={'inBlock'}
          size={'medium'}
          activeViewTemplate={<UnLookView {...props} />}
        />
      </Box>
    )
  },
)
