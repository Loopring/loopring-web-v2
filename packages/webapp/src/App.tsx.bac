import { ModalProvider } from 'styled-react-modal'
import RouterView from './routers'
import { Avatar, GlobalStyles } from '@material-ui/core';
import { css, Theme, useTheme } from '@emotion/react';
import { globalCss,ErrorMap } from '@loopring-web/common-resources';
import { GlobalProvider, Web3ReactManager } from './provider/';
import React, { useEffect } from 'react';
import { useInit } from './hook';
import { STATUS } from 'stores/constant';
import loadingSvg from '@loopring-web/common-resources/assets/svg/loading.svg';
import { ErrorPage } from './pages/ErrorPage';
import { LoadingPage } from './pages/LoadingPage';

const App =  () => {
    const theme: Theme = useTheme();
    const { state } = useInit();
    const [status,setStatus] = React.useState<keyof typeof STATUS>('PENDING');
    // check all status be
    //TODO  demo if  tokenMapStatus is unset and tokenMap is empty. show error
    //TODO tokenMapObj.status is pending, show global loading
    //console.log(tokenMapObj.tokenMap && Object.keys(tokenMapObj.tokenMap).length>0,tokenMapObj.status, tokenMapObj.errorMessage)

    useEffect(() => {
      if (state === STATUS.PENDING || state === STATUS.ERROR) {
          setStatus(state)
      } else {
          setStatus('DONE')
      }
    }, [state, setStatus])
    
    return <><GlobalStyles styles={css` 
      ${globalCss({theme})};
      body{
          ${theme.mode === 'dark' ? `
            color: ${theme.colorBase.textPrimary};
          `:``}
      }
      body:before {
        ${theme.mode === 'dark' ? `
            background: #191C30;
            background: ${theme.colorBase.background().bg};
       ` : ''}
      }
      //#root{
      //  display: flex;
      //  flex-direction: column;
      //}
}`}></GlobalStyles>
  <ModalProvider>
      <GlobalProvider>
          <Web3ReactManager>
              { status === 'PENDING' ?
                  <LoadingPage />
                  // <ErrorPage {...ErrorMap.LOADING_WHOLE_SITE}/>
                  // <Avatar src={loadingSvg}/>
                  : status === 'ERROR'? <ErrorPage {...ErrorMap.NO_NETWORK_ERROR}/> : <>
                  <RouterView />
                  {/*    <ErrorPage {...ErrorMap.LOADING_WHOLE_SITE}/>*/}
                  </>  }
          </Web3ReactManager>
      </GlobalProvider>
  </ModalProvider></>

     
}

// const mapStateToProps = state => {
//     ,
//         status,
//         getTokenMap

//     return {
//         tokenMap: state.tokenMap.tokenMap,
//         tokenMap: state.tokenMap.t,
//         actionCreated: state.posts.newAction
//     };
// };


export default App;

// connect(
//     mapStateToProps,
//     null // Generaly its the place of mapStateToDispatch
// )(App);

