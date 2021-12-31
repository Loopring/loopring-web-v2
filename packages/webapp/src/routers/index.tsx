import { Redirect, Route, Switch, useLocation } from "react-router-dom";
import React from "react";
import { Box, Container } from "@mui/material";
import Header from "layouts/header";
import { ModalGroup } from "../modal";
import { LAYOUT } from "../defs/common_defs";
import { QuotePage } from "pages/QuotePage";
import { SwapPage } from "pages/SwapPage";
import { Layer2Page } from "pages/Layer2Page";
import { LiquidityPage } from "pages/LiquidityPage";
import { MiningPage } from "pages/MiningPage";
import { OrderbookPage } from "pages/ProTradePage";
import { useTicker } from "../stores/ticker";
import { LoadingBlock, LoadingPage } from "../pages/LoadingPage";
import { LandPage, WalletPage } from "../pages/LandPage";
import {
  ErrorMap,
  SagaStatus,
  ThemeType,
} from "@loopring-web/common-resources";
import { ErrorPage } from "../pages/ErrorPage";
import { Footer, useSettings } from "@loopring-web/component-lib";
import { ReportPage } from "pages/ReportPage";
import { MarkdownPage, NotifyMarkdownPage } from "../pages/MarkdownPage";
import { TradeRacePage } from "../pages/TradeRacePage";
import { HebaoPage } from "../pages/hebaoPage";

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

const RouterView = ({ state }: { state: keyof typeof SagaStatus }) => {
  const proFlag =
    process.env.REACT_APP_WITH_PRO && process.env.REACT_APP_WITH_PRO === "true";
  const { tickerMap } = useTicker();
  const { setTheme } = useSettings();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  React.useEffect(() => {
    if (query.has("theme")) {
      query.get("theme") === ThemeType.dark
        ? setTheme("dark")
        : setTheme("light");
    }
  }, [location.search]);
  React.useEffect(() => {
    if (state === SagaStatus.ERROR) {
      window.location.replace(`${window.location.origin}/error`);
    }
  }, [state]);
  return (
    <>
      <Switch>
        <Route exact path="/wallet">
          {query && query.has("noheader") ? (
            <></>
          ) : (
            <Header isHideOnScroll={true} isLandPage />
          )}
          <WalletPage />
        </Route>
        <Route exact path="/loading">
          <LoadingPage />
        </Route>
        <Route path={["/hebao", "/hebao/*"]}>
          {query && query.has("noheader") ? (
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
              marginTop={3}
            >
              <HebaoPage />
            </Box>
          </Container>
        </Route>
        <Route exact path="/">
          {query && query.has("noheader") ? (
            <></>
          ) : (
            <Header isHideOnScroll={true} isLandPage />
          )}
          <LandPage />
        </Route>
        <Route exact path="/report">
          <Redirect to="/newticket" />
        </Route>
        <Route exact path="/newticket">
          {query && query.has("noheader") ? (
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
            <ReportPage />
          </Container>
        </Route>
        <Route exact path="/document/:path">
          {query && query.has("noheader") ? (
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
          {query && query.has("noheader") ? (
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

        <Route exact path={["/document", "/race-event", "/notification"]}>
          {query && query.has("noheader") ? (
            <></>
          ) : (
            <Header isHideOnScroll={true} />
          )}
          <ErrorPage messageKey={"error404"} />
        </Route>
        <Route exact path={["/race-event/:path"]}>
          {query && query.has("noheader") ? (
            <></>
          ) : (
            <Header isHideOnScroll={true} />
          )}
          <TradeRacePage />
        </Route>

        <Route path="/trade/pro">
          {query && query.has("noheader") ? (
            <></>
          ) : (
            <Header isHideOnScroll={true} />
          )}

          {state === "PENDING" && proFlag && tickerMap ? (
            <LoadingBlock />
          ) : (
            <OrderbookPage />
          )}
        </Route>
        <Route path="/trade/lite">
          <ContentWrap state={state}>
            <SwapPage />
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
        <Route exact path={["/layer2", "/layer2/*"]}>
          <ContentWrap state={state}>
            <Layer2Page />
          </ContentWrap>
        </Route>
        <Route exact path="/liquidity">
          <ContentWrap state={state}>
            <LiquidityPage />
          </ContentWrap>
        </Route>
        <Route exact path="/liquidity/pools/*">
          <ContentWrap state={state}>
            <LiquidityPage />
          </ContentWrap>
        </Route>
        <Route exact path="/liquidity/pools">
          <ContentWrap state={state}>
            <LiquidityPage />
          </ContentWrap>
        </Route>
        <Route exact path="/liquidity/amm-mining">
          <ContentWrap state={state}>
            <LiquidityPage />
          </ContentWrap>
        </Route>
        <Route exact path="/liquidity/my-liquidity">
          <ContentWrap state={state}>
            <LiquidityPage />
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
      <ModalGroup />
      {query && query.has("nofooter") ? <></> : <Footer />}
    </>
  );
};

export default RouterView;
