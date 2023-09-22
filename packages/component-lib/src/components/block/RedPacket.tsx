import styled from '@emotion/styled'
import { Box, BoxProps, Button, Divider, IconButton, Link, Modal, Typography } from '@mui/material'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  Account,
  BackIcon,
  EmptyValueTag,
  FirstPlaceIcon,
  GET_IPFS_STRING,
  getShortAddr,
  NFTWholeINFO,
  RedPacketColorConfig,
  RedPacketCssColorConfig,
  RedPacketOpenWrapSVG,
  RedPacketQRCodeSvg,
  RedPacketWrapSVG,
  SoursURL,
  YEAR_DAY_MINUTE_FORMAT,
  DAY_MINUTE_FORMAT,
  hexToRGB,
} from '@loopring-web/common-resources'
import QRCodeStyling from 'qr-code-styling'
import * as sdk from '@loopring-web/loopring-sdk'
import { RedPacketViewStep } from '../modal'
import { ModalStatePlayLoad } from '../../stores'
import moment from 'moment'
import {
  RedPacketBlindBoxDetailProps,
  RedPacketBlindBoxLimit,
  RedPacketClockProps,
  RedPacketDefault,
  RedPacketDefaultBg,
  RedPacketDetailLimit,
  RedPacketDetailProps,
  RedPacketNFTDetailLimit,
  RedPacketOpenedProps,
  RedPacketOpenProps,
  RedPacketQRCodeProps,
  RedPacketTimeoutProps,
  RedPacketUnreadyProps,
} from './Interface'
import { BoxNFT, CoinIcon, ModalCloseButtonPosition, TablePagination } from '../basic-lib'
import { NFTMedia } from './nftMedia'
import { sanitize } from 'dompurify'
import { useTheme } from '@emotion/react'

export const RedPacketBg = styled(Box)<BoxProps & { imageSrc?: string; type: string }>`
  display: flex;
  align-items: center;
  position: relative;
  justify-content: center;

  .content {
    color: ${({ type }) => RedPacketCssColorConfig[type]?.primaryColor};

    .betweenEle {
      left: 50%;
      top: 128px;
      position: absolute;

      .open {
        background: #fff7b1;
        color: ${({ type }) => RedPacketCssColorConfig[type]?.highLightColor}; //#7c3400;
        &.disable {
          color: ${({ type }) => RedPacketCssColorConfig[type]?.highLightDisableColor}; //#7c3400;
        }

        cursor: pointer;
        display: inline-flex;
        z-index: 100;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 64px;
        content: 'Open';
        font-size: 20px;
        font-weight: 500;
        border-radius: 100%;
        transform: translate(-50%, -50%);
      }

      .open.openUnready {
        background: url('${SoursURL}/images/redpacketLock.webp') center no-repeat;
        color: ${({ type }) => RedPacketCssColorConfig[type]?.colorTop}; //#7c3400;
        width: 76px;
        height: 76px;
        background-size: contain;
        border-radius: initial;
      }

      .clock {
        display: flex;
        z-index: 100;
        align-items: center;
        justify-content: center;
        position: absolute;
        font-size: 28px;
        font-weight: 900;
        transform: translate(-50%, -50%);
        left: 50%;
        top: -50%;
        .hours,
        .minutes,
        .seconds {
          justify-content: center;
          height: 52px;
          width: 52px;
          background: #fff7b1;
          color: #7c3400;
          display: inline-flex;
          align-items: center;
          border-radius: ${({ theme }) => theme.unit + 'px'};
          h4 {
            text-indent: -9999em;
            height: 0;
            width: 0;
          }
        }

        .hours,
        .minutes {
          position: relative;

          &:after {
            display: block;
            content: ':';
            position: absolute;
            font-size: 20px;
            right: -12px;
            line-height: 52px;
            top: 0;
          }
        }
      }
    }

    .secondary {
      color: ${({ type }) => RedPacketCssColorConfig[type]?.secondaryColor};
    }

    .viewDetail {
      color: ${({ type }) => RedPacketCssColorConfig[type]?.primaryColor};

      &:hover {
        text-decoration: underline;
        //color: ${({ type }) => RedPacketCssColorConfig[type]?.secondaryColor};
      }
    }

    .top {
      height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${({ type }) => RedPacketCssColorConfig[type]?.primaryColor};
    }

    .middle {
      height: 218px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .footer {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  &.RedPacketClock {
    .top {
      height: 40px;
      margin-top: 50px;
    }
    .middle {
      margin-top: 40px;
      height: 128px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .betweenEle {
      top: 328px;
    }
  }

  &.redPacketOpened {
    .top {
      color: ${({ type }) => RedPacketCssColorConfig[type]?.highLightColor};
    }
  }

  &.redPacketOpened,
  &.redPacketOpen {
    .redPacketNFT {
      margin-top: 48px;
      padding-top: 0;
      width: var(--nft-large-avatar);
      height: var(--nft-large-avatar);
    }

    .RedPacketReceived .redPacketNFT {
      margin-top: 20px;
    }
  }

  //&.redPacketOpened {
  //  .content {
  //
  //  }
  //}
` as (props: BoxProps & { imageSrc?: string; type: string }) => JSX.Element

export const BoxClaim = styled(Box)`
  &.self {
    //background-color: var(--field-opacity);
  }
` as typeof Box

export const RedPacketSize = {
  middle: {
    height: 414,
    width: 260,
  },
  large: {
    height: 600,
    width: 320,
  },
}

export const RedPacketQRCode = ({
  type = 'default',
  imageEleUrl,
  url,
  ...rest
}: RedPacketDefault & RedPacketQRCodeProps) => {
  const qrcodeRef = React.createRef<SVGGElement>()
  const ref = React.useRef()
  const qrCode = new QRCodeStyling({
    type: 'svg',
    width: 200,
    height: 200,
    image: `${SoursURL + 'svg/loopring.svg'}`,
    dotsOptions: {
      gradient: {
        type: 'linear',
        rotation: 45,
        colorStops: [
          {
            offset: 0,
            color: '#4169FF', // hardcode for export png
          },
          {
            offset: 1,
            color: '#000',
          },
        ],
      },
      type: 'dots',
    },
    backgroundOptions: {
      color: '#ffffff', //colorConfig.bgColor
    },
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: 4,
    },
    cornersSquareOptions: {
      type: 'extra-rounded',
    },
    cornersDotOptions: {
      type: 'square',
    },
  })
  const [qrCodeG, setQrCodeG] = React.useState<string | undefined>(undefined)

  const updateSvg = React.useCallback(async () => {
    qrCode.update({
      data: url,
    })
    const svgEle = await qrCode._getElement('svg')
    setQrCodeG(svgEle?.innerHTML)
  }, [url])
  React.useEffect(() => {
    updateSvg()
  }, [url])
  const onClick = (e: React.MouseEvent<SVGGElement, MouseEvent>) => {
    try {
      // @ts-ignore-start
      const svg: SVGElement = ref.current as SVGElement
      const w = parseInt(svg.getAttribute('width') ?? '334')
      const h = parseInt(svg.getAttribute('height') ?? '603')
      if (svg && svg.outerHTML) {
        const canvas = document.createElement('canvas')
        const base64doc = btoa(unescape(encodeURIComponent(svg.outerHTML)))
        const img_to_download = document.createElement('img')
        img_to_download.src = 'data:image/svg+xml;base64,' + base64doc
        img_to_download.onload = function () {
          canvas.setAttribute('width', w.toString())
          canvas.setAttribute('height', h.toString())
          // @ts-ignore
          const context: CanvasRenderingContext2D = canvas.getContext('2d')
          context.drawImage(img_to_download, 0, 0, w, h)
          const dataURL = canvas.toDataURL('image/png')
          // @ts-ignore
          if (window.navigator.msSaveBlob) {
            // @ts-ignore
            window.navigator.msSaveBlob(
              // @ts-ignore
              canvas.msToBlob(),
              'Loopring_Red_Packet.png',
            )
            e.preventDefault()
          } else {
            const a = document.createElement('a')
            const my_evt = new MouseEvent('click')
            a.download = 'Loopring_Red_Packet.png'
            a.href = dataURL
            a.dispatchEvent(my_evt)
          }
          //canvas.parentNode.removeChild(canvas);
        }
      }
      // @ts-ignore-end
    } catch (error) {}
  }
  return (
    <>
      {qrCodeG && (
        <Box>
          <RedPacketQRCodeSvg
            ref={ref}
            {...{ ...RedPacketColorConfig[type], ...rest }}
            qrcodeRef={qrcodeRef}
            imageEleUrl={imageEleUrl}
            qrCodeG={qrCodeG}
            type={type}
            onClickShareButton={onClick}
          />
        </Box>
      )}
    </>
  )
}

export const RedPacketBgDefault = ({
  type = 'default',
  size = 'middle',
  className,
  content,
}: RedPacketDefaultBg & any) => {
  const scale = RedPacketSize[size].width / 260

  return (
    <RedPacketBg
      type={type}
      sx={{
        transform: `scale(${scale})`,
      }}
      className={className ?? 'redPacketOpen'}
    >
      <Box
        className={'bg'}
        position={'absolute'}
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={100}
        display={'flex'}
        justifyContent={'center'}
        marginTop={1}
      >
        <RedPacketWrapSVG
          {...{ ...RedPacketCssColorConfig[type] }}
          height={'100%'}
          width={'100%'}
          type={type}
          // height={RedPacketSize[size].height}
          // width={RedPacketSize[size].width}
        />
      </Box>
      <Box
        className={`content content${size}`}
        position={'relative'}
        zIndex={200}
        height={RedPacketSize['middle'].height}
        width={RedPacketSize['middle'].width}
      >
        {content}
      </Box>
    </RedPacketBg>
  )
}

export const RedPacketBgOpened = ({
  type = 'default',
  size = 'middle',
  content,
}: RedPacketDefaultBg & any) => {
  const scale = RedPacketSize[size].width / 260

  return (
    <RedPacketBg
      type={type}
      sx={{
        transform: `scale(${scale})`,
      }}
      className={'redPacketOpened'}
    >
      <Box
        position={'absolute'}
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={100}
        display={'flex'}
        justifyContent={'center'}
      >
        <RedPacketOpenWrapSVG
          {...{ ...RedPacketCssColorConfig[type] }}
          height={'100%'}
          width={'100%'}
          type={type}
        />
      </Box>
      <Box
        className={`content content${size}`}
        position={'relative'}
        zIndex={200}
        height={RedPacketSize['middle'].height}
      >
        {content}
      </Box>
    </RedPacketBg>
  )
}

export const RedPacketOpen = ({
  type = 'default',
  size,
  sender,
  amountStr,
  memo,
  viewDetail,
  onOpen,
  ImageEle,
}: RedPacketDefault & RedPacketOpenProps) => {
  const { t } = useTranslation()
  const content = React.useMemo(() => {
    return (
      <Box display={'flex'} flex={1} onClick={onOpen} flexDirection={'column'}>
        <Box display={'flex'} className={'betweenEle'} position={'absolute'}>
          <Box display={'flex'} position={'absolute'} className={'open'}>
            {t('labelRedPacketOpen')}
          </Box>
        </Box>
        <Box display={'flex'} className={'top'} flexDirection={'column'}>
          <Typography color={'inherit'}>{sender}</Typography>
        </Box>
        <Box display={'flex'} className={'middle'} flexDirection={'column'}>
          {ImageEle}
          <Typography
            color={'inherit'}
            variant={'h4'}
            whiteSpace={'pre-line'}
            textAlign={'center'}
            paddingX={2}
            paddingTop={1}
          >
            {amountStr}
          </Typography>
          <Typography
            color={'inherit'}
            variant={'body1'}
            whiteSpace={'pre-line'}
            textAlign={'center'}
            overflow={'hidden'}
            textOverflow={'ellipsis'}
            paddingX={4}
            sx={{
              wordBreak: 'break-all',
              display: '-webkit-box',
              '-webkit-line-clamp': '2',
              lineClamp: '2',
              '-webkit-box-orient': 'vertical',
            }}
            dangerouslySetInnerHTML={{ __html: sanitize(memo ?? '') }}
          />
        </Box>
        <Box display={'flex'} className={'footer'}>
          {viewDetail && (
            <Link
              className={'viewDetail'}
              whiteSpace={'pre-line'}
              color={'inherit'}
              variant={'body1'}
              onClick={(e) => {
                e.stopPropagation()
                viewDetail()
              }}
            >
              {t('labelLuckyRedPacketDetail')}
            </Link>
          )}
        </Box>
      </Box>
    )
  }, [size, sender, amountStr, memo, viewDetail, onOpen])

  return <RedPacketBgDefault type={type} size={size} content={content} />
}

export const RedPacketClock = ({
  type = 'default',
  size,
  validSince,
  sender,
  memo,
  showRedPacket,
  ImageEle,
}: RedPacketDefault & RedPacketClockProps) => {
  const { t } = useTranslation('common')
  const anchorRef = React.useRef()
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1)
  const [countDown, setCountDown] = React.useState<{
    days: undefined | string
    hours: undefined | string
    seconds: undefined | string
    minutes: undefined | string
  }>()
  const calculateTimeLeft = React.useCallback((validSince: number) => {
    if (nodeTimer.current !== -1) {
      clearTimeout(nodeTimer.current as NodeJS.Timeout)
    }
    let difference = +new Date(validSince).getTime() - Date.now()
    if (difference > 0) {
      setCountDown({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)).toString(),
        hours: ('0' + Math.floor((difference / (1000 * 60 * 60)) % 24).toString()).slice(-2),
        minutes: ('0' + Math.floor((difference / 1000 / 60) % 60).toString()).slice(-2),
        seconds: ('0' + Math.floor((difference / 1000) % 60).toString()).slice(-2),
      })
      nodeTimer.current = setTimeout(() => calculateTimeLeft(validSince), 1000)
    } else {
      showRedPacket()
    }
  }, [])
  React.useEffect(() => {
    calculateTimeLeft(validSince)
    return () => {
      if (nodeTimer.current !== -1) {
        clearTimeout(nodeTimer.current as NodeJS.Timeout)
      }
    }
  }, [validSince])

  const content = React.useMemo(() => {
    return (
      <>
        <Box display={'flex'} className={'betweenEle'} position={'absolute'}>
          <Box display={'flex'} flexDirection={'column'} position={'absolute'} className={'clock'}>
            <Typography
              display={'none'}
              component={'span'}
              variant={'body1'}
              // marginBottom={1}
            >
              {t('labelCountDown')}
            </Typography>
            <Box display={'flex'} flexDirection={'row'} flex={1} ref={anchorRef}>
              <Box
                className={'hours'}
                display={'flex'}
                flexDirection={'column'}
                alignItems={'center'}
                marginRight={2}
              >
                <Typography variant={'h2'} component={'span'} color={'inherit'}>
                  {Number(countDown?.hours) >= 0 ? countDown?.hours : EmptyValueTag}
                </Typography>
                <Typography
                  variant={'h4'}
                  color={'var(--color-text-secondary)'}
                  display={'none'}
                  style={{ textTransform: 'uppercase' }}
                >
                  {t('labelHours')}
                </Typography>
              </Box>
              <Box
                className={'minutes'}
                display={'flex'}
                flexDirection={'column'}
                alignItems={'center'}
                marginRight={2}
              >
                <Typography variant={'h2'} component={'span'} color={'inherit'}>
                  {Number(countDown?.minutes) >= 0 ? countDown?.minutes : EmptyValueTag}
                </Typography>
                <Typography
                  variant={'h4'}
                  color={'var(--color-text-secondary)'}
                  display={'none'}
                  style={{ textTransform: 'uppercase' }}
                >
                  {t('labelMinutes')}
                </Typography>
              </Box>
              <Box
                className={'seconds'}
                display={'flex'}
                flexDirection={'column'}
                alignItems={'center'}
              >
                <Typography variant={'h2'} component={'span'} color={'inherit'}>
                  {Number(countDown?.seconds) >= 0 ? countDown?.seconds : EmptyValueTag}
                </Typography>
                <Typography
                  variant={'h4'}
                  color={'var(--color-text-secondary)'}
                  display={'none'}
                  style={{ textTransform: 'uppercase' }}
                >
                  {t('labelSeconds')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box display={'flex'} className={'top'} flexDirection={'column'}>
          <Typography color={'inherit'}>{sender}</Typography>
        </Box>
        <Typography
          color={'inherit'}
          variant={'body1'}
          whiteSpace={'pre-line'}
          textAlign={'center'}
          overflow={'hidden'}
          textOverflow={'ellipsis'}
          paddingX={4}
          sx={{
            wordBreak: 'break-all',
            display: '-webkit-box',
            '-webkit-line-clamp': '2',
            lineClamp: '2',
            '-webkit-box-orient': 'vertical',
          }}
          dangerouslySetInnerHTML={{ __html: sanitize(memo ?? '') }}
        />
        <Box display={'flex'} className={'middle'} flexDirection={'column'}>
          {ImageEle}
        </Box>
      </>
    )
  }, [countDown])
  return (
    <RedPacketBgDefault className={'RedPacketClock'} type={type} size={size} content={content} />
  )
}

export const RedPacketUnready = ({
  type = 'default',
  size,
  sender,
  validSince,
  amountStr,
  memo,
  ImageEle,
  onClickOpen,
}: // ImageEle,
RedPacketDefault & RedPacketUnreadyProps) => {
  const { t } = useTranslation()
  const content = React.useMemo(() => {
    return (
      <Box display={'flex'} flex={1} flexDirection={'column'}>
        <Box onClick={onClickOpen} display={'flex'} className={'betweenEle'} position={'absolute'}>
          <Box display={'flex'} position={'absolute'} className={'open'}>
            {t('labelRedPacketOpen')}
          </Box>
        </Box>
        <Box display={'flex'} className={'top'} flexDirection={'column'}>
          <Typography color={'inherit'}>{sender}</Typography>
        </Box>
        <Box display={'flex'} className={'middle'} flexDirection={'column'} position={'relative'}>
          <Typography color={'inherit'} position={'absolute'} marginTop={3} top={0}>
            {`${moment(validSince).format(DAY_MINUTE_FORMAT)} ${t('labelOpenStart')}`}
          </Typography>
          {ImageEle}
          <Typography
            color={'inherit'}
            variant={'h4'}
            whiteSpace={'pre-line'}
            textAlign={'center'}
            paddingX={2}
            paddingTop={1}
          >
            {amountStr}
          </Typography>
          <Typography
            color={'inherit'}
            variant={'body1'}
            whiteSpace={'pre-line'}
            textAlign={'center'}
            overflow={'hidden'}
            textOverflow={'ellipsis'}
            paddingX={4}
            sx={{
              wordBreak: 'break-all',
              display: '-webkit-box',
              '-webkit-line-clamp': '2',
              lineClamp: '2',
              '-webkit-box-orient': 'vertical',
            }}
            dangerouslySetInnerHTML={{ __html: sanitize(memo ?? '') }}
          />
        </Box>
      </Box>
    )
  }, [size, sender, amountStr, memo])

  return <RedPacketBgDefault type={type} size={size} content={content} />
}

export const RedPacketOpened = ({
  type = 'default',
  size,
  sender,
  memo,
  myAmountStr,
  amountStr,
  viewDetail,
  ImageEle,
}: RedPacketDefault & RedPacketOpenedProps) => {
  const { t } = useTranslation('common')
  const content = React.useMemo(() => {
    return (
      <Box display={'flex'} flex={1} flexDirection={'column'}>
        <Box display={'flex'} className={'top'} flexDirection={'column'}>
          <Typography
            variant={'h5'}
            color={RedPacketCssColorConfig[type].highLightColor}
            marginTop={type === 'blindbox' ? 2 : 0}
          >
            {type === 'blindbox'
              ? t('labelRedPacketBlindboxReceived1')
              : t('labelRedPacketReceived')}
          </Typography>
          {type === 'blindbox' && (
            <Typography variant={'h5'} color={RedPacketCssColorConfig[type].highLightColor}>
              {t('labelRedPacketBlindboxReceived2')}
            </Typography>
          )}
          {type !== 'blindbox' && (
            <>
              <Typography
                variant={'h4'}
                color={RedPacketCssColorConfig[type].highLightColor}
                marginTop={1}
              >
                {myAmountStr ? myAmountStr : EmptyValueTag}
              </Typography>
              <Typography variant={'body2'} color={RedPacketCssColorConfig[type].highLightColor}>
                {t('labelTotalRedPacket', { value: amountStr })}
              </Typography>
            </>
          )}
        </Box>
        <Box display={'flex'} className={'middle RedPacketReceived'} flexDirection={'column'}>
          {ImageEle}
          <Typography color={'inherit'}>{sender}</Typography>
          <Typography
            variant={'body2'}
            color={'inherit'}
            whiteSpace={'pre-line'}
            textAlign={'center'}
            marginTop={1 / 2}
            overflow={'hidden'}
            textOverflow={'ellipsis'}
            paddingX={4}
            sx={{
              wordBreak: 'break-all',
              display: '-webkit-box',
              '-webkit-line-clamp': '2',
              lineClamp: '2',
              '-webkit-box-orient': 'vertical',
            }}
            dangerouslySetInnerHTML={{ __html: sanitize(memo ?? '') }}
            width={300}
          />
        </Box>
        <Box display={'flex'} className={'footer'}>
          <Link
            className={'viewDetail'}
            whiteSpace={'pre-line'}
            color={'inherit'}
            variant={'body1'}
            onClick={(e) => {
              e.stopPropagation()
              viewDetail()
            }}
          >
            {t('labelLuckyRedPacketDetail')}
          </Link>
        </Box>
      </Box>
    )
  }, [type])
  return <RedPacketBgOpened type={type} content={content} size={size} />
}

export const RedPacketDetailStyled = styled(Box)`
  border-radius: ${({ theme }) => theme.unit}px;
  background-color: var(--color-box);
` as typeof Box

export const RedPacketTimeout = ({
  type = 'default',
  size,
  sender,
  memo,
  viewDetail,
}: RedPacketTimeoutProps) => {
  const { t } = useTranslation('common')
  const content = React.useMemo(() => {
    return (
      <Box
        className={`content content${size}`}
        position={'relative'}
        zIndex={200}
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'stretch'}
        // alignItems={"s"}
        height={RedPacketSize['middle'].height}
      >
        <Box display={'flex'} className={'top'} flexDirection={'column'}>
          <Typography
            color={'inherit'}
            variant={'h4'}
            className={'timeoutTitle'}
            whiteSpace={'pre-line'}
            paddingTop={2}
            textAlign={'center'}
          >
            {t('labelLuckyRedPacketTimeout')}
          </Typography>
          <Typography paddingTop={1 / 2} className={'secondary'}>
            {sender}
          </Typography>
        </Box>
        <Box display={'flex'} className={'middle'}>
          <Typography
            color={'inherit'}
            variant={'body1'}
            whiteSpace={'pre-line'}
            textAlign={'center'}
            overflow={'hidden'}
            textOverflow={'ellipsis'}
            paddingX={4}
            sx={{
              wordBreak: 'break-all',
              display: '-webkit-box',
              '-webkit-line-clamp': '2',
              lineClamp: '2',
              '-webkit-box-orient': 'vertical',
            }}
            dangerouslySetInnerHTML={{ __html: sanitize(memo ?? '') }}
          />
        </Box>
        <Box display={'flex'} className={'footer'}>
          {viewDetail && (
            <Link
              className={'viewDetail'}
              whiteSpace={'pre-line'}
              color={'inherit'}
              variant={'body1'}
              onClick={(e) => {
                e.stopPropagation()
                viewDetail()
              }}
            >
              {t('labelLuckyRedPacketDetail')}
            </Link>
          )}
        </Box>
      </Box>
    )
  }, [])
  return <RedPacketBgOpened type={type} content={content} size={size} />
}

const BoxStyle = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;

  .redPacketNFT {
    margin-top: ${({ theme }) => 2 * theme.unit}px;
    padding-top: var(--nft-large-avatar);
  }

  .top {
    border-radius: ${({ theme }) => theme.unit}px;
    border-bottom-right-radius: 100%;
    border-bottom-left-radius: 100%;
  }
`

export const RedPacketDetail = ({
  redPacketType,
  sender,
  amountStr,
  // _amountClaimStr,
  memo,
  // page = 1,
  claimList,
  // detail,
  // detail,
  handlePageChange,
  myAmountStr,
  totalCount,
  remainCount,
  onShared,
  relyNumber,
  relyAmount,
  ImageEle,
  showRelayText,
  tokenSymbol,
  detail,
  bottomButton,
  page,
  onClickClaim,
  claimButton,
  totalNumber,
}: RedPacketDetailProps) => {
  const { t } = useTranslation('common')
  const showLucky = detail.luckyToken.tokenAmount.remainCount == 0
  const limit = detail.luckyToken.isNft ? RedPacketNFTDetailLimit : RedPacketDetailLimit
  const pageNation = totalNumber - limit > 0 && (
    <TablePagination
      size={'small'}
      page={page}
      pageSize={limit}
      total={totalNumber}
      onPageChange={(_page) => {
        handlePageChange(_page)
      }}
    />
  )
  const theme = useTheme()
  const isTarget = detail.luckyToken.type.scope === sdk.LuckyTokenViewType.TARGET

  return (
    <BoxStyle
      flex={1}
      width={RedPacketSize.large.width}
      height={RedPacketSize.large.height}
      display={'flex'}
      paddingBottom={1}
      flexDirection={'column'}
      overflow={'scroll'}
    >
      <Box
        className={'top'}
        width={'100%'}
        sx={{
          background: RedPacketColorConfig.default.startColor,
          height: '88px',
        }}
        display={'flex'}
        alignItems={'center'}
        justifyContent={'center'}
      >
        <Typography variant={'body1'} color={RedPacketColorConfig.default.fontColor}>
          {t(`label${redPacketType}RedPacket`)}
        </Typography>
      </Box>
      <Box display={'flex'} flexDirection={'column'} alignItems={'center'} marginY={2}>
        <Typography marginLeft={isTarget ? 8.5 : 0} variant={'body1'}>
          {sender}
          {isTarget && (
            <Typography
              marginLeft={0.5}
              borderRadius={1}
              paddingX={0.5}
              bgcolor={hexToRGB(theme.colorBase.warning, 0.5)}
              color={'var(--color-warning)'}
              component={'span'}
            >
              {t('labelRedPacketExclusiveTag')}
            </Typography>
          )}
        </Typography>
        <Typography
          variant={'body2'}
          color={'var(--color-text-third)'}
          whiteSpace={'pre-line'}
          textAlign={'center'}
          marginTop={1 / 2}
          overflow={'hidden'}
          textOverflow={'ellipsis'}
          paddingX={4}
          sx={{
            wordBreak: 'break-all',
            display: '-webkit-box',
            '-webkit-line-clamp': '2',
            lineClamp: '2',
            '-webkit-box-orient': 'vertical',
          }}
        >
          {memo ?? ''}{' '}
          
        </Typography>
        {ImageEle}
        <Typography variant={'h3'} color={RedPacketColorConfig.default.colorTop} marginTop={1}>
          {myAmountStr ? myAmountStr : EmptyValueTag}
        </Typography>
        <Typography variant={'body2'} color={RedPacketColorConfig.default.colorTop}>
          {t('labelTotalRedPacket', { value: amountStr })}
        </Typography>
      </Box>
      {/*<Divider orientation={"horizontal"} sx={{ borderWidth: 3 }} />*/}
      <Box flex={1} display={'flex'} justifyContent={'stretch'} flexDirection={'column'}>
        <Typography
          variant={'body1'}
          color={'var(--color-text-third)'}
          marginY={1}
          paddingX={1}
          paddingY={1}
          sx={{ background: 'var(--color-divide)' }}
        >
          {t('labelRedPacketReceivedRecord', {
            value: totalCount - remainCount,
            count: totalCount,
          })}
        </Typography>
        {/*<Divider*/}
        {/*  orientation={"horizontal"}*/}
        {/*  sx={{ borderWidth: 1, paddingX: 1 }}*/}
        {/*/>*/}
        <Box flex={1}>
          {claimList &&
            claimList.map((item, index) => {
              return (
                <BoxClaim
                  className={item.isSelf ? 'self claim' : 'claim'}
                  display={'flex'}
                  justifyContent={'stretch'}
                  flexDirection={'column'}
                  paddingTop={1 / 2}
                  paddingX={1}
                >
                  <Typography
                    component={'span'}
                    display={'inline-flex'}
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                    paddingX={1}
                  >
                    <Typography
                      variant={'body1'}
                      component={'span'}
                      color={item.isSelf ? 'success' : 'textPrimary'}
                    >
                      {item.accountStr}
                      {item.isSelf ? ` (${t('labelRedPacketMe')})` : ''}
                    </Typography>
                    <Typography variant={'body1'} component={'span'} color={'textPrimary'}>
                      {item.amountStr}
                    </Typography>
                  </Typography>
                  <Typography
                    component={'span'}
                    display={'inline-flex'}
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                    paddingX={1}
                  >
                    <Typography
                      variant={'body2'}
                      component={'span'}
                      color={'var(--color-text-third)'}
                    >
                      {moment(new Date(item.createdAt), 'YYYYMMDDHHMM').fromNow()}
                    </Typography>
                    <Typography display={'inline'}>
                      {item.helper && (
                        <Typography
                          component={'span'}
                          color={'var(--color-primary)'}
                          display={'inline-flex'}
                          alignItems={'center'}
                          variant={'body2'}
                        >
                          {item.helper} Help
                        </Typography>
                      )}
                      {showLucky &&
                        (redPacketType === 'lucky' || redPacketType === 'relay') &&
                        item.isMax && (
                          <Typography
                            component={'span'}
                            color={'var(--color-warning)'}
                            display={'inline-flex'}
                            alignItems={'center'}
                            variant={'body2'}
                            marginLeft={1}
                          >
                            <FirstPlaceIcon fontSize={'medium'} sx={{ paddingRight: 1 / 2 }} />
                            {t('labelLuckDraw')}
                          </Typography>
                        )}
                    </Typography>
                  </Typography>

                  {index + 1 !== claimList.length && (
                    <Divider
                      orientation={'horizontal'}
                      sx={{
                        borderWidth: 1 / 2,
                        paddingX: 1,
                        marginTop: 1 / 2,
                      }}
                    />
                  )}
                </BoxClaim>
              )
            })}
        </Box>
        {pageNation}
      </Box>
      {/* {showShareBtn && ( */}
      <Box paddingX={1} display={'flex'} flexDirection={'column'}>
        {claimButton === 'claim' ? (
          <Button variant={'contained'} fullWidth onClick={onClickClaim}>
            {t('labelClaimBtn')}
          </Button>
        ) : claimButton === 'expired' && bottomButton === 'hidden' ? (
          <Button variant={'contained'} fullWidth disabled>
            {t('labelClaimBtnExpired')}
          </Button>
        ) : claimButton === 'claimed' && bottomButton === 'hidden' ? (
          <Button variant={'contained'} fullWidth disabled>
            {t('labelClaimBtnClaimed')}
          </Button>
        ) : claimButton === 'claiming' && bottomButton === 'hidden' ? (
          <Button variant={'contained'} fullWidth disabled>
            {t('labelRedPacketClaiming')}
          </Button>
        ) : (
          <></>
        )}
        {bottomButton === 'share' ? (
          claimButton === 'claim' ? (
            <Button variant={'text'} size={'small'} onClick={onShared}>
              {t('labelRedPacketGrab')}
            </Button>
          ) : (
            <Button
              variant={'contained'}
              color={'error'}
              sx={{
                backgroundColor: RedPacketColorConfig.default.colorTop as any,
                '&:hover': {
                  backgroundColor: RedPacketColorConfig.default.colorTop as any,
                },
              }}
              fullWidth={true}
              onClick={onShared}
            >
              {t('labelRedPacketGrab')}
            </Button>
          )
        ) : (
          bottomButton !== 'hidden' && (
            <Button
              variant={'contained'}
              color={'error'}
              sx={{
                backgroundColor: RedPacketColorConfig.default.colorTop as any,
                '&:hover': {
                  backgroundColor: RedPacketColorConfig.default.colorTop as any,
                },
              }}
              fullWidth={true}
              disabled
            >
              {t('labelRedPacketEnded')}
            </Button>
          )
        )}

        {showRelayText && (
          <Typography
            color={'textSecondary'}
            variant={'body2'}
            textAlign={'center'}
            paddingTop={1}
            component={'span'}
          >
            <Trans
              i18nKey={'labelRedpacketHavePeopleHelp'}
              tOptions={{
                number: relyNumber ? relyNumber : EmptyValueTag,
                amount:
                  relyAmount && !sdk.toBig(relyAmount).isZero()
                    ? relyAmount + (tokenSymbol ? ` ${tokenSymbol}` : '')
                    : EmptyValueTag,
              }}
            >
              have
              <Typography
                variant={'inherit'}
                component={'span'}
                color={RedPacketColorConfig.default.startColor}
              >
                {relyNumber ?? EmptyValueTag}
              </Typography>
              friends help you pick up Redpacket, you extends reward:
              <Typography
                variant={'inherit'}
                component={'span'}
                color={RedPacketColorConfig.default.fontColor}
              >
                {relyAmount ?? EmptyValueTag}
              </Typography>
            </Trans>
          </Typography>
        )}
      </Box>
      {/* )} */}
    </BoxStyle>
  )
}

export const RedPacketPrepare = ({
  chainId,
  account,
  tokenInfo,
  setShowRedPacket,
  claim,
  _type = 'default',
  amountStr,
  myAmountStr,
  onOpen,
  getIPFSString,
  baseURL,
  claimed,
  ...props
}: {
  chainId: sdk.ChainId
  account: Account
  amountStr: string
  tokenInfo: sdk.TokenInfo
  claim: string | undefined
  myAmountStr: string | undefined
  setShowRedPacket: (
    state: ModalStatePlayLoad & {
      step?: number
      info?: { [key: string]: any }
    },
  ) => void
  baseURL: string
  getIPFSString: GET_IPFS_STRING
  onOpen: () => void
  _type?: 'official' | 'default' | 'blindbox'
  claimed: boolean
} & sdk.LuckyTokenItemForReceive) => {
  // const { t } = useTranslation("common");
  const ref = React.createRef()
  const _info = props as sdk.LuckyTokenItemForReceive
  // const props.isNft;
  const ImageEle = React.useMemo(() => {
    return props.isNft ? (
      <BoxNFT flex={1} position={'relative'} className={'redPacketNFT'}>
        <Box
          position={'absolute'}
          top={0}
          right={0}
          bottom={0}
          left={0}
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <NFTMedia
            ref={ref}
            item={props.nftTokenInfo as Partial<NFTWholeINFO>}
            shouldPlay={true}
            onNFTError={() => undefined}
            isOrigin={true}
            getIPFSString={getIPFSString}
            baseURL={baseURL}
          />
        </Box>
      </BoxNFT>
    ) : (
      <></>
    )
  }, [props])

  // following code is for triggering rerender
  const getDifferenceStatus = () => {
    const difference = new Date(_info.validSince).getTime() - Date.now()
    return difference > 180000 ? 0 : difference > 0 ? 1 : 2
  }
  const [differenceStatus, setDifferenceStatus] = React.useState(getDifferenceStatus())
  React.useEffect(() => {
    setInterval(() => {
      setDifferenceStatus(getDifferenceStatus)
    }, 1000)
  }, [])
  const viewItem = React.useMemo(() => {
    let difference = new Date(_info.validSince).getTime() - Date.now()
    if (claimed) {
      return (
        <RedPacketOpened
          {...{
            ...props,
          }}
          ImageEle={ImageEle}
          amountStr={amountStr}
          myAmountStr={myAmountStr}
          viewDetail={() => {
            if (_info.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX) {
              setShowRedPacket({
                isShow: true,
                step: RedPacketViewStep.BlindBoxDetail,
                info: {
                  ..._info,
                },
              })
            } else {
              setShowRedPacket({
                isShow: true,
                step: RedPacketViewStep.DetailPanel,
                info: {
                  ..._info,
                },
              })
            }
          }}
          sender={props?.sender?.ens ? props?.sender?.ens : getShortAddr(props?.sender?.address)}
          memo={props?.info?.memo}
          type={_type}
        />
      )
    } else if (difference > 180000) {
      return (
        <RedPacketUnready
          sender={props?.sender?.ens ? props?.sender?.ens : getShortAddr(props?.sender?.address)}
          {...props?.info}
          ImageEle={ImageEle}
          amountStr={amountStr}
          validSince={_info.validSince}
          type={_type}
          onClickOpen={() => {
            // if (_info.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX) {
            setShowRedPacket({
              isShow: true,
              step: RedPacketViewStep.RedPacketClock,
              info: {
                ..._info,
              },
            })
          }}
        />
      )
    } else if (difference > 0) {
      return (
        <RedPacketClock
          {...props?.info}
          ImageEle={ImageEle}
          sender={props?.sender?.ens ? props?.sender?.ens : getShortAddr(props?.sender?.address)}
          showRedPacket={() => {
            // do nothing
            // setShowRedPacket({
            //   isShow: true,
            //   step: RedPacketViewStep.OpenPanel,
            //   info: _info,
            // });
          }}
          amountStr={amountStr}
          validSince={_info.validSince}
          type={_type}
        />
      )
    } else if (
      // difference + 86400000 < 0 ||
      _info.status == sdk.LuckyTokenItemStatus.COMPLETED ||
      _info.status == sdk.LuckyTokenItemStatus.OVER_DUE ||
      _info.tokenAmount.remainCount === 0
    ) {
      return (
        <RedPacketTimeout
          {...props?.info}
          ImageEle={ImageEle}
          sender={props?.sender?.ens ? props?.sender?.ens : getShortAddr(props?.sender?.address)}
          type={_type ?? 'default'}
          viewDetail={() => {
            if (_info.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX) {
              setShowRedPacket({
                isShow: true,
                step: RedPacketViewStep.BlindBoxDetail,
                info: {
                  ..._info,
                },
              })
            } else {
              setShowRedPacket({
                isShow: true,
                step: RedPacketViewStep.DetailPanel,
                info: {
                  ..._info,
                },
              })
            }
          }}
        />
      )
    } else {
      return (
        <RedPacketOpen
          {...{
            ...props,
          }}
          ImageEle={ImageEle ?? undefined}
          type={_type}
          amountStr={amountStr}
          sender={props?.sender?.ens ? props?.sender?.ens : getShortAddr(props?.sender?.address)}
          memo={props?.info?.memo}
          onOpen={() => {
            setShowRedPacket({
              isShow: false,
              step: RedPacketViewStep.Loading,
              info: _info,
            })
            onOpen()
          }}
          viewDetail={
            _info.sender.accountId === account.accountId
              ? () => {
                  if (_info.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX) {
                    setShowRedPacket({
                      isShow: true,
                      step: RedPacketViewStep.BlindBoxDetail,
                      info: {
                        ..._info,
                      },
                    })
                  } else {
                    setShowRedPacket({
                      isShow: true,
                      step: RedPacketViewStep.DetailPanel,
                      info: {
                        ..._info,
                      },
                    })
                  }
                }
              : undefined
          }
        />
      )
    }
  }, [amountStr, claim, myAmountStr, onOpen, _info, differenceStatus])
  return <Box>{viewItem}</Box>
}

const BlindBoxDetailBoxStyle = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;

  .redPacketNFT {
    margin-top: ${({ theme }) => 2 * theme.unit}px;
    padding-top: var(--nft-large-avatar);
  }

  .top {
    border-radius: ${({ theme }) => theme.unit}px;
    border-bottom-right-radius: 100%;
    border-bottom-left-radius: 100%;
  }

  .viewDetail {
    color: ${RedPacketCssColorConfig.default?.primaryColor};

    &:hover {
      text-decoration: underline;
    }
  }
`

export const RedPacketBlindBoxDetail = ({
  sender,
  memo,
  type,
  NFTURL,
  blindBoxStartTime,
  lotteryStartTime,
  lotteryEndTime,
  opendBlindBoxAmount,
  totalBlindBoxAmount,
  deliverdGiftsAmount,
  totalGiftsAmount,
  onShared,
  onClickViewDetail,
  NFTClaimList,
  BlindBoxClaimList,
  showOpenLottery,
  wonPrizeInfo,
  onClickClaim,
  onCloseOpenModal,
  onClickClaimDetailBack,
  description,
  shareButton,
  claimButton,
  didClaimABlindBox,
  wonInfo,
  page,
  handlePageChange,
  totalClaimedNFTsCount,
  handlePageChange_BlindBox,
  pageForBlindbox,
  totalBlindboxCount,
  onClickClaimPopViewDetail,
  expired,
  isTokenBlindbox,
  remainGiftsAmount,
}: RedPacketBlindBoxDetailProps) => {
  const { t } = useTranslation('common')
  const theme = useTheme()
  const emptyImg =
    theme.mode === 'dark'
      ? SoursURL + 'images/redpackBlind1.webp'
      : SoursURL + 'images/redpackBlind2.webp'

  const pageNation = totalClaimedNFTsCount - RedPacketNFTDetailLimit > 0 && (
    <Box width={'100%'}>
      <TablePagination
        page={page}
        pageSize={RedPacketNFTDetailLimit}
        total={totalClaimedNFTsCount}
        onPageChange={(_page) => {
          handlePageChange(_page)
        }}
        size={'small'}
      />
    </Box>
  )
  const pageNationBlindBox = totalBlindboxCount - RedPacketBlindBoxLimit > 0 && (
    <TablePagination
      page={pageForBlindbox}
      pageSize={RedPacketBlindBoxLimit}
      total={totalBlindboxCount}
      onPageChange={(_page) => {
        handlePageChange_BlindBox(_page)
      }}
      size={'small'}
    />
  )

  const LooteryModal = (
    <Modal open={showOpenLottery === true} onClose={onCloseOpenModal}>
      <>
        <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
          <Box
            padding={5}
            bgcolor={'var(--color-box)'}
            width={'var(--modal-width)'}
            borderRadius={1}
            display={'flex'}
            alignItems={'center'}
            flexDirection={'column'}
            position={'relative'}
          >
            {/* <Box></Box> */}
            <ModalCloseButtonPosition right={2} top={2} t={t} onClose={onCloseOpenModal!} />
            <Typography marginBottom={3} variant={'h3'}>
              {wonPrizeInfo ? t('labelBlindBoxCongratulations') : t('labelBlindBoxSorry')}
            </Typography>
            {wonPrizeInfo ? (
              wonPrizeInfo.isNFT ? (
                <>
                  <Typography variant={'h5'}>{wonPrizeInfo.name} </Typography>
                  <img width={'40%'} alt={''} src={wonPrizeInfo.url} />
                </>
              ) : (
                <>
                  <Box marginTop={3} />
                  <CoinIcon symbol={wonPrizeInfo.tokenName} size={48} />
                  {/* <img width={6} alt={""} src={wonPrizeInfo.tokenURL} /> */}
                  <Typography marginTop={2} marginBottom={3} variant={'h2'}>
                    {wonPrizeInfo.amountStr}
                  </Typography>
                  <Typography width={`${25 * theme.unit}px`} textAlign={'center'} variant={'body2'}>
                    {t('labelBlindBoxClaimHint')}
                  </Typography>
                </>
              )
            ) : (
              <>
                <Typography variant={'h5'}>{t('labelBlindBoxNoRewards') + ' '}</Typography>
                <img src={emptyImg} alt={''} />
              </>
            )}
            <Link
              marginBottom={3}
              onClick={onClickClaimPopViewDetail}
              variant={'body1'}
              color={theme.colorBase.textSecondary}
              marginTop={5}
            >
              <u>{t('labelLuckyRedPacketDetail')}</u>
            </Link>
            {/* <Button variant={"contained"} fullWidth onClick={onClickClaim}>
          {t("labelClaimBtn")}
        </Button> */}
            {wonPrizeInfo && wonPrizeInfo.isNFT && (
              <Button variant={'contained'} fullWidth onClick={onClickClaim}>
                {t('labelClaimBtn')}
              </Button>
            )}
          </Box>
        </Box>
      </>
    </Modal>
  )

  if (
    type === 'Lottery Started and Not Win Lottery' ||
    type === 'Lottery Started and Win Lottery'
  ) {
    return LooteryModal
  }

  return (
    <BlindBoxDetailBoxStyle
      flex={1}
      width={RedPacketSize.large.width}
      height={RedPacketSize.large.height}
      display={'flex'}
      paddingBottom={1}
      flexDirection={'column'}
      overflow={'scroll'}
    >
      {LooteryModal}

      <Box
        className={'top'}
        width={'100%'}
        sx={{
          background: RedPacketColorConfig.default.startColor,
          height: '88px',
        }}
        display={'flex'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Box flex={'1 1 0'}>
          {type === 'BlindBox Claime Detail' && (
            <IconButton onClick={onClickClaimDetailBack!} sx={{ marginLeft: 3 }}>
              <BackIcon htmlColor={RedPacketColorConfig.default.fontColor} />
            </IconButton>
          )}
        </Box>
        <Typography
          flex={'3 1 0'}
          variant={'body1'}
          color={RedPacketColorConfig.default.fontColor}
          textAlign={'center'}
        >
          {isTokenBlindbox ? t('labelToken') : t('labelRedPacketMarketNFT')}/
          {t('labelLuckyBlindBox')}
        </Typography>
        <Box flex={'1 1 0'} />
      </Box>

      {type === 'BlindBox Claime Detail' ? (
        <Box
          flex={1}
          display={'flex'}
          justifyContent={'stretch'}
          flexDirection={'column'}
          width={'100%'}
          paddingX={1}
          marginTop={3}
        >
          <Typography variant={'body1'} color={'var(--color-text-third)'} marginY={1} paddingX={1}>
            {t('labelLuckyRecievedBlindBox', {
              opendBlindBoxAmount,
              totalBlindBoxAmount,
            })}
            {/* Received Blind Box {opendBlindBoxAmount}/{totalBlindBoxAmount} */}
          </Typography>

          <Box flex={1} overflow={'scroll'}>
            {BlindBoxClaimList &&
              BlindBoxClaimList.map((info) => {
                return (
                  <BoxClaim
                    className={'claim'}
                    display={'flex'}
                    justifyContent={'stretch'}
                    flexDirection={'column'}
                    paddingY={1}
                    paddingX={1}
                  >
                    <Typography
                      component={'span'}
                      display={'inline-flex'}
                      flexDirection={'row'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                    >
                      <Typography variant={'body1'} component={'span'} color={'textPrimary'}>
                        {info.who}
                        {info.isMe ? ` (${t('labelRedPacketMe')})` : ''}
                      </Typography>
                      <Typography variant={'body1'} component={'span'} color={'textPrimary'}>
                        x 1
                      </Typography>
                    </Typography>
                    <Typography
                      component={'span'}
                      display={'inline-flex'}
                      flexDirection={'row'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                    >
                      <Typography
                        variant={'body2'}
                        component={'span'}
                        color={'var(--color-text-third)'}
                      >
                        {moment(info.when).fromNow()}
                      </Typography>
                    </Typography>
                  </BoxClaim>
                )
              })}
            {pageNationBlindBox}
          </Box>
        </Box>
      ) : (
        <Box
          paddingBottom={2}
          display={'flex'}
          flexDirection={'column'}
          paddingX={1}
          justifyContent={'space-between'}
          height={'100%'}
        >
          <Box display={'flex'} flexDirection={'column'} alignItems={'center'} marginY={2}>
            <Typography variant={'body1'}>{sender}</Typography>
            <Typography
              variant={'body2'}
              color={'var(--color-text-third)'}
              whiteSpace={'pre-line'}
              textAlign={'center'}
              marginTop={1 / 2}
              overflow={'hidden'}
              textOverflow={'ellipsis'}
              paddingX={4}
              sx={{
                wordBreak: 'break-all',
                display: '-webkit-box',
                '-webkit-line-clamp': '2',
                lineClamp: '2',
                '-webkit-box-orient': 'vertical',
              }}
              dangerouslySetInnerHTML={{ __html: sanitize(memo ?? '') }}
            />
            {!isTokenBlindbox && (
              <Box marginY={1} width={'60%'}>
                {NFTURL ? (
                  <img style={{ width: '100%' }} alt={''} src={NFTURL} />
                ) : (
                  <img
                    alt={''}
                    style={{ width: '100%' }}
                    src={SoursURL + 'images/redpackBlind3.webp'}
                  />
                )}
              </Box>
            )}
            {isTokenBlindbox && (type === 'Blind Box Started' || type === 'Not Started') && (
              <Box marginY={1} width={'60%'}>
                <img
                  alt={''}
                  style={{ width: '100%' }}
                  src={SoursURL + 'images/redpackBlind3.webp'}
                />
              </Box>
            )}
            {type === 'Blind Box Started' && didClaimABlindBox && (
              <Typography>{t('labelBlindBoxCongratulationsBlindBox')}</Typography>
            )}
            {type === 'Lottery Started' &&
              (wonInfo.isNFT ? (
                wonInfo.participated ? (
                  wonInfo.won ? (
                    <Typography>{`${wonInfo.amount} NFTs`}</Typography>
                  ) : (
                    <Typography color={'var(--color-error)'}>
                      {t('labelBlindBoxSorryBlindBox')}
                    </Typography>
                  )
                ) : (
                  <Typography color={'var(--color-error)'}>{EmptyValueTag}</Typography>
                )
              ) : (
                <>
                  <Typography
                    marginTop={3}
                    variant={'h2'}
                    color={RedPacketColorConfig.default.colorTop}
                  >
                    {wonInfo.participated ? (
                      wonInfo.won ? (
                        `${wonInfo.amount} ${wonInfo.symbol}`
                      ) : (
                        <Typography color={'var(--color-error)'}>
                          {t('labelBlindBoxSorryBlindBox')}
                        </Typography>
                      )
                    ) : (
                      <Typography>{EmptyValueTag}</Typography>
                    )}
                  </Typography>
                  <Typography variant={'h4'} color={RedPacketColorConfig.default.colorTop}>
                    {t('labelRedpacketTotalReward', {
                      amount: `${wonInfo.total} ${wonInfo.symbol}`,
                    })}{' '}
                  </Typography>
                </>
              ))}
            <Typography
              variant={'body2'}
              color={theme.colorBase.textSecondary}
              marginTop={1}
              textAlign={'center'}
            >
              {description}
            </Typography>
            {type !== 'Lottery Started' && (
              <>
                <Typography
                  variant={'body2'}
                  color={theme.colorBase.textSecondary}
                  // color={RedPacketColorConfig.default.fontColor}
                  marginTop={1}
                  textAlign={'center'}
                >
                  {t('labelBlindBoxExplaination2', {
                    opendBlindBoxAmount,
                    totalBlindBoxAmount,
                    // deliverdGiftsAmount,
                    // totalGiftsAmount,
                    remainingGiftsAmount: totalGiftsAmount - deliverdGiftsAmount,
                  })}
                  {/* {opendBlindBoxAmount} out of {totalBlindBoxAmount} blind boxes have been opened; {deliverdGiftsAmount} out of {totalGiftsAmount} gifts delivered. */}
                </Typography>
                <Typography
                  variant={'body2'}
                  color={theme.colorBase.textSecondary}
                  // color={RedPacketColorConfig.default.fontColor}
                  marginTop={1}
                  textAlign={'center'}
                >
                  {t('labelBlindBoxExplaination3', {
                    remainingGiftsAmount: remainGiftsAmount,
                  })}
                </Typography>
              </>
            )}

            <Box>
              {type === 'Not Started' && (
                <Typography
                  variant={'body2'}
                  color={theme.colorBase.warning}
                  marginTop={1}
                  textAlign={'center'}
                >
                  {t('labelBlindBoxNotStarted', {
                    time: moment(blindBoxStartTime).format(YEAR_DAY_MINUTE_FORMAT),
                    interpolation: {
                      escapeValue: false,
                    },
                  })}
                </Typography>
              )}
              {(type === 'Not Started' || type === 'Blind Box Started') && (
                <Typography
                  variant={'body2'}
                  color={
                    type === 'Blind Box Started'
                      ? theme.colorBase.warning
                      : theme.colorBase.textSecondary
                  }
                  marginTop={1}
                  textAlign={'center'}
                >
                  {t('labelBlindBoxStarted', {
                    time: moment(lotteryStartTime).format(YEAR_DAY_MINUTE_FORMAT),
                    interpolation: {
                      escapeValue: false,
                    },
                  })}
                </Typography>
              )}
              {(type === 'Not Started' || type === 'Blind Box Started') && isTokenBlindbox && (
                <Typography
                  variant={'body2'}
                  color={theme.colorBase.textSecondary}
                  marginTop={1}
                  textAlign={'center'}
                >
                  {t('labelBlindBoxTokenHint', {
                    time: moment(lotteryEndTime).format(YEAR_DAY_MINUTE_FORMAT),
                    interpolation: {
                      escapeValue: false,
                    },
                  })}
                </Typography>
              )}
              {!isTokenBlindbox && (
                <Typography
                  variant={'body2'}
                  color={
                    type !== 'Blind Box Started' && type !== 'Not Started'
                      ? expired
                        ? theme.colorBase.textDisable
                        : theme.colorBase.warning
                      : theme.colorBase.textSecondary
                  }
                  marginTop={1}
                  textAlign={'center'}
                >
                  {t('labelBlindBoxClaimStarted', {
                    time: moment(lotteryEndTime).format(YEAR_DAY_MINUTE_FORMAT),
                    interpolation: {
                      escapeValue: false,
                    },
                  })}
                </Typography>
              )}
            </Box>
            {/* <Typography
              variant={"body2"}
              color={theme.colorBase.warning}
              marginTop={1}
              textAlign={"center"}
            >
              {type === "Not Started"
                ? t("labelBlindBoxNotStarted", {
                    time: moment(blindBoxStartTime).format(
                      YEAR_DAY_MINUTE_FORMAT
                    ),
                    interpolation: {
                      escapeValue: false,
                    }
                  })
                : type === "Blind Box Started"
                ? t("labelBlindBoxStarted", {
                    time: moment(lotteryStartTime).format(
                      YEAR_DAY_MINUTE_FORMAT
                    ),
                    interpolation: {
                      escapeValue: false,
                    }
                  })
                : t("labelBlindBoxClaimStarted", {
                    time: moment(lotteryEndTime).format(YEAR_DAY_MINUTE_FORMAT),
                    interpolation: {
                      escapeValue: false,
                    }
                  })}
            </Typography> */}
            {(type === 'Blind Box Started' || type === 'Lottery Started') && (
              <Link
                className={'viewDetail'}
                whiteSpace={'pre-line'}
                color={'inherit'}
                variant={'body1'}
                onClick={(e) => {
                  e.stopPropagation()
                  onClickViewDetail!()
                }}
              >
                {t('labelLuckyRedPacketDetail')}
              </Link>
            )}
            {type === 'Lottery Started' && (
              <>
                <Divider
                  orientation={'horizontal'}
                  sx={{
                    borderWidth: 3,
                    width: '120%',
                    marginY: 1,
                    marginX: -2,
                  }}
                />
                <Box
                  flex={1}
                  display={'flex'}
                  justifyContent={'stretch'}
                  flexDirection={'column'}
                  width={'100%'}
                >
                  <Typography
                    variant={'body1'}
                    color={'var(--color-text-third)'}
                    marginY={1}
                    paddingX={1}
                  >
                    {isTokenBlindbox
                      ? t('labelBlindBoxRecieved', {
                          deliverdGiftsAmount,
                          totalGiftsAmount,
                        })
                      : t('labelBlindBoxRecievedNFT', {
                          deliverdGiftsAmount,
                          totalGiftsAmount,
                        })}
                  </Typography>

                  <Box flex={1} overflow={'scroll'}>
                    {NFTClaimList &&
                      NFTClaimList.map((info) => {
                        return (
                          <BoxClaim
                            className={'claim'}
                            display={'flex'}
                            justifyContent={'stretch'}
                            flexDirection={'column'}
                            paddingY={1}
                            paddingX={1}
                          >
                            <Typography
                              component={'span'}
                              display={'inline-flex'}
                              flexDirection={'row'}
                              justifyContent={'space-between'}
                              alignItems={'center'}
                            >
                              <Typography
                                component={'span'}
                                display={'inline-flex'}
                                flexDirection={'row'}
                                justifyContent={'space-between'}
                                alignItems={'center'}
                              >
                                <Typography
                                  variant={'body1'}
                                  component={'span'}
                                  color={'textPrimary'}
                                >
                                  {info.who}
                                  {info.isMe ? ` (${t('labelRedPacketMe')})` : ''}
                                </Typography>
                              </Typography>
                              <Typography
                                component={'span'}
                                display={'inline-flex'}
                                flexDirection={'row'}
                                justifyContent={'space-between'}
                                alignItems={'center'}
                              >
                                <Typography
                                  variant={'body2'}
                                  component={'span'}
                                  color={'textPrimary'}
                                >
                                  {info.showMultiplier && 'x'} {info.amount}
                                </Typography>
                              </Typography>
                            </Typography>
                            <Typography
                              component={'span'}
                              display={'inline-flex'}
                              flexDirection={'row'}
                              justifyContent={'space-between'}
                              alignItems={'center'}
                            >
                              <Typography
                                variant={'body2'}
                                component={'span'}
                                color={'var(--color-text-third)'}
                              >
                                {moment(info.when).fromNow()}
                              </Typography>
                              <Typography display={'inline'}>
                                {info.showLuckiest && (
                                  <Typography
                                    component={'span'}
                                    color={'var(--color-warning)'}
                                    display={'inline-flex'}
                                    alignItems={'center'}
                                    variant={'body2'}
                                    marginLeft={1}
                                  >
                                    <FirstPlaceIcon
                                      fontSize={'medium'}
                                      sx={{ paddingRight: 1 / 2 }}
                                    />
                                    {t('labelLuckDraw')}
                                  </Typography>
                                )}
                              </Typography>
                            </Typography>
                          </BoxClaim>
                        )
                      })}
                  </Box>
                  {pageNation}
                </Box>
              </>
            )}
          </Box>
          {/* {(type === "Not Started" || type === "Blind Box Started") && ( */}
          <Box marginBottom={1}>
            {shareButton === 'share' && (
              <Button
                variant={'contained'}
                color={'error'}
                sx={{
                  backgroundColor: RedPacketColorConfig.default.colorTop as any,
                  '&:hover': {
                    backgroundColor: RedPacketColorConfig.default.colorTop as any,
                  },
                }}
                fullWidth={true}
                onClick={onShared}
              >
                {t('labelRedPacketGrab')}
              </Button>
            )}
            {claimButton === 'claim' ? (
              <Button variant={'contained'} fullWidth onClick={onClickClaim}>
                {t('labelClaimBtn')}
              </Button>
            ) : claimButton === 'claimed' ? (
              <Button disabled variant={'contained'} fullWidth>
                {t('labelClaimBtnClaimed')}
              </Button>
            ) : claimButton === 'expired' ? (
              <Button disabled variant={'contained'} fullWidth>
                {t('Expired')}
              </Button>
            ) : claimButton === 'ended' ? (
              <Button disabled variant={'contained'} fullWidth>
                {t('labelRedPacketStatusEnded')}
              </Button>
            ) : undefined}
          </Box>
          {/* )} */}
        </Box>
      )}
    </BlindBoxDetailBoxStyle>
  )
}
