import { withTranslation } from 'react-i18next'

import React from 'react'
import { Layout, Layouts, Responsive, WidthProvider } from 'react-grid-layout'

import { usePro } from './hookPro'
import { useTheme } from '@emotion/react'
import { Box, IconButton } from '@mui/material'
import {
  BreakPoint,
  DragIcon,
  LayoutConfig,
  LayoutConfigInfo,
  layoutConfigs,
  myLog,
  ResizeIcon,
  RowConfig,
  SoursURL,
} from '@loopring-web/common-resources'
import {
  ChartView,
  MarketView,
  OrderTableView,
  SpotView,
  TabMarketIndex,
  Toolbar,
  WalletInfo,
} from './panel'
import { boxLiner, useSettings } from '@loopring-web/component-lib'
import styled from '@emotion/styled'
import { usePageTradePro } from '@loopring-web/core'
import { useHistory } from 'react-router-dom'

const MARKET_ROW_LENGTH: number = 8
// const MARKET_ROW_LENGTH_LG: number = 11;

const MARKET_TRADES_LENGTH: number = 19
// const MARKET_TRADES_LENGTH_LG: number = 24;
export const HeaderHeight = RowConfig.rowHeaderHeight

const BoxStyle = styled(Box)`
  --tab-header: ${HeaderHeight}px;
  background: var(--color-global-bg);

  &.spot {
    ${({ theme }: any) => boxLiner({ theme })}
    background-color: var(--color-global-bg);
  }

  .MuiTabs-root {
    min-height: var(--tab-header);

    .MuiTab-root.MuiTab-fullWidth,
    .MuiTab-root {
      font-size: ${({ theme }) => theme.fontDefault.body1};
      min-height: var(--tab-header);
      padding: ${({ theme }) => theme.unit}px;

      &:after {
        margin: 0;
      }
    }
  }
`
const ResponsiveGridLayout = WidthProvider(Responsive)

const initBreakPoint = (): BreakPoint => {
  if (window.innerWidth >= layoutConfigs[0].breakpoints[BreakPoint.xlg]) {
    return BreakPoint.xlg
  } else if (window.innerWidth >= layoutConfigs[0].breakpoints[BreakPoint.lg]) {
    return BreakPoint.lg
  } else if (window.innerWidth >= layoutConfigs[0].breakpoints[BreakPoint.md]) {
    return BreakPoint.md
  } else if (window.innerWidth >= layoutConfigs[0].breakpoints[BreakPoint.sm]) {
    return BreakPoint.sm
  } else if (window.innerWidth >= layoutConfigs[0].breakpoints[BreakPoint.xs]) {
    return BreakPoint.xs
  } else if (window.innerWidth >= layoutConfigs[0].breakpoints[BreakPoint.xxs]) {
    return BreakPoint.xxs
  } else {
    return BreakPoint.md
  }
}
export const OrderbookPage = withTranslation('common')(<Config extends LayoutConfigInfo>() => {
  const {
    pageTradePro: { depthLevel, depthForCalc },
  } = usePageTradePro()
  const { market, handleOnMarketChange, assetBtnStatus, resetTradeCalcData } = usePro({})
  const { unit } = useTheme()
  const { proLayout, setLayouts, isMobile } = useSettings()

  const history = useHistory()

  const [rowLength, setRowLength] = React.useState<number>(MARKET_ROW_LENGTH)
  const [tradeTableLengths, setTradeTableLengths] = React.useState<{
    market: number
    market2: number
  }>({
    market: MARKET_TRADES_LENGTH,
    market2: MARKET_TRADES_LENGTH,
  })

  const [configLayout, setConfigLayout] = React.useState<Config>({
    // @ts-ignore
    compactType: 'vertical',
    currentBreakpoint: initBreakPoint(),
    mounted: false,
    layouts: proLayout ?? layoutConfigs[0].layouts,
  })
  const sportMemo = React.useMemo(() => {
    return (
      <>
        {depthForCalc ? (
          <SpotView market={market as any} resetTradeCalcData={resetTradeCalcData} />
        ) : (
          <Box
            flex={1}
            height={'100%'}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
          >
            {/*<LoadingIcon />*/}
            <img
              className='loading-gif'
              alt={'loading'}
              width='36'
              src={`${SoursURL}images/loading-line.gif`}
            />
          </Box>
        )}
      </>
    )
  }, [market, depthForCalc])

  const onRestDepthTableLength = React.useCallback(
    (h: number) => {
      if (h) {
        const i = Math.floor((h * unit - (isMobile ? 88 : 144)) / 40)
        if (i <= 40) {
          setRowLength(i)
        } else {
          setRowLength(48)
        }
      }
    },
    [isMobile],
  )
  const onRestMarketTableLength = React.useCallback(
    (layout: Layout | undefined) => {
      if (layout && layout.h) {
        const h = layout.h
        const i = Math.floor((h * unit - (isMobile ? 88 : 144)) / 20)
        setTradeTableLengths((state) => {
          if (i <= 30) {
            //32
            return {
              ...state,
              [layout.i]: i,
            }
          } else {
            return {
              ...state,
              [layout.i]: MARKET_TRADES_LENGTH + 30,
            }
          }
        })
      }
    },
    [isMobile],
  )

  const onBreakpointChange = React.useCallback(
    (breakpoint: BreakPoint) => {
      setConfigLayout((state) => {
        return {
          ...state,
          currentBreakpoint: breakpoint,
        }
      })
      configLayout.layouts[breakpoint].forEach((layoutItem, index) => {
        onResize(
          configLayout.layouts[breakpoint],
          configLayout.layouts[configLayout.currentBreakpoint][index],
          layoutItem,
        )
      })
    },
    [configLayout],
  )

  const onResize = React.useCallback(
    (layout: Layout[], oldLayoutItem, layoutItem) => {
      if (layoutItem.i === 'market') {
        onRestDepthTableLength(layoutItem.h)
        onRestMarketTableLength(layoutItem)
      }
      if (layoutItem.i === 'market2') {
        onRestMarketTableLength(layoutItem)
      }
      setLayouts({ [configLayout.currentBreakpoint]: layout })
    },
    [configLayout, setRowLength],
  )

  const handleLayoutChange = React.useCallback(
    (currentLayout: Layout[], allLayouts?: Layouts, defaultlayouts?: Layouts) => {
      if (defaultlayouts) {
        setLayouts(defaultlayouts)
        history.push('/loading')
        setTimeout(() => {
          history.go(-1)
        }, 0)
      } else {
      }
      myLog(currentLayout)
    },
    [configLayout, proLayout, setConfigLayout, setLayouts],
  )
  const ViewList = {
    toolbar: React.useMemo(
      () => (
        <Toolbar
          market={market as any}
          handleLayoutChange={handleLayoutChange}
          handleOnMarketChange={handleOnMarketChange}
        />
      ),
      [market, handleLayoutChange, handleOnMarketChange],
    ),
    walletInfo: React.useMemo(
      () => <WalletInfo market={market as any} assetBtnStatus={assetBtnStatus} />,
      [market, assetBtnStatus],
    ),
    spot: sportMemo,
    market: React.useMemo(
      () => (
        <>
          {depthLevel && (
            <MarketView
              market={market as any}
              rowLength={rowLength}
              tableLength={tradeTableLengths.market}
              main={TabMarketIndex.Orderbook}
              breakpoint={configLayout.currentBreakpoint}
            />
          )}
        </>
      ),
      [market, rowLength, configLayout.currentBreakpoint, depthLevel, tradeTableLengths.market],
    ),
    market2: React.useMemo(
      () => (
        <>
          <MarketView
            isOnlyTrade={true}
            market={market as any}
            main={TabMarketIndex.Trades}
            tableLength={tradeTableLengths.market2}
            rowLength={0}
            breakpoint={configLayout.currentBreakpoint}
          />
        </>
      ),
      [market, rowLength, configLayout.currentBreakpoint, depthLevel, tradeTableLengths.market2],
    ), //<MarketView market={market as any}/>, [market])
    chart: React.useMemo(
      () => <ChartView market={market} rowLength={rowLength} />,
      [market, rowLength],
    ),
    orderTable: React.useMemo(
      () => <OrderTableView market={market} handleOnMarketChange={handleOnMarketChange} />,
      [market],
    ),
  }
  return (
    <Box bgcolor={'var(--color-box-third)'} display={'block'} margin={'0 auto'} width={'100%'} position={'relative'}>
      {market ? (
        <ResponsiveGridLayout
          className='layout'
          {...{ ...configLayout }}
          onBreakpointChange={onBreakpointChange}
          onLayoutChange={handleLayoutChange}
          onResizeStop={onResize}
          resizeHandle={
            <IconButton
              size={'medium'}
              style={{
                position: 'absolute',
                zIndex: 78,
                right: 0,
                bottom: 0,
              }}
              className={'resize-holder'}
            >
              <ResizeIcon
                htmlColor={'var(--color-text-third)'}
                style={{
                  marginRight: `-${unit}px`,
                  marginBottom: `-${unit}px`,
                }}
              />
            </IconButton>
          }
          draggableHandle={'.drag-holder'}
          breakpoints={layoutConfigs[0].breakpoints}
          cols={layoutConfigs[0].cols}
          rowHeight={unit / 2}
          margin={[unit / 2, unit / 2]}
        >
          {configLayout.layouts[configLayout.currentBreakpoint].map((layout) => {
            return (
              <BoxStyle
                key={layout.i}
                overflow={'hidden'}
                className={layout.i}
                component={'section'}
                position={'relative'}
                display={'flex'}
                flexDirection={'column'}
              >
                {ViewList[layout.i]}
                <IconButton
                  size={'medium'}
                  style={{
                    position: 'absolute',
                    zIndex: 78,
                    right: 0,
                    top: 0,
                  }}
                  className={'drag-holder'}
                >
                  <DragIcon
                    htmlColor={'var(--color-text-third)'}
                    style={{ marginRight: `-${unit}px`, marginTop: '' }}
                  />
                </IconButton>
              </BoxStyle>
            )
          })}
        </ResponsiveGridLayout>
      ) : (
        <Box
          flex={1}
          height={'100%'}
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}
        >
          {/*<LoadingIcon />*/}
          <img
            className='loading-gif'
            alt={'loading'}
            width='36'
            src={`${SoursURL}images/loading-line.gif`}
          />
        </Box>
      )}
    </Box>
  )
})
