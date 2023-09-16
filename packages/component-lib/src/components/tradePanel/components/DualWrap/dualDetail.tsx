import { DualDetailProps, DualDisplayMode } from './Interface'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useSettings } from '../../../../stores'
import {
  BackIcon,
  EmptyValueTag,
  getValuePrecisionThousand,
  hexToRGB,
  Info2Icon,
  myLog,
  UpColor,
  YEAR_DAY_MINUTE_FORMAT,
} from '@loopring-web/common-resources'
import { Box, Divider, Link, Modal, Switch, Tooltip, Typography } from '@mui/material'
import { ModalCloseButton } from '../../../basic-lib'
import { ModifyParameter } from './ModifyParameter'
import * as sdk from '@loopring-web/loopring-sdk'
import moment from 'moment/moment'
import styled from '@emotion/styled'
import { SwitchPanelStyled } from '../../../styled'

const BoxChartStyle = styled(Box)(({ theme }: any) => {
  const fillColor: string = theme.colorBase.textThird
  const whiteColor: string = theme.colorBase.white
  const svg = encodeURIComponent(
    `<svg viewBox='0 0 24 24' fill='${fillColor}' height='24' width='24'  xmlns='http://www.w3.org/2000/svg'><path d='M12 15L8.5359 11.25L15.4641 11.25L12 15Z' /></svg>`,
  )
  const svgStar = encodeURIComponent(
    `<svg viewBox='0 0 24 24' fill='${whiteColor}' height='24' width='24'  xmlns='http://www.w3.org/2000/svg'><path d='M11.6085 5L13.4046 10.5279H19.2169L14.5146 13.9443L16.3107 19.4721L11.6085 16.0557L6.90617 19.4721L8.70228 13.9443L4 10.5279H9.81234L11.6085 5Z' /></svg>`,
  )
  return `
   border-radius: ${theme.unit / 2}px;
   overflow:hidden;
   background: var(--color-table-header-bg);
  .backView{
      
      height: 1px;
      left: 0;
      right: 0;
      bottom: 48px;
      position: absolute;
      background-color: var(--color-primary);
      &:before {
        content: "";
        display: block;
        height: 24px;
        width: 24px;
        transform: scale(${14 / 24});
        border-radius: 50%;
        background-image: url("data:image/svg+xml, ${svgStar}");
        background-color: var(--color-primary);
        bottom: -12px;
        left: calc(50% - 12px);
        position: absolute;
        z-index:99;
      }
      .line {
        display: block;
        height: 5px;
        background-color: var(--color-primary);
        bottom: -2px;
        left: 0;
        position: absolute;
        z-index:20;
    }
    }
    .point {
      position: absolute;
      display:flex;
      flex-direction:column;
      align-items: center;
      top: ${theme.unit}px;
      &:after {
        content: "";
        display: block;
        height: 24px;
        width:24px;
        background-image: url("data:image/svg+xml, ${svg}");
        left: calc(50% - 12px);
        bottom: -20px;
        position: absolute;
      }
    }
    .point1 {
      left: 50%;
      transform: translateX(-50%);  
    }
    .point2 {
       transform: translateX(-50%);  
    }
   
    .returnV{
      position: absolute;
      bottom:0;
      height: 48px;
      width:50%;
      display:flex;
      align-items: center;
      justify-content: center;
      text-align:center;
    }
    .returnV1{
      right: 25%;
      transform: translateX(50%);  
      background-color: ${hexToRGB(theme.colorBase.warning, 0.3)};

    }
    .returnV2{
      left: 25%;
      transform: translateX(-50%);
      background-color: ${hexToRGB(theme.colorBase.success, 0.3)};

     
    }
`
})

export const DualDetail = ({
  isOrder = false,
  displayMode = DualDisplayMode.nonBeginnerMode,
  isPriceEditable = true,
  coinSell,
  ...rest
}: DualDetailProps) => {
  const { dualViewInfo, currentPrice, tokenMap, lessEarnView, greaterEarnView, onChange } = rest
  const [showEdit, setShowEdit] = React.useState(false)
  const { t } = useTranslation()
  const { upColor, isMobile } = useSettings()
  const { base, quote, precisionForPrice } = currentPrice
  const currentView = React.useMemo(
    () =>
      base
        ? getValuePrecisionThousand(
            currentPrice.currentPrice,
            precisionForPrice ? precisionForPrice : tokenMap[quote].precisionForOrder,
            precisionForPrice ? precisionForPrice : tokenMap[quote].precisionForOrder,
            precisionForPrice ? precisionForPrice : tokenMap[quote].precisionForOrder,
            true,
            { floor: true },
          )
        : EmptyValueTag,
    [dualViewInfo.currentPrice.currentPrice, precisionForPrice, tokenMap],
  )

  const targetView = React.useMemo(() => {
    return dualViewInfo?.strike
      ? getValuePrecisionThousand(
          dualViewInfo.strike,
          precisionForPrice ? precisionForPrice : tokenMap[quote].precisionForOrder,
          precisionForPrice ? precisionForPrice : tokenMap[quote].precisionForOrder,
          precisionForPrice ? precisionForPrice : tokenMap[quote].precisionForOrder,
          true,
          { floor: true },
        ) + ` ${quote}`
      : EmptyValueTag
  }, [dualViewInfo?.strike])

  const renewTargetPriceView = React.useMemo(() => {
    return coinSell?.renewTargetPrice
      ? getValuePrecisionThousand(
          coinSell?.renewTargetPrice,
          precisionForPrice ? precisionForPrice : tokenMap[quote].precisionForOrder,
          precisionForPrice ? precisionForPrice : tokenMap[quote].precisionForOrder,
          precisionForPrice ? precisionForPrice : tokenMap[quote].precisionForOrder,
          true,
          { floor: true },
        ) + ` ${quote}`
      : EmptyValueTag
  }, [
    // Number(dualViewInfo?.strike).toLocaleString('en-US')
    //   ? Number(dualViewInfo?.strike).toLocaleString('en-US')
    //   : EmptyValueTag,
    coinSell?.renewTargetPrice,
  ])

  myLog('dualViewInfo', dualViewInfo)
  return (
    <>
      <Modal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <SwitchPanelStyled width={'var(--modal-width)'}>
          <Box display={'flex'} width={'100%'} flexDirection={'column'}>
            <ModalCloseButton onClose={() => setShowEdit(false)} t={t} {...rest} />
            <ModifyParameter
              onClose={() => setShowEdit(false)}
              {...rest}
              coinSell={coinSell}
              isPriceEditable={isPriceEditable}
            />
          </Box>
        </SwitchPanelStyled>
      </Modal>

      <Box>
        <Box display={'flex'} flexDirection={'column'}>
          <Box display={'flex'} flexDirection={'column'} paddingX={2}>
            <Box display={'flex'} justifyContent={'space-between'}>
              <Tooltip title={t('labelDualAutoTitleDes').toString()}>
                <Typography
                  component={'span'}
                  variant={'body1'}
                  color={'textSecondary'}
                  display={'inline-flex'}
                  alignItems={'center'}
                >
                  <Trans i18nKey={'labelDualAutoTitle'}>
                    <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                  </Trans>
                </Typography>
              </Tooltip>
              <Typography component={'span'} variant={'inherit'}>
                <Switch
                  checked={coinSell.isRenew}
                  color='default'
                  onChange={(e) =>
                    onChange({
                      ...coinSell,
                      isRenew: e.target.checked,
                    })
                  }
                />
              </Typography>
            </Box>

            <Typography
              component={'span'}
              variant={'body2'}
              color={'var(--color-text-third)'}
              display={'inline-flex'}
              alignItems={'center'}
              paddingBottom={1}
            >
              <Trans i18nKey={'labelDualAutoDetail'}>
                Auto Reinvest will try to find a new product which based on the following rule at
                16:00 on the settlement day.
              </Trans>
            </Typography>
          </Box>
        </Box>
        {coinSell.isRenew && (
          <Box
            display={'flex'}
            flexDirection={'column'}
            sx={{
              background: 'var(--field-opacity)',
            }}
            paddingY={1}
            marginX={2}
            borderRadius={1 / 2}
          >
            <Box display={'flex'} justifyContent={'space-between'} paddingBottom={1} paddingX={2}>
              <Tooltip title={t(`labelDualAuto${dualViewInfo?.dualType}PriceDes`).toString()}>
                <Typography
                  component={'span'}
                  variant={'body1'}
                  color={'textSecondary'}
                  display={'inline-flex'}
                  alignItems={'center'}
                >
                  <Trans i18nKey={`labelDualAuto${dualViewInfo?.dualType}Price`}>
                    type Price
                    <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                  </Trans>
                </Typography>
              </Tooltip>
              {isPriceEditable ? (
                <Link
                  onClick={() => {
                    setShowEdit(true)
                  }}
                  component={'a'}
                  variant={'body1'}
                  display={'inline-flex'}
                  alignItems={'center'}
                >
                  {renewTargetPriceView}
                  <BackIcon fontSize={'small'} sx={{ transform: 'rotate(180deg)' }} />
                </Link>
              ) : (
                <Typography component={'span'} variant={'body1'}>
                  {renewTargetPriceView}
                </Typography>
              )}
            </Box>
            <Box display={'flex'} justifyContent={'space-between'} paddingX={2}>
              <Tooltip title={t(`labelDualAutoDurationDes`).toString()}>
                <Typography
                  component={'span'}
                  variant={'body1'}
                  color={'textSecondary'}
                  display={'inline-flex'}
                  alignItems={'center'}
                >
                  <Trans i18nKey={`labelDualAutoDuration`}>
                    Duration
                    <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                  </Trans>
                </Typography>
              </Tooltip>
              <Link
                onClick={() => {
                  setShowEdit(true)
                }}
                component={'a'}
                variant={'body1'}
                display={'inline-flex'}
                alignItems={'center'}
              >
                {coinSell.renewDuration}
                <BackIcon fontSize={'inherit'} sx={{ transform: 'rotate(180deg)' }} />
              </Link>
            </Box>
          </Box>
        )}
        {displayMode === DualDisplayMode.nonBeginnerMode &&
          (isOrder ? (
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              marginTop={-4}
              textAlign={'center'}
              paddingBottom={2}
            >
              {t('labelDuaInvestmentDetails', { ns: 'common' })}
            </Typography>
          ) : (
            <Typography
              variant={'body1'}
              component={'h6'}
              color={'textSecondary'}
              paddingX={2}
              paddingY={1}
            >
              {t('labelDualSettlementCalculator')}
            </Typography>
          ))}
        {displayMode !== DualDisplayMode.beginnerModeStep1 && (
          <Box paddingX={2} paddingBottom={1}>
            <BoxChartStyle height={128} width={'100%'} position={'relative'}>
              <Box className={'point1 point'}>
                <Typography variant={'body2'} whiteSpace={'pre'} color={'textPrimary'}>
                  {t('labelDualTargetPrice3')}
                </Typography>
                <Typography>{targetView}</Typography>
              </Box>
              <Box
                className={'point2 point'}
                whiteSpace={'pre'}
                sx={{
                  left: sdk
                    .toBig(dualViewInfo.currentPrice?.currentPrice ?? 0)
                    .minus(dualViewInfo.strike)
                    .gte(0)
                    ? '75%'
                    : '25%',
                }}
              >
                <Typography variant={'body2'} color={'textPrimary'}>
                  {t('labelDualCurrentPrice3', {
                    symbol: base,
                  })}
                </Typography>
                <Typography
                  color={upColor == UpColor.green ? 'var(--color-error)' : 'var(--color-success)'}
                >
                  {currentView}
                </Typography>
              </Box>
              <Box className={'returnV1 returnV'}>
                <Typography
                  variant={'body2'}
                  color={'var(--color-warning)'}
                  whiteSpace={'pre-line'}
                >
                  {quote &&
                    t('labelDualReturn', {
                      symbol:
                        (greaterEarnView === '0' ? EmptyValueTag : greaterEarnView) + ' ' + quote,
                    })}
                </Typography>
              </Box>
              <Box className={'returnV2 returnV'}>
                <Typography
                  variant={'body2'}
                  color={'var(--color-success)'}
                  whiteSpace={'pre-line'}
                >
                  {base &&
                    t('labelDualReturn', {
                      symbol: (lessEarnView === '0' ? EmptyValueTag : lessEarnView) + ' ' + base,
                    })}
                </Typography>
              </Box>
              <Box className={'backView'}>
                <Box
                  className={'line'}
                  width={
                    sdk
                      .toBig(dualViewInfo.currentPrice?.currentPrice ?? 0)
                      .minus(dualViewInfo.strike)
                      .gte(0)
                      ? '75%'
                      : '25%'
                  }
                />
              </Box>
            </BoxChartStyle>
          </Box>
        )}
        {displayMode === DualDisplayMode.beginnerModeStep2 && (
          <>
            <Box paddingX={2} marginTop={2}>
              <Typography variant={'h5'} marginBottom={0}>
                {t('At Settlement Date')}
              </Typography>
              <Typography color={'textSecondary'} marginBottom={1}>
                {t('labelDualBeginnerIndexPriceDes')}
              </Typography>
              <Box marginBottom={1} display={'flex'} justifyContent={'space-between'}>
                <Typography>
                  {t(
                    dualViewInfo.isUp
                      ? 'labelDualBeginnerPriceSmallerThan'
                      : 'labelDualBeginnerPriceSmallerThanOrEqual',
                    {
                      value: targetView,
                    },
                  )}
                </Typography>
                <Typography>
                  {base &&
                    t('labelDualReturn', {
                      symbol: (lessEarnView === '0' ? EmptyValueTag : lessEarnView) + ' ' + base,
                    })}
                </Typography>
              </Box>
              <Box marginBottom={5} display={'flex'} justifyContent={'space-between'}>
                <Typography>
                  {t(
                    dualViewInfo.isUp
                      ? 'labelDualBeginnerPriceGreaterThanOrEqual'
                      : 'labelDualBeginnerPriceGreaterThan',
                    {
                      value: targetView,
                    },
                  )}
                </Typography>
                <Typography>
                  {quote &&
                    t('labelDualReturn', {
                      symbol:
                        (greaterEarnView === '0' ? EmptyValueTag : greaterEarnView) + ' ' + quote,
                    })}
                </Typography>
              </Box>
            </Box>
            <Typography textAlign={'center'} color={'var(--color-text-third)'} variant={'body2'}>
              {t('labelDualBeginnerLockingDes')}
            </Typography>
          </>
        )}
        {displayMode !== DualDisplayMode.beginnerModeStep2 && (
          <Box
            display={'flex'}
            flexDirection={'column'}
            alignItems={'stretch'}
            justifyContent={'space-between'}
            marginTop={displayMode === DualDisplayMode.nonBeginnerMode ? 2 : 0}
            marginX={2}
            paddingX={2}
            paddingTop={1}
            borderRadius={1 / 2}
            sx={{
              background: 'var(--field-opacity)',
            }}
          >
            {displayMode === DualDisplayMode.nonBeginnerMode && (
              <>
                <Typography
                  variant={'body1'}
                  display={'inline-flex'}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                  paddingBottom={1}
                >
                  <Typography component={'span'} variant={'inherit'} color={'textSecondary'}>
                    {t('labelDualCalcLabel', {
                      symbol: base,
                      tag: dualViewInfo.isUp ? '<' : '≤',
                      target: targetView,
                      interpolation: {
                        escapeValue: false,
                      },
                    })}
                  </Typography>
                  <Typography
                    component={'span'}
                    variant={'inherit'}
                    color={'textPrimary'}
                    whiteSpace={'pre-line'}
                  >
                    {t('labelDualReturnValue', {
                      symbol: base,
                      value: lessEarnView === '0' ? EmptyValueTag : lessEarnView,
                    })}
                  </Typography>
                </Typography>
                <Typography
                  variant={'body1'}
                  display={'inline-flex'}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                  paddingBottom={3}
                >
                  <Typography
                    component={'span'}
                    variant={'inherit'}
                    color={'textSecondary'}
                    whiteSpace={'pre-line'}
                  >
                    {t('labelDualCalcLabel', {
                      symbol: base,
                      tag: dualViewInfo.isUp ? '≥' : '>',
                      target: targetView,
                      interpolation: {
                        escapeValue: false,
                      },
                    })}
                  </Typography>
                  <Typography component={'span'} variant={'inherit'} color={'textPrimary'}>
                    {t('labelDualReturnValue', {
                      symbol: quote,
                      value: greaterEarnView === '0' ? EmptyValueTag : greaterEarnView,
                    })}
                  </Typography>
                </Typography>
              </>
            )}

            {isOrder && (
              <Box paddingBottom={1}>
                <Divider />
              </Box>
            )}
            <Typography
              variant={'body1'}
              display={'inline-flex'}
              alignItems={'center'}
              justifyContent={'space-between'}
              paddingBottom={1}
              order={isOrder ? 4 : 0}
            >
              <Tooltip title={t('labelDualCurrentAPRDes').toString()}>
                <Typography
                  component={'span'}
                  variant={'inherit'}
                  color={'textSecondary'}
                  display={'inline-flex'}
                  alignItems={'center'}
                >
                  <Trans i18nKey={'labelDualCurrentAPR'}>
                    APR
                    <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                  </Trans>
                </Typography>
              </Tooltip>
              <Typography
                component={'span'}
                variant={'inherit'}
                color={upColor == UpColor.green ? 'var(--color-success)' : 'var(--color-error)'}
              >
                {dualViewInfo?.apy}
              </Typography>
            </Typography>

            <Typography
              variant={'body1'}
              display={'inline-flex'}
              alignItems={'center'}
              justifyContent={'space-between'}
              paddingBottom={1}
              order={isOrder ? 5 : 1}
            >
              <Tooltip title={t('labelDualTargetPriceDes').toString()}>
                <Typography
                  component={'span'}
                  variant={'inherit'}
                  color={'textSecondary'}
                  display={'inline-flex'}
                  alignItems={'center'}
                >
                  <Trans i18nKey={'labelDualTargetPrice2'}>
                    Target Price
                    <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                  </Trans>
                </Typography>
              </Tooltip>
              <Typography component={'span'} variant={'inherit'} color={'textPrimary'}>
                {targetView}
              </Typography>
            </Typography>
            {isOrder && dualViewInfo.enterTime && (
              <>
                <Typography
                  variant={'body1'}
                  display={'inline-flex'}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                  paddingBottom={1}
                  order={1}
                >
                  <Typography
                    component={'span'}
                    variant={'inherit'}
                    color={'textSecondary'}
                    display={'inline-flex'}
                    alignItems={'center'}
                  >
                    {t('labelDualSubDate')}
                  </Typography>
                  <Typography component={'span'} variant={'inherit'} color={'textPrimary'}>
                    {moment(new Date(dualViewInfo.enterTime)).format(YEAR_DAY_MINUTE_FORMAT)}
                  </Typography>
                </Typography>
                <Typography
                  variant={'body1'}
                  display={'inline-flex'}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                  paddingBottom={1}
                  order={0}
                >
                  <Typography
                    component={'span'}
                    variant={'inherit'}
                    color={'textSecondary'}
                    display={'inline-flex'}
                    alignItems={'center'}
                  >
                    {t('labelDualAmount')}
                  </Typography>
                  <Typography component={'span'} variant={'inherit'} color={'textPrimary'}>
                    {dualViewInfo?.amount}
                  </Typography>
                </Typography>
              </>
            )}
            <Typography
              variant={'body1'}
              display={'inline-flex'}
              alignItems={'center'}
              justifyContent={'space-between'}
              paddingBottom={1}
              order={isOrder ? 2 : 2}
            >
              <Typography
                component={'span'}
                variant={'inherit'}
                color={'textSecondary'}
                display={'inline-flex'}
                alignItems={'center'}
              >
                {t('labelDualSettleDate')}
              </Typography>
              <Typography component={'span'} variant={'inherit'} color={'textPrimary'}>
                {moment(new Date(dualViewInfo.expireTime)).format(YEAR_DAY_MINUTE_FORMAT)}
              </Typography>
            </Typography>
            <Typography
              variant={'body1'}
              display={'inline-flex'}
              alignItems={'center'}
              justifyContent={'space-between'}
              paddingBottom={1}
              order={isOrder ? 3 : 3}
            >
              <Typography
                component={'span'}
                variant={'inherit'}
                color={'textSecondary'}
                display={'inline-flex'}
                alignItems={'center'}
              >
                {t('labelDualSettleDateDur')}
              </Typography>
              <Typography component={'span'} variant={'inherit'} color={'textPrimary'}>
                {getValuePrecisionThousand(
                  (dualViewInfo.expireTime -
                    (isOrder && dualViewInfo.enterTime ? dualViewInfo.enterTime : Date.now())) /
                    (1000 * 60 * 60 * 24),
                  1,
                  1,
                  1,
                  true,
                  { floor: true },
                )}
              </Typography>
            </Typography>
          </Box>
        )}
      </Box>
    </>
  )
}
