import React from 'react'
import styled from '@emotion/styled'
import { Avatar, Box, Card, CardContent, Grid, Tooltip, Typography } from '@mui/material'
import { useTranslation, WithTranslation, withTranslation } from 'react-i18next'
import { DeFiTradePanel } from './DeFiTradePanel'
import {
  boxLiner,
  Button,
  ConfirmInvestDefiServiceUpdate,
  Toast,
  useSettings,
  LoadingBlock,
  ConfirmInvestDefiRisk,
  ToastType,
} from '@loopring-web/component-lib'
import { confirmation, useDefiMap, useNotify, usePopup, useToast } from '@loopring-web/core'
import { useHistory, useRouteMatch } from 'react-router-dom'
import {
  BackIcon,
  defiRETHAdvice,
  defiWSTETHAdvice,
  Info2Icon,
  MarketType,
  SatkingLogo,
  SoursURL,
  TOAST_TIME,
  UpColor,
} from '@loopring-web/common-resources'
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

const LandDefiInvest = ({
  setConfirmedDefiInvest,
}: {
  setConfirmedDefiInvest: (props: { isShow: boolean; type: 'RETH' | 'WSETH' }) => void
}) => {
  const history = useHistory()
  const { notifyMap } = useNotify()
  const { marketMap: defiMarketMap } = useDefiMap()
  const { t } = useTranslation('common')
  const { isMobile, upColor } = useSettings()
  const {
    confirmation: { confirmedRETHDefiInvest, confirmedWSETHDefiInvest },
  } = confirmation.useConfirmation()
  // const {
  //   confirmedRETHDefiInvest: confirmedRETHDefiInvestFun,
  //   confirmedWSETHDefiInvest: confirmedWSETHDefiInvestFun,
  // } = confirmation.useConfirmation();

  const investAdviceList = [
    {
      ...defiWSTETHAdvice,
      ...(notifyMap?.invest?.STAKE ? notifyMap?.invest?.STAKE[0] : {}),
      click: () => {
        if (!confirmedWSETHDefiInvest) {
          setConfirmedDefiInvest({ isShow: true, type: 'WSETH' })
        } else {
          history.push(defiWSTETHAdvice.router)
        }
      },
      apy: defiMarketMap[defiWSTETHAdvice?.market ?? '']?.apy,
    },
    {
      ...defiRETHAdvice,
      ...(notifyMap?.invest?.STAKE ? notifyMap?.invest?.STAKE[1] : {}),
      click: () => {
        if (!confirmedRETHDefiInvest) {
          setConfirmedDefiInvest({ isShow: true, type: 'RETH' })
        } else {
          history.push(defiRETHAdvice.router)
        }
      },
      apy: defiMarketMap[defiRETHAdvice?.market ?? '']?.apy,
    },
  ]

  return (
    <Box flex={1} display={'flex'} alignItems={'center'} alignSelf={'stretch'}>
      <Grid container spacing={isMobile ? 2 : 4} padding={3} flex={1} justifyContent={'center'}>
        {investAdviceList.map((item, index) => {
          return (
            <React.Fragment key={item.type + index}>
              {item.enable ? (
                <Grid item xs={12} md={4} lg={3}>
                  <Card sx={{ display: 'flex' }} onClick={item.click}>
                    <StyleCardContent className={isMobile ? 'isMobile' : 'tableLap'}>
                      <Box
                        className={'content'}
                        display={'flex'}
                        flexDirection={'row'}
                        alignItems={'center'}
                      >
                        <Avatar
                          variant='circular'
                          style={{
                            height: 'var(--svg-size-huge)',
                            width: 'var(--svg-size-huge)',
                          }}
                          src={item.banner}
                        />
                        <Box
                          flex={1}
                          display={'flex'}
                          flexDirection={'column'}
                          paddingLeft={1}
                          className={'des'}
                        >
                          <Typography variant={'h4'}>
                            {t(item.titleI18n, { ns: 'layout' })}
                          </Typography>
                          <Typography
                            variant={'body2'}
                            textOverflow={'ellipsis'}
                            whiteSpace={'pre'}
                            overflow={'hidden'}
                            color={'textSecondary'}
                          >
                            {t(item.desI18n, { ns: 'layout' })}
                          </Typography>
                          {isMobile ? (
                            <Typography
                              variant={'body1'}
                              textOverflow={'ellipsis'}
                              whiteSpace={'pre'}
                              overflow={'hidden'}
                              paddingTop={1}
                              color={
                                upColor === UpColor.green
                                  ? 'var(--color-success)'
                                  : 'var(--color-error)'
                              }
                            >
                              {'APR: ' + item.apy + '%'}
                            </Typography>
                          ) : (
                            <Typography
                              display={'flex'}
                              flexDirection={'column'}
                              alignItems={'center'}
                              marginTop={2}
                              component={'span'}
                            >
                              <Typography
                                variant={'h3'}
                                component={'span'}
                                color={
                                  upColor === UpColor.green
                                    ? 'var(--color-success)'
                                    : 'var(--color-error)'
                                }
                              >
                                {item.apy + '%'}
                              </Typography>
                              <Tooltip title={t('labelEstRateAprDes').toString()}>
                                <Typography
                                  variant={'body2'}
                                  component={'span'}
                                  display={'inline-flex'}
                                  alignItems={'center'}
                                  color={'var(--color-text-third)'}
                                >
                                  {t('labelEstRateApr')}
                                  <Info2Icon color={'inherit'} sx={{ marginLeft: 1 / 2 }} />
                                </Typography>
                              </Tooltip>
                            </Typography>
                          )}
                        </Box>
                        {isMobile ? (
                          <BackIcon
                            className={'backIcon'}
                            fontSize={'small'}
                            htmlColor={'var(--color-text-third)'}
                            sx={{
                              transform: 'rotate(180deg)',
                            }}
                          />
                        ) : (
                          <Button variant={'contained'} fullWidth={true} size={'medium'}>
                            {t('labelInvestBtn')}
                          </Button>
                        )}
                      </Box>
                    </StyleCardContent>
                  </Card>
                </Grid>
              ) : (
                ''
              )}
            </React.Fragment>
          )
        })}
      </Grid>
    </Box>
  )
}
export const DeFiPanel: any = withTranslation('common')(({ t }: WithTranslation & {}) => {
  const { marketArray } = useDefiMap()

  const {
    confirmedRETHDefiInvest: confirmedRETHDefiInvestFun,
    confirmedWSETHDefiInvest: confirmedWSETHDefiInvestFun,
  } = confirmation.useConfirmation()
  // const []
  const {
    confirmationNeeded,
    showRETHStakignPopup,
    showWSTETHStakignPopup,
    setShowRETHStakignPopup,
    setShowWSTETHStakignPopup,
  } = usePopup()
  const _confirmedDefiInvest = {
    isShow: showRETHStakignPopup || showWSTETHStakignPopup,
    type: showRETHStakignPopup ? 'RETH' : showWSTETHStakignPopup ? 'WSETH' : undefined,
    confirmationNeeded,
  }
  const setConfirmedDefiInvest = ({
    isShow,
    type,
  }: {
    isShow: boolean
    type?: 'RETH' | 'WSETH' | undefined
  }) => {
    if (isShow) {
      if (type === 'RETH') {
        setShowRETHStakignPopup({ show: true, confirmationNeeded: true })
      } else {
        setShowWSTETHStakignPopup({ show: true, confirmationNeeded: true })
      }
    } else {
      setShowRETHStakignPopup({ show: false, confirmationNeeded: true })
      setShowWSTETHStakignPopup({ show: false, confirmationNeeded: true })
    }
  }

  const match: any = useRouteMatch('/invest/defi/:market?/:isJoin?')
  const [serverUpdate, setServerUpdate] = React.useState(false)
  const { toastOpen, setToastOpen, closeToast } = useToast()
  const history = useHistory()

  const _market: MarketType = [...(marketArray ? marketArray : [])].find((_item) => {
    if (match?.params?.market) {
      //@ts-ignore
      const [, , base] = _item.match(/(defi-)?(\w+)(-\w+)?/i)
      //@ts-ignore
      const [_base] = match?.params?.market?.split('-')
      return base.toUpperCase() == _base.toUpperCase()
    }
  }) as MarketType
  const isJoin = match?.params?.isJoin?.toUpperCase() !== 'Redeem'.toUpperCase()
  const theme = useTheme()

  return (
    <Box display={'flex'} flexDirection={'column'} flex={1}>
      <MaxWidthContainer
        display={'flex'}
        justifyContent={'space-between'}
        background={containerColors[0]}
      >
        <Box paddingY={7}>
          <Typography marginBottom={2} fontSize={'48px'} variant={'h1'}>
            {t("labelInvestDefiTitle")}
          </Typography>
          <Typography marginBottom={3} color={'var(--color-text-secondary)'} variant={'h4'}>
            {t("labelInvestDefiDes")}
          </Typography>
          <Button onClick={() => history.push('/invest/balance')} sx={{ width: 18 * theme.unit }} variant={'contained'}>
            {t("labelInvestMyAmm")}
          </Button>
        </Box>
        <SatkingLogo />
      </MaxWidthContainer>

      <MaxWidthContainer minHeight={'80vh'} background={containerColors[1]}>
        <Typography marginTop={6} marginBottom={4} textAlign={"center"} variant={"h1"}>
          {t("labelInvestChoseProduct")}
        </Typography>
        <StyleWrapper
          display={'flex'}
          flexDirection={'column'}
          justifyContent={'center'}
          alignItems={'center'}
          flex={1}
        >
          {marketArray?.length ? (
            match?.params?.market && _market ? (
              <DeFiTradePanel
                market={_market}
                isJoin={isJoin}
                setServerUpdate={setServerUpdate}
                setToastOpen={setToastOpen}
              />
            ) : (
              <LandDefiInvest setConfirmedDefiInvest={setConfirmedDefiInvest} />
            )
          ) : (
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
            open={_confirmedDefiInvest.isShow}
            type={_confirmedDefiInvest.type as any}
            confirmationNeeded={confirmationNeeded}
            handleClose={(_e, isAgree) => {
              if (!isAgree) {
                setConfirmedDefiInvest({ isShow: false })
              } else {
                if (_confirmedDefiInvest.type === 'RETH') {
                  confirmedRETHDefiInvestFun()
                  history.push(defiRETHAdvice.router)
                }
                if (_confirmedDefiInvest.type === 'WSETH') {
                  confirmedWSETHDefiInvestFun()
                  history.push(defiWSTETHAdvice.router)
                }
              }
              setConfirmedDefiInvest({ isShow: false })
            }}
          />
        </StyleWrapper>
      </MaxWidthContainer>
    </Box>
  )
})
