import React from 'react'
import { Box, Typography } from '@mui/material'
import { useRouteMatch } from 'react-router-dom'
import { useToast, ViewAccountTemplate } from '@loopring-web/core'
import { RedPacketMarketPanel } from './RedPacketMarketPanel'
import { CreateRedPacketUIPanel } from './CreateRedPacketPanel'
import { MyRedPacketPanel } from './MyRedPacketPanel'
import { TOAST_TIME } from '@loopring-web/common-resources'
import { Toast, ToastType, useSettings } from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'

export const RedPacketPage = () => {
  let match: any = useRouteMatch('/redPacket/:item')
  const selected = match?.params.item ?? 'markets'
  const { toastOpen, setToastOpen, closeToast } = useToast()
  const { isMobile } = useSettings()
  const { t } = useTranslation()
  const reaPacketRouter = React.useMemo(() => {
    switch (selected) {
      case 'create':
        return <CreateRedPacketUIPanel />
      case 'records':
        return <MyRedPacketPanel setToastOpen={setToastOpen} />
      case 'markets':
        return <RedPacketMarketPanel setToastOpen={setToastOpen} />
      default:
        ;<RedPacketMarketPanel setToastOpen={setToastOpen} />
    }
  }, [selected])

  const activeView = React.useMemo(
    () => (
      <>
        <Toast
          alertText={toastOpen?.content ?? ''}
          severity={toastOpen?.type ?? ToastType.success}
          open={toastOpen?.open ?? false}
          autoHideDuration={TOAST_TIME}
          onClose={closeToast}
        />
        <Box
          display={'flex'}
          alignItems={'stretch'}
          flexDirection={'column'}
          marginTop={0}
          flex={1}
        >
          {reaPacketRouter}
        </Box>
      </>
    ),
    [reaPacketRouter],
  )
  return (
    <>
      {isMobile ? (
        <Typography component={'h3'}>{t('labelRedPacketNotSupport')}</Typography>
      ) : (
        <ViewAccountTemplate activeViewTemplate={activeView} />
      )}
    </>
  )
}
