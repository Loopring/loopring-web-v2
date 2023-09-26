import { Box, Grid, Typography } from '@mui/material'
import {
  DualDownIcon,
  DualConvertIcon,
  DualUpIcon,
  DualViewType,
  LOOPRING_DOCUMENT,
  DualInvestmentLogo,
} from '@loopring-web/common-resources'
import { Button, MenuBtnStyled, useSettings } from '@loopring-web/component-lib'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from '@emotion/styled'
import { containerColors, MaxWidthContainer } from '../index'
import { useHistory } from 'react-router-dom'
import { useTheme } from '@emotion/react'

export const ChooseDualTypeContent = [
  {
    icon: (
      <DualUpIcon
        style={{
          width: 156,
          height: 156,
        }}
      />
    ),
    type: DualViewType.DualGain,
    titleKey: 'labelCoverGain',
    desKey: 'labelCoverGainDes',
  },
  {
    icon: (
      <DualDownIcon
        style={{
          width: 156,
          height: 156,
        }}
      />
    ),
    type: DualViewType.DualDip,
    titleKey: 'labelDip',
    desKey: 'labelDipDes',
  },

  {
    icon: (
      <DualConvertIcon
        style={{
          width: 156,
          height: 156,
        }}
      />
    ),
    type: DualViewType.All,
    titleKey: 'labelDualMerge',
    desKey: 'labelDualMergeDes',
  },
]
export const TypographyStyle = styled(Typography)`
  svg {
    fill: ${({ theme }) => theme.colorBase.textSecondary};
  }
` as typeof Typography
export const ChooseDualType = ({ onSelect }: { onSelect: (props: DualViewType) => void }) => {
  const { isMobile } = useSettings()
  const theme = useTheme()
  const history = useHistory()
  const { t } = useTranslation()
  return (
    <>
      <MaxWidthContainer
        display={'flex'}
        justifyContent={'space-between'}
        background={containerColors[0]}
        height={isMobile ? 60 * theme.unit : 30 * theme.unit}
        alignItems={'center'}
      >
        <Box paddingY={7}>
          <Typography marginBottom={2} fontSize={'38px'} variant={'h1'}>
            {t('labelInvestDualTitle')}
          </Typography>
          <Box display={'flex'} alignItems={'center'}>
            <Button
              onClick={() => history.push('/invest/balance')}
              sx={{ width: isMobile ? 36 * theme.unit : 18 * theme.unit }}
              variant={'contained'}
            >
              {t('labelInvestMyDual')}
            </Button>

            <Button
              onClick={() => {
                window.open(`${LOOPRING_DOCUMENT}dual_investment_tutorial_en.md`, '_blank')
                window.opener = null
              }}
              sx={{ marginLeft: 1.5 }}
              variant={'contained'}
            >
              {t('labelInvestDualTutorial')}
            </Button>
          </Box>
        </Box>
        {!isMobile && <DualInvestmentLogo />}
      </MaxWidthContainer>
      <MaxWidthContainer background={containerColors[1]} minHeight={'70vh'} paddingY={3}>
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
                    height: '380px',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                  }}
                  onClick={() => onSelect(item.type)}
                >
                  <TypographyStyle component={'span'} display={'inline-flex'}>
                    {item.icon}
                  </TypographyStyle>
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
      </MaxWidthContainer>
    </>
  )
}
