import styled from '@emotion/styled'
import { Box, Button, Divider, Grid, Typography } from '@mui/material'
import React from 'react'
import { Trans, WithTranslation, withTranslation } from 'react-i18next'
import { useExportAccountInfo, useResetAccount } from './hook'
import { useOpenModals, useSettings, useToggle } from '@loopring-web/component-lib'
import { useAccount } from '@loopring-web/core'
import { useHistory } from 'react-router-dom'
import {
  ProfileIndex,
  MapChainId,
  ProfileKey,
  L1L2_NAME_DEFINED,
} from '@loopring-web/common-resources'

const StyledPaper = styled(Grid)`
  width: 100%;
  height: 100%;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`

const StyledDivider = styled(Divider)`
  margin: ${({ theme }) => theme.unit}px ${({ theme }) => (theme.unit * 5) / 2}px;
`

export const SecurityPanel = withTranslation(['common', 'layout'])(({ t }: WithTranslation) => {
  const { account } = useAccount()
  const { resetKeypair } = useResetAccount()
  const { setShowFeeSetting } = useOpenModals()
  const { exportAccount } = useExportAccountInfo()
  const history = useHistory()
  const { setShowAccount } = useOpenModals()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const { toggle } = useToggle()

  return (
    <StyledPaper container className={'MuiPaper-elevation2'} marginBottom={2}>
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
        <StyledDivider />
        <Box component={'section'} display={'flex'} flexDirection={'column'} padding={5 / 2}>
          <Grid container display={'flex'}>
            <Grid item xs={7}>
              <Typography variant={'h4'} color={'text.primary'} component={'h4'} marginBottom={1}>
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
        <StyledDivider />
        <Box component={'section'} display={'flex'} flexDirection={'column'} padding={5 / 2}>
          <Grid
            container
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'stretch'}
            alignItems={'flex-start'}
          >
            <Grid item xs={7} display={'flex'} flexDirection={'column'}>
              <Typography variant={'h4'} color={'text.primary'} component={'h4'} marginBottom={1}>
                {t('labelSettingFee')}
              </Typography>
              <Typography variant={'body1'} color={'text.secondary'} component={'p'}>
                {t('descriptionSettingFee')}
              </Typography>
            </Grid>
            <Grid
              item
              xs={5}
              display={'flex'}
              flexDirection={'column'}
              justifyContent={'flex-start'}
              alignItems={'flex-end'}
              alignSelf={'stretch'}
            >
              <Grid item>
                <Button
                  onClick={() => {
                    // exportAccInfo()
                    setShowFeeSetting({ isShow: true })
                  }}
                  variant={'outlined'}
                  size={'medium'}
                  color={'primary'}
                  disabled={false}
                >
                  {t('labelBtnEdit')}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Box>
        {ProfileIndex[network]?.includes(ProfileKey.forcewithdraw) && (
          <>
            <StyledDivider />
            <Box component={'section'} display={'flex'} flexDirection={'column'} padding={5 / 2}>
              <Grid
                container
                display={'flex'}
                flexDirection={'row'}
                justifyContent={'stretch'}
                alignItems={'flex-start'}
              >
                <Grid item xs={7} display={'flex'} flexDirection={'column'}>
                  <Typography
                    variant={'h4'}
                    color={'text.primary'}
                    component={'h4'}
                    marginBottom={1}
                  >
                    {t('labelForceWithdrawTitle')}
                  </Typography>
                  <Typography variant={'body1'} color={'text.secondary'} component={'p'}>
                    {t('labelForceWithdrawDes', {
                      layer2: L1L2_NAME_DEFINED[network].layer2,
                      l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
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
                  flexDirection={'column'}
                  justifyContent={'flex-start'}
                  alignItems={'flex-end'}
                  alignSelf={'stretch'}
                >
                  <Grid item>
                    <Button
                      onClick={() => {
                        // exportAccInfo()
                        setShowAccount({
                          isShow: false,
                          info: { lastFailed: undefined },
                        })
                        history.push(`/layer2/forcewithdraw`)
                      }}
                      variant={'outlined'}
                      size={'medium'}
                      color={'primary'}
                      disabled={false}
                    >
                      {t('labelForceWithdrawBtn')}
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </>
        )}
        <StyledDivider />
        {!!toggle?.isSupperUser?.length && (
          <Box component={'section'} display={'flex'} flexDirection={'column'} padding={5 / 2}>
            <Grid
              container
              display={'flex'}
              flexDirection={'row'}
              justifyContent={'stretch'}
              alignItems={'flex-start'}
            >
              <Grid item xs={7} display={'flex'} flexDirection={'column'}>
                <Typography component={'h3'} variant={'h4'} marginBottom={1}>
                  {t('labelSuperUserTitle')}
                </Typography>
                <Typography variant={'body1'} color={'text.secondary'} component={'p'}>
                  {t('labelFunctionList', {
                    loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                  })}
                  {toggle?.isSupperUser?.map((item: any, index: number) => {
                    return (
                      <Typography
                        variant={'body1'}
                        color={'text.secondary'}
                        component={'span'}
                        paddingLeft={1}
                      >
                        {item.toString() + (index + 1 != toggle?.isSupperUser?.length ? ', ' : '')}
                      </Typography>
                    )
                  })}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </Grid>
    </StyledPaper>
  )
})
