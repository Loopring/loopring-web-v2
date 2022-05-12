import { Route, Switch, useLocation } from "react-router-dom";
import React from "react";
import { Box, Container } from "@mui/material";
import { ModalGroup } from "@loopring-web/core";
import { LoadingPage } from "../pages/LoadingPage";
import {
  SagaStatus,
  setMyLog,
  ThemeType,
} from "@loopring-web/common-resources";
import { ErrorPage } from "../pages/ErrorPage";
import { useOpenModals, useSettings } from "@loopring-web/component-lib";

import { DepositToPage } from "../pages/DepositPage";
import { Footer } from "../layouts/footer";

const RouterView = ({ state }: { state: keyof typeof SagaStatus }) => {
  const location = useLocation();
  const proFlag =
    process.env.REACT_APP_WITH_PRO && process.env.REACT_APP_WITH_PRO === "true";
  const { setTheme } = useSettings();
  const { setShowAccount } = useOpenModals();
  // const { assetsRawData } = useGetAssets();
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
  if (query.has("___OhTrustDebugger___")) {
    // @ts-ignore
    setMyLog(true);
  }
  return (
    <>
      <Switch>
        <Route exact path="/loading">
          <LoadingPage />
        </Route>
        <Route exact path={["/", "/depositto", "/depositto/*"]}>
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
              <DepositToPage />
            </Box>
          </Container>
        </Route>
        <Route
          component={() => (
            <>
              <ErrorPage messageKey={"error404"} />
            </>
          )}
        />
      </Switch>
      <ModalGroup
        assetsRawData={[]}
        onAccountInfoPanelClose={() => setShowAccount({ isShow: false })}
        isLayer1Only={true}
      />
      {query && query.has("nofooter") ? <></> : <Footer />}
    </>
  );
};

export default RouterView;
