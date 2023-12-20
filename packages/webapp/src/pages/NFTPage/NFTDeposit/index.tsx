import styled from '@emotion/styled'
import { Box, Typography } from '@mui/material'
import React from 'react'
import {
  Button,
  DepositNFTWrap,
  PopoverPure,
  useOpenModals,
  useSettings,
  useToggle,
} from '@loopring-web/component-lib'

import { useNFTDeposit } from '@loopring-web/core'
import { BackIcon, Info2Icon, L1L2_NAME_DEFINED, MapChainId } from '@loopring-web/common-resources'
import { bindHover } from 'material-ui-popup-state/es'
import { bindPopper, usePopupState } from 'material-ui-popup-state/hooks'
import { Trans, useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'

const StyledPaper = styled(Box)`
  background: var(--color-box-third);
  border-radius: ${({ theme }) => theme.unit}px;
`

export const DepositNFTPanel = () => {
  const { nftDepositProps } = useNFTDeposit()
  const { t } = useTranslation(['common'])
  const history = useHistory()
  const { setShowTradeIsFrozen } = useOpenModals()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const popupState = usePopupState({
    variant: 'popover',
    popupId: `popupId-nftDeposit`,
  })
  const { toggle } = useToggle()
  React.useEffect(() => {
    if (!toggle.depositNFT?.enable) {
      setShowTradeIsFrozen({ isShow: true, type: 'Deposit' })
      history.goBack()
    }
  }, [toggle.depositNFT?.enable])
  return (
    <Box flex={1} display={'flex'} flexDirection={'column'}>
      <Box marginBottom={2}>
        <Button
          startIcon={<BackIcon fontSize={'small'} />}
          variant={'text'}
          size={'medium'}
          sx={{ color: 'var(--color-text-secondary)' }}
          color={'inherit'}
          onClick={history.goBack}
        >
          {t('labelNFTDepositLabel')}
          {/*<Typography color={"textPrimary"}></Typography>*/}
        </Button>
      </Box>
      <StyledPaper
        flex={1}
        className={'MuiPaper-elevation2'}
        marginTop={0}
        marginBottom={2}
        display={'flex'}
        flexDirection={'column'}
      >
        <Typography
          component={'h3'}
          variant={'h4'}
          paddingX={5 / 2}
          paddingTop={5 / 2}
          display={'inline-flex'}
          alignItems={'center'}
        >
          <Typography variant={'inherit'} component={'span'}>
            {nftDepositProps.title
              ? nftDepositProps.title
              : t('labelNFTDepositTitle', { l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol })}
          </Typography>
          <Info2Icon
            {...bindHover(popupState)}
            fontSize={'large'}
            htmlColor={'var(--color-text-third)'}
          />

          <PopoverPure
            className={'arrow-center'}
            {...bindPopper(popupState)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
          >
            <Typography padding={2} component={'p'} variant={'body2'} whiteSpace={'pre-line'}>
              <Trans
                i18nKey={
                  nftDepositProps.description
                    ? nftDepositProps.description
                    : 'nftDepositDescription'
                }
                tOptions={{
                  loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
                  loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                  l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                  l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                  ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                }}
              >
                Creates a smart contract on Ethereum L1, which requires a gas fee. NFTs minted here
                are on L2 only until deployed.
              </Trans>
            </Typography>
          </PopoverPure>
        </Typography>

        <DepositNFTWrap {...nftDepositProps} />
      </StyledPaper>
    </Box>
  )
}
