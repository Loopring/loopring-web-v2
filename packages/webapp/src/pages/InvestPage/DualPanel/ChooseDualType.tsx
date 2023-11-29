import { Box, Grid, Typography } from '@mui/material'
import {
  DualViewType,
  LOOPRING_DOCUMENT,
  DualInvestmentLogo,
  RouterPath,
  InvestRouter,
  InvestType,
  SwapSettingIcon,
} from '@loopring-web/common-resources'
import {
  Button,
  MenuBtnStyled,
  useSettings,
  MaxWidthContainer,
  IconButtonStyled,
} from '@loopring-web/component-lib'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from '@emotion/styled'
import { containerColors } from '../index'
import { useHistory } from 'react-router-dom'
import { useTheme } from '@emotion/react'
import { confirmation, useDualMap } from '@loopring-web/core'
import { ChooseDualTypeContentType } from './hook'

export const TypographyStyle = styled(Typography)`
  svg {
    fill: ${({ theme }) => theme.colorBase.textSecondary};
  }
` as typeof Typography
export const ChooseDualType = ({
  onSelect,
  chooseDualTypeContent,
}: {
  chooseDualTypeContent: ChooseDualTypeContentType[]
  onSelect: (props: DualViewType) => void
}) => {
  const { isMobile } = useSettings()
  const theme = useTheme()
  const history = useHistory()
  const { t } = useTranslation()
  const { setShowAutoDefault } = confirmation.useConfirmation()
  return (
    <>
      <MaxWidthContainer
        sx={{ flexDirection: 'row' }}
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
              onClick={() =>
                history.push(`${RouterPath.invest}/${InvestRouter[InvestType.MyBalance]}`)
              }
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
              sx={{ marginLeft: 1.5, height: 40 }}
              variant={'outlined'}
              color={'inherit'}
            >
              {t('labelInvestDualTutorial')}
            </Button>
            <IconButtonStyled
              onClick={(e) => {
                setShowAutoDefault(true)
              }}
              sx={{ backgroundColor: 'var(--field-opacity)' }}
              className={'switch outlined'}
              aria-label='to set dual auto switch'
              size={'large'}
            >
              <SwapSettingIcon htmlColor={'var(--color-text-primary)'} />
            </IconButtonStyled>
            {/* <Button*/}
            {/*   onClick={() => {*/}
            {/*   window.open(`${LOOPRING_DOCUMENT}dual_investment_tutorial_en.md`, '_blank')*/}
            {/*   window.opener = null*/}
            {/* }}*/}
            {/*   sx={{ marginLeft: 1.5, height: 40 }}*/}
            {/*   variant={'outlined'}*/}
            {/*   color={'inherit'}*/}
            {/*   >*/}
            {/*     {t('labelInvestDualTutorial')}*/}
            {/*</Button>*/}
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
          {chooseDualTypeContent?.map((item) => {
            return (
              <Grid
                item
                xs={6}
                md={12 / chooseDualTypeContent.length}
                key={item.type}
                display={'flex'}
                justifyContent={'center'}
              >
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
                  <Box display={'flex'} flexDirection={'column'} alignItems={'left'} marginTop={3}>
                    <Typography
                      variant={'h5'}
                      component={'span'}
                      display={'inline-flex'}
                      color={'textPrimary'}
                      textAlign={'left'}
                      sx={{ textIndent: 0 }}
                    >
                      {t(item.titleKey)}
                    </Typography>
                    <Typography
                      sx={{ textIndent: 0 }}
                      variant={'body1'}
                      component={'span'}
                      display={'inline-flex'}
                      color={'textSecondary'}
                      textAlign={'left'}
                    >
                      {t(item.desKey)}
                    </Typography>
                  </Box>
                  <TypographyStyle component={'span'} display={'inline-flex'}>
                    {item.icon}
                  </TypographyStyle>
                  <Button
                    sx={{ marginBottom: 3 }}
                    variant={'contained'}
                    fullWidth
                    color={'primary'}
                    size={'medium'}
                  >
                    {t('labelDualInvestGuid')}
                  </Button>
                </MenuBtnStyled>
              </Grid>
            )
          })}
        </Grid>
      </MaxWidthContainer>
    </>
  )
}
