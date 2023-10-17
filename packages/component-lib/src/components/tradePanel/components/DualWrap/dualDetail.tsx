import { DualDetailProps, DualDisplayMode } from './Interface'
import React, { useEffect, useRef } from 'react'
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
import {
  Box,
  Divider,
  Switch,
  FormControlLabel,
  Link,
  Modal,
  Tooltip,
  Typography,
} from '@mui/material'
import { InputCoin, ModalCloseButton } from '../../../basic-lib'
import { ModifyParameter } from './ModifyParameter'
import * as sdk from '@loopring-web/loopring-sdk'
import moment from 'moment/moment'
import styled from '@emotion/styled'
import { SwitchPanelStyled } from '../../../styled'
import { Grid } from '@mui/material'
import { useTheme } from '@emotion/react'


type CanvasProps = {
  width: number,
  height: number,
}
const Canvas = ({
  width, 
  height,
}: CanvasProps) => {
  const canvasRef = useRef()
  const theme = useTheme()
  const canvas = canvasRef.current ? canvasRef.current as HTMLCanvasElement : undefined
  useEffect(() => {
    if (canvas) {
      const ctx = canvas.getContext('2d')!
      
      canvas.width = canvas.parentElement!.clientWidth;
      canvas.height = height;
      myLog('width',canvas.width)
      myLog('width',canvas.height)
      ctx.clearRect(0, 0, width, height)
      
      const isUp = true
      const dotColor = theme.colorBase.border
      const green = theme.colorBase.success
      const orange = theme.colorBase.warning
      const greenBox = hexToRGB(theme.colorBase.success, 0.5)
      const orangeBox = hexToRGB(theme.colorBase.warning, 0.5)
      const animationCurveColor = isUp ? theme.colorBase.success : theme.colorBase.warning
      const fontColor1 = theme.colorBase.white
      const fontColor2 = theme.colorBase.success
      const fontColor3 = theme.colorBase.warning
      const fontColor4 = theme.colorBase.textSecondary
      const text1 = 'BTC Price'
      const text2 = '$29,200'
      const font1 = '12px Roboto'
      const text3 = 'earn extra USDT'
      const text4 = 'Buy BTC low and earn extra BTC'
      const text5 = '$29,200'
      

      
      ctx.clearRect(0,0,width,height)

      // draw dash
      ctx.lineWidth = 1
      ctx.setLineDash([5, 3])
      ctx.beginPath()
      ctx.strokeStyle = dotColor
      ctx.moveTo(1, 0)
      ctx.lineTo(width, 0)

      ctx.moveTo(1, height / 2)
      ctx.lineTo(width / 2, height / 2)

      ctx.moveTo(1, height - 1)
      ctx.lineTo(width, height - 1)
      ctx.stroke()
      ctx.closePath()

      ctx.beginPath()
      ctx.setLineDash([0, 0])
      ctx.lineWidth = 2
      ctx.strokeStyle = green
      ctx.moveTo(width / 2, 0)
      ctx.lineTo(width / 2, height / 2)
      ctx.stroke()
      ctx.closePath()

      ctx.beginPath()
      ctx.setLineDash([0, 0])
      ctx.lineWidth = 2
      ctx.strokeStyle = orange
      ctx.moveTo(width / 2, height / 2)
      ctx.lineTo(width / 2, height)
      ctx.stroke()
      ctx.closePath()

      ctx.fillStyle = greenBox
      ctx.fillRect(width / 2, 0, width / 2, height / 2)

      ctx.fillStyle = orangeBox
      ctx.fillRect(width / 2, height / 2, width / 2, height / 2)

      ctx.fillStyle = green
      ctx.roundRect(5, 10, 100, 50, 5)
      ctx.fill()

      ctx.font = font1
      ctx.fillStyle = fontColor1
      ctx.fillText(text1, 10, height / 4 - 7)
      ctx.fillText(text2, 10, height / 4 + 14)

      ctx.fillStyle = fontColor2
      ctx.fillText(text3, width / 2 + 5, height / 3.5)
      ctx.fillStyle = fontColor3
      ctx.fillText(text4, width / 2 + 5, height / 1.2)

      ctx.fillStyle = fontColor4
      ctx.fillText(text5, width - 50, height / 2 + 4)

      const controlPoints = isUp
        ? [
            { x: 10, y: height / 2 + 10 },
            { x: (width / 5) * 1, y: height - height / 6 },
            { x: (width / 5) * 2, y: height / 6 },
            { x: width / 2, y: height / 2 - 10 },
          ]
        : [
            { x: 10, y: height / 2 + 10 },
            { x: (width / 5) * 1, y: height - height / 6 },
            { x: (width / 5) * 2, y: height / 6 },
            { x: width / 2, y: height / 2 + 20 },
          ]

      drawBezierAnimation(controlPoints, animationCurveColor)

      function drawBezierAnimation(controlPoints, color) {
        var t = 0

        function draw() {
          if (t === 0) {
            ctx.beginPath()
            ctx.strokeStyle = animationCurveColor
            ctx.arc(controlPoints[0].x, controlPoints[0].y, 4, 0, 2 * Math.PI)
            ctx.closePath()
            ctx.stroke()
          }

          ctx.beginPath()
          ctx.moveTo(controlPoints[0].x, controlPoints[0].y)
          var x = cubicBezier(
            t,
            controlPoints[0].x,
            controlPoints[1].x,
            controlPoints[2].x,
            controlPoints[3].x,
          )
          var y = cubicBezier(
            t,
            controlPoints[0].y,
            controlPoints[1].y,
            controlPoints[2].y,
            controlPoints[3].y,
          )
          if (
            (x - controlPoints[0].x) * (x - controlPoints[0].x) +
              (y - controlPoints[0].y) * (y - controlPoints[0].y) >
              25 &&
            (x - controlPoints[3].x) * (x - controlPoints[3].x) +
              (y - controlPoints[3].y) * (y - controlPoints[3].y) >
              25
          ) {
            // Draw a point moving along the curve
            ctx.beginPath()
            ctx.arc(x, y, 1, 0, Math.PI * 2)
            ctx.fillStyle = color
            ctx.fill()
            ctx.closePath()
          }

          // Update the parameter t for animation
          t += 0.005
          if (t > 1) {
            ctx.beginPath()
            ctx.strokeStyle = animationCurveColor
            ctx.arc(controlPoints[3].x, controlPoints[3].y, 4, 0, 2 * Math.PI)
            ctx.closePath()
            ctx.stroke()
            return
          }

          // Request next frame
          requestAnimationFrame(draw)
        }

        // Start the animation
        draw()

        // Cubic Bezier function
        function cubicBezier(t, p0, p1, p2, p3) {
          var u = 1 - t
          var tt = t * t
          var uu = u * u
          var uuu = uu * u
          var ttt = tt * t

          var p = uuu * p0 // (1-t)^3 * P0
          p += 3 * uu * t * p1 // 3(1-t)^2 * t * P1
          p += 3 * u * tt * p2 // 3(1-t) * t^2 * P2
          p += ttt * p3 // t^3 * P3

          return p
        }
      }
    }
  }, [canvasRef.current])
  return <Box component={'canvas'} width={canvas?.parentElement?.clientWidth} height={height} ref={canvasRef}/>
}

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
  toggle,
  btnConfirm,
  inputView,
  ...rest
}: DualDetailProps) => {
  const { dualViewInfo, currentPrice, tokenMap, lessEarnView, greaterEarnView, onChange } = rest
  const [showEdit, setShowEdit] = React.useState(false)
  const { t } = useTranslation()
  const { upColor, isMobile } = useSettings()
  const { base, quote, precisionForPrice } = currentPrice
  const quoteAlice = /USD/gi.test(dualViewInfo?.quote ?? '') ? 'USDT' : dualViewInfo?.quote

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
  const renewTargetPriceView = React.useMemo(() => {
    return coinSell?.renewTargetPrice
      ? getValuePrecisionThousand(
          coinSell?.renewTargetPrice,
          precisionForPrice ? precisionForPrice : tokenMap[quote].precisionForOrder,
          precisionForPrice ? precisionForPrice : tokenMap[quote].precisionForOrder,
          precisionForPrice ? precisionForPrice : tokenMap[quote].precisionForOrder,
          true,
          { floor: true },
        ) + ` ${quoteAlice}`
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
        ) + ` ${quoteAlice}`
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
              inputView={inputView}
            />
          </Box>
        </SwitchPanelStyled>
      </Modal>

      {displayMode === DualDisplayMode.beginnerModeStep2 && (
          <>
            <Box paddingX={2} marginTop={2}>
              <Typography variant={'h5'} marginBottom={0}>
                {t('labelDualBeginnerAtSettlementDay')}
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
              <Box marginBottom={2} display={'flex'} justifyContent={'space-between'}>
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
            <Typography
              textAlign={'center'}
              color={'var(--color-text-third)'}
              variant={'body2'}
              paddingBottom={1}
            >
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
            marginBottom={2}
            paddingX={2}
            paddingTop={1}
            borderRadius={1 / 2}
            order={isOrder ? 3 : 3}
            sx={{
              background: 'var(--field-opacity)',
            }}
          >
            {/* {displayMode === DualDisplayMode.nonBeginnerMode && (
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
            )} */}

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

      {inputView}


      <Box display={'flex'} flexDirection={'column'}>
        {(toggle?.enable && !isOrder) ||
        (isOrder && dualViewInfo?.__raw__?.order?.dualReinvestInfo?.isRecursive) ? (
          // RETRY_SUCCESS  ｜ RETRY_FAILED  ｜ isRecursive=false
          <Box
            display={'flex'}
            order={isOrder ? 2 : 0}
            marginBottom={isOrder ? 2 : 0}
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

        <Box component={'div'} height={8} marginX={-1} marginY={3} bgcolor={'var(--field-opacity)'}/>


        {displayMode === DualDisplayMode.nonBeginnerMode &&
          (isOrder ? (
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              marginTop={-4}
              textAlign={'center'}
              paddingBottom={2}
              order={0}
            >
              {t('labelDuaInvestmentDetails', { ns: 'common' })}
            </Typography>
          ) : (
            <Box display={'flex'} justifyContent={'space-between'}>
              <Typography
              variant={'body1'}
              component={'h6'}
              color={'textSecondary'}
              paddingX={2}
              paddingY={1}
            >
              {t('labelDualSettlementCalculator')}
            </Typography>
              <Typography
              variant={'body1'}
              component={'h6'}
              color={'textSecondary'}
              paddingX={2}
              paddingY={1}
              
            >
              Current Price<Typography marginLeft={1} component={'span'} color={'var(--color-success)'}>$200</Typography> 
            </Typography>
            </Box>
            
          ))}
        {displayMode !== DualDisplayMode.beginnerModeStep1 && (
          <Box paddingX={2} paddingBottom={1} order={isOrder ? 2 : 2}>
             <Canvas height={180} width={500}/>
            {/* <<CanvasBoxChartStyle height={128} width={'100%'} position={'relative'}>
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
            </BoxChartStyle> */}
          </Box>
        )}
      </Box>
    </>
  )
}
