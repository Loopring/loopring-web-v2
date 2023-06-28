// import { ModalProvider } from 'styled-react-modal'
import RouterView from "./routers";
import { GlobalStyles } from "@mui/material";
import { css, Theme, useTheme } from "@emotion/react";
import { globalCss } from "@loopring-web/common-resources";
import { setLanguage } from "@loopring-web/component-lib";
import { useInit } from "./hook";
import React from "react";
import { useTranslation } from "react-i18next";

import { HashRouter as Router, useLocation } from "react-router-dom";
import { store } from "@loopring-web/core";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
const App = () => {
  const theme: Theme = useTheme();
  const {
    i18n: { language },
  } = useTranslation();
  const storeLan = store.getState().settings.language;

  React.useEffect(() => {
    if (storeLan !== language) {
      store.dispatch(setLanguage(language));
    }
  }, [storeLan, language]);

  React.useEffect(() => {
    if (window.location.protocol !== "https:") {
      console.log("Current PROTOCOL::", window.location.protocol);
      window.location.replace(
        `https:${window.location.href.substring(
          window.location.protocol.length
        )}`
      );
    }
  }, []);

  const { state } = useInit();

  return (
    <>
      <GlobalStyles
        styles={css`
      ${globalCss({ theme })};

      body {
        ${
          theme.mode === "dark"
            ? `
            color: ${theme.colorBase.textPrimary};
          `
            : ``
        }


      }

          body:before {
            ${
              theme.mode === "dark"
                ? `
            background: var(--color-global-bg);
       `
                : ""
            }
      }
    }`}
      />

      <Router>
        <ScrollToTop />
        <RouterView state={state} />
      </Router>
    </>
  );
};
const h = new Headers();
export default App;

// new ContactAPI({chainId: 1, baseUrl: 'https://uat2.loopring.io'})
// .getContacts({
//   isHebao: false,
//   accountId: 10086,
// })
// .then(x => {
//   debugger
// })
// .catch(x => {
//   debugger
// })

// curl -v 'https://uat2.loopring.io/api/v3/user/contact?accountId=10083&isHebao=false' \
//   -H 'Accept: application/json, text/plain, */*' \
//   -H 'Accept-Language: en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7' \
//   -H 'Connection: keep-alive' \
//   -H 'Origin: https://localhost:3000' \
//   -H 'Referer: https://localhost:3000/' \
//   -H 'Sec-Fetch-Dest: empty' \
//   -H 'Sec-Fetch-Mode: cors' \
//   -H 'Sec-Fetch-Site: cross-site' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36' \
//   -H 'X-API-KEY: 2PYgTOZwXHkPXtJMlOMG06ZX1QKJInpoky6iYIbtMgmkbfdL4PvxyEOj0LPOfgYX' \
//   -H 'feeVersion: v2' \
//   -H 'pf: web' \
//   -H 'sec-ch-ua: "Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"' \
//   -H 'sec-ch-ua-mobile: ?0' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   --compressed
