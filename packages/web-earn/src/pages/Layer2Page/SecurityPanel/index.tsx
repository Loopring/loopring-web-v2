import styled from '@emotion/styled'
import { Box, Button, Grid, Typography } from '@mui/material'
import React from 'react'
import { Trans, WithTranslation, withTranslation } from 'react-i18next'
import { useExportAccountInfo, useResetAccount } from './hook'
import { useSettings } from '@loopring-web/component-lib'
import { useAccount } from '@loopring-web/core'
import {
  MapChainId,
  L1L2_NAME_DEFINED,
} from '@loopring-web/common-resources'

const StyledPaper = styled(Grid)`
  width: 100%;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`

export const SecurityPanel = withTranslation(['common', 'layout'])(({ t }: WithTranslation) => {
  const { account } = useAccount()
  const { resetKeypair } = useResetAccount()
  const { exportAccount } = useExportAccountInfo()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]

  return (
    <StyledPaper height={'auto'} container className={'MuiPaper-elevation2'} marginBottom={2}>
      <Grid item xs={12} display={'flex'} flexDirection={'row'} alignItems={'center'}>
        <Typography
          component={'h3'}
          variant={'h4'}
          paddingX={5 / 2}
          paddingTop={5 / 2}
          paddingBottom={2}
        >
          {t('labelSecurity')}
        </Typography>
      </Grid>
      <Grid item xs={12} display={'flex'} flexDirection={'column'} paddingY={1}>
        {!account.isContract && !account.isInCounterFactualStatus && (
          <Box component={'section'} display={'flex'} flexDirection={'column'} padding={5 / 2}>
            <Grid container display={'flex'}>
              <Grid item xs={7}>
                <Typography variant={'h4'} color={'text.primary'} component={'h4'} marginBottom={1}>
                  {t('labelTitleResetL2Keypair', {
                    loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                  })}
                </Typography>
                <Typography variant={'body1'} color={'text.secondary'} component={'p'}>
                  <Trans
                    i18nKey='labelResetDescription'
                    tOptions={{
                      layer2: L1L2_NAME_DEFINED[network].layer2,
                      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                    }}
                  >
                    Create a new signing key for layer-2 authentication (no backup needed). This
                    will
                    <Typography component={'span'}>cancel all your pending orders</Typography>.
                  </Trans>
                </Typography>
              </Grid>

              <Grid
                item
                xs={5}
                display={'flex'}
                justifyContent={'flex-start'}
                alignItems={'flex-end'}
                flexDirection={'column'}
              >
                <Button
                  variant={'outlined'}
                  size={'medium'}
                  color={'primary'}
                  onClick={() => {
                    resetKeypair()
                  }}
                  disabled={false}
                >
                  {t('labelBtnReset')}
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
        <Box component={'section'} display={'flex'} flexDirection={'column'} padding={5 / 2}>
                <Grid container display={'flex'}>
                  <Grid item xs={7}>
                    <Typography
                      variant={'h4'}
                      color={'text.primary'}
                      component={'h4'}
                      marginBottom={1}
                    >
                      {t('labelTitleExportAccount')}
                    </Typography>
                    <Typography variant={'body1'} color={'text.secondary'} component={'p'}>
                      {t('labelDescriptionExportAccount', {
                        loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
                        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                      })}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={5}
                    display={'flex'}
                    justifyContent={'flex-start'}
                    alignItems={'flex-end'}
                    flexDirection={'column'}
                  >
                    <Button
                      onClick={() => {
                        // exportAccInfo()
                        exportAccount()
                      }}
                      variant={'outlined'}
                      size={'medium'}
                      color={'primary'}
                      disabled={false}
                    >
                      {t('labelBtnExportAccount')}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
      </Grid>
    </StyledPaper>
  )
})
