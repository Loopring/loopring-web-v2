import { confirmation, useDefiMap, useDefiTrade } from '@loopring-web/core'
import { DEFI_ADVICE_MAP, MarketType, myLog } from '@loopring-web/common-resources'
import { ConfirmDefiNOBalance, DeFiWrap, LoadingBlock } from '@loopring-web/component-lib'
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
  const { marketArray, marketMap } = useDefiMap()
  myLog('isJoin', isJoin, 'market', market)
  const [confirmShowLimitBalance, setConfirmShowLimitBalance] = React.useState<boolean>(false)
  const [confirmShowNoBalance, setConfirmShowNoBalance] = React.useState<boolean>(false)
  const { deFiWrapProps } = useDefiTrade({
    isJoin,
    setToastOpen: setToastOpen as any,
    market: market ? market : marketArray[0], // marketArray[1] as MarketType,
    setServerUpdate,
    setConfirmShowNoBalance,
    confirmShowLimitBalance,
    setConfirmShowLimitBalance,
    isLeverageETH: false,
  })
  const [, tokenBase] = market.match(/(\w+)-(\w+)/i) ?? []
  const { t } = useTranslation()
  const { setShowRETHStakePopup, setShowWSTETHStakePopup } = confirmation.useConfirmation()
  return (
    <>
      {deFiWrapProps.deFiCalcData ? (
        <Box
          className={'hasLinerBg'}
          display={'flex'}
          sx={{
            width: 'var(--modal-width)',
            background: 'var(--color-box-third)',
          }}
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
