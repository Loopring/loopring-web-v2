import React from 'react'
import { Box, Typography, Link } from '@mui/material'
import { MaxWidthContainer } from '@loopring-web/component-lib'
import { useTheme } from '@emotion/react'
import { SoursURL } from '@loopring-web/common-resources'
import { useTranslation } from 'react-i18next'

const BannerPage: React.FC = () => {
  const theme = useTheme()
  const { t } = useTranslation('common')

  return (
    <MaxWidthContainer>
      <Typography mt={10} variant='h3'>
        {t('labelTaikoFarmingBannerTitle')}
      </Typography>
      <Typography mt={3} variant='h4'>
        {t('labelTaikoFarmingBannerDes')}
      </Typography>

      <Box
        sx={{
          backgroundColor: 'var(--color-box-third)',
          borderRadius: '48px',
          justifyContent: 'center',
          px: '12%',
          py: 12.75,
          mt: 7,
          mb: 15,
        }}
      >
        <Box display={'flex'} flexDirection={'column'}>
          <Box mb={16} display={'flex'} flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>
            <Box width={'45%'} display={'flex'} justifyContent={'center'}>
              <Box
                component={'img'}
                width={'70%'}
                src={`${SoursURL}images/web-earn/taiko_farming_intro1_${theme.mode}.png`}
              />
            </Box>
            <Typography width={'45%'} variant='h4'>
              {t('labelTaikoFarmingQuestion')}
            </Typography>
          </Box>
          <Box mb={16} display={'flex'} flexDirection={'row-reverse'} alignItems={'center'} justifyContent={'space-between'}>
            <Box width={'45%'} display={'flex'} justifyContent={'center'}>
              <Box
                component={'img'}
                width={'90%'}
                src={`${SoursURL}images/web-earn/taiko_farming_intro2_${theme.mode}.png`}
              />
            </Box>
            <Typography width={'45%'} variant='h4'>
              {t('labelTaikoFarmingExplanation')}
              <Typography mt={4} variant='h4' color={'var(--color-text-secondary)'}>
                {t('labelTaikoFarmingComingSoon')}
              </Typography>
            </Typography>
          </Box>
          <Box display={'flex'} flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>
            <Box width={'45%'} display={'flex'} justifyContent={'center'}>
              <Box
                component={'img'}
                width={'90%'}
                src={`${SoursURL}images/web-earn/taiko_farming_intro3_${theme.mode}.png`}
              />
            </Box>
            <Typography width={'45%'} variant='h4'>
              {t('labelTaikoFarmingPortalIntegration')}
            </Typography>
          </Box>
        </Box>
        <Box mt={12.5}>
          <Typography variant='h4'>
            {t('labelTaikoFarmingStayTuned')}
          </Typography>
          <Typography mt={2} variant='h4'>
            {t('labelTaikoFarmingExploreUseCase')}
            <Link href='#' color='secondary'>
              {t('labelTaikoFarmingHereLink')}
            </Link>
            {t('labelTaikoFarmingDepositAnytime')}
          </Typography>
        </Box>
      </Box>
    </MaxWidthContainer>
  )
}

export default BannerPage
