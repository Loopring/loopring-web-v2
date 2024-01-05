import { WithTranslation, withTranslation } from 'react-i18next'
import { Box, Tab } from '@mui/material'
import {
  AssetsTable,
  AssetTitle,
  AssetTitleProps,
  Tabs,
  useSettings,
} from '@loopring-web/component-lib'

import { useSystem, useTokenMap } from '@loopring-web/core'
import { AssetPanelProps, useAssetAction } from './hook'
import React from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import MyLiquidity from '../../InvestPage/MyLiquidityPanel'
import { MapChainId, SoursURL, TradeBtnStatus } from '@loopring-web/common-resources'
import { AssetL2TabEarnIndex, AssetTabIndex } from '../../../constant/router'
import { MaxWidthContainer, containerColors } from 'pages/InvestPage'
import { RowEarnConfig } from 'constant/setting'
import { useTheme } from '@emotion/react'

export const AssetPanel = withTranslation('common')(
  ({
    t,
    assetTitleProps,
    assetPanelProps: {
      assetsRawData,
      getTokenRelatedMarketArray,
      onSend,
      assetBtnStatus,
      onReceive,
      hideInvestToken,
      hideSmallBalances,
      allowTrade,
      setHideLpToken,
      setHideSmallBalances,
      // onTokenLockHold,
      // tokenLockDetail,
    },
    showRedpacketReddot,
    ...rest
  }: {
    showRedpacketReddot: boolean
    assetTitleProps: AssetTitleProps
    assetPanelProps: AssetPanelProps
  } & WithTranslation) => {
    const { disableWithdrawList } = useTokenMap()
    const { forexMap } = useSystem()
    const { isMobile, defaultNetwork } = useSettings()
    const match: any = useRouteMatch('/l2assets/:assets?/:item?')
    const [currentTab, setCurrentTab] = React.useState<AssetTabIndex>(AssetTabIndex.Tokens)
    const history = useHistory()
    const theme = useTheme()
    const { onTokenLockHold, tokenLockDetail } = useAssetAction()

    const handleTabChange = (value: AssetTabIndex) => {
      if (AssetL2TabEarnIndex[MapChainId[defaultNetwork]]?.includes(value)) {
        switch (value) {
          case AssetTabIndex.DualInvests:
            history.replace('/l2assets/assets/Invests')
            setCurrentTab(AssetTabIndex.DualInvests)
            break
          case AssetTabIndex.Tokens:
          default:
            history.replace('/l2assets/assets/Tokens')
            setCurrentTab(AssetTabIndex.Tokens)
            break
        }
      } else {
        history.replace('/l2assets/assets/Tokens')
        setCurrentTab(AssetTabIndex.Tokens)
      }
    }
    React.useEffect(() => {
      if (match.params.item === 'Invests') {
        setCurrentTab(AssetTabIndex.DualInvests)
      }
    }, [])
    const hideAssets = assetTitleProps.hideL2Assets

    return (
      <>
        {!isMobile && (
          <MaxWidthContainer
            containerProps={{
              sx: {
                background: 'transparent',
                paddingY: 5,
                position: 'relative',
              },
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                zIndex: -1,
                top: 'calc(var(--header-height) * -1)',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundImage:
                  theme.mode === 'light'
                    ? `url(${SoursURL + 'images/asset_page_bg_light.png'})`
                    : `url(${SoursURL + 'images/asset_page_bg_dark.png'})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
              }}
            />
            <AssetTitle
              {...{
                t,
                ...rest,
                ...assetTitleProps,
                assetBtnStatus,
                forexMap,
                isWebEarn: true,
              }}
            />
          </MaxWidthContainer>
        )}
        <MaxWidthContainer
          containerProps={{
            sx: {
              background: containerColors[1],
              paddingY: 2.5,
              borderBottom: '1px solid var(--color-border)',
            },
          }}
        >
          <Tabs
            className={'btnTab'}
            value={currentTab}
            onChange={(_event, value) => handleTabChange(value)}
            aria-label='l2-history-tabs'
            variant='scrollable'
          >
            {AssetL2TabEarnIndex[MapChainId[defaultNetwork]].map((item: string) => {
              return <Tab key={item.toString()} label={t(`labelAsset${item}`)} value={item} />
            })}
          </Tabs>
        </MaxWidthContainer>

        {currentTab === AssetTabIndex.Tokens && (
          <MaxWidthContainer
            containerProps={{
              sx: {
                '&': {
                  background: containerColors[1],
                  paddingTop: 2,
                  display: 'flex',
                  flex: 1,
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                },
              },
            }}
          >
            <Box className='tableWrapper'>
              <AssetsTable
                {...{
                  rawData: assetsRawData,
                  disableWithdrawList,
                  showFilter: true,
                  allowTrade,
                  onSend,
                  onTokenLockHold: onTokenLockHold as any,
                  tokenLockDetail,
                  onReceive,
                  isLoading: assetBtnStatus === TradeBtnStatus.LOADING,
                  getMarketArrayListCallback: getTokenRelatedMarketArray,
                  hideInvestToken,
                  forexMap: forexMap as any,
                  hideSmallBalances,
                  setHideLpToken,
                  setHideSmallBalances,
                  hideAssets,
                  isWebEarn: true,
                  rowConfig: RowEarnConfig,
                  ...rest,
                }}
              />
            </Box>
          </MaxWidthContainer>
        )}

        {currentTab === AssetTabIndex.DualInvests && (
          <MyLiquidity
            noHeader
            className={'assetWrap'}
            isHideTotal={true}
            hideAssets={hideAssets}
          />
        )}
      </>
    )
  },
)
