import { confirmation, useLeverageETHTrade, usePopup } from '@loopring-web/core'
import { MarketType, leverageETHAdvice, myLog } from '@loopring-web/common-resources'
import {
  ConfirmDefiNOBalance,
  DeFiWrap,
  LoadingBlock,
  useSettings,
} from '@loopring-web/component-lib'
import { Box } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDefiMap } from '@loopring-web/core'

export const TradePanel = ({
  isJoin,
  setServerUpdate,
  setToastOpen,
}: {
  isJoin: boolean
  setServerUpdate: (state: any) => void
  setToastOpen: (state: any) => void
}) => {
  const { marketLeverageArray: marketArray } = useDefiMap()
  // @ts-ignore
  const market: MarketType = marketArray[0]
  myLog('isJoin', isJoin, 'market', market)
  const [confirmShowLimitBalance, setConfirmShowLimitBalance] = React.useState<boolean>(false)
  const [confirmShowNoBalance, setConfirmShowNoBalance] = React.useState<boolean>(false)

  const { deFiWrapProps } = useLeverageETHTrade({
    isJoin,
    setToastOpen: setToastOpen as any,
    market: market,
    setServerUpdate,
    setConfirmShowNoBalance,
    confirmShowLimitBalance,
    setConfirmShowLimitBalance,
  })
  const { t } = useTranslation()

  const { isMobile } = useSettings()
  const [, tokenBase] = market.match(/(\w+)-(\w+)/i) ?? []

  const styles = isMobile
    ? { flex: 1, background: 'var(--color-box-third)' }
    : { width: 'var(--swap-box-width)', background: 'var(--color-box-third)' }
  // leverageETHAdvice
  // console.log('leverageETHAdvice', leverageETHAdvice)
  // setShowRETHStakignPopup={setShowRETHStakignPopup}
  // setShowWSTETHStakignPopup={setShowWSTETHStakignPopup}
  const { setShowLeverageETHPopup } = confirmation.useConfirmation()

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
            isLeverageETH
            market={market}
            isJoin={isJoin}
            setShowLeverageETHPopup={setShowLeverageETHPopup}
            type={leverageETHAdvice.project}
            title={t('labelLeverageETHStaking')}
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
        isLeverage
      />
    </>
  )
}
