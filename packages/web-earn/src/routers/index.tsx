import { Redirect, Route, Switch, useLocation } from 'react-router-dom'
import React from 'react'
import { Box, Container, Link } from '@mui/material'
import Header from 'layouts/header'
import {
  ModalCoinPairPanel,
  ModalGroup,
  ModalRedPacketPanel,
  store,
  useDeposit,
  useOffFaitModal,
  useSystem,
  useTicker,
  useTokenMap,
} from '@loopring-web/core'
import { LoadingPage } from '../pages/LoadingPage'
import {
  ErrorMap,
  GUARDIAN_URL,
  MapChainId,
  // RouterAllowIndex,
  // RouterMainKey,
  // RouterPath,
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
  VaultPage,
} from '@loopring-web/component-lib'
import { InvestMarkdownPage, MarkdownPage, NotifyMarkdownPage } from '../pages/MarkdownPage'
import { TradeRacePage } from '../pages/TradeRacePage'
import { useGetAssets } from '../pages/AssetPage/AssetPanel/hook'
import { Footer } from '../layouts/footer'
import { InvestPage } from '../pages/InvestPage'
import { getAnalytics, logEvent } from 'firebase/analytics'
import { AssetPage } from '../pages/AssetPage'
import { useTranslation } from 'react-i18next'
import { EarnPage } from '../pages/EarnPage'
import { RouterAllowIndex, RouterMainKey, RouterPath } from '../constant/router'
import { Layer2Page } from '../pages/Layer2Page'
import { BtradeSwapPage } from '../pages/BtradeSwapPage'
import { TaikoLockBannerPage, TaikoLockPage } from 'pages/TaikoLockPage'

// RouterAllowIndex
const ContentWrap = ({
  children,
  state,
  noContainer = false,
  value,
  noPending
}: React.PropsWithChildren<any> & {
  state: keyof typeof SagaStatus
  noContainer: boolean
  noPending?: boolean
  value: string
}) => {
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  return (
    <>
      <Header isHideOnScroll={false} />
      {state === 'PENDING' && !noPending ? (
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
  const { depositProps } = useDeposit(false, { owner: store.getState()?.account?.accAddress })

  const { open, actionEle, handleClose } = useOffFaitModal()

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
    ] as any
  }, [open, actionEle])
  return (
    <>
      <ModalCoinPairPanel />
      <ModalRedPacketPanel etherscanBaseUrl={etherscanBaseUrl} />
      <ModalGroup
        assetsRawData={assetsRawData}
        depositProps={depositProps}
        isLayer1Only={/(guardian)|(depositto)/gi.test(location.pathname ?? '')}
        hideDepositWithdrawBack
        isWebEarn
      />
      <NoticePanelSnackBar noticeSnacksElEs={noticeSnacksElEs} />
    </>
  )
}

const RouterView = ({ state }: { state: keyof typeof SagaStatus }) => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const { tickerMap } = useTicker()
  const { marketArray } = useTokenMap()
  const { setTheme, defaultNetwork, setReferralCode } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]

  const {
    toggle: { BTradeInvest, StopLimit },
  } = useToggle()

  React.useEffect(() => {
    if (searchParams.has('theme')) {
      searchParams.get('theme') === ThemeType.dark ? setTheme('dark') : setTheme('light')
    }
    if (searchParams.has('referralcode')) {
      const value = searchParams.get('referralcode')
      setReferralCode(value ? value : '')
    }
  }, [location.search])

  React.useEffect(() => {
    if (state === SagaStatus.ERROR) {
      window.location.replace(`${window.location.origin}/error`)
    }
  }, [state])
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
        <Route exact path={'/'} children={ <Redirect to={RouterPath.l2assets} /> }/>
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
        <Route exact path='/investrule/:path'>
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
            <InvestMarkdownPage />
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

        <Route path={RouterPath.btrade}>
          <ContentWrap state={state} value={RouterMainKey.btrade}>
            <BtradeSwapPage />
          </ContentWrap>
        </Route>

        {/* <Route path={RouterPath.pro}>
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
        <Route path={RouterPath.lite}>
          <ContentWrap state={state} value={RouterMainKey.lite}>
            <SwapPage />
          </ContentWrap>
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
        </Route> */}
        {/* <Redirect */}
        {/* <Redirect to={RouterPath.dualIntro} exact path={'/'} /> */}
          {/* <ContentWrap state={state} value={RouterMainKey.dualIntro}>
            <EarnPage />
          </ContentWrap>
        </Redirect> */}
        

        <Route exact path={RouterPath.dualIntro}>
          <ContentWrap state={state} value={RouterMainKey.dualIntro}>
            <EarnPage />
          </ContentWrap>
        </Route>
        <Route exact path={[RouterPath.portal, RouterPath.portal + '/*']}>
          <ContentWrap state={state} noContainer value={RouterMainKey.portal}>
            <VaultPage />
          </ContentWrap>
        </Route>
        
        <Route path={[RouterPath.layer2, RouterPath.layer2 + '/*']}>
          <ContentWrap state={state} noContainer={true} value={RouterMainKey.layer2}>
            <Layer2Page />
          </ContentWrap>
        </Route>
        <Route exact path={[RouterPath.l2assets, RouterPath.l2assets + '/*']}>
          <ContentWrap noContainer state={state} value={RouterMainKey.l2assets}>
            <AssetPage />
          </ContentWrap>
        </Route>
        <Route exact path={[RouterPath.invest, RouterPath.invest + '/*']}>
          <ContentWrap noContainer state={state} value={RouterMainKey.invest}>
            <InvestPage />
          </ContentWrap>
        </Route>
        <Route exact path={[RouterPath.taikoFarming ]}>
          <ContentWrap noContainer state={state} value={RouterMainKey.taikoFarming}>
            <TaikoLockPage symbol='TAIKO' setConfirmedLRCStakeInvestInvest={() => {}} />
          </ContentWrap>
        </Route>
        <Route exact path={`${RouterPath.taikoFarming}/banner`}>
          <ContentWrap noContainer state={state} value={RouterMainKey.taikoFarming}>
            <TaikoLockBannerPage />
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
