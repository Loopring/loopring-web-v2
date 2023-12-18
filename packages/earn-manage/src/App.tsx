// import { ModalProvider } from 'styled-react-modal'
import { GlobalStyles } from '@mui/material'
import { css, Theme, useTheme } from '@emotion/react'
import { globalCss, SagaStatus } from '@loopring-web/common-resources'
import { setLanguage } from '@loopring-web/component-lib'
import { useInit } from './hook'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { HashRouter as Router, useLocation } from 'react-router-dom'
import { store } from '@loopring-web/core'
import RouterView from './routers'

const ScrollToTop = () => {
  const { pathname } = useLocation()

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
const App = () => {
  const theme: Theme = useTheme()
  const {
    i18n: { language },
  } = useTranslation()
  const storeLan = store.getState().settings.language

  const { state } = useInit()

  return (
    <>
      <GlobalStyles
        styles={css`
      ${globalCss({ theme })};

      body {
        ${
          theme.mode === 'dark'
            ? `
            color: ${theme.colorBase.textPrimary};
          `
            : ``
        }


      }

          body:before {
            ${
              theme.mode === 'dark'
                ? `
            background: var(--color-global-bg);
       `
                : ''
            }
      }
    }`}
      />

      <Router>
        <ScrollToTop />
        <RouterView state={state as SagaStatus} />
      </Router>
    </>
  )
}

export default App
