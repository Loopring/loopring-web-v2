import { useSettings } from '../../../stores'
import { L1L2_NAME_DEFINED, MapChainId, TradeBtnStatus } from '@loopring-web/common-resources'
import { Box, Typography } from '@mui/material'
import { Trans, useTranslation } from 'react-i18next'
import { Button } from '../../basic-lib'
import { VaultExitBaseProps } from '../components/VaultWrap'
import React from 'react'

export const VaultExitPanel = ({
  onSubmitClick,
  onClose,
  btnStatus,
  disabled,
  confirmLabel = 'labelVaultConfirm',
  cancelLabel = 'labelVaultCancel',
}: VaultExitBaseProps) => {
  const { t } = useTranslation()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const getDisabled = React.useMemo(() => {
    return disabled || btnStatus === TradeBtnStatus.DISABLED
  }, [btnStatus, disabled])
  const label = React.useMemo(() => {
    if (confirmLabel) {
      const key = confirmLabel.split('|')
      return t(
        key[0],
        key && key[1]
          ? {
              arg: key[1].toString(),
              l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            }
          : {
              l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            },
      )
    } else {
      return t(`labelVaultConfirm`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      })
    }
  }, [confirmLabel])
  return (
    <Box flex={1} marginX={4} marginBottom={4}>
      <Typography marginBottom={2}>
        {/* eslint-disable-next-line react/jsx-no-undef */}
        <Trans
          i18nKey={'labelVaultExitDes'}
          tOptions={{
            l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
            ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          }}
        >
          Upon closing your position, all open orders will be canceled, and any outstanding debts
          will be automatically repaid. If the available balance of the Vault_Token is insufficient
          to cover the debt, Loopring will sell a portion of your assets at the market price to
          repay the debt. The remaining Vault_Token will be converted to the token you have staked
          at the current market price and returned to your Loopring L2 Account.
        </Trans>
      </Typography>
      <Box
        display={'flex'}
        justifyContent={'space-between'}
        width={'100%'}
        className={'action-btn'}
        flexDirection={'row'}
        alignItems={'center'}
      >
        <Box width={'48%'}>
          <Button
            variant={'outlined'}
            size={'medium'}
            sx={{ height: '4rem' }}
            onClick={(_) => onClose()}
            color={'primary'}
            fullWidth
          >
            {t(cancelLabel)}
          </Button>
        </Box>
        <Box width={'48%'}>
          <Button
            sx={{ height: '4rem' }}
            variant={'contained'}
            size={'medium'}
            fullWidth
            onClick={(_) => onSubmitClick()}
            loading={!getDisabled && btnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
            disabled={
              getDisabled ||
              btnStatus === TradeBtnStatus.DISABLED ||
              btnStatus === TradeBtnStatus.LOADING
            }
          >
            {label}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
