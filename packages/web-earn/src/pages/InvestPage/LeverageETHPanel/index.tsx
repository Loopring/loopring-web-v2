import React from 'react'
import styled from '@emotion/styled'
import { Box, CardContent, Grid, Typography } from '@mui/material'
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
  useToggle,
  useSettings,
} from '@loopring-web/component-lib'
import { confirmation, useDefiMap, useToast } from '@loopring-web/core'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { BackIcon, SatkingLogo, SoursURL, TOAST_TIME } from '@loopring-web/common-resources'
import { MaxWidthContainer, containerColors } from '..'
import { useTheme } from '@emotion/react'

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

const ButtonStyled = styled(Button)`
  background-color: var(--color-button-outlined);
  color: var(--color-text-primary);
  :hover {
    background-color: var(--color-button-outlined);
    ::before {
      border-radius: 4px;
    }
  }
`

const LeverageETHPanel: any = withTranslation('common')(({ t }: WithTranslation & {}) => {
  const { marketLeverageArray: marketArray } = useDefiMap()
  const {
    confirmedLeverageETHInvest,
    showLeverageETHPopup,
    setShowLeverageETHPopup,
    confirmation: { confirmedLeverageETHInvest: confirmed, confirmationNeeded },
  } = confirmation.useConfirmation()
  const {
    toggle: {
      CIETHInvest: { enable },
    },
  } = useToggle()

  const _confirmedDefiInvest = {
    isShow: showLeverageETHPopup,
    type: 'CiETH',
    confirmationNeeded,
  }
  const setConfirmedDefiInvest = ({ isShow }: { isShow: boolean }) => {
    if (isShow) {
      setShowLeverageETHPopup({ isShow: true, confirmationNeeded: true })
    } else {
      setShowLeverageETHPopup({ isShow: false, confirmationNeeded: true })
    }
  }
  const match: any = useRouteMatch('/invest/leverageETH/:isJoin?')
  const [serverUpdate, setServerUpdate] = React.useState(false)
  const { toastOpen, setToastOpen, closeToast } = useToast()
  const history = useHistory()
  const isJoin = match?.params?.isJoin?.toUpperCase() !== 'Redeem'.toUpperCase()
  React.useEffect(() => {
    setConfirmedDefiInvest({
      isShow: enable ? !confirmed : false,
    })
  }, [confirmed, enable])
  const theme = useTheme()
  const { isMobile } = useSettings()
  return (
    <Box display={'flex'} flexDirection={'column'} flex={1}>
      <MaxWidthContainer
        display={'flex'}
        justifyContent={'space-between'}
        background={containerColors[0]}
        height={6 * theme.unit}
        alignItems={'center'}
        containerProps={{
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Box width={'100%'} display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
          <Button
            startIcon={<BackIcon htmlColor={'var(--color-text-primary)'} fontSize={'small'} />}
            variant={'text'}
            size={'medium'}
            sx={{ color: 'var(--color-text-primary)' }}
            color={'inherit'}
            onClick={() => history.push(`/invest/overview`)}
          >
            {t('labelBack')}
          </Button>

          {/* <Typography variant={'h4'}>
            {t('labelLeverageETHStaking')}
          </Typography> */}
          <Button onClick={() => history.push('/invest/balance')} variant={'text'}>
            {t('labelMyInvestLRCStaking')}{' '}
            {<BackIcon sx={{ marginLeft: 0.5, transform: 'rotate(180deg)' }} />}
          </Button>
        </Box>
      </MaxWidthContainer>
      <MaxWidthContainer minHeight={'70vh'} paddingY={5}>
        <StyleWrapper
          display={'flex'}
          flexDirection={'column'}
          justifyContent={'center'}
          alignItems={'center'}
          flex={1}
          marginTop={6}
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
      </MaxWidthContainer>
    </Box>
  )
})

export default LeverageETHPanel
