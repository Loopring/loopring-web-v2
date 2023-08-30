import { Box, Container } from '@mui/material'
import React from 'react'
import { SoursURL, TradeBtnStatus } from '@loopring-web/common-resources'
import { BoxBannerStyle, Button, useSettings } from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import { useAccountInfo } from '../components/useAccountInfo'

export const VaultHomePanel = () => {
  const { isMobile } = useSettings()
  const { t } = useTranslation()
  const { btnStatus, onBtnClick, btnLabel, vaultAccountInfo } = useAccountInfo()
  return (
    <Box flex={1} display={'flex'} flexDirection={'column'}>
      <BoxBannerStyle
        className={isMobile ? 'mobile' : ''}
        backGroundUrl={SoursURL + '/images/any.webp'}
        direction={'right'}
      >
        <Container>
          <Box className={'bg'} marginY={3} display={'flex'}>
            <Box width={isMobile ? '100%' : '65%'}>
              <Box marginY={2}>
                <Button
                  size={'medium'}
                  onClick={onBtnClick}
                  loading={'false'}
                  variant={'contained'}
                  sx={{ minWidth: 'var(--walletconnect-width)' }}
                  disabled={
                    btnStatus === TradeBtnStatus.DISABLED || btnStatus === TradeBtnStatus.LOADING
                  }
                >
                  {btnLabel}
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </BoxBannerStyle>
    </Box>
  )
}
