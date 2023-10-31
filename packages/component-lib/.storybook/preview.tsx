import type { Preview } from '@storybook/react'
import { getTheme, globalCss, i18n } from '@loopring-web/common-resources'
import StoryRouter from 'storybook-react-router/dist/react'
import { ThemeProvider } from '@emotion/react'
import { Provider } from 'react-redux'
import { LocalizationProvider } from '@mui/lab'
import { I18nextProvider } from 'react-i18next'
import DateAdapter from '@mui/lab/AdapterMoment'
import createStorybookListener from 'storybook-addon-redux-listener'
import { GlobalStyles, ThemeProvider as MuThemeProvider } from '@mui/material'
import {applyMiddleware, combineReducers, compose, createStore} from "redux";
import {modalsSlice, provider, ProviderComposer, setLanguage, setTheme, settingsSlice} from '../src'


export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  // controls: {
  //   matchers: {
  //     color: /(background|color)$/i,
  //     date: /Date$/,
  //   },
  // },
  backgrounds: {
    default: 'dark',
    values: [
      { name: 'dark', value: '#14172C' },
      { name: 'light', value: '#ffffff' },
    ],
  },
}
export const globalTypes = {
  locale: {
    name: 'Locale',
    description: 'Internationalization locale',
    defaultValue: 'zh_CN',
    toolbar: {
      icon: 'globe',
      items: [
        { value: 'en_US', right: 'en_US', title: 'English' },
        { value: 'zh_CN', right: 'zh_CN', title: '中文' },
      ],
    },
  },
}

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

const middlewares:any[] = [
    // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    //...getDefaultMiddleware({ thunk: true })      Button.stories.tsx
]
const reducers = combineReducers({
    settings: settingsSlice.reducer,
    modals: modalsSlice.reducer,
})
if (process.env.NODE_ENV === 'storybook') {
    const reduxListener = createStorybookListener()
    middlewares.push(reduxListener)
}
// @ts-ignore
const composeEnhancers = (global??window)?.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const enhancer = composeEnhancers(
    applyMiddleware(...middlewares),
    // other stores enhancers if any
)

const createStoreWithMiddleware = (reducers) => {
    return createStore(reducers, enhancer)
}
const configureStore = () => createStoreWithMiddleware(reducers)
const store = configureStore()
export const decorators = [
  (Story, context) => {
    const { backgrounds, locale } = context.globals
    const themeMode = backgrounds && backgrounds.value === '#ffffff' ? 'light' : 'dark'
    store.dispatch(setLanguage(locale))
    store.dispatch(setTheme(themeMode))
    // @ts-ignore
    const theme = getTheme(store.getState().settings.themeMode)
    StoryRouter()
    return (
      <ProviderComposer
        providers={[
          // @ts-ignore
          provider(LocalizationProvider, { dateAdapter: DateAdapter }),
          // @ts-ignore
          provider(I18nextProvider, { i18n: i18n }),
          // @ts-ignore
          provider(MuThemeProvider, { theme: theme }),
          // @ts-ignore
          provider(ThemeProvider, { theme: theme }),
          // @ts-ignore
          provider(Provider, { store }),
        ] as any}
      >
        <style type='text/css'>
          {`.sb-show-main.sb-main-padded{
            padding:0.01em;  
          }
        `}
        </style>
        <GlobalStyles styles={globalCss({ theme })}></GlobalStyles>
        <Story {...{ context }}> </Story>
      </ProviderComposer>
    )
  },
]

