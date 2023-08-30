import React from 'react'
import { useTokenMap, useVaultMap } from '@loopring-web/core'
import {
  Modal,
  useOpenModals,
  useSettings,
  VaultExitPanel,
  VaultJoinPanel,
} from '@loopring-web/component-lib'
import { useVaultJoin } from './useVaultJoin'

export const ModalWrap = () => {
  const { tokenMap } = useTokenMap()
  const { getVaultMap, tokensMap: vaultTokenMao, idIndex: vaultIndex } = useVaultMap()
  const {
    modals: { isShowVaultExit, isShowVaultJoin, isShowVaultSwap },
    setShowVaultJoin,
    setShowVaultExit,
    setShowVaultSwap,
  } = useOpenModals()
  const joinVaultProps = useVaultJoin()
  React.useEffect(() => {
    getVaultMap()
  }, [])
  // const checkBtnStatus = React.useCallback(() => {
  //   if (
  //     tokenMap
  //     // tokenMap &&
  //     // nftTransferValue.fee?.belong &&
  //     // nftTransferValue?.tradeValue &&
  //     // chargeFeeTokenList.length &&
  //     // !isFeeNotEnough.isFeeNotEnough &&
  //     // !isSameAddress &&
  //     // sureItsLayer2 &&
  //     // sdk.toBig(nftTransferValue.tradeValue).gt(BIGO) &&
  //     // sdk.toBig(nftTransferValue.tradeValue).lte(Number(nftTransferValue.balance) ?? 0) &&
  //     // (addrStatus as AddressError) === AddressError.NoError &&
  //     // realAddr
  //   ) {
  //     enableBtn()
  //     // myLog('enableBtn')
  //     return
  //   }
  //   disableBtn()
  // }, [
  //   tokenMap,
  //   // nftTransferValue.fee?.belong,
  //   // nftTransferValue.tradeValue,
  //   // nftTransferValue.balance,
  //   // chargeFeeTokenList.length,
  //   // isFeeNotEnough,
  //   // isSameAddress,
  //   // sureItsLayer2,
  //   // addrStatus,
  //   // realAddr,
  //   disableBtn,
  //   enableBtn,
  // ])

  return (
    <>
      <Modal
        open={isShowVaultJoin.isShow}
        onClose={() => {
          setShowVaultJoin({ isShow: false })
        }}
        content={<VaultJoinPanel {...joinVaultProps} />}
      ></Modal>
      <Modal
        open={isShowVaultExit.isShow}
        onClose={() => {
          setShowVaultExit({ isShow: false })
        }}
        content={<VaultExitPanel />}
      ></Modal>
    </>
  )
}
