import { Route, Switch } from "react-router-dom";
import React from "react";
import { LandPage } from "LandPage/LandPage";
import { Footer } from "@loopring-web/component-lib/src/components/footer";
import Header from "../header";

const RouterView = () => {
  return (
    <>
      <Switch>
        <Route exact path="/">
          <Header isHideOnScroll={true} isLandPage />
          <LandPage />
        </Route>
      </Switch>
      <Footer />
    </>
  );
};

export default RouterView;
