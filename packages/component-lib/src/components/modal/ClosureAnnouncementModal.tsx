import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  // styled,
  // useTheme,
} from '@mui/material'
import { withTranslation, WithTranslation } from 'react-i18next'
import { AlertIcon, SoursURL } from '@loopring-web/common-resources'
import styled from '@emotion/styled'
import { useTheme } from '@emotion/react'
// styled

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.unit * 2,
    maxWidth: '480px',
    width: '90vw',
    maxHeight: '90vh',
    overflow: 'hidden',
  },
}))

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.colorBase.primary} 0%, ${theme.colorBase.warning} 100%)`,
  color: theme.colorBase.textPrimary,
  padding: theme.unit * 2,
  display: 'flex',
  alignItems: 'center',
  gap: theme.unit,
  fontSize: '1.25rem',
  fontWeight: 600,
}))

const StyledDialogContent = styled(Box)(({ theme }) => ({

  paddingTop: theme.unit * 5,
  paddingBottom: theme.unit * 2,
  paddingLeft: theme.unit * 4,
  paddingRight: theme.unit * 4,
  maxHeight: '85vh',
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: theme.colorBase.divide,
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.colorBase.textSecondary,
    borderRadius: '3px',
  },
}))

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.unit * 2,
  borderTop: `1px solid ${theme.colorBase.divide}`,
}))

const HighlightDate = styled('span')(({ theme }) => ({
  backgroundColor: theme.colorBase.warning,
  color: theme.colorBase.textPrimary,
  padding: '2px 8px',
  borderRadius: '4px',
  fontWeight: 600,
  fontSize: '0.9rem',
}))

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 600,
  color: theme.colorBase.textPrimary,
  marginBottom: theme.unit,
  display: 'flex',
  alignItems: 'center',
  gap: theme.unit,
}))

const BulletList = styled('ul')(({ theme }) => ({
  paddingLeft: theme.unit,
  margin: `${theme.unit}px 0`,
  listStyle: 'none',
  '& li': {
    marginBottom: theme.unit * 0.5,
    color: theme.colorBase.textSecondary,
    lineHeight: 1.5,
    position: 'relative',
    paddingLeft: theme.unit,
    fontSize: '1.3rem',
  },
  '& li::before': {
    content: '"•"',
    color: theme.colorBase.textSecondary,
    position: 'absolute',
    left: 0,
  },
}))

const NetworkSection = styled(Box)(({ theme }) => ({
  backgroundColor: theme.colorBase.box,
  borderRadius: theme.unit,
  marginBottom: theme.unit * 2,
}))

export const ClosureAnnouncementModal = withTranslation('common')(
  ({
    t,
    open,
    handleClose,
  }: WithTranslation & {
    open: boolean
    handleClose: () => void
  }) => {
    const theme = useTheme()

    return (
      <StyledDialog
        open={open}
        keepMounted
        onClose={() => {}} // Prevent closing on outside click
        disableEscapeKeyDown // Prevent closing with Escape key
        aria-describedby='closure-announcement-dialog'
      >
        <StyledDialogContent position={'relative'}>
          <Typography variant='h2' mb={4}>
            Loopring DeFi{' '}
            <Typography
              variant='h2'
              bgcolor={'var(--color-primary)'}
              component={'span'}
              borderRadius={'17.75px'}
              color={theme.colorBase.white}
              px={1}
            >
              Closure
            </Typography>{' '}
            Announcement
          </Typography>
          <Box width={'150px'} sx={{
            position: 'absolute',
            top: 5,
            right: 0
          }} component={'img'} src={SoursURL + 'svg/closure_logo.svg'}/>
          <Typography variant='body1' sx={{ mb: 2, color: theme.colorBase.textSecondary, fontSize: '1.4rem' }}>
            We have made the difficult decision to sunset the Loopring DeFi business, with the final
            closure date set for <HighlightDate>July 31st, 2025</HighlightDate> on top of the
            Loopring DeFi portal technology—many of which have been well received by our users.
            However, one of the core challenges we've faced is scalability— specifically, how to
            make these services fully trustless and decentralized.
          </Typography>

          <Typography variant='body1' sx={{ mb: 2, color: theme.colorBase.textSecondary, fontSize: '1.4rem' }}>
            Currently, many Loopring DeFi products aim to bridge CeFi and DeFi, requiring
            participation from market makers operating in a centralized technology. While if
            Loopring alone serves as the primary market maker, these services cannot scale to
            compete with leading DeFi protocols. While the user experience and design of Loopring
            DeFi are compelling, the underlying structure makes it difficult to enable broader,
            permissionless participation in a fully decentralized, non-custodial manner.
          </Typography>

          <Typography variant='body1' sx={{ mb: 2, color: theme.colorBase.textSecondary, fontSize: '1.4rem' }}>
            After a thorough review, we have decided to shut down all Loopring DeFi services,
            including:
          </Typography>

          <BulletList>
            <Box sx={{'&&': {color: theme.colorBase.textPrimary}} } component={'li'}>Dual Investment</Box>
            <Box sx={{'&&': {color: theme.colorBase.textPrimary}} } component={'li'}>Portal</Box>
            <Box sx={{'&&': {color: theme.colorBase.textPrimary}} } component={'li'}>Block Trade</Box>
            <Box sx={{'&&': {color: theme.colorBase.textPrimary}} } component={'li'}>ETH Staking</Box>
          </BulletList>

          <Typography variant='body1' sx={{ mb: 3, color: theme.colorBase.textSecondary, fontSize: '1.4rem' }}>
            This allows us to allocate all resources to focus on improving the Loopring Layer2
            network.
          </Typography>

          <SectionTitle>📅 After the Sunset Date (July 31, 2025)</SectionTitle>

          <Box sx={{ mb: 3 }}>
            <Typography variant='h6' sx={{ mb: 1, color: theme.colorBase.textPrimary, fontSize: '1.5rem' }}>
              🔷 For Existing Positions:
            </Typography>

            <Typography variant='body2' sx={{ mb: 1,color: theme.colorBase.textPrimary, fontWeight: 600, fontSize: '1.3rem' }}>
              1. Dual Investment:
            </Typography>
            <BulletList>
              <li>No new subscriptions will be allowed after the sunset date.</li>
              <li>All existing positions will be settled before July 31st.</li>
            </BulletList>

            <Typography variant='body2' sx={{ mb: 1,color: theme.colorBase.textPrimary, fontWeight: 600, fontSize: '1.3rem' }}>
              2. Portal:
            </Typography>
            <BulletList>
              <li>All active positions will be force-closed after the sunset date.</li>
            </BulletList>

            <Typography variant='body2' sx={{ mb: 1,color: theme.colorBase.textPrimary, fontWeight: 600, fontSize: '1.3rem' }}>
              3. ETH Staking:
            </Typography>
            <BulletList>
              <li>No new subscriptions will be accepted.</li>
              <li>Users holding wsETH, rETH, or CiETH can still:</li>
              <Box pl={2.5}>
                <li >
                Redeem directly on Loopring Layer 2, or Withdraw to Ethereum Layer 1 and interact
                directly with Lido, Rocket Pool, or the CIAN protocol for redemption.
              </li>
              </Box>
              
            </BulletList>
          </Box>

          <NetworkSection>
            <SectionTitle>🌐 For Users on Taiko and Base Networks:</SectionTitle>
            <Typography variant='body1' sx={{ mb: 2, color: theme.colorBase.textPrimary, fontSize: '1.4rem' }}>
              After July 31st, Loopring will cease all services on both the Taiko and Base networks.
            </Typography>
            <BulletList>
              <li>
                Users who do not withdraw their assets from their Loopring DeFi (Layer 3) account
                before the sunset date will have their funds automatically force-withdrawn to the
                upper layer (Taiko or Base).
              </li>
            </BulletList>
            <Typography
              variant='body2'
              sx={{ mt: 1, fontStyle: 'italic', color: theme.colorBase.textTertiary, fontSize: '1.2rem' }}
            >
              Note: Accounts with dust balances (i.e., less than $0.10 USD) will not trigger a
              force-withdrawal operation.
            </Typography>
          </NetworkSection>

          <NetworkSection>
            <SectionTitle>🌐 For Ethereum Users:</SectionTitle>
            <Typography variant='body1' sx={{ mb: 2, color: theme.colorBase.textSecondary, fontSize: '1.4rem' }}>
              Loopring Layer 2 will continue to operate as usual. All core features—including the
              fully decentralized exchange—will remain functional.
            </Typography>
            <BulletList>
              <li>All assets, including tokens and NFTs, remain safe and intact on Layer 2.</li>
              <li>
                However, all Loopring DeFi features will be permanently disabled after the sunset
                date.
              </li>
            </BulletList>
          </NetworkSection>

          <Typography variant='body1' sx={{ mt: 3, mb: 2, color: theme.colorBase.textSecondary, fontSize: '1.4rem' }}>
            Thank you to all our users and community members who have supported Loopring DeFi. While
            this chapter is closing, we remain committed to building and supporting decentralized
            infrastructure that empowers users and developers alike.
          </Typography>

          <Typography variant='body1' sx={{ color: theme.colorBase.textSecondary, fontSize: '1.4rem' }}>
            If you have any questions, please reach out to our support channels.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
            <Button
              variant='contained'
              color='primary'
              onClick={handleClose}
              sx={{
                minWidth: '200px',
                height: '40px',
                borderRadius: '6px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1.1rem',
              }}
            >
              I Know
            </Button>
          </Box>
        </StyledDialogContent>
      </StyledDialog>
    )
  },
)