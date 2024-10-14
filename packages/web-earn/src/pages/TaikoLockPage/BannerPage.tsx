import React from 'react'
import { Box, Typography, Link } from '@mui/material'
import { MaxWidthContainer } from '@loopring-web/component-lib'
import { useTheme } from '@emotion/react'
import { SoursURL } from '@loopring-web/common-resources'

const BannerPage: React.FC = () => {
  const theme = useTheme()
  return (
    <MaxWidthContainer>
      <Typography mt={10} variant='h3'>
        Taiko Farming
      </Typography>
      <Typography mt={3} variant='h4'>
        Earn Trailblazer points 5x faster by locking TAIKO and participating in Taiko Farming.
        Please note that TAIKO can only be unlocked after the end of Trailblazer Campaign Season 2.
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
              Worried about missing trading or earning opportunities when locking your valuable TAIKO?
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
              Loopring lets you mint lrTAIKO at a 1:1 ratio, allowing you to freely use it across
              all trading and earning options within Loopring DeFi. Plus, you’ll continue farming
              Trailblazer points.
              <Typography mt={4} variant='h4' color={'var(--color-text-secondary)'}>
                The lrTAIKO mint feature is coming soon!
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
              The first DeFi integration will be with Portal, allowing you to use lrTAIKO as
              collateral for leveraged trading on select hot tokens. You’ll be able to go LONG or
              SHORT on your favorite tokens based on market conditions.
            </Typography>
          </Box>
        </Box>
        <Box mt={12.5}>
          <Typography variant='h4'>
            Stay tuned for the upcoming release—more exciting use cases are on the way!
          </Typography>
          <Typography mt={2} variant='h4'>
            Take a tour to explore all the current Loopring DeFi use cases{' '}
            <Link href='#' color='secondary'>
              {'<here>'}
            </Link>
            . You can deposit assets into Loopring DeFi anytime and start enjoying the experience!
          </Typography>
        </Box>
      </Box>
    </MaxWidthContainer>
  )
}

export default BannerPage
