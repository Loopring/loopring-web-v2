import { useTheme } from '@emotion/react'
import { SoursURL } from '@loopring-web/common-resources'
import { Box, Link } from '@mui/material'
import { WithTranslation, withTranslation } from 'react-i18next'

export const DownloadPanel = withTranslation(['common', 'layout'])(
  ({ t, viewMoreUrl }: WithTranslation & { viewMoreUrl: string }) => {
    const theme = useTheme()
    return (
      <Box
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
        paddingX={2}
        paddingTop={2}
      >
        <Link
          marginBottom={1}
          target='_blank'
          rel='noopener noreferrer'
          href='https://play.google.com/store/apps/details?id=loopring.defi.wallet'
        >
          <img height={56} src={`${SoursURL}images/google-play.png`} alt={'GooglePlay'} />
        </Link>
        <Link
          marginBottom={1}
          target='_blank'
          rel='noopener noreferrer'
          href='https://download.loopring.io/LoopringWallet.apk'
        >
          <img height={56} src={`${SoursURL}images/android-apk.png`} alt={'Android'} />
        </Link>
        <Link
          marginBottom={1}
          target='_blank'
          rel='noopener noreferrer'
          href='https://apps.apple.com/us/app/loopring-smart-wallet/id1550921126'
        >
          <img height={56} src={`${SoursURL}images/apple-app-store.png`} alt={'AppStore'} />
        </Link>
        <Link
          marginBottom={1}
          target='_blank'
          rel='noopener noreferrer'
          href={viewMoreUrl}
          style={{ cursor: 'pointer' }}
          variant={'body1'}
          color={theme.colorBase.primary}
        >
          {t('labelDownloadViewMore')}
        </Link>
      </Box>
    )
  },
)
