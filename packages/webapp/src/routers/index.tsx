import { Route, Switch, useHistory, useLocation } from 'react-router-dom'
import React from 'react'
import { Box, Container, Link, Snackbar, Typography } from '@mui/material'
import Header from 'layouts/header'
import { QuotePage } from 'pages/QuotePage'
import { SwapPage } from 'pages/SwapPage'
import { Layer2Page } from 'pages/Layer2Page'
import { MiningPage } from 'pages/MiningPage'
import { OrderbookPage } from 'pages/ProTradePage'
import {
  ModalCoinPairPanel,
  ModalGroup,
  ModalRedPacketPanel,
  store,
  useDeposit,
  useNotificationSocket,
  useNotify,
  useOffFaitModal,
  useSystem,
  useTicker,
  useTokenMap,
  useVaultMap,
  NoticePop,
} from '@loopring-web/core'
import { LoadingPage } from '../pages/LoadingPage'
import { LandPage, HomePage, LandBtn } from '../pages/LandPage'
import {
  ErrorMap,
  GUARDIAN_URL,
  MapChainId,
  RouterAllowIndex,
  RouterMainKey,
  RouterPath,
  SagaStatus,
  setMyLog,
  ThemeType,
  VendorProviders,
  WalletSite,
} from '@loopring-web/common-resources'
import { ErrorPage } from '../pages/ErrorPage'
import {
  LoadingBlock,
  NoticePanelSnackBar,
  NoticeSnack,
  useSettings,
  useToggle,
} from '@loopring-web/component-lib'
import { MarkdownPage, NotifyMarkdownPage } from '../pages/MarkdownPage'
import { TradeRacePage } from '../pages/TradeRacePage'
import { NFTPage } from '../pages/NFTPage'
import { useGetAssets } from '../pages/AssetPage/AssetPanel/hook'
import { Footer } from '../layouts/footer'
import { InvestPage } from '../pages/InvestPage'
import { getAnalytics, logEvent } from 'firebase/analytics'
import { AssetPage } from '../pages/AssetPage'
import { FiatPage } from '../pages/FiatPage'
import { RedPacketPage } from '../pages/RedPacketPage'
import { useTranslation } from 'react-i18next'
import { BtradeSwapPage } from '../pages/BtradeSwapPage'
import { StopLimitPage } from '../pages/ProTradePage/stopLimtPage'
import { VaultPage } from '../pages/VaultPage'
const ContentWrap = ({
  children,
  state,
  noContainer = false,
  value,
}: React.PropsWithChildren<any> & {
  state: keyof typeof SagaStatus
  noContainer: boolean
  value: string
}) => {
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  return (
    <>
      <Header isHideOnScroll={false} />
      {state === 'PENDING' ? (
        <LoadingBlock />
      ) : state === 'ERROR' || !RouterAllowIndex[network]?.includes(value) ? (
        <ErrorPage
          {...(!RouterAllowIndex[network]?.includes(value)
            ? ErrorMap.TRADE_404
            : ErrorMap.NO_NETWORK_ERROR)}
        />
      ) : noContainer ? (
        <>{children}</>
      ) : (
        <Container
          maxWidth='lg'
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          <Box display={'flex'} flex={1} alignItems={'stretch'} flexDirection={'row'} marginTop={3}>
            {children}
          </Box>
        </Container>
      )}
    </>
  )
}

const WrapModal = () => {
  const { assetsRawData } = useGetAssets()
  const location = useLocation()
  const { etherscanBaseUrl } = useSystem()
  const { t } = useTranslation()
  const { getUserNotify } = useNotify()

  const { depositProps } = useDeposit(false, { owner: store.getState()?.account?.accAddress })
  const [notificationPush, setNotificationPush] = React.useState({ isShow: false, item: {} })
  const { open, actionEle, handleClose } = useOffFaitModal()

  const notificationCallback = React.useCallback((notification) => {
    if (notification) {
      setNotificationPush({ isShow: true, item: { ...notification } })
      getUserNotify()
    }
  }, [])
  useNotificationSocket({ notificationCallback })

  const noticeSnacksElEs = React.useMemo(() => {
    return [
      <NoticeSnack
        actionEle={actionEle}
        open={open}
        handleClose={handleClose}
        messageInfo={{
          svgIcon: 'BanxaIcon',
          key: VendorProviders.Banxa,
          message: t('labelOrderBanxaIsReadyToPay'),
        }}
      />,
      ,
    ] as any
  }, [open, actionEle, notificationPush])
  return (
    <>
      <ModalCoinPairPanel />
      <ModalRedPacketPanel etherscanBaseUrl={etherscanBaseUrl} />
      <ModalGroup
        assetsRawData={assetsRawData}
        depositProps={depositProps}
        isLayer1Only={/(guardian)|(depositto)/gi.test(location.pathname ?? '')}
      />
      <NoticePanelSnackBar
        noticeSnacksElEs={[
          ...noticeSnacksElEs,
          ...(notificationPush.isShow && notificationPush?.item
            ? [
                <NoticePop
                  {...notificationPush?.item}
                  isShow={notificationPush.isShow}
                  setNotificationPush={setNotificationPush}
                />,
              ]
            : []),
        ]}
      />
    </>
  )
}

const RouterView = ({ state }: { state: keyof typeof SagaStatus }) => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const { tickerMap } = useTicker()
  const { tokenMap: vaultTokenMap } = useVaultMap()

  const { marketArray } = useTokenMap()
  const { setTheme, defaultNetwork, setReferralCode } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]

  const {
    toggle: { BTradeInvest, StopLimit, VaultInvest, isSupperUser },
  } = useToggle()
  const vaultEnabled = VaultInvest.enable || isSupperUser

  React.useEffect(() => {
    if (searchParams.has('theme')) {
      searchParams.get('theme') === ThemeType.dark ? setTheme('dark') : setTheme('light')
    }
    if (searchParams.has('referralcode')) {
      const value = searchParams.get('referralcode')
      setReferralCode(value ? value : '')
    }
  }, [location.search])
  if (searchParams.has('___OhTrustDebugger___')) {
    // @ts-ignore
    setMyLog(true)
  }
  const analytics = getAnalytics()

  logEvent(analytics, 'Route', {
    protocol: window.location.protocol,
    pathname: window.location.pathname,
    query: searchParams,
  })
  React.useEffect(() => {
    if (/^\/?wallet/.test(location.pathname)) {
      window.open(WalletSite, '_self')
      window.opener = null
    }
  }, [location.pathname])
  return (
    <>
      <Switch>
        <Route exact path='/loading'>
          <LoadingPage />
        </Route>
        <Route exact path='/'>
          {searchParams && searchParams.has('noheader') ? (
            <></>
          ) : (
            <Header isHideOnScroll={true} isLandPage  />
            // <Header isHideOnScroll={true} isLandPage />
          )}
          <HomePage />
        </Route>
        <Route exact path='/pro'>
          {searchParams && searchParams.has('noheader') ? <></> : <Header isHideOnScroll={true} />}
          <LandPage />
        </Route>
        <Route path='/document'>
          {searchParams && searchParams.has('noheader') ? (
            <></>
          ) : (
            <Header isHideOnScroll={true} isLandPage />
          )}
          <Container
            maxWidth='lg'
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
            }}
          >
            <MarkdownPage />
          </Container>
        </Route>
        <Route exact path='/notification/:path'>
          {searchParams && searchParams.has('noheader') ? (
            <></>
          ) : (
            <Header isHideOnScroll={true} isLandPage />
          )}
          <Container
            maxWidth='lg'
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
            }}
          >
            <NotifyMarkdownPage />
          </Container>
        </Route>
        <Route exact path={['/document', '/race-event', '/notification', '/investrule']}>
          {searchParams && searchParams.has('noheader') ? <></> : <Header isHideOnScroll={true} />}
          <ErrorPage messageKey={'error404'} />
        </Route>
        <Route exact path={['/race-event/:path']}>
          {searchParams && searchParams.has('noheader') ? <></> : <Header isHideOnScroll={true} />}
          <TradeRacePage />
        </Route>

        <Route path={RouterPath.pro}>
          {searchParams && searchParams.has('noheader') ? <></> : <Header isHideOnScroll={true} />}

          {state === 'PENDING' && tickerMap ? (
            <LoadingBlock />
          ) : RouterAllowIndex[network]?.includes(RouterMainKey.pro) ? (
            <OrderbookPage />
          ) : (
            <ErrorPage {...ErrorMap.TRADE_404} />
          )}
        </Route>
        <Route path={RouterPath.stoplimit}>
          {searchParams && searchParams.has('noheader') ? <></> : <Header isHideOnScroll={true} />}

          {state === 'PENDING' || !marketArray.length || !Object.keys(tickerMap ?? {}).length ? (
            <LoadingBlock />
          ) : RouterAllowIndex[network]?.includes(RouterMainKey.stoplimit) ? (
            <StopLimitPage />
          ) : (
            <ErrorPage {...ErrorMap.TRADE_404} />
          )}
        </Route>
        <Route path={RouterPath.btrade}>
          <ContentWrap state={state} value={RouterMainKey.btrade}>
            <BtradeSwapPage />
          </ContentWrap>
        </Route>
        <Route exact path={[RouterPath.fiat, RouterPath.fiat + '/*']}>
          <ContentWrap state={state} value={RouterMainKey.fiat}>
            <FiatPage />
          </ContentWrap>
        </Route>
        <Route path={[RouterPath.lite, RouterPath.trade]}>
          <ContentWrap state={state} value={RouterMainKey.lite}>
            <SwapPage />
          </ContentWrap>
        </Route>
        <Route exact path={RouterPath.markets}>
          <ContentWrap state={state} value={RouterMainKey.markets}>
            <QuotePage />
          </ContentWrap>
        </Route>
        <Route exact path={RouterPath.mining}>
          <ContentWrap state={state} value={RouterMainKey.mining}>
            <MiningPage />
          </ContentWrap>
        </Route>
        <Route exact path={[RouterPath.redPacket, RouterPath.redPacket + '/*']}>
          <ContentWrap state={state} value={RouterMainKey.redPacket}>
            <RedPacketPage />
          </ContentWrap>
        </Route>
        <Route exact path={[RouterPath.l2assets, RouterPath.l2assets + '/*']}>
          <ContentWrap state={state} value={RouterMainKey.l2assets}>
            <AssetPage />
          </ContentWrap>
        </Route>
        <Route exact path={[RouterPath.layer2, RouterPath.layer2 + '/*']}>
          <ContentWrap state={state} noContainer={true} value={RouterMainKey.layer2}>
            <Layer2Page />
          </ContentWrap>
        </Route>

        <Route exact path={[RouterPath.vault, RouterPath.vault + '/*']}>
          <ContentWrap state={state} noContainer={true} value={RouterMainKey.layer2}>
            {state === 'PENDING' && tickerMap ? (
              <LoadingBlock />
            ) : vaultEnabled && RouterAllowIndex[network]?.includes(RouterMainKey.vault) ? (
              <VaultPage />
            ) : (
              <ErrorPage {...ErrorMap.TRADE_404} />
            )}
          </ContentWrap>
        </Route>
        <Route exact path={[RouterPath.nft, RouterPath.nft + '/*']}>
          <ContentWrap state={state} value={RouterMainKey.nft}>
            <NFTPage />
          </ContentWrap>
        </Route>
        <Route exact path={[RouterPath.invest, RouterPath.invest + '/*']}>
          <ContentWrap noContainer state={state} value={RouterMainKey.invest}>
            <InvestPage />
          </ContentWrap>
        </Route>

        <Route
          path={['/guardian', '/guardian/*']}
          component={() => (
            <>
              <Header isHideOnScroll={true} isLandPage />
              <ErrorPage
                {...ErrorMap.GUARDIAN_ROUTER_ERROR}
                components={{
                  a: <Link target='_blank' rel='noopener noreferrer' href={GUARDIAN_URL} />,
                }}
              />
            </>
          )}
        />
        <Route
          path={['/error/:messageKey', '/error']}
          component={() => (
            <>
              <Header isHideOnScroll={true} isLandPage />
              <ErrorPage {...ErrorMap.NO_NETWORK_ERROR} />
            </>
          )}
        />
        <Route
          component={() => (
            <>
              <Header isHideOnScroll={true} isLandPage />
              <ErrorPage messageKey={'error404'} />
            </>
          )}
        />
      </Switch>
      {state === SagaStatus.DONE && <WrapModal />}
      {searchParams && searchParams.has('nofooter') ? <></> : <Footer />}
    </>
  )
}

export default RouterView
