import { useDefiMap, useDefiTrade, confirmation } from '@loopring-web/core'
import { DEFI_ADVICE_MAP, MarketType } from '@loopring-web/common-resources'
import {
  ConfirmDefiNOBalance,
  DeFiWrap,
  LoadingBlock,
  useSettings,
} from '@loopring-web/component-lib'
import { Box } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const DeFiTradePanel = ({
  isJoin,
  market,
  setServerUpdate,
  setToastOpen,
}: {
  market: MarketType
  isJoin: boolean
  setServerUpdate: (state: any) => void
  setToastOpen: (state: any) => void
}) => {
  const { marketArray } = useDefiMap()
  const [confirmShowLimitBalance, setConfirmShowLimitBalance] = React.useState<boolean>(false)
  const [confirmShowNoBalance, setConfirmShowNoBalance] = React.useState<boolean>(false)
  const { deFiWrapProps } = useDefiTrade({
    isJoin,
    setToastOpen: setToastOpen as any,
    market: market ? market : marketArray[0],
    setServerUpdate,
    setConfirmShowNoBalance,
    confirmShowLimitBalance,
    setConfirmShowLimitBalance,
    isLeverageETH: false,
  })
  const { isMobile } = useSettings()
  const [, tokenBase] = market.match(/(\w+)-(\w+)/i) ?? []
  const styles = isMobile
    ? { flex: 1, background: 'var(--color-box-third)' }
    : { width: 'var(--swap-box-width)', background: 'var(--color-box-third)' }
  const { t } = useTranslation()
  const { setShowRETHStakePopup, setShowWSTETHStakePopup } = confirmation.useConfirmation()
  return (
    <>
      {deFiWrapProps.deFiCalcData ? (
        <Box
          className={'hasLinerBg'}
          display={'flex'}
          style={styles}
          justifyContent={'center'}
          padding={5 / 2}
          bgcolor={'var(--color-box-third)'}
        >
          <DeFiWrap
            market={market}
            isJoin={isJoin}
            setShowRETHStakePopup={setShowRETHStakePopup}
            setShowWSTETHStakePopup={setShowWSTETHStakePopup}
            // setShowLeverageETHPopup={setShowLeverageETHPopup}
            type={DEFI_ADVICE_MAP[tokenBase].project}
            title={DEFI_ADVICE_MAP[tokenBase].project}
            {...(deFiWrapProps as any)}
          />
        </Box>
      ) : (
        <LoadingBlock />
      )}
      <ConfirmDefiNOBalance
        isJoin={isJoin}
        market={market}
        type={DEFI_ADVICE_MAP[tokenBase].project}
        handleClose={(_e) => {
          setConfirmShowNoBalance(false)
          if (deFiWrapProps?.onRefreshData) {
            deFiWrapProps?.onRefreshData(true, true)
          }
        }}
        isLeverage={false}
        open={confirmShowNoBalance}
      />
    </>
  )
}
