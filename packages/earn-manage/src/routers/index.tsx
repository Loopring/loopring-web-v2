import { Route, Switch, useLocation } from 'react-router-dom'
import React from 'react'
import { LoadingPage } from '../pages/LoadingPage'
import { SagaStatus, setMyLog, ThemeType } from '@loopring-web/common-resources'
import { ErrorPage } from '../pages/ErrorPage'
import { useSettings } from '@loopring-web/component-lib'
import { Footer } from '../layouts/footer'
import Header from 'layouts/header'
import { AssetPage } from '../pages/AssetPage'
import { ModalGroup } from '../modal'
import { RecordPage } from '../pages/HistoryPage'

const RouterView = ({ state }: { state: SagaStatus }) => {
  const location = useLocation()
  const { setTheme } = useSettings()
  const query = new URLSearchParams(location.search)
  const searchParams = new URLSearchParams(location.search)
  React.useEffect(() => {
    if (query.has('theme')) {
      query.get('theme') === ThemeType.dark ? setTheme('dark') : setTheme('light')
    }
  }, [location.search])

  React.useEffect(() => {
    if (state === SagaStatus.ERROR) {
      window.location.replace(`${window.location.origin}/error`)
    }
  }, [state])
  if (query.has('___OhTrustDebugger___')) {
    // @ts-ignore
    setMyLog(true)
  }
  return (
    <>
      state ==
      {searchParams && searchParams.has('noheader') ? <></> : <Header />}
      {state === SagaStatus.DONE && (
        <Switch>
          <Route exact path='/loading'>
            <LoadingPage />
          </Route>
          <Route path='/record'>
            <RecordPage />
          </Route>
          <Route path={['/', '/*']}>
            <AssetPage />
          </Route>

          <Route
            component={() => (
              <>
                <ErrorPage messageKey={'error404'} />
              </>
            )}
          />
        </Switch>
      )}
      {state === SagaStatus.DONE && (
        <ModalGroup assetsRawData={[]} isLayer1Only={true} onWalletConnectPanelClose />
      )}
      {query && query.has('nofooter') ? <></> : <Footer />}
    </>
  )
}

export default RouterView
