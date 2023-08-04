import React from 'react'

import { ConnectProviders, connectProvides } from '@loopring-web/web3-provider'
import { AccountStep, SwitchData, useOpenModals, FeeSelectProps } from '@loopring-web/component-lib'
import {
  AccountStatus,
  AddressError,
  CoinMap,
  EXCHANGE_TYPE,
  Explorer,
  getValuePrecisionThousand,
  globalSetup,
  IBData,
  LIVE_FEE_TIMES,
  myLog,
  SagaStatus,
  SUBMIT_PANEL_AUTO_CLOSE,
  TRADE_TYPE,
  UIERROR_CODE,
  WALLET_TYPE,
  WalletMap,
  WithdrawTypes,
} from '@loopring-web/common-resources'

import * as sdk from '@loopring-web/loopring-sdk'

import {
  BIGO,
  DAYS,
  getAllContacts,
  getTimestampDaysLater,
  isAccActivated,
  LAST_STEP,
  LoopringAPI,
  makeWalletLayer2,
  store,
  useAccount,
  useAddressCheckWithContacts,
  useBtnStatus,
  useChargeFees,
  useIsHebao,
  useModalData,
  useSystem,
  useTokenMap,
  useWalletLayer2Socket,
  walletLayer2Service,
} from '../../index'
import { useWalletInfo } from '../../stores/localStore/walletInfo'
import _ from 'lodash'
import { addressToExWalletMapFn, exWalletToAddressMapFn } from '@loopring-web/core'
import { useContacts } from '../../stores/contacts/hooks'
import { useTheme } from '@emotion/react'


// export const FeeSelect = <C extends FeeInfo>({
//   chargeFeeTokenList,
//   handleToggleChange,
//   feeInfo,
//   disableNoToken = false,
// }: {
//   chargeFeeTokenList: Array<C>
//   handleToggleChange: (value: C) => void
//   feeInfo: C
//   disableNoToken?: boolean
// }) => {
//   return (
//     <MuToggleButtonGroupStyle
//       size={'small'}
//       value={chargeFeeTokenList.findIndex((ele) => feeInfo?.belong === ele.belong)}
//       exclusive
//       onChange={(_e, value: number) => {
//         handleToggleChange(chargeFeeTokenList[value])
//       }}
//     >
//       {chargeFeeTokenList?.map((feeInfo, index) => (
//         <ToggleButton
//           key={feeInfo.belong + index}
//           value={index}
//           aria-label={feeInfo.belong}
//           disabled={disableNoToken && !feeInfo.hasToken}
//         >
//           {feeInfo.belong}
//         </ToggleButton>
//       ))}
//     </MuToggleButtonGroupStyle>
//   )
// }


export const useFeeSelect = <R extends IBData<T>, T>() => {
  
  // const 
  
  
  const {
    modals: {
      isShowFeeSelect: {
        requestType,

        // symbol,
        // isShow,
        // info,
        // address: contactAddress,
        // name: contactName,
        // addressType: contactAddressType,
      },
    },
    setShowFeeSelect
  } = useOpenModals()
  const tokenMap = useTokenMap()
  // tokenMap.tokenMap
  const {
    chargeFeeTokenList,
    // isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    // checkFeeIsEnough,
    // resetIntervalTime,
  } = useChargeFees({
    requestType: sdk.OffchainFeeReqType.TRANSFER,
    // updateData: ({ fee, requestType }) => {
    //   let _requestType = feeWithActive
    //     ? sdk.OffchainFeeReqType.TRANSFER_AND_UPDATE_ACCOUNT
    //     : sdk.OffchainFeeReqType.TRANSFER
    //   if (_requestType === requestType) {
    //     const transferValue = store.getState()._router_modalData.transferValue
    //     updateTransferData({ ...transferValue, fee })
    //   }
    // },
    //   [feeWithActive]
    // ),
  })

  myLog('chargeFeeTokenList', chargeFeeTokenList)
  
  const feeSelectProps: FeeSelectProps = {
    chargeFeeTokenList,
    feeInfo,
    handleToggleChange: handleFeeChange
  }

  return {
    feeSelectProps,
    // retryBtn,
  }
}
