import React from 'react'
import styled from '@emotion/styled'
import { Box, CardContent, Grid } from '@mui/material'
import { WithTranslation, withTranslation } from 'react-i18next'
import { TradePanel } from './TradePanel'
import {
  boxLiner,
  Button,
  ConfirmInvestDefiServiceUpdate,
  Toast,
  LoadingBlock,
  ConfirmInvestDefiRisk,
  ToastType,
} from '@loopring-web/component-lib'
import { confirmation, useDefiMap, usePopup, useToast } from '@loopring-web/core'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { BackIcon, TOAST_TIME } from '@loopring-web/common-resources'

export const StyleWrapper = styled(Box)`
  position: relative;
  border-radius: ${({ theme }) => theme.unit}px;

  .loading-block {
    background: initial;
  }

  .hasLinerBg {
    ${({ theme }) => boxLiner({ theme })}
  }

  border-radius: ${({ theme }) => theme.unit}px;
` as typeof Grid
export const StyleCardContent = styled(CardContent)`
  display: flex;

  &.tableLap {
    display: block;
    width: 100%;
    cursor: pointer;

    .content {
      flex-direction: column;
      align-items: center;
      padding-top: ${({ theme }) => 4 * theme.unit}px;

      .des {
        align-items: center;
        margin: ${({ theme }) => 3 * theme.unit}px 0;
      }

      .backIcon {
        display: none;
      }
    }
  }

  padding: 0;

  &:last-child {
    padding: 0;
  }

  &.isMobile {
    flex: 1;

    .content {
      flex-direction: row;
      width: 100%;

      .des {
        margin-left: ${({ theme }) => 2 * theme.unit}px;
        align-items: flex-start;
      }
    }
  }
` as typeof CardContent

const LeverageETHPanel: any = withTranslation('common')(({ t }: WithTranslation & {}) => {
  const { marketLeverageArray: marketArray } = useDefiMap()
  const {
    confirmedLeverageETHInvest,
    confirmation: { confirmedLeverageETHInvest: confirmed },
  } = confirmation.useConfirmation()

  const {
    confirmationNeeded,
    showLeverageETHPopup,
    setShowLeverageETHPopup
  } = usePopup()
  const _confirmedDefiInvest = {
    isShow: showLeverageETHPopup,
    type: 'CiETH',
    confirmationNeeded,
  }
  const setConfirmedDefiInvest = ({
    isShow,
  }: {
    isShow: boolean
  }) => {
    if (isShow) {
      setShowLeverageETHPopup({ show: true, confirmationNeeded: true })
    } else {
      setShowLeverageETHPopup({ show: false, confirmationNeeded: true })
    }
  }
  const match: any = useRouteMatch('/invest/leverageETH/:isJoin?')
  const [serverUpdate, setServerUpdate] = React.useState(false)
  const { toastOpen, setToastOpen, closeToast } = useToast()
  const history = useHistory()
  const isJoin = match?.params?.isJoin?.toUpperCase() !== 'Redeem'.toUpperCase()

  return (
    <Box display={'flex'} flexDirection={'column'} flex={1} marginBottom={2}>
      <Box marginBottom={2} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
        <Button
          startIcon={<BackIcon fontSize={'small'} />}
          variant={'text'}
          size={'medium'}
          sx={{ color: 'var(--color-text-secondary)' }}
          color={'inherit'}
          onClick={() =>
            history.push(match?.params?.isJoin ? '/invest/balance' : '/invest/overview')
          }
        >
          {t('labelLeverageETHTitle')}
          {/*<Typography color={"textPrimary"}></Typography>*/}
        </Button>
        <Button
          variant={'outlined'}
          sx={{ marginLeft: 2 }}
          onClick={() => history.push('/invest/balance/stake')}
        >
          {t('labelInvestMyDefi')}
        </Button>
      </Box>
      <StyleWrapper
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'center'}
        alignItems={'center'}
        flex={1}
      >
        {marketArray?.length ? (
          // match?.params?.market && _market ? (
          <TradePanel
            isJoin={isJoin}
            setServerUpdate={setServerUpdate}
            setToastOpen={setToastOpen}
          />
        ) : (
          // )
          // : (
          //   <LandDefiInvest setConfirmedDefiInvest={setConfirmedDefiInvest} />
          // )
          <LoadingBlock />
        )}
        <Toast
          alertText={toastOpen?.content ?? ''}
          severity={toastOpen?.type ?? ToastType.success}
          open={toastOpen?.open ?? false}
          autoHideDuration={TOAST_TIME}
          onClose={closeToast}
        />

        <ConfirmInvestDefiServiceUpdate
          open={serverUpdate}
          handleClose={() => setServerUpdate(false)}
        />
        <ConfirmInvestDefiRisk
          confirmationNeeded={confirmationNeeded}
          open={_confirmedDefiInvest.isShow}
          type={_confirmedDefiInvest.type as any}
          handleClose={(_e, isAgree) => {
            if (!isAgree) {
              setConfirmedDefiInvest({ isShow: false })
              history.push('/invest/overview')
            } else {
              confirmedLeverageETHInvest()
              setConfirmedDefiInvest({ isShow: false })
            }
          }}
        />
      </StyleWrapper>
    </Box>
  )
})

export default LeverageETHPanel
