import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import App from './App'
import reportWebVitals from './reportWebVitals'

// import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import store from 'stores' //{persistor}
// import { getLibrary } from 'utils/web3_tools'
// import { NetworkContextName } from 'loopring-sdk'
import { getTheme, i18n, provider, ProviderComposer } from "@loopring-web/common-resources"

import { ThemeProvider as MuThemeProvider } from '@material-ui/core'
import LocalizationProvider from '@material-ui/pickers/LocalizationProvider'

import MomentUtils from '@material-ui/lab/AdapterMoment'

import { ThemeProvider } from "@emotion/react"

import { I18nextProvider } from "react-i18next"

// const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)
const providers = [
    provider(LocalizationProvider as any, {dateAdapter: MomentUtils}),
    provider(I18nextProvider as any, {i18n: i18n}),
    provider(MuThemeProvider as any, {theme: getTheme('dark')}),
    provider(ThemeProvider as any, {theme: getTheme('dark')}),
    provider(Provider as any, {store}),// persistor
]

ReactDOM.render(
// @ts-ignore
    <ProviderComposer providers={providers}>
        {/*<Web3ReactProvider getLibrary={getLibrary}>*/}
        {/*    <Web3ProviderNetwork getLibrary={getLibrary}>*/}
        <App/>
        {/*</Web3ProviderNetwork>*/}
        {/*</Web3ReactProvider>*/}
    </ProviderComposer>,
    document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

if (process.env.NODE_ENV !== 'production') {
    reportWebVitals(console.log)
}
