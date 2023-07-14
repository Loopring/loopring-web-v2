import { Route, Switch, useLocation } from 'react-router-dom'
import React from 'react'
import { Box, Container } from '@mui/material'
import { ModalGroup, ModalGroupL1, useDeposit } from '@loopring-web/core'
import { LoadingPage } from '../pages/LoadingPage'
import { SagaStatus, setMyLog, ThemeType } from '@loopring-web/common-resources'
import { ErrorPage } from '../pages/ErrorPage'
import { useSettings } from '@loopring-web/component-lib'
import { Footer } from '../layouts/footer'
import Header from 'layouts/header'
import { GuardianPage } from '../pages/WalletPage'

export const useWrapModal = () => {
  const { search } = useLocation()
  const searchParams = new URLSearchParams(search)
  const token = searchParams.get('token')
  const l2account = searchParams.get('l2account') || searchParams.get('owner')
  const { depositProps } = useDeposit(true, { token, owner: l2account })
  return {
    depositProps,
    view: <ModalGroupL1 assetsRawData={[]} depositProps={depositProps} />,
  }
}
const RouterView = ({ state }: { state: SagaStatus }) => {
  const location = useLocation()
  const { setTheme } = useSettings()
  const { view: modalView } = useWrapModal()
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
      <Switch>
        <Route exact path='/loading'>
          <LoadingPage />
        </Route>
        <Route path={['/', '/*']}>
          {searchParams && searchParams.has('noheader') ? <></> : <Header />}
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
              justifyContent={'center'}
              marginTop={3}
            >
              <GuardianPage />
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
      {modalView}
      {query && query.has('nofooter') ? <></> : <Footer />}
    </>
  )
}

export default RouterView
