import { WithTranslation, withTranslation } from 'react-i18next'
import { Tab, Typography, Box } from '@mui/material'
import {
  AssetsTable,
  AssetTitle,
  AssetTitleProps,
  Tabs,
  useSettings,
} from '@loopring-web/component-lib'

import { numberStringListSum, StylePaper, useSystem, useTokenMap } from '@loopring-web/core'
import { AssetPanelProps, useAssetAction } from './hook'
import React from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import MyLiquidity from '../../InvestPage/MyLiquidityPanel'
import { MapChainId, SoursURL, TradeBtnStatus } from '@loopring-web/common-resources'
import { AssetL2TabEarnIndex, AssetTabIndex } from '../../../constant/router'
import { containerColors } from 'pages/InvestPage'
import { RowEarnConfig } from 'constant/setting'
import { useTheme } from '@emotion/react'
import Decimal from 'decimal.js'

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
      totalAvailableInCurrency,
      totalFrozenInCurrency,
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
          case AssetTabIndex.DefiPortfolio:
            history.replace('/l2assets/assets/Invests')
            setCurrentTab(AssetTabIndex.DefiPortfolio)
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
        setCurrentTab(AssetTabIndex.DefiPortfolio)
      }
    }, [])
    const hideAssets = assetTitleProps.hideL2Assets

    return (
      <Box bgcolor={'var(--color-box)'} borderRadius={'24px'} px={3.5} py={5}>
        {!isMobile && (
          <Box
            sx={{
              background: 'transparent',
              paddingY: 5,
              position: 'relative',
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
          </Box>
        )}
        <Box
          sx={{
            paddingTop: 2.5,
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <Tabs
            sx={{ ml: -2 }}
            value={currentTab}
            onChange={(_event, value) => handleTabChange(value)}
            aria-label='l2-history-tabs'
            variant='scrollable'
          >
            {AssetL2TabEarnIndex[MapChainId[defaultNetwork]]?.map((item: string) => {
              return <Tab key={item.toString()} label={t(`labelEarnAsset${item}`)} value={item} />
            })}
          </Tabs>
        </Box>

        <Box
          sx={{
            // overflowY: 'scroll',
            // height: isMobile ? '300px' : '450px',
          }}
        >
          {currentTab === AssetTabIndex.Tokens && (
            <Box>
              <Box marginBottom={3} marginTop={2} display={'flex'} justifyContent={'start'}>
                <Typography marginRight={4} color={'var(--color-text-secondary)'}>
                  {t('labelLocked')}:{' '}
                  {hideAssets ? (
                    <>
                      <>&#10033;&#10033;&#10033;&#10033;&#10033;&#10033;</>
                    </>
                  ) : (
                    totalFrozenInCurrency
                  )}
                </Typography>
                <Typography color={'var(--color-text-secondary)'}>
                  {t('labelAvailable')}{' '}
                  {hideAssets ? (
                    <>&#10033;&#10033;&#10033;&#10033;&#10033;&#10033;</>
                  ) : (
                    totalAvailableInCurrency
                  )}
                </Typography>
              </Box>
              <Box>
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
            </Box>
          )}

          {currentTab === AssetTabIndex.DefiPortfolio && (
            <MyLiquidity hideAssets={hideAssets} isPortfolio />
          )}
        </Box>
      </Box>
    )
  },
)
