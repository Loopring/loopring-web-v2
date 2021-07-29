// import React, { useState, useEffect } from 'react'
// import styled from '@emotion/styled/macro'
// import { useTranslation } from 'react-i18next'
//
// import { useWeb3React } from '@web3-react/core'
//
// import { network } from 'networks/web3_connectors'
//
// import { useEagerConnect, useInactiveListener } from 'hooks/web3/useWeb3'
// import { reset, setAccountStatus } from 'stores/account/reducer'
//
// import { ChainId, NetworkContextName } from 'loopring-sdk'

// import Loader from 'components/modals/Loader'
// import { useDispatch } from 'react-redux'
// import { AccountStatus } from 'state_machine/account_machine_spec'

// const MessageWrapper = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   height: 20rem;
// `
//
// const Message = styled.h2`
//   color: ${({ theme }) => theme.colorBase.error};
// `

// export function Web3ReactManager({ children }: { children: JSX.Element }) {
//   const { t } = useTranslation()
//   const { active } = useWeb3React()
//   const { active: networkActive, error: networkError, activate: activateNetwork } = useWeb3React(NetworkContextName)
//
//   // try to eagerly connect to an injected provider, if it exists and has granted access already
//   const triedEager = useEagerConnect()
//
//   // after eagerly trying injected, if the network connect ever isn't active or in an error state, activate itd
//   useEffect(() => {
//     if (triedEager && !networkActive && !networkError && !active) {
//       activateNetwork(network)
//     }
//   }, [triedEager, networkActive, networkError, activateNetwork, active])
//
//   // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
//
//   const dispatch = useDispatch()
//
//   const onReConnectInjected = () => {
//     console.log('onReConnectInjected')
//     dispatch(reset(undefined))
//     dispatch(setAccountStatus(AccountStatus.UNCONNNECTED))
//   }
//
//   useInactiveListener(onReConnectInjected, !triedEager)
//
//   // handle delayed loader state
//   const [showLoader, setShowLoader] = useState(false)
//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       setShowLoader(true)
//     }, 600)
//
//     return () => {
//       clearTimeout(timeout)
//     }
//   }, [])
//
//   // on page load, do nothing until we've tried to connect to the injected connector
//   if (!triedEager) {
//     return null
//   }
//
//   // if the account context isn't active, and there's an error on the network context, it's an irrecoverable error
//   if (!active && networkError) {
//     return (
//       <MessageWrapper>
//         <Message>{t('unknownError')}</Message>
//       </MessageWrapper>
//     )
//   }
//
//   // if neither context is active, spin
//   if (!active && !networkActive) {
//     return showLoader ? (
//       <MessageWrapper>
//         {/*<Loader />*/}
//       </MessageWrapper>
//     ) : null
//   }
//
//   return children
// }
