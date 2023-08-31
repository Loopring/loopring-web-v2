import React from 'react'
import { useTokenMap, useVaultMap } from '@loopring-web/core'
import { Modal, useOpenModals, VaultExitPanel, VaultJoinPanel } from '@loopring-web/component-lib'
import { useVaultJoin } from './useVaultJoin'
import { useTheme } from '@emotion/react'
import { TRADE_TYPE } from '@loopring-web/common-resources'

export const ModalVaultWrap = () => {
  const { tokenMap } = useTokenMap()
  const { getVaultMap, tokenMap: vaultTokenMao, idIndex: vaultIndex } = useVaultMap()
  const theme = useTheme()
  const {
    modals: { isShowVaultExit, isShowVaultJoin, isShowVaultSwap },
    setShowVaultJoin,
    setShowVaultExit,
  } = useOpenModals()
  const joinVaultProps = useVaultJoin()
  React.useEffect(() => {
    getVaultMap()
  }, [])

  return (
    <>
      <Modal
        contentClassName={'trade-wrap'}
        open={isShowVaultJoin.isShow}
        onClose={() => {
          setShowVaultJoin({ isShow: false })
        }}
        content={
          <VaultJoinPanel
            {...{
              ...joinVaultProps,
              type: TRADE_TYPE.TOKEN,
              _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,
              _height: `auto`,
            }}
          />
        }
      />
      <Modal
        open={isShowVaultExit.isShow}
        onClose={() => {
          setShowVaultExit({ isShow: false })
        }}
        content={<VaultExitPanel />}
      />
    </>
  )
}
