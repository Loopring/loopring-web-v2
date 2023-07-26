import { useHistory, useRouteMatch } from 'react-router-dom'

import { Box, Tab, Tabs, Typography } from '@mui/material'

import { useTranslation, withTranslation } from 'react-i18next'
import { ConfirmInvestDualRisk, ConfirmInvestLRCStakeRisk } from '@loopring-web/component-lib'
import React from 'react'
import { confirmation, usePopup, ViewAccountTemplate } from '@loopring-web/core'
import MyLiquidityPanel from './MyLiquidityPanel'
import { PoolsPanel } from './PoolsPanel'
import { DeFiPanel } from './DeFiPanel'
import { OverviewPanel } from './OverviewPanel'
import { DualListPanel } from './DualPanel/DualListPanel'
import { StackTradePanel } from './StakePanel/StackTradePanel'
import LeverageETHPanel from './LeverageETHPanel'

export enum InvestType {
  MyBalance = 0,
  AmmPool = 1,
  DeFi = 2,
  Overview = 3,
  Dual = 4,
  Stack = 5,
  LeverageETH = 6,
}

export const InvestRouter = [
  'balance',
  'ammpool',
  'defi',
  'overview',
  'dual',
  'stakelrc',
  'leverageETH',
]
export const BalanceTitle = () => {
  const { t } = useTranslation()
  return (
    <Typography display={'inline-flex'} alignItems={'center'}>
      <Typography
        component={'span'}
        variant={'h5'}
        whiteSpace={'pre'}
        marginRight={1}
        className={'invest-Balance-Title'}
      >
        {t('labelInvestBalanceTitle')}
      </Typography>
    </Typography>
  )
}
export const OverviewTitle = () => {
  const { t } = useTranslation()
  return (
    <Typography display={'inline-flex'} alignItems={'center'}>
      <Typography
        component={'span'}
        variant={'h5'}
        whiteSpace={'pre'}
        marginRight={1}
        className={'invest-Overview-Title'}
      >
        {t('labelInvestOverviewTitle')}
      </Typography>
    </Typography>
  )
}
export const AmmTitle = () => {
  const { t } = useTranslation()
  return (
    <Typography display={'inline-flex'} alignItems={'center'}>
      <Typography
        component={'span'}
        variant={'h5'}
        whiteSpace={'pre'}
        marginRight={1}
        className={'invest-Amm-Title'}
      >
        {t('labelInvestAmmTitle')}
      </Typography>
    </Typography>
  )
}

export const DefiTitle = () => {
  const { t } = useTranslation()

  return (
    <Typography display={'inline-flex'} alignItems={'center'}>
      <Typography
        component={'span'}
        variant={'h5'}
        whiteSpace={'pre'}
        marginRight={1}
        className={'invest-defi-Title'}
      >
        {t('labelInvestDefiTitle')}
      </Typography>
    </Typography>
  )
}

export const InvestPage = withTranslation('common', { withRef: true })(() => {
  let match: any = useRouteMatch('/invest/:item?')
  const history = useHistory()
  const {
    confirmDualInvest: confirmDualInvestFun,
    confirmedLRCStakeInvest: confirmedLRCInvestFun,
  } = confirmation.useConfirmation()
  const [confirmDualInvest, setConfirmDualInvest] = React.useState(
    'hidden' as 'hidden' | 'all' | 'USDCOnly',
  )
  const {
    showLRCStakignPopup: confirmedLRCStakeInvest,
    setShowLRCStakignPopup: setConfirmedLRCStakeInvestInvest,
    confirmationNeeded,
  } = usePopup()

  const [showBeginnerModeHelp, setShowBeginnerModeHelp] = React.useState(false)
  const onShowBeginnerModeHelp = React.useCallback((show: boolean) => {
    setShowBeginnerModeHelp(show)
  }, [])
  const [tabIndex, setTabIndex] = React.useState<InvestType>(
    (InvestRouter.includes(match?.params?.item)
      ? InvestType[match?.params?.item]
      : InvestType.Overview) as any,
    // InvestType.Overview
  )
  const [isShowTab, setIsShowTab] = React.useState<Boolean>(false)
  React.useEffect(() => {
    switch (match?.params.item) {
      case InvestRouter[InvestType.MyBalance]:
        setTabIndex(InvestType.MyBalance)
        setIsShowTab(true)
        return
      // return ;
      case InvestRouter[InvestType.AmmPool]:
        setTabIndex(InvestType.AmmPool)
        setIsShowTab(false)
        return
      case InvestRouter[InvestType.DeFi]:
        setTabIndex(InvestType.DeFi)
        setIsShowTab(false)
        return
      case InvestRouter[InvestType.Dual]:
        setTabIndex(InvestType.Dual)
        setIsShowTab(false)
        return
      case InvestRouter[InvestType.Stack]:
        setTabIndex(InvestType.Stack)
        setIsShowTab(false)
        return
      case InvestRouter[InvestType.LeverageETH]:
        setTabIndex(InvestType.LeverageETH)
        setIsShowTab(false)
        return
      case InvestRouter[InvestType.Overview]:
      default:
        setTabIndex(InvestType.Overview)
        setIsShowTab(true)
        return
    }
  }, [match?.params.item])

  return (
    <Box flex={1} flexDirection={'column'} display={'flex'}>
      {isShowTab && (
        <Box display={'flex'}>
          <Tabs
            variant={'scrollable'}
            value={tabIndex}
            onChange={(_e, value) => {
              history.push(`/invest/${InvestRouter[value]}`)
              setTabIndex(value)
            }}
          >
            <Tab value={InvestType.Overview} label={<OverviewTitle />} />
            <Tab value={InvestType.MyBalance} label={<BalanceTitle />} />
            <Tab
              sx={{ visibility: 'hidden', width: 0 }}
              value={InvestType.AmmPool}
              label={<AmmTitle />}
            />
            <Tab
              sx={{ visibility: 'hidden', width: 0 }}
              value={InvestType.DeFi}
              label={<DefiTitle />}
            />
            <Tab
              sx={{ visibility: 'hidden', width: 0 }}
              value={InvestType.LeverageETH}
              label={<>todo</>}
            />
          </Tabs>
        </Box>
      )}
      <Box flex={1} component={'section'} marginTop={1} display={'flex'}>
        {tabIndex === InvestType.Overview && <OverviewPanel />}
        {tabIndex === InvestType.AmmPool && <PoolsPanel />}
        {tabIndex === InvestType.DeFi && <DeFiPanel />}
        {tabIndex === InvestType.Dual && (
          <DualListPanel
            showBeginnerModeHelp={showBeginnerModeHelp}
            onShowBeginnerModeHelp={onShowBeginnerModeHelp}
            setConfirmDualInvest={setConfirmDualInvest}
          />
        )}
        {tabIndex === InvestType.MyBalance && (
          <Box flex={1} alignItems={'stretch'} display={'flex'} flexDirection={'column'}>
            <ViewAccountTemplate activeViewTemplate={<MyLiquidityPanel />} />
          </Box>
        )}
        {tabIndex === InvestType.Stack && (
          <StackTradePanel setConfirmedLRCStakeInvestInvest={setConfirmedLRCStakeInvestInvest} />
        )}
        {tabIndex === InvestType.LeverageETH && <LeverageETHPanel />}
      </Box>

      <ConfirmInvestDualRisk
        open={confirmDualInvest !== 'hidden'}
        USDCOnly={confirmDualInvest === 'USDCOnly'}
        handleClose={(_e, isAgree) => {
          if (!isAgree) {
            history.goBack()
          } else {
            confirmDualInvestFun()
            setShowBeginnerModeHelp(true)
            setTimeout(() => {
              onShowBeginnerModeHelp(false)
            }, 5 * 1000)
          }
        }}
      />
      <ConfirmInvestLRCStakeRisk
        open={confirmedLRCStakeInvest}
        confirmationNeeded={confirmationNeeded}
        handleClose={(_e, isAgree) => {
          setConfirmedLRCStakeInvestInvest({ show: false, confirmationNeeded: false })
          if (!isAgree) {
            history.goBack()
          } else {
            confirmedLRCInvestFun()
          }
        }}
      />
    </Box>
  )
})
