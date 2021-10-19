// import { ModalProvider } from 'styled-react-modal'
import RouterView from './routers'
import { GlobalStyles } from '@mui/material';
import { css, Theme, useTheme } from '@emotion/react';
import { globalCss } from '@loopring-web/common-resources/static-resources/src/themes';
import { setLanguage } from '@loopring-web/component-lib/src/stores/reducer/settings'
import React from 'react';
import { useTranslation } from 'react-i18next';

import { HashRouter as Router, useLocation } from 'react-router-dom'
import store from './stores';

const ScrollToTop = () => {
    const {pathname} = useLocation();

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}
const App = () => {
    const theme: Theme = useTheme();
    const {i18n: {language}} = useTranslation()
    const storeLan = store.getState().settings.language


    React.useEffect(() => {
        if (storeLan !== language) {
            store.dispatch(setLanguage(language));
        }
    }, [])


    return <><GlobalStyles styles={css`
      ${globalCss({theme})};

      body {
        ${theme.mode === 'dark' ? `
            color: ${theme.colorBase.textPrimary};
          ` : ``}
      }

      body:before {
        ${theme.mode === 'dark' ? `
            background: var(--color-global-bg);
       ` : ''}
      }
    }`}/>

        <Router>
            <ScrollToTop/>
            <RouterView/>
        </Router>

    </>


}

export default App;


