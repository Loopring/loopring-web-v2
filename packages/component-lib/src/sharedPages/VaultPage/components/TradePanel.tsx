import { Box, Container, Typography } from '@mui/material'
import React from 'react'
import { VaultAccountInfoStatus } from '@loopring-web/core'
import { useSettings } from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'

export const VaultTradePanel = ({
  vaultAccountInfo,
}: {
  vaultAccountInfo: VaultAccountInfoStatus
}) => {
  const { isMobile } = useSettings()
  const { t } = useTranslation()
  
  // 保留对 vaultAccountInfo 的引用，但通过注释标记将来使用
  // const _vaultAccountInfo = vaultAccountInfo

  return (
    <Box flex={1} display={'flex'} flexDirection={'column'}>
      <Container 
        maxWidth='lg'
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <Box
          display={'flex'}
          flexDirection={'column'}
          justifyContent={'flex-start'}
          alignItems={'center'}
          flex={1}
          marginTop={4}
        >
          <Typography variant="h4" component="div" marginBottom={2}>
            {t('labelVaultTradeTitle')}
          </Typography>
          <Typography variant="body1" marginBottom={4}>
            {t('coming soon')}
          </Typography>
          
          {/* 这里添加交易功能的具体内容 */}
          <Box
            bgcolor="var(--color-box-secondary)"
            borderRadius={2}
            padding={isMobile ? 2 : 4}
            width="100%"
            maxWidth={isMobile ? "100%" : 600}
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <Typography variant={isMobile ? "subtitle1" : "h6"} marginBottom={2}>
              {t('Trading Interface')}
            </Typography>
            <Typography variant="body2" color="textSecondary" textAlign="center">
              {t('Trade panel is under development. Check back soon for updates.')}
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
