import { WithTranslation, withTranslation } from 'react-i18next'

import { Box, Tab, Tabs } from '@mui/material'
import styled from '@emotion/styled'
import { AssetsTable, AssetTitle, AssetTitleProps, useSettings } from '@loopring-web/component-lib'

import { StylePaper, useSystem, useTokenMap } from '@loopring-web/core'
import { AssetPanelProps } from './hook'
import React from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import MyLiquidity from '../../InvestPage/MyLiquidityPanel'
import { RedPacketClaimPanel } from '../../RedPacketPage/RedPacketClaimPanel'
import {
  AssetL2TabIndex,
  AssetTabIndex,
  MapChainId, myLog,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import RewardsPanel from '../RewardsPanel'

const StyleTitlePaper = styled(Box)`
  width: 100%;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`

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
      onTokenLockHold,
      tokenLockDetail,
    },
    ...rest
  }: {
    assetTitleProps: AssetTitleProps
    assetPanelProps: AssetPanelProps //AssetPanelProps;
  } & WithTranslation) => {
    const container = React.useRef(null)
    const { disableWithdrawList } = useTokenMap()
    const { forexMap } = useSystem()
    const { isMobile, defaultNetwork } = useSettings()
    const match: any = useRouteMatch('/l2assets/:assets?/:item?')
    const [currentTab, setCurrentTab] = React.useState<AssetTabIndex>(AssetTabIndex.Tokens)
    const history = useHistory()
    const handleTabChange = (value: AssetTabIndex) => {
      if (AssetL2TabIndex[MapChainId[defaultNetwork]]?.includes(value)) {
        switch (value) {
          case AssetTabIndex.Invests:
            history.replace('/l2assets/assets/Invests')
            setCurrentTab(AssetTabIndex.Invests)
            break
          case AssetTabIndex.RedPacket:
            history.replace('/l2assets/assets/RedPacket')
            setCurrentTab(AssetTabIndex.RedPacket)
            break
          case AssetTabIndex.Rewards:
            history.replace('/l2assets/assets/Rewards')
            setCurrentTab(AssetTabIndex.Rewards)
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
      handleTabChange(match?.params?.item)
    }, [match?.params?.item, defaultNetwork])
    const hideAssets = assetTitleProps.hideL2Assets
    // myLog('assetsRawData')
    return (
      <>
        {!isMobile && (
          <StyleTitlePaper paddingX={3} paddingY={5 / 2} className={'MuiPaper-elevation2'}>
            <AssetTitle
              {...{
                t,
                ...rest,
                ...assetTitleProps,
                assetBtnStatus,
              }}
            />
          </StyleTitlePaper>
        )}

        <Tabs
          value={currentTab}
          onChange={(_event, value) => handleTabChange(value)}
          aria-label='l2-history-tabs'
          variant='scrollable'
        >
          {AssetL2TabIndex[MapChainId[defaultNetwork]].map((item: string) => {
            if (isMobile && item == AssetTabIndex.RedPacket) {
              return <React.Fragment key={item.toString()} />
            } else {
              return <Tab key={item.toString()} label={t(`labelAsset${item}`)} value={item} />
            }
          })}
        </Tabs>
        {currentTab === AssetTabIndex.Tokens && (
          <StylePaper
            marginTop={1}
            marginBottom={2}
            ref={container}
            className={'MuiPaper-elevation2'}
          >
            <Box className='tableWrapper table-divide-short'>
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
                  ...rest,
                }}
              />
            </Box>
          </StylePaper>
        )}
        {currentTab === AssetTabIndex.Rewards && <RewardsPanel hideAssets={hideAssets} />}
        {currentTab === AssetTabIndex.Invests && (
          <MyLiquidity className={'assetWrap'} isHideTotal={true} hideAssets={hideAssets} />
        )}
        {!isMobile && currentTab === AssetTabIndex.RedPacket && (
          <RedPacketClaimPanel hideAssets={hideAssets} />
        )}
      </>
    )
  },
)
