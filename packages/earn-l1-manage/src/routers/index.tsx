import { Route, Switch, useLocation } from 'react-router-dom'
import React from 'react'
import { Box, Container } from '@mui/material'
import { LoadingPage } from '../pages/LoadingPage'
import { SagaStatus, setMyLog, ThemeType } from '@loopring-web/common-resources'
import { ErrorPage } from '../pages/ErrorPage'
import { useSettings } from '@loopring-web/component-lib'
import { Footer } from '../layouts/footer'
import { ModalGroup } from '.././modal'
import Header from 'layouts/header'
const RouterView = ({ state }: { state: SagaStatus }) => {
  const location = useLocation()
  const { setTheme } = useSettings()
  const searchParams = new URLSearchParams(location.search)
  React.useEffect(() => {
    if (searchParams.has('theme')) {
      searchParams.get('theme') === ThemeType.dark ? setTheme('dark') : setTheme('light')
    }
  }, [location.search])
  React.useEffect(() => {
    if (state === SagaStatus.ERROR) {
      window.location.replace(`${window.location.origin}/error`)
    }
  }, [state])
  if (searchParams.has('___OhTrustDebugger___')) {
    // @ts-ignore
    setMyLog(true)
  }
  return (
    <>
      <Switch>
        <Route exact path='/loading'>
          <LoadingPage />
        </Route>
        <Route exact path={['/']}>
          {searchParams && searchParams.has('noheader') ? <></> : <Header isHideOnScroll={true} />}
          <Container
            maxWidth='lg'
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
            }}
          >
            <Box
              display={'flex'}
              flex={1}
              alignItems={'stretch'}
              flexDirection={'row'}
              marginTop={3}
            >
              {/*<AssetPage />*/}
            </Box>
          </Container>
        </Route>
        <Route
          component={() => (
            <>
              <ErrorPage messageKey={'error404'} />
            </>
          )}
        />
      </Switch>
      {<ModalGroup assetsRawData={[]} isLayer1Only={true} />}
      {searchParams && searchParams.has('nofooter') ? <></> : <Footer />}
    </>
  )
}

export default RouterView
