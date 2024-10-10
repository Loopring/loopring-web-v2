import { useRouteMatch } from 'react-router-dom'

import { Box, BoxProps, Modal, Typography } from '@mui/material'

import { useTranslation, withTranslation } from 'react-i18next'
import {
  ComingSoonPanel,
  ConfirmInvestLRCStakeRisk,
  ModalCloseButton,
  ModifySetting,
  SwitchPanelStyled,
  useToggle,
} from '@loopring-web/component-lib'
import React from 'react'
import { confirmation, ViewAccountTemplate } from '@loopring-web/core'
import MyLiquidityPanel from './MyLiquidityPanel'
import { PoolsPanel } from './PoolsPanel'
import { DeFiPanel } from './DeFiPanel'
import { OverviewPanel } from './OverviewPanel'
import { DualListPanel } from './DualPanel/DualListPanel'
import { StackTradePanel } from './StakePanel/StackTradePanel'
import LeverageETHPanel from './LeverageETHPanel'
import styled from '@emotion/styled'

export enum InvestType {
  MyBalance = 0,
  AmmPool = 1,
  DeFi = 2,
  Overview = 3,
  Dual = 4,
  Stack = 5,
  LeverageETH = 6,
}
export const containerColors = ['var(--color-global-bg)', 'var(--color-pop-bg)']
const BoxStyled = styled(Box)`
  display: flex;
  justify-content: center;
  @media only screen and (max-width: 1200px) {
    .inner-box {
      width: 100%;
    }
  }
`
export const MaxWidthContainer = (
  props: {
    children: React.ReactNode
    background?: string
    containerProps?: BoxProps
  } & BoxProps,
) => {
  const { containerProps, children, background, sx, ...otherProps } = props
  return (
    <BoxStyled sx={{ background, ...containerProps?.sx }} {...containerProps}>
      <Box
        sx={{
          width: '1200px',
          maxWidth: '100%',
          ...sx,
        }}
        className={'inner-box'}
        paddingX={3}
        {...otherProps}
      >
        {children}
      </Box>
    </BoxStyled>
  )
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
  const {
    confirmation: {
      confirmationNeeded,
      showLRCStakePopup: confirmedLRCStakeInvest,
      showAutoDefault,
    },
    confirmedLRCStakeInvest: confirmedLRCInvestFun,
    setShowAutoDefault,
    setShowLRCStakePopup: setConfirmedLRCStakeInvestInvest,
  } = confirmation.useConfirmation()
  const {
    toggle: { CIETHInvest },
  } = useToggle()
  const { t } = useTranslation()
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
            <ViewAccountTemplate activeViewTemplate={<MyLiquidityPanel />} />
          </Box>
        )}
        {tabIndex === InvestType.Stack && (
          <StackTradePanel symbol='TAIKO' setConfirmedLRCStakeInvestInvest={setConfirmedLRCStakeInvestInvest} />
        )}
        {tabIndex === InvestType.LeverageETH &&
          (!CIETHInvest.enable && CIETHInvest.reason === 'no view' ? (
            <ComingSoonPanel />
          ) : (
            <LeverageETHPanel />
          ))}
      </Box>
      <Modal
        open={showAutoDefault}
        onClose={() => setShowAutoDefault(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <SwitchPanelStyled width={'var(--modal-width)'}>
          <Box display={'flex'} width={'100%'} flexDirection={'column'}>
            <ModalCloseButton onClose={() => setShowAutoDefault(false)} t={t} />
            <ModifySetting onClose={() => setShowAutoDefault(false)} />
          </Box>
        </SwitchPanelStyled>
      </Modal>
      <ConfirmInvestLRCStakeRisk
        open={confirmedLRCStakeInvest}
        confirmationNeeded={confirmationNeeded}
        handleClose={(_e, isAgree) => {
          setConfirmedLRCStakeInvestInvest({ isShow: false, confirmationNeeded: false })
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
