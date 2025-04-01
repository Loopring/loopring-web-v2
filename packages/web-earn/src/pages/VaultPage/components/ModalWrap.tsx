import React from 'react'
import {
  useVaultLoan,
  useVaultRedeem,
} from '@loopring-web/core'
import {
  Modal,
  useOpenModals,
  VaultExitPanel,
  VaultLoanPanel,
} from '@loopring-web/component-lib'
import {
  VaultLoanType,
} from '@loopring-web/common-resources'

export const ModalVaultWrap = ({onClickLeverage}: {onClickLeverage: () => void}) => {
  const {
    modals: { isShowVaultExit, isShowVaultLoan },
    setShowVaultExit,
    setShowVaultLoan,
  } = useOpenModals()
  const exitVaultProps = useVaultRedeem()

  const { vaultRepayProps, vaultBorrowProps, vaultLoanType, handleTabChange } = useVaultLoan()
  return (
    <>


      <Modal
        contentClassName={'vault-wrap'}
        open={isShowVaultExit.isShow}
        _width={'var(--modal-width)'}
        onClose={() => {
          setShowVaultExit({ isShow: false })
        }}
        content={<VaultExitPanel {...{ ...exitVaultProps }} />}
      />
      <Modal
        open={isShowVaultLoan.isShow}
        onClose={() => {
          setShowVaultLoan({ isShow: false })
        }}
        content={
          <VaultLoanPanel
            vaultRepayProps={vaultRepayProps as any}
            vaultBorrowProps={{...vaultBorrowProps, onClickLeverage} as any}
            vaultLoanType={vaultLoanType as VaultLoanType}
            handleTabChange={handleTabChange}
          />
        }
      />

    </>
  )
}
