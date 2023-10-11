import { useHistory } from 'react-router-dom'

import { Box, Container, Typography, Grid } from '@mui/material'
import React from 'react'
import {
  ConvertToIcon,
  CloseOutIcon,
  LoadIcon,
  MarginIcon,
  MarginLevelIcon,
  VaultTradeIcon,
} from '@loopring-web/common-resources'
import { MenuBtnStyled, useSettings, VaultAssetsTable } from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import { VaultAccountInfoStatus } from '@loopring-web/core'
import { useGetVaultAssets } from './hook'

export const VaultDashBoardPanel = ({
  vaultAccountInfo: {
    joinBtnStatus,
    joinBtnLabel,
    onJoinPop,
    vaultAccountInfo,
    swapBtnStatus,
    swapBtnLabel,
    onSwapPop,
    redeemBtnStatus,
    onRedeemPop,
    redeemBtnLabel,
    borrowBtnStatus,
    onBorrowPop,
    borrowBtnLabel,
    repayBtnStatus,
    onRepayPop,
    repayBtnLabel,
  },
}: {
  vaultAccountInfo: VaultAccountInfoStatus
}) => {
  const { t } = useTranslation()
  const history = useHistory()
  const { isMobile } = useSettings()
  const { totalAsset, ...assetPanelProps } = useGetVaultAssets()

  return (
    <Box flex={1} display={'flex'} flexDirection={'column'}>
      <Container
        maxWidth='lg'
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <Grid container spacing={3} display={'flex'} alignContent={'stretch'} marginTop={3}>
          <Grid item md={9} xs={12}>
            <Grid
              border={'var(--color-border)'}
              borderRadius={1.5}
              display={'flex'}
              flexDirection={'column'}
            >
              <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                <Box>
                  <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                    {t('labelVaultTotalBalance')}
                  </Typography>
                  <Typography component={'span'} variant={'h4'} color={'textSecondary'}>
                    {}
                  </Typography>
                </Box>
                <Box>
                  <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                    {t('labelVaultOpenDate')}
                  </Typography>
                  <Typography component={'span'} variant={'h4'} color={'textSecondary'}>
                    {}
                  </Typography>
                </Box>
              </Box>
              <Box
                display={'flex'}
                flexWrap={'nowrap'}
                flexDirection={'row'}
                justifyContent={'space-between'}
              >
                <Box>
                  <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                    {t('labelVaultMarginLevel')}
                  </Typography>
                  <Typography component={'span'} variant={'h4'} color={'textSecondary'}>
                    <MarginLevelIcon />
                  </Typography>
                </Box>
                <Box>
                  <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                    {t('labelVaultTotalCollateral')}
                  </Typography>
                  <Typography
                    component={'span'}
                    variant={'h4'}
                    color={'textSecondary'}
                  ></Typography>
                </Box>
                <Box>
                  <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                    {t('labelVaultTotalDebt')}
                  </Typography>
                  <Typography
                    component={'span'}
                    variant={'h4'}
                    color={'textSecondary'}
                  ></Typography>
                </Box>
                <Box>
                  <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                    {t('labelVaultTotalEquity')}
                  </Typography>
                  <Typography
                    component={'span'}
                    variant={'h4'}
                    color={'textSecondary'}
                  ></Typography>
                </Box>
                <Box>
                  <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                    {t('labelVaultProfit')}
                  </Typography>
                  <Typography
                    component={'span'}
                    variant={'h4'}
                    color={'textSecondary'}
                  ></Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item md={3} xs={12}>
              <Box border={'var(--color-border)'} borderRadius={1.5}></Box>
            </Grid>
          </Grid>
          <Grid item md={4} xs={12}>
            <Box
              border={'var(--color-border) 1px solid'}
              borderRadius={1.5}
              display={'flex'}
              flexDirection={'column'}
              justifyContent={'stretch'}
              paddingY={3}
            >
              <MenuBtnStyled
                variant={'outlined'}
                size={'large'}
                className={`vaultBtn  ${isMobile ? 'isMobile' : ''}`}
                fullWidth
                endIcon={<ConvertToIcon fontSize={'medium'} color={'inherit'} />}
                onClick={(e) => {
                  // TODO
                }}
              >
                <Typography
                  component={'span'}
                  variant={'inherit'}
                  color={'inherit'}
                  display={'inline-flex'}
                  alignItems={'center'}
                  lineHeight={'1.2em'}
                  sx={{
                    textIndent: 0,
                    textAlign: 'left',
                  }}
                >
                  <LoadIcon color={'inherit'} fontSize={'inherit'} sx={{ marginRight: 1 / 2 }} />
                  {t('labelVaultLoadBtn')}
                </Typography>
              </MenuBtnStyled>
              <MenuBtnStyled
                variant={'outlined'}
                size={'large'}
                className={`vaultBtn  ${isMobile ? 'isMobile' : ''}`}
                fullWidth
                endIcon={<ConvertToIcon fontSize={'medium'} color={'inherit'} />}
                onClick={(e) => {
                  // TODO
                }}
              >
                <Typography
                  component={'span'}
                  variant={'inherit'}
                  color={'inherit'}
                  display={'inline-flex'}
                  alignItems={'center'}
                  lineHeight={'1.2em'}
                  sx={{
                    textIndent: 0,
                    textAlign: 'left',
                  }}
                >
                  <MarginIcon color={'inherit'} fontSize={'inherit'} sx={{ marginRight: 1 / 2 }} />
                  {t('labelVaultAddBtn')}
                </Typography>
              </MenuBtnStyled>
              <MenuBtnStyled
                variant={'outlined'}
                size={'large'}
                className={`vaultBtn  ${isMobile ? 'isMobile' : ''}`}
                fullWidth
                endIcon={<ConvertToIcon fontSize={'medium'} color={'inherit'} />}
                onClick={(e) => {
                  // TODO
                }}
              >
                <Typography
                  component={'span'}
                  variant={'inherit'}
                  color={'inherit'}
                  display={'inline-flex'}
                  alignItems={'center'}
                  lineHeight={'1.2em'}
                  sx={{
                    textIndent: 0,
                    textAlign: 'left',
                  }}
                >
                  <VaultTradeIcon
                    color={'inherit'}
                    fontSize={'inherit'}
                    sx={{ marginRight: 1 / 2 }}
                  />
                  {t('labelVaultTradeBtn')}
                </Typography>
              </MenuBtnStyled>
              <MenuBtnStyled
                variant={'outlined'}
                size={'large'}
                className={`vaultBtn  ${isMobile ? 'isMobile' : ''}`}
                fullWidth
                endIcon={<ConvertToIcon fontSize={'medium'} color={'inherit'} />}
                onClick={(e) => {
                  // TODO
                }}
              >
                <Typography
                  component={'span'}
                  variant={'inherit'}
                  color={'inherit'}
                  display={'inline-flex'}
                  alignItems={'center'}
                  lineHeight={'1.2em'}
                  sx={{
                    textIndent: 0,
                    textAlign: 'left',
                  }}
                >
                  <CloseOutIcon
                    color={'inherit'}
                    fontSize={'inherit'}
                    sx={{ marginRight: 1 / 2 }}
                  />
                  {t('labelVaultRedeemBtn')}
                </Typography>
              </MenuBtnStyled>
            </Box>
          </Grid>
        </Grid>
        <Box flex={1} display={'flex'} flexDirection={'column'}>
          <VaultAssetsTable {...assetPanelProps} />
        </Box>
      </Container>
    </Box>
  )
}
