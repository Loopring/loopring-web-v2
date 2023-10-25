import { DualDetailProps, DualDisplayMode } from './Interface'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useSettings } from '../../../../stores'
import {
  BackIcon,
  EmptyValueTag,
  getValuePrecisionThousand,
  Info2Icon,
  myLog,
  SoursURL,
  UpColor,
  WarningIcon2,
  YEAR_DAY_MINUTE_FORMAT,
} from '@loopring-web/common-resources'
import {
  Box,
  Divider,
  Switch,
  FormControlLabel,
  Link,
  Modal,
  Tooltip,
  Typography,
  Tab,
} from '@mui/material'
import { ModalCloseButton, Tabs } from '../../../basic-lib'
import { ModifyParameter } from './ModifyParameter'
import * as sdk from '@loopring-web/loopring-sdk'
import moment from 'moment/moment'
import styled from '@emotion/styled'
import { SwitchPanelStyled } from '../../../styled'

const BoxChartStyle = styled(Box)`
  background-clip: content-box;
  background-size: contain;
  background-repeat: no-repeat;
  min-height: 176px;
  width: 100%;
  &.mobile {
    min-height: 122px;
  }

  &.dualHL {
    background-image: url('${SoursURL}/images/dualHL.png');
  }
  &.dualHH {
    background-image: url('${SoursURL}/images/dualHH.png');
  }
  &.dualLL {
    background-image: url('${SoursURL}/images/dualLL.png');
  }
  &.dualLH {
    background-image: url('${SoursURL}/images/dualLH.png');
  }
  .point {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    // top: ${({ theme }) => theme.unit}px;
  }
  .point1 {
    top: 50%;
    transform: translateY(-50%);
    right: ${({ theme }) => theme.unit}px;
    justify-content: flex-end;

    //left: 50%;
    //transform: translateX(-50%);
  }
  .point2 {
    top: ${({ theme }) => theme.unit}px;
    left: ${({ theme }) => theme.unit}px;
  }
  .returnV {
    position: absolute;
    bottom: 0;
    height: 50%;
    width: 50%;
    left: 50%;
    display: flex;
    align-items: center;
    justify-content: left;
    text-indent: 0;
    padding-left: ${({ theme }) => 2 * theme.unit}px;
    //text-align: left;
  }
  .returnV2 {
    color: var(--color-warning);
  }
  .returnV1 {
    color: var(--color-success);
    top: 0;
  }
`
export enum DualDetailTab {
  less = 0,
  greater = 1,
}
export const DualDetail = ({
  isOrder = false,
  displayMode = DualDisplayMode.nonBeginnerMode,
  isPriceEditable = true,
  coinSell,
  toggle,
  btnConfirm,
  inputPart,
  showClock = false,
  ...rest
}: DualDetailProps) => {
  const { dualViewInfo, currentPrice, tokenMap, lessEarnView, greaterEarnView, onChange } = rest
  const [showEdit, setShowEdit] = React.useState(false)
  const { t } = useTranslation(['common', 'tables'])
  const { upColor, isMobile } = useSettings()
  const { base, quote, precisionForPrice, quoteUnit } = currentPrice
  const [tab, setTab] = React.useState<DualDetailTab>(DualDetailTab.less)
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
  const quoteAlice = /USD/gi.test(quoteUnit ?? '') ? 'USDT' : quoteUnit

  const renewTargetPriceView = React.useMemo(() => {
    return coinSell?.renewTargetPrice
      ? getValuePrecisionThousand(
          coinSell?.renewTargetPrice,
          precisionForPrice ? precisionForPrice : tokenMap[quote].precisionForOrder,
          precisionForPrice ? precisionForPrice : tokenMap[quote].precisionForOrder,
          precisionForPrice ? precisionForPrice : tokenMap[quote].precisionForOrder,
          true,
          { floor: true },
        )
      : EmptyValueTag
  }, [
    // Number(dualViewInfo?.strike).toLocaleString('en-US')
    //   ? Number(dualViewInfo?.strike).toLocaleString('en-US')
    //   : EmptyValueTag,
    coinSell?.renewTargetPrice,
  ])
  const targetView = React.useMemo(() => {
    return dualViewInfo?.strike
      ? getValuePrecisionThousand(
          dualViewInfo.strike,
          precisionForPrice ? precisionForPrice : tokenMap[quote].precisionForOrder,
          precisionForPrice ? precisionForPrice : tokenMap[quote].precisionForOrder,
          precisionForPrice ? precisionForPrice : tokenMap[quote].precisionForOrder,
          true,
          { floor: true },
        )
      : EmptyValueTag
  }, [dualViewInfo?.strike])

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
              toggle={toggle}
              onClose={() => setShowEdit(false)}
              {...rest}
              btnConfirm={btnConfirm}
              coinSell={coinSell}
              isPriceEditable={isPriceEditable}
            />
          </Box>
        </SwitchPanelStyled>
      </Modal>

      <Box display={'flex'} flexDirection={'column'}>
        {isOrder && showClock && (
          <Typography
            component={'span'}
            variant={'body1'}
            display={'flex'}
            flexDirection={'column'}
            sx={{
              background: 'var(--vip-bg)',
            }}
            padding={2}
            marginBottom={2}
          >
            <Typography
              component={'span'}
              color={'textPrimary'}
              display={'inline-flex'}
              alignItems={'center'}
            >
              <WarningIcon2
                color={'warning'}
                fontSize={'large'}
                sx={{
                  marginRight: 1,
                }}
              />
              {t('labelDualAutoSearchingDes')}
            </Typography>
          </Typography>
        )}
        {displayMode !== DualDisplayMode.beginnerModeStep2 && (
          <Box
            display={'flex'}
            flexDirection={'column'}
            alignItems={'stretch'}
            justifyContent={'space-between'}
            marginX={2}
            marginBottom={isOrder ? 2 : 0}
            paddingX={2}
            paddingTop={1}
            borderRadius={1 / 2}
            order={isOrder ? 0 : 0}
            sx={{
              background: 'var(--field-opacity)',
            }}
          >
            {isOrder && (
              <>
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
                    <Trans i18nKey={'labelDualStatus'}>Status</Trans>
                  </Typography>
                  <Typography
                    component={'span'}
                    variant={'inherit'}
                    color={dualViewInfo?.statusColor}
                  >
                    {dualViewInfo?.side ?? ''}
                  </Typography>
                </Typography>
                {dualViewInfo.outSymbol && (
                  <Typography
                    variant={'body1'}
                    display={'inline-flex'}
                    alignItems={'center'}
                    justifyContent={'space-between'}
                    paddingBottom={1}
                    order={2}
                  >
                    <Typography
                      component={'span'}
                      variant={'inherit'}
                      color={'textSecondary'}
                      display={'inline-flex'}
                      alignItems={'center'}
                    >
                      {t('labelDualTxsSettlement')}
                    </Typography>
                    <Typography component={'span'} variant={'inherit'}>
                      {dualViewInfo.outAmount + ' ' + dualViewInfo.outSymbol}
                    </Typography>
                  </Typography>
                )}
                {dualViewInfo?.deliveryPrice && (
                  <Typography
                    variant={'body1'}
                    display={'inline-flex'}
                    alignItems={'center'}
                    justifyContent={'space-between'}
                    paddingBottom={1}
                    order={4}
                  >
                    <Typography
                      component={'span'}
                      variant={'inherit'}
                      color={'textSecondary'}
                      display={'inline-flex'}
                      alignItems={'center'}
                    >
                      {t('labelDualDeliver')}
                    </Typography>
                    <Typography
                      component={'span'}
                      variant={'inherit'}
                      color={
                        upColor == UpColor.green ? 'var(--color-success)' : 'var(--color-error)'
                      }
                    >
                      {dualViewInfo.deliveryPrice + ' ' + quoteAlice}
                    </Typography>
                  </Typography>
                )}
                {dualViewInfo.enterTime && (
                  <>
                    <Typography
                      variant={'body1'}
                      display={'inline-flex'}
                      alignItems={'center'}
                      justifyContent={'space-between'}
                      paddingBottom={1}
                      order={8}
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
                      order={7}
                    >
                      <Typography
                        component={'span'}
                        variant={'inherit'}
                        color={'textSecondary'}
                        display={'inline-flex'}
                        alignItems={'center'}
                      >
                        {t('labelDualAuto')}
                      </Typography>

                      {dualViewInfo.autoIcon && dualViewInfo?.autoStatus ? (
                        <Tooltip
                          title={t(dualViewInfo?.autoStatus, {
                            day: dualViewInfo.maxDuration
                              ? dualViewInfo.maxDuration / 86400000
                              : EmptyValueTag,
                            price: dualViewInfo.newStrike ? dualViewInfo.newStrike : EmptyValueTag,
                          }).toString()}
                        >
                          <Typography
                            component={'span'}
                            display={'inline-flex'}
                            alignItems={'center'}
                            variant={'inherit'}
                            color={'textPrimary'}
                          >
                            <>{t(dualViewInfo?.autoContent ?? '')}</>
                            <>{dualViewInfo.autoIcon}</>
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Typography component={'span'} variant={'inherit'} color={'textPrimary'}>
                          {dualViewInfo?.autoContent ?? ''}
                        </Typography>
                      )}
                    </Typography>
                  </>
                )}
              </>
            )}
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
                {t('labelDualAmount')}
              </Typography>
              <Typography component={'span'} variant={'inherit'} color={'textPrimary'}>
                {dualViewInfo?.amount}
              </Typography>
            </Typography>
            <Typography
              variant={'body1'}
              display={'inline-flex'}
              alignItems={'center'}
              justifyContent={'space-between'}
              paddingBottom={1}
              order={3}
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
                {targetView + ' ' + quoteAlice}
              </Typography>
            </Typography>

            <Typography
              variant={'body1'}
              display={'inline-flex'}
              alignItems={'center'}
              justifyContent={'space-between'}
              paddingBottom={1}
              order={5}
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
              order={6}
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
        {inputPart ? <>{inputPart}</> : <></>}
        {(displayMode !== DualDisplayMode.beginnerModeStep2 && toggle?.enable && !isOrder) ||
        (isOrder && dualViewInfo?.__raw__?.order?.dualReinvestInfo?.isRecursive) ? (
          // RETRY_SUCCESS  ｜ RETRY_FAILED  ｜ isRecursive=false
          <Box
            display={'flex'}
            order={isOrder ? 1 : 2}
            marginBottom={isOrder ? 2 : 2}
            flexDirection={'column'}
          >
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
                      Auto Reinvest
                      <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                    </Trans>
                  </Typography>
                </Tooltip>
                {!isOrder && (
                  <Typography component={'span'} variant={'inherit'}>
                    <FormControlLabel
                      sx={{
                        marginRight: 0,
                      }}
                      disabled={[
                        sdk.DUAL_RETRY_STATUS.RETRY_SUCCESS,
                        sdk.DUAL_RETRY_STATUS.RETRY_FAILED,
                      ].includes(dualViewInfo?.__raw__?.order?.dualReinvestInfo.retryStatus)}
                      onChange={(_e, checked) =>
                        onChange({
                          ...coinSell,
                          isRenew: checked,
                        })
                      }
                      control={<Switch color={'primary'} checked={coinSell.isRenew} />}
                      label={''}
                    />
                  </Typography>
                )}
              </Box>

              <Typography
                component={'span'}
                variant={'body2'}
                color={'var(--color-text-third)'}
                display={'inline-flex'}
                alignItems={'center'}
                paddingBottom={1}
              >
                {coinSell.isRenew && (
                  <Trans i18nKey={'labelDualAutoDetail'}>
                    Auto Reinvest will try to find a new product which based on the following rule
                    at 16:00 on the settlement day.
                  </Trans>
                )}
              </Typography>
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
                <Box
                  display={'flex'}
                  justifyContent={'space-between'}
                  paddingBottom={1}
                  paddingX={2}
                >
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
                      {renewTargetPriceView + ' ' + quoteAlice}
                      <BackIcon fontSize={'small'} sx={{ transform: 'rotate(180deg)' }} />
                    </Link>
                  ) : (
                    <Typography component={'span'} variant={'body1'}>
                      {renewTargetPriceView + ' ' + quoteAlice}
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
                    {t('labelDayDisplay', { item: coinSell.renewDuration })}
                    <BackIcon fontSize={'inherit'} sx={{ transform: 'rotate(180deg)' }} />
                  </Link>
                </Box>
              </Box>
            )}
          </Box>
        ) : (
          <></>
        )}
        {displayMode === DualDisplayMode.beginnerModeStep2 && (
          <Box paddingX={2} marginTop={2} order={isOrder ? 1 : 3}>
            <Typography variant={'h5'} marginBottom={0}>
              {t('labelDualBeginnerAtSettlementDay')}
            </Typography>
            <Typography color={'textSecondary'} marginBottom={1}>
              {t('labelDualBeginnerIndexPriceDes')}
            </Typography>
            <Typography
              textAlign={'center'}
              color={'var(--color-text-third)'}
              variant={'body2'}
              paddingBottom={1}
            >
              {t('labelDualBeginnerLockingDes')}
            </Typography>
          </Box>
        )}
        {displayMode !== DualDisplayMode.beginnerModeStep1 && (
          <>
            <Box paddingBottom={1} order={isOrder ? 4 : 4}>
              <Divider sx={{ borderWidth: 2, marginBottom: 2 }} />
              <Box
                display={'flex'}
                flexDirection={'row'}
                paddingX={2}
                alignItems={'center'}
                justifyContent={'space-between'}
                paddingBottom={2}
              >
                <Typography
                  variant={isMobile ? 'h5' : 'h5'}
                  component={'span'}
                  color={'textPrimary'}
                >
                  {t('labelDualSettlementCalculator')}
                </Typography>
                {/*<Typography component={'span'} variant={'body1'} color={'textSecondary'}>*/}
                {/*  <Typography component={'span'} variant={'inherit'}>*/}
                {/*    {t('labelDualCurrentPrice3', {*/}
                {/*      symbol: base,*/}
                {/*    })}*/}
                {/*  </Typography>*/}
                {/*  <Typography*/}
                {/*    component={'span'}*/}
                {/*    variant={'inherit'}*/}
                {/*    paddingLeft={1 / 2}*/}
                {/*    color={upColor == UpColor.green ? 'var(--color-error)' : 'var(--color-success)'}*/}
                {/*  >*/}
                {/*    {currentView + ' ' + quoteAlice}*/}
                {/*  </Typography>*/}
                {/*</Typography>*/}
              </Box>
              <Box
                display={'flex'}
                alignItems={'stretch'}
                flexDirection={'column'}
                paddingX={2}
                justifyContent={'space-between'}
                paddingBottom={2}
              >
                <Tabs
                  className={'btnOutLineTab'}
                  variant={'fullWidth'}
                  value={tab}
                  onChange={(_e, newVaule) => setTab(newVaule)}
                  sx={{ marginBottom: 2 }}
                >
                  <Tab
                    key={DualDetailTab.less}
                    value={DualDetailTab.less}
                    label={
                      // <Tooltip
                      //   placement={'top'}
                      //   title={t(`labelImportCollection${item}Des`).toString()}
                      // >
                      <Typography component={'span'} color={'inherit'}>
                        {t(
                          dualViewInfo.isUp
                            ? 'labelDualNewPriceLessThan'
                            : 'labelDualNewPriceLessOrEqualThan',
                          {
                            value: targetView,
                            base: currentPrice.base,
                            quote: quoteAlice,
                          },
                        )}
                      </Typography>
                    }
                  />
                  <Tab
                    key={DualDetailTab.greater}
                    value={DualDetailTab.greater}
                    label={
                      <Typography component={'span'} color={'inherit'}>
                        {t(
                          dualViewInfo.isUp
                            ? 'labelDualNewPriceGreaterThanOrEqual'
                            : 'labelDualNewPriceGreaterThan',
                          {
                            value: targetView,
                            quote: quoteAlice,
                            base: base,
                          },
                        )}
                      </Typography>
                    }
                  />
                </Tabs>
                <BoxChartStyle
                  className={`${isMobile ? 'mobile' : ''} dual${
                    sdk.toBig(currentPrice.currentPrice ?? 0).gte(dualViewInfo.strike) ? 'H' : 'L'
                  }${tab == DualDetailTab.greater ? 'H' : 'L'}`}
                  // greater={}
                  // isUp={}
                  height={128}
                  width={'100%'}
                  position={'relative'}
                >
                  <Box className={'point1 point'}>
                    {/*<Typography variant={'body2'} whiteSpace={'pre'} color={'textPrimary'}>*/}
                    {/*  {t('labelDualTargetPrice3')}*/}
                    {/*</Typography>*/}
                    <Typography>{targetView + ' ' + quoteAlice}</Typography>
                  </Box>
                  <Box
                    className={'point2 point'}
                    whiteSpace={'pre'}
                    sx={{
                      top: 0,
                      left: 0,
                      // left: sdk
                      //   .toBig(dualViewInfo.currentPrice?.currentPrice ?? 0)
                      //   .minus(dualViewInfo.strike)
                      //   .gte(0)
                      //   ? '75%'
                      //   : '25%',
                    }}
                  >
                    <Typography
                      display={'inline-block'}
                      width={'120px'}
                      whiteSpace={'pre-wrap'}
                      // flexWrap={'wrap'}
                      // variant={'body2'}
                      color={'textPrimary'}
                      component={'span'}
                      // alignItems={'center'}
                    >
                      <Trans
                        i18nKey={'labelDualCurrentPrice2'}
                        tOptions={{
                          price: ' ' + currentView,
                          symbol: '', //base,
                          baseSymbol: quoteAlice,
                        }}
                      >
                        LRC Current price:
                        <Typography
                          component={'span'}
                          color={
                            upColor == UpColor.green ? 'var(--color-error)' : 'var(--color-success)'
                          }
                        >
                          price
                        </Typography>
                      </Trans>
                    </Typography>
                  </Box>
                  <Box className={'returnV1 returnV'}>
                    <Typography variant={'body2'} color={'inherit'} whiteSpace={'pre-line'}>
                      {quote &&
                        t('labelDualReturn', {
                          symbol:
                            (greaterEarnView === '0' ? EmptyValueTag : greaterEarnView) +
                            ' ' +
                            quoteAlice,
                        })}
                    </Typography>
                  </Box>
                  <Box className={'returnV2 returnV'}>
                    <Typography variant={'body2'} color={'inherit'} whiteSpace={'pre-line'}>
                      {base &&
                        t('labelDualReturn', {
                          symbol:
                            (lessEarnView === '0' ? EmptyValueTag : lessEarnView) + ' ' + base,
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
            </Box>
          </>
        )}
      </Box>
    </>
  )
}
