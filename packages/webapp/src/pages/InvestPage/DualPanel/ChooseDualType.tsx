import { Avatar, Box, Grid, Typography } from '@mui/material'
import { DualInvestmentLogo, DualViewType, SoursURL } from '@loopring-web/common-resources'
import { Button, MenuBtnStyled, useSettings } from '@loopring-web/component-lib'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const ChooseDualTypeContent = [
  {
    icon: (
      <Avatar
        alt={'sell-high'}
        sx={{
          width: 80,
          height: 80,
        }}
        src={SoursURL + '/svg/sell-high.svg'}
      />
    ),
    type: DualViewType.DualGain,
    titleKey: 'labelCoverGain',
    desKey: 'labelCoverGainDes',
  },
  {
    icon: (
      <Avatar
        alt={'buy-low'}
        sx={{
          width: 80,
          height: 80,
        }}
        src={SoursURL + '/svg/buy-low.svg'}
      />
    ),
    type: DualViewType.DualDip,
    titleKey: 'labelDip',
    desKey: 'labelDipDes',
  },

  {
    icon: (
      <DualInvestmentLogo
        style={{
          width: 100,
          height: 100,
        }}
      />
    ),
    type: DualViewType.All,
    titleKey: 'labelDualMerge',
    desKey: 'labelDualMergeDes',
  },
]
export const ChooseDualType = ({ onSelect }: { onSelect: (props: DualViewType) => void }) => {
  const { isMobile } = useSettings()
  const { t } = useTranslation()
  return (
    <Grid
      container
      flex={1}
      display={'flex'}
      spacing={2}
      flexDirection={isMobile ? 'column' : 'row'}
    >
      {ChooseDualTypeContent.map((item) => {
        return (
          <Grid item xs={6} md={4} key={item.type} display={'flex'} justifyContent={'center'}>
            <MenuBtnStyled
              variant={'outlined'}
              sx={{
                width: 'var(--dual-type-width)',
                height: '320px',
                flexDirection: 'column',
                justifyContent: 'space-around',
              }}
              onClick={() => onSelect(item.type)}
            >
              <Typography component={'span'} display={'inline-flex'}>
                {item.icon}
              </Typography>
              <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
                <Typography
                  variant={'h5'}
                  component={'span'}
                  display={'inline-flex'}
                  color={'textPrimary'}
                  textAlign={'center'}
                >
                  {t(item.titleKey)}
                </Typography>
                <Typography
                  variant={'body1'}
                  component={'span'}
                  display={'inline-flex'}
                  color={'textSecondary'}
                  textAlign={'center'}
                  marginBottom={2}
                >
                  {t(item.desKey)}
                </Typography>
                <Box width={'100%'}>
                  <Button variant={'contained'} fullWidth color={'primary'} size={'medium'}>
                    {t('labelDualInvestGuid')}
                  </Button>
                </Box>
              </Box>
            </MenuBtnStyled>
          </Grid>
        )
      })}
    </Grid>
  )
}
