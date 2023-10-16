import { withTranslation } from 'react-i18next'

import React from 'react'
import { Layout, Layouts, Responsive, WidthProvider } from 'react-grid-layout'

import { usePro } from './hookPro'
import { useTheme } from '@emotion/react'
import { Box, IconButton } from '@mui/material'
import {
  BreakPoint,
  DragIcon,
  stopLimitLayoutConfigs,
  myLog,
  ResizeIcon,
  RowConfig,
  SoursURL,
  LayoutConfigInfo,
} from '@loopring-web/common-resources'
import { ChartView, OrderTableView, Toolbar } from './panel'
import { boxLiner, useSettings } from '@loopring-web/component-lib'
import styled from '@emotion/styled'
import { usePageTradePro } from '@loopring-web/core'
import { useHistory } from 'react-router-dom'
import { StopLimitView } from './panel/spot/stopLimit'
import { StopLimitInfo } from './panel/walletInfo/stopLimitInfo'

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
  if (window.innerWidth >= stopLimitLayoutConfigs[0].breakpoints[BreakPoint.xlg]) {
    return BreakPoint.xlg
  } else if (window.innerWidth >= stopLimitLayoutConfigs[0].breakpoints[BreakPoint.lg]) {
    return BreakPoint.lg
  } else if (window.innerWidth >= stopLimitLayoutConfigs[0].breakpoints[BreakPoint.md]) {
    return BreakPoint.md
  } else if (window.innerWidth >= stopLimitLayoutConfigs[0].breakpoints[BreakPoint.sm]) {
    return BreakPoint.sm
  } else if (window.innerWidth >= stopLimitLayoutConfigs[0].breakpoints[BreakPoint.xs]) {
    return BreakPoint.xs
  } else if (window.innerWidth >= stopLimitLayoutConfigs[0].breakpoints[BreakPoint.xxs]) {
    return BreakPoint.xxs
  } else {
    return BreakPoint.md
  }
}
export const StopLimitPage = withTranslation('common')(<Config extends LayoutConfigInfo>() => {
  const {
    pageTradePro: { depthForCalc },
  } = usePageTradePro()
  const { market, handleOnMarketChange, resetTradeCalcData } = usePro({
    path: '/trade/stoplimit',
  })
  const { unit } = useTheme()
  const { stopLimitLayout, setStopLimitLayouts } = useSettings()
  const history = useHistory()

  const [configLayout, setConfigLayout] = React.useState<Config>({
    // @ts-ignore
    compactType: 'vertical',
    currentBreakpoint: initBreakPoint(),
    mounted: false,
    layouts: stopLimitLayout ?? stopLimitLayoutConfigs[0].layouts,
  })
  const sportMemo = React.useMemo(() => {
    return (
      <>
        {depthForCalc ? (
          <StopLimitView market={market as any} resetTradeCalcData={resetTradeCalcData} />
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

  const onBreakpointChange = React.useCallback(
    (breakpoint: BreakPoint) => {
      setConfigLayout((state: Config) => {
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
    (layout: Layout[], _oldLayoutItem, _layoutItem) => {
      setStopLimitLayouts({ [configLayout.currentBreakpoint]: layout })
    },
    [configLayout],
  )

  const handleLayoutChange = React.useCallback(
    (currentLayout: Layout[], allLayouts?: Layouts, defaultlayouts?: Layouts) => {
      if (defaultlayouts) {
        setStopLimitLayouts(defaultlayouts)
        history.push('/loading')
        setTimeout(() => {
          history.go(-1)
        }, 0)
      } else {
      }
      myLog(currentLayout)
    },
    [configLayout, stopLimitLayout, setConfigLayout, setStopLimitLayouts],
  )
  const ViewList = {
    toolbar: React.useMemo(
      () => (
        <Toolbar
          market={market as any}
          layoutConfigs={stopLimitLayoutConfigs}
          handleLayoutChange={handleLayoutChange}
          handleOnMarketChange={handleOnMarketChange}
        />
      ),
      [market, handleLayoutChange, handleOnMarketChange],
    ),
    spot: sportMemo,
    markdown: <StopLimitInfo />,
    chart: React.useMemo(
      () => <ChartView market={market} rowLength={0} isShowDepth={false} />,
      [market],
    ),
    orderTable: React.useMemo(
      () => (
        <OrderTableView
          isStopLimit={true}
          market={market}
          handleOnMarketChange={handleOnMarketChange}
        />
      ),
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
          breakpoints={stopLimitLayoutConfigs[0].breakpoints}
          cols={stopLimitLayoutConfigs[0].cols}
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
