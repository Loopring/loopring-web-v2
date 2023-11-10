import { useRouteMatch } from 'react-router-dom'

import { Box, BoxProps, Container, Typography } from '@mui/material'

import { useTranslation, withTranslation } from 'react-i18next'
import { ComingSoonPanel, ConfirmInvestLRCStakeRisk, useToggle } from '@loopring-web/component-lib'
import React from 'react'
import { confirmation, usePopup, ViewAccountTemplate } from '@loopring-web/core'
import { MyLiquidity } from './MyLiquidityPanel'
import { PoolsPanel } from './PoolsPanel'
import { DeFiPanel } from './DeFiPanel'
import { OverviewPanel } from './OverviewPanel'
import { DualListPanel } from './DualPanel/DualListPanel'
import { StackTradePanel } from './StakePanel/StackTradePanel'
import LeverageETHPanel from './LeverageETHPanel'
import { InvestType, RouterPath, InvestRouter } from '@loopring-web/common-resources'

export const containerColors = ['var(--color-global-bg)', 'var(--color-pop-bg)']

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
const InvestRouterMatch = `${RouterPath.invest}/:item?`
export const InvestPage = withTranslation('common', { withRef: true })(() => {
  let match: any = useRouteMatch(InvestRouterMatch)
  const {
    confirmedLRCStakeInvest: confirmedLRCInvestFun,
    setShowLRCStakingPopup: setConfirmedLRCStakeInvestInvest,
    confirmation: { confirmationNeeded, showLRCStakignPopup: confirmedLRCStakeInvest },
  } = confirmation.useConfirmation()
  const {
    toggle: { CIETHInvest },
  } = useToggle()

    const [tabIndex, setTabIndex] = React.useState<InvestType>(
        (InvestRouter.find((item) => item.toLowerCase() === match?.params?.item?.toLowerCase())
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
  }, [match?.params?.item])

  return (
    <Box flex={1} flexDirection={'column'} display={'flex'}>
      <Box flex={1} component={'section'} display={'flex'}>
        {tabIndex === InvestType.Overview && <OverviewPanel />}
        {tabIndex === InvestType.AmmPool && <PoolsPanel />}
        {tabIndex === InvestType.DeFi && <DeFiPanel />}
        {tabIndex === InvestType.Dual && <DualListPanel />}
        {tabIndex === InvestType.MyBalance && (
          <Box flex={1} alignItems={'stretch'} display={'flex'} flexDirection={'column'}>
            <ViewAccountTemplate activeViewTemplate={<MyLiquidity />} />
          </Box>
        )}
        {tabIndex === InvestType.Stack && (
          <StackTradePanel setConfirmedLRCStakeInvestInvest={setConfirmedLRCStakeInvestInvest} />
        )}
        {tabIndex === InvestType.LeverageETH &&
          (!CIETHInvest.enable && CIETHInvest.reason === 'no view' ? (
            <ComingSoonPanel />
          ) : (
            <LeverageETHPanel />
          ))}
      </Box>

      <ConfirmInvestLRCStakeRisk
        open={confirmedLRCStakeInvest}
        confirmationNeeded={confirmationNeeded}
        handleClose={(_e, isAgree) => {
          setConfirmedLRCStakeInvestInvest({ show: false, confirmationNeeded: false })
          if (!isAgree) {
            // history.goBack()
          } else {
            confirmedLRCInvestFun()
          }
        }}
      />
    </Box>
  )
})
