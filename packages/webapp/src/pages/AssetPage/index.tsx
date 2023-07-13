import { useRouteMatch } from 'react-router-dom'

import { Box } from '@mui/material'
import { AssetTitleMobile, useSettings } from '@loopring-web/component-lib'
import { AccountStatus, subMenuLayer2 } from '@loopring-web/common-resources'

import HistoryPanel from './HistoryPanel'
import React from 'react'
import { useAccount, ViewAccountTemplate, walletLayer2Service } from '@loopring-web/core'
import { useGetAssets } from './AssetPanel/hook'
import { AssetPanel } from './AssetPanel'

export * from './HistoryPanel/hooks'
export const subMenu = subMenuLayer2

export const AssetPage = () => {
  let match: any = useRouteMatch('/l2assets/:item')
  const selected = match?.params.item ?? 'assets'
  const { assetTitleProps, assetTitleMobileExtendProps, assetBtnStatus, ...assetPanelProps } =
    useGetAssets()
  const { account } = useAccount()

  React.useEffect(() => {
    if (account.readyState === AccountStatus.ACTIVATED) {
      walletLayer2Service.sendUserUpdate()
    }
  }, [])
  const layer2Router = React.useMemo(() => {
    switch (selected.toLowerCase()) {
      case 'history':
        return <HistoryPanel />
      case 'assets':
      default:
        return (
          <AssetPanel
            assetTitleProps={assetTitleProps}
            assetPanelProps={{ ...assetPanelProps, assetBtnStatus }}
          />
        )
    }
  }, [selected, assetTitleProps, assetPanelProps, assetBtnStatus])
  const { isMobile } = useSettings()
  const activeView = React.useMemo(
    () => (
      <>
        <Box
          display={'flex'}
          alignItems={'stretch'}
          flexDirection={'column'}
          marginTop={0}
          flex={1}
        >
          {isMobile && (
            <AssetTitleMobile
              assetBtnStatus={assetBtnStatus}
              {...{ ...assetTitleProps, ...assetTitleMobileExtendProps }}
            />
          )}
          {layer2Router}
        </Box>
      </>
    ),
    [assetTitleMobileExtendProps, assetTitleProps, isMobile, assetBtnStatus, layer2Router],
  )
  return <ViewAccountTemplate activeViewTemplate={activeView} />
  // <>{viewTemplate}</>;
}
