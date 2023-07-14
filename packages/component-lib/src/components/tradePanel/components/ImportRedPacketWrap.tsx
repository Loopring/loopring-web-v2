import { Trans } from 'react-i18next'
import { Box, Typography } from '@mui/material'
import { QRCodeUpload } from '../../basic-lib/panel/QRCodeUpload'
import React from 'react'

export const ImportRedPacketWrap = React.forwardRef(({}, _ref: React.ForwardedRef<any>) => {
  // @ts-ignore
  return (
    <Box
      // className={walletMap ? "" : "loading"}
      display={'flex'}
      flex={1}
      flexDirection={'column'}
      padding={5 / 2}
      alignItems={'stretch'}
    >
      <Typography
        component={'p'}
        variant={'h5'}
        display={'inline-flex'}
        color={'var(--color-text-secondary)'}
        marginBottom={1}
        textAlign={'center'}
        justifyContent={'center'}
      >
        <Trans i18nKey={'labelImportRedPacket'}>Import QR code to receive red packet</Trans>
      </Typography>
      <Box display={'flex'} flex={1}>
        <QRCodeUpload ref={_ref} />
      </Box>
    </Box>
  )
})
