// import { ModalProvider } from 'styled-react-modal'
import RouterView from './routers'
import { GlobalStyles } from '@material-ui/core';
import { css, Theme, useTheme } from '@emotion/react';
import { ErrorMap, globalCss } from '@loopring-web/common-resources';
// import { GlobalProvider, Web3ReactManager } from './provider/';
import { useInit } from './hook';
// import loadingSvg from '@loopring-web/common-resources/assets/svg/loading.svg';
import { ErrorPage } from './pages/ErrorPage';
import { LoadingPage } from './pages/LoadingPage';
import { GlobalProvider } from './provider';

const App = () => {
  const theme: Theme = useTheme();
  const { state } = useInit();
  // const [status, setStatus] = React.useState<keyof typeof SagaStatus>('PENDING');
  // check all status be
  //TODO  demo if  tokenMapStatus is unset and tokenMap is empty. show error
  //TODO tokenMapObj.status is pending, show global loading
  //console.log(tokenMapObj.tokenMap && Object.keys(tokenMapObj.tokenMap).length>0,tokenMapObj.status, tokenMapObj.errorMessage)

  // useEffect(() => {
  //     if (state === SagaStatus.PENDING || state === SagaStatus.ERROR) {
  //         setStatus(state)
  //     } else {
  //         setStatus('DONE')
  //     }
  // }, [state, setStatus])

  return <><GlobalStyles styles={css` 
      ${globalCss({ theme })};
      body{
          ${theme.mode === 'dark' ? `
            color: ${theme.colorBase.textPrimary};
          ` : ``}
      }
      body:before {
        ${theme.mode === 'dark' ? `
            background: var(--color-global-bg);
       ` : ''}
      }
      //#root{
      //  display: flex;
      //  flex-direction: column;
      //}
}`}></GlobalStyles>
      <GlobalProvider>
        {/*<Web3ReactManager>*/}
        {state === 'PENDING' ?
          <LoadingPage />
          // <ErrorPage {...ErrorMap.LOADING_WHOLE_SITE}/>
          // <Avatar src={loadingSvg}/>
          : state === 'ERROR' ? <ErrorPage {...ErrorMap.NO_NETWORK_ERROR} /> : <>
            <RouterView />

            {/*    <ErrorPage {...ErrorMap.LOADING_WHOLE_SITE}/>*/}
          </>}
      </GlobalProvider>
</>


}

export default App;


