import { Provider } from 'react-redux'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { firebaseProps, persistor, store, TimeoutCheckProvider } from '@loopring-web/core'
import { getTheme, i18n } from '@loopring-web/common-resources'
import { ThemeProvider as MuThemeProvider } from '@mui/material'

import { ThemeProvider } from '@emotion/react'
import * as sdk from '@loopring-web/loopring-sdk'
import { PersistGate } from 'redux-persist/integration/react'
import { provider, ProviderComposer, useSettings } from '@loopring-web/component-lib'
import React, { Provider as TProvider } from 'react'
import { ReactReduxFirebaseProvider } from 'react-redux-firebase'
import { LocalizationProvider } from '@mui/lab'
import MomentUtils from '@mui/lab/AdapterMoment'
import { I18nextProvider } from 'react-i18next'
import { createRoot } from 'react-dom/client'

if (process.env.REACT_APP_VER) {
  console.log('VER:', process.env.REACT_APP_VER)
}
window.global = window;
const ProviderApp = React.memo(({ children }: { children: JSX.Element }) => {
  const providers: Array<[TProvider<any>, any]> = [
    provider(Provider as any, { store }),
    provider(LocalizationProvider as any, { dateAdapter: MomentUtils }),
    provider(I18nextProvider as any, { i18n: i18n }),
  ] as any
  return <ProviderComposer providers={providers}>{children}</ProviderComposer>
})
const ProviderThen = React.memo(({ children }: { children: JSX.Element }) => {
  const { themeMode, setIsMobile } = useSettings()
  const isMobile = sdk.IsMobile.any() ? true : false
  setIsMobile(isMobile)
  const providers: Array<[TProvider<any>, any]> = [
    provider(MuThemeProvider as any, { theme: getTheme(themeMode, isMobile) }),
    provider(ThemeProvider as any, { theme: getTheme(themeMode, isMobile) }),
    provider(PersistGate as any, { persistor, loading: null }),
    provider(TimeoutCheckProvider as any),
  ] as any
  return <ProviderComposer providers={providers}>{children}</ProviderComposer>
})

const root = createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <ProviderApp>
    <ReactReduxFirebaseProvider {...firebaseProps}>
      <ProviderThen>
        <App />
      </ProviderThen>
    </ReactReduxFirebaseProvider>
  </ProviderApp>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

if (process.env.NODE_ENV !== 'production') {
  reportWebVitals(console.log)
}
