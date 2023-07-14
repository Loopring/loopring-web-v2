import { useDefiMap, useDefiTrade, useLeverageETHTrade } from '@loopring-web/core'
import {
  // DEFI_ADVICE_MAP,
  MarketType,
  leverageETHAdvice,
  myLog,
} from '@loopring-web/common-resources'
import {
  ConfirmDefiNOBalance,
  DeFiWrap,
  LoadingBlock,
  useSettings,
} from '@loopring-web/component-lib'
import { Box } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const TradePanel = ({
  isJoin,
  // market,
  setServerUpdate,
  setToastOpen,
}: {
  // market: MarketType;
  isJoin: boolean
  setServerUpdate: (state: any) => void
  setToastOpen: (state: any) => void
}) => {
  const market: MarketType = 'CIETH-ETH'
  const { marketArray, marketMap } = useDefiMap()
  myLog('isJoin', isJoin, 'market', market)
  const [confirmShowLimitBalance, setConfirmShowLimitBalance] = React.useState<boolean>(false)
  const [confirmShowNoBalance, setConfirmShowNoBalance] = React.useState<boolean>(false)

  const { deFiWrapProps } = useLeverageETHTrade({
    isJoin,
    setToastOpen: setToastOpen as any,
    market: market ? market : marketArray[0], // marketArray[1] as MarketType,
    setServerUpdate,
    setConfirmShowNoBalance,
    confirmShowLimitBalance,
    setConfirmShowLimitBalance,
  })
  console.log('deFiWrapProps', deFiWrapProps.deFiCalcData.coinSell)
  const { t } = useTranslation()

  const { isMobile } = useSettings()
  const [, tokenBase] = market.match(/(\w+)-(\w+)/i) ?? []

  const styles = isMobile ? { flex: 1 } : { width: 'var(--swap-box-width)' }
  // leverageETHAdvice
  // console.log('leverageETHAdvice', leverageETHAdvice)
  return (
    <>
      {deFiWrapProps.deFiCalcData ? (
        <Box
          className={'hasLinerBg'}
          display={'flex'}
          style={styles}
          justifyContent={'center'}
          padding={5 / 2}
        >
          <DeFiWrap
            market={market}
            isJoin={isJoin}
            type={leverageETHAdvice.project}
            title={t('labelLeverageETHTitle')}
            {...(deFiWrapProps as any)}
          />
        </Box>
      ) : (
        <LoadingBlock />
      )}
      <ConfirmDefiNOBalance
        isJoin={isJoin}
        market={market}
        type={leverageETHAdvice.project as any}
        handleClose={(_e) => {
          setConfirmShowNoBalance(false)
          if (deFiWrapProps?.onRefreshData) {
            deFiWrapProps?.onRefreshData(true, true)
          }
        }}
        open={confirmShowNoBalance}
      />
    </>
  )
}
