import { Route, Switch, useLocation } from "react-router-dom";
import React from "react";
import { Box, Container } from "@mui/material";
import Header from "layouts/header";
import { QuotePage } from "pages/QuotePage";
import { SwapPage } from "pages/SwapPage";
import { Layer2Page } from "pages/Layer2Page";
import { MiningPage } from "pages/MiningPage";
import { OrderbookPage } from "pages/ProTradePage";
import { useTicker, ModalGroup, useDeposit } from "@loopring-web/core";
import { LoadingPage } from "../pages/LoadingPage";
import { LandPage, WalletPage } from "../pages/LandPage";
import {
  ErrorMap,
  hexToRGB,
  SagaStatus,
  setMyLog,
  ThemeType,
} from "@loopring-web/common-resources";
import { ErrorPage } from "../pages/ErrorPage";
import {
  useOpenModals,
  useSettings,
  LoadingBlock,
} from "@loopring-web/component-lib";
import {
  InvestMarkdownPage,
  MarkdownPage,
  NotifyMarkdownPage,
} from "../pages/MarkdownPage";
import { TradeRacePage } from "../pages/TradeRacePage";
import { GuardianPage } from "../pages/WalletPage";
import { NFTPage } from "../pages/NFTPage";
import { useGetAssets } from "../pages/AssetPage/AssetPanel/hook";
import { Footer } from "../layouts/footer";
import { InvestPage } from "../pages/InvestPage";
import { getAnalytics, logEvent } from "firebase/analytics";
import { AssetPage } from "../pages/AssetPage";
import { FiatPage } from "../pages/FiatPage";

const ContentWrap = ({
  children,
  state,
}: React.PropsWithChildren<any> & { state: keyof typeof SagaStatus }) => {
  return (
    <>
      <Header isHideOnScroll={false} />
      {state === "PENDING" ? (
        <LoadingBlock />
      ) : state === "ERROR" ? (
        <ErrorPage {...ErrorMap.NO_NETWORK_ERROR} />
      ) : (
        <Container
          maxWidth="lg"
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          <Box
            display={"flex"}
            flex={1}
            alignItems={"stretch"}
            flexDirection={"row"}
            marginTop={3}
          >
            {children}
          </Box>
        </Container>
      )}
    </>
  );
};
const WrapModal = () => {
  const { depositProps } = useDeposit(false);
  const { assetsRawData } = useGetAssets();
  const location = useLocation();
  const { setShowAccount } = useOpenModals();
  return (
    <ModalGroup
      assetsRawData={assetsRawData}
      depositProps={depositProps}
      isLayer1Only={
        /(guardian)|(depositto)/gi.test(location.pathname ?? "") ? true : false
      }
    />
  );
};

const RouterView = ({ state }: { state: keyof typeof SagaStatus }) => {
  const location = useLocation();

  const proFlag =
    process.env.REACT_APP_WITH_PRO && process.env.REACT_APP_WITH_PRO === "true";
  const { tickerMap } = useTicker();
  const { setTheme } = useSettings();

  // const { pathname } = useLocation();
  const searchParams = new URLSearchParams(location.search);
  React.useEffect(() => {
    if (searchParams.has("theme")) {
      searchParams.get("theme") === ThemeType.dark
        ? setTheme("dark")
        : setTheme("light");
    }
  }, [location.search]);

  React.useEffect(() => {
    if (state === SagaStatus.ERROR) {
      window.location.replace(`${window.location.origin}/error`);
    }
  }, [state]);
  if (searchParams.has("___OhTrustDebugger___")) {
    // @ts-ignore
    setMyLog(true);
  }
  const analytics = getAnalytics();

  logEvent(analytics, "Route", {
    protocol: window.location.protocol,
    pathname: window.location.pathname,
    query: searchParams,
  });

  return (
    <>
      <Switch>
        <Route exact path="/wallet">
          {searchParams && searchParams.has("noheader") ? (
            <></>
          ) : (
            <Header isHideOnScroll={true} isLandPage />
          )}
          <WalletPage />
        </Route>

        <Route exact path="/loading">
          <LoadingPage />
        </Route>
        <Route path={["/guardian", "/guardian/*"]}>
          {searchParams && searchParams.has("noheader") ? (
            <></>
          ) : (
            <Header isHideOnScroll={false} />
          )}
          <Container
            maxWidth="lg"
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            <Box
              display={"flex"}
              flex={1}
              alignItems={"stretch"}
              flexDirection={"row"}
              justifyContent={"center"}
              marginTop={3}
            >
              <GuardianPage />
            </Box>
          </Container>
        </Route>
        <Route exact path="/">
          {searchParams && searchParams.has("noheader") ? (
            <></>
          ) : (
            <Header isHideOnScroll={true} isLandPage />
          )}
          <LandPage />
        </Route>
        <Route exact path="/document/:path">
          {searchParams && searchParams.has("noheader") ? (
            <></>
          ) : (
            <Header isHideOnScroll={true} isLandPage />
          )}
          <Container
            maxWidth="lg"
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            <MarkdownPage />
          </Container>
        </Route>
        <Route exact path="/notification/:path">
          {searchParams && searchParams.has("noheader") ? (
            <></>
          ) : (
            <Header isHideOnScroll={true} isLandPage />
          )}
          <Container
            maxWidth="lg"
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            <NotifyMarkdownPage />
          </Container>
        </Route>

        <Route exact path="/investrule/:path">
          {searchParams && searchParams.has("noheader") ? (
            <></>
          ) : (
            <Header isHideOnScroll={true} isLandPage />
          )}
          <Container
            maxWidth="lg"
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            <InvestMarkdownPage />
          </Container>
        </Route>

        <Route
          exact
          path={["/document", "/race-event", "/notification", "/investrule"]}
        >
          {searchParams && searchParams.has("noheader") ? (
            <></>
          ) : (
            <Header isHideOnScroll={true} />
          )}
          <ErrorPage messageKey={"error404"} />
        </Route>
        <Route exact path={["/race-event/:path"]}>
          {searchParams && searchParams.has("noheader") ? (
            <></>
          ) : (
            <Header isHideOnScroll={true} />
          )}
          <TradeRacePage />
        </Route>

        <Route path="/trade/pro">
          {searchParams && searchParams.has("noheader") ? (
            <></>
          ) : (
            <Header isHideOnScroll={true} />
          )}

          {state === "PENDING" && proFlag && tickerMap ? (
            <LoadingBlock />
          ) : (
            <Box display={"flex"} flexDirection={"column"} flex={1}>
              <OrderbookPage />
            </Box>
          )}
        </Route>
        <Route path="/trade/lite">
          <ContentWrap state={state}>
            <SwapPage />
          </ContentWrap>
        </Route>
        <Route exact path={["/trade/fiat", "/trade/fiat/*"]}>
          <ContentWrap state={state}>
            <FiatPage />
          </ContentWrap>
        </Route>
        <Route exact path="/markets">
          <ContentWrap state={state}>
            <QuotePage />
          </ContentWrap>
        </Route>
        <Route exact path="/mining">
          <ContentWrap state={state}>
            <MiningPage />
          </ContentWrap>
        </Route>

        <Route exact path={["/l2assets", "/l2assets/*"]}>
          <ContentWrap state={state}>
            <AssetPage />
          </ContentWrap>
        </Route>
        <Route exact path={["/layer2", "/layer2/*"]}>
          <ContentWrap state={state}>
            <Layer2Page />
          </ContentWrap>
        </Route>
        <Route exact path={["/nft", "/nft/*"]}>
          <ContentWrap state={state}>
            <NFTPage />
          </ContentWrap>
        </Route>
        <Route exact path={["/invest", "/invest/*"]}>
          <ContentWrap state={state}>
            <InvestPage />
          </ContentWrap>
        </Route>
        <Route
          path={["/error/:messageKey", "/error"]}
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
              <ErrorPage messageKey={"error404"} />
            </>
          )}
        />
      </Switch>
      {state === SagaStatus.DONE && <WrapModal />}
      {searchParams && searchParams.has("nofooter") ? <></> : <Footer />}
    </>
  );
};

export default RouterView;
