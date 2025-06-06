import { WithTranslation, withTranslation } from 'react-i18next'

import { Box, Tab, Tabs } from '@mui/material'
import styled from '@emotion/styled'
import { AssetsTable, AssetTitle, AssetTitleProps, useSettings } from '@loopring-web/component-lib'

import { StylePaper, useSystem, useTokenMap } from '@loopring-web/core'
import { AssetPanelProps, useAssetAction } from './hook'
import React from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { MyLiquidity } from '../../InvestPage/MyLiquidityPanel'
import { RedPacketClaimPanel } from '../../RedPacketPage/RedPacketClaimPanel'
import {
  AssetL2TabIndex,
  AssetTabIndex,
  CircleIcon,
  MapChainId,
  RouterPath,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import RewardsPanel from '../RewardsPanel'

const StyleTitlePaper = styled(Box)`
  width: 100%;
  background: var(--color-box-third);
  border-radius: ${({ theme }) => theme.unit}px;
`
export const l2assetsRouter = `${RouterPath.l2assets}/:assets?/:item?`

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
    const container = React.useRef(null)
    const { disableWithdrawList } = useTokenMap()
    const { forexMap } = useSystem()
    const { isMobile, defaultNetwork } = useSettings()
    const match: any = useRouteMatch(l2assetsRouter)
    const [currentTab, setCurrentTab] = React.useState<AssetTabIndex>(AssetTabIndex.Tokens)
    const history = useHistory()
    const { onTokenLockHold, tokenLockDetail } = useAssetAction()

    const handleTabChange = (value: AssetTabIndex) => {
      if (AssetL2TabIndex[MapChainId[defaultNetwork]]?.includes(value)) {
        switch (value) {
          case AssetTabIndex.Invests:
            history.replace(`${RouterPath.l2assetsDetail}/${AssetTabIndex.Invests}`)
            setCurrentTab(AssetTabIndex.Invests)
            break
          case AssetTabIndex.RedPacket:
            history.replace(`${RouterPath.l2assetsDetail}/${AssetTabIndex.RedPacket}`)
            setCurrentTab(AssetTabIndex.RedPacket)
            break
          case AssetTabIndex.Rewards:
            history.replace(`${RouterPath.l2assetsDetail}/${AssetTabIndex.Rewards}`)
            setCurrentTab(AssetTabIndex.Rewards)
            break
          case AssetTabIndex.Tokens:
          default:
            history.replace(`${RouterPath.l2assetsDetail}/${AssetTabIndex.Tokens}`)
            setCurrentTab(AssetTabIndex.Tokens)
            break
        }
      } else {
        history.replace(`${RouterPath.l2assetsDetail}/${AssetTabIndex.Tokens}`)
        setCurrentTab(AssetTabIndex.Tokens)
      }
    }
    React.useEffect(() => {
      handleTabChange(match?.params?.item)
    }, [match?.params?.item, defaultNetwork])
    const hideAssets = assetTitleProps.hideL2Assets
    return (
      <>
        {!isMobile && (
          <StyleTitlePaper paddingX={3} paddingY={5 / 2}>
            <AssetTitle
              {...{
                t,
                ...rest,
                ...assetTitleProps,
                assetBtnStatus,
                forexMap,
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
          {AssetL2TabIndex[MapChainId[defaultNetwork]]?.map((item: string) => {
            if (item == AssetTabIndex.RedPacket) {
              if (isMobile) {
                return <React.Fragment key={item.toString()} />
              } else {
                return (
                  <Tab
                    key={item.toString()}
                    label={
                      <>
                        {t(`labelAsset${item}`)}
                        {showRedpacketReddot && (
                          <CircleIcon
                            sx={{
                              position: 'absolute',
                              top: 2,
                              right: -0,
                              pointerEvents: 'none' as any,
                            }}
                            className={'noteit'}
                            fontSize={'large'}
                            htmlColor={'var(--color-error)'}
                          />
                        )}
                      </>
                    }
                    value={item}
                  />
                )
              }
            } else {
              return <Tab key={item.toString()} label={t(`labelAsset${item}`)} value={item} />
            }
          })}
        </Tabs>
        {currentTab === AssetTabIndex.Tokens && (
          <StylePaper marginTop={1} marginBottom={2} ref={container}>
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
          <MyLiquidity
            noHeader
            path={`${RouterPath.l2assets}/assets/Invests`}
            className={'assetWrap'}
            isHideTotal={true}
            hideAssets={hideAssets}
          />
        )}
        {!isMobile && currentTab === AssetTabIndex.RedPacket && (
          <RedPacketClaimPanel hideAssets={hideAssets} />
        )}
      </>
    )
  },
)
