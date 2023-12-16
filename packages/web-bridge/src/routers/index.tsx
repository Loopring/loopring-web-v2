import { Route, Switch, useLocation } from 'react-router-dom'
import React from 'react'
import { Box, Container } from '@mui/material'
import { ModalGroup, useDeposit } from '@loopring-web/core'
import { LoadingPage } from '../pages/LoadingPage'
import { SagaStatus, setMyLog, ThemeType } from '@loopring-web/common-resources'
import { ErrorPage } from '../pages/ErrorPage'
import { useSettings } from '@loopring-web/component-lib'
import { DepositToPage } from '../pages/DepositPage'
import { Footer } from '../layouts/footer'

export const useWrapModal = () => {
  const { search } = useLocation()
  const searchParams = new URLSearchParams(search)
  const token = searchParams.get('token')
  const l2account = searchParams.get('l2account') || searchParams.get('owner')
  const { depositProps } = useDeposit(true, { token, owner: l2account })
  return {
    depositProps,
    view: <ModalGroup assetsRawData={[]} depositProps={depositProps} isLayer1Only={true} />,
  }
}
const RouterView = ({ state }: { state: SagaStatus }) => {
  const location = useLocation()
  const { setTheme } = useSettings()
  const { depositProps, view: modalView } = useWrapModal()
  // const { depositProps } = useDeposit(true, { token, owner });
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
        <Route exact path={['/', '/depositto', '/depositto/*']}>
          {/*{searchParams && searchParams.has("noheader") ? <></> : <Header />}*/}
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
              <DepositToPage depositProps={depositProps} />
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
      {searchParams && searchParams.has('nofooter') ? <></> : <Footer />}
    </>
  )
}

export default RouterView
