import styled from '@emotion/styled'
import { Box, Divider, Typography } from '@mui/material'
import React from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import { useSettings, MaxWidthContainer } from '@loopring-web/component-lib'
import { useForceWithdraw } from '@loopring-web/core'
import { useTheme } from '@emotion/react'
import { useHistory } from 'react-router-dom'
import { NotificationIcon } from '@loopring-web/common-resources'

const StylePaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;

  .content {
    width: 420px;
  }

  &.isMobile {
    .content {
      flex: 1;
      width: var(--swap-box-width);
    }
  }
`

export const NotificationPanel = withTranslation(['common', 'layout'])(({ t }: WithTranslation) => {
  const { isMobile } = useSettings()
  const history = useHistory()
  const { forceWithdrawProps } = useForceWithdraw()
  const theme = useTheme()
  const extendsProps = isMobile ? { _width: 420 } : { _width: 'auto' }
  return (
    <Box flex={1} display={'flex'} flexDirection={'column'}>
      <MaxWidthContainer
        background={'var(--color-pop-bg)'}
        display={'flex'}
        justifyContent={'space-between'}
        paddingY={2}
      >
        <Typography component={'h3'} variant={'h5'} display={'inline-flex'} alignItems={'center'}>
          <NotificationIcon color={'inherit'} sx={{ marginRight: 1 }} /> {t('labelNoticeTitle')}
        </Typography>
      </MaxWidthContainer>
      <Divider />
      <MaxWidthContainer
        // background={'var(--color-pop-bg)'}
        display={'flex'}
        justifyContent={'space-between'}
        paddingY={2}
      >
        <Box flex={1} display={'flex'} flexDirection={'column'}>
          12
        </Box>
      </MaxWidthContainer>
    </Box>
  )
})
