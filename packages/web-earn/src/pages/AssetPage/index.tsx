import { useRouteMatch } from 'react-router-dom'

import { Box, BoxProps, Button, Typography } from '@mui/material'
import { AssetTitleMobile, AssetTitleMobileEarn, useSettings, useToggle } from '@loopring-web/component-lib'
import { CloseIcon, hexToRGB, HiddenTag, SoursURL, subMenuLayer2 } from '@loopring-web/common-resources'

import HistoryPanel from './HistoryPanel'
import React from 'react'
import {
  fiatNumberDisplay,
  numberFormatShowInPercent,
  useAccount,
  useDualMap,
  useSocket,
  useSubmitBtn,
  useSystem,
  useTargetRedPackets,
  ViewAccountTemplate,
  WalletConnectL2Btn,
} from '@loopring-web/core'
import { useGetAssets } from './AssetPanel/hook'
import { AssetPanel } from './AssetPanel'
import { MaxWidthContainer } from '../InvestPage'
import { WsTopicType } from '@loopring-web/loopring-sdk'
import { useTheme } from '@emotion/react'
import { useConfirmation } from '@loopring-web/core/src/stores/localStore/confirmation/hook'
import { concat, max } from 'lodash'
import Decimal from 'decimal.js'
import { t } from 'i18next'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'

export * from './HistoryPanel/hooks'
export const subMenu = subMenuLayer2

interface BottomSectionProps {
  title: string
  subTitle?: React.ReactNode
  des: string
  imgSrc: string
  link: string
  isMobile: boolean
}

const BottomSection = ({
  title,
  subTitle,
  des,
  imgSrc,
  link,
  isMobile,
  ...rest
}: BottomSectionProps & BoxProps) => {
  const theme = useTheme()
  return (
    <Box
      borderRadius={'24px'}
      px={4}
      py={8}
      minHeight={'100%'}
      bgcolor={hexToRGB(theme.colorBase.boxSecondary, 0.6)}
      display={'flex'}
      flexDirection={'column'}
      minWidth={isMobile ? '100%' : '400px'}
      justifyContent={'space-between'}
      {...rest}
    >
      <Box>
        <Box display={'flex'} justifyContent={'space-between'}>
          <Typography mt={1.5} variant={isMobile ? 'h3' : 'h2'}>
            {title}
          </Typography>
          <Box
            component={'img'}
            src={`${SoursURL}${
              theme.mode === 'dark' ? 'earn/nav_button_dark.png' : 'earn/nav_button_light.png'
            }`}
            sx={{ cursor: 'pointer' }}
            height={isMobile ? '32px' : '44px'}
            width={isMobile ? '32px' : '44px'}
            onClick={() => {
              window.open(link, '_blank')
            }}
          />
        </Box>
        {subTitle && <Box mt={2}>{subTitle}</Box>}
        <Typography
          variant={isMobile ? 'body2' : 'body1'}
          color={'var(--color-text-secondary)'}
          mt={2}
          mb={8}
        >
          {des}
        </Typography>
      </Box>

      <Box width={'100%'} display={'flex'} justifyContent={'center'}>
        <Box component={'img'} src={imgSrc} mt={'auto'} height={isMobile ? '120px' : '160px'} />
      </Box>
    </Box>
  )
}

const RightButton = ({ size, sx, ...rest }: { size: number } & BoxProps) => {
  return (
    <Box
      sx={{
        width: size + 'px',
        height: size + 'px',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'var(--color-border)',
        cursor: 'pointer',
        ...sx,
      }}
      {...rest}
    >
      <ArrowForwardIosIcon className='custome-size' sx={{ fontSize: '16px' }} />
    </Box>
  )
}

const LeftButton = ({ size, sx, ...rest }: { size: number } & BoxProps) => {
  return (
    <Box
      sx={{
        width: size + 'px',
        height: size + 'px',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'var(--color-border)',
        cursor: 'pointer',
        ...sx,
      }}
      {...rest}
    >
      <ArrowForwardIosIcon className='custome-size' sx={{ transform: 'rotate(180deg)' ,fontSize: '16px' }} />
    </Box>
  )
}

export const AssetPage = () => {
  let match: any = useRouteMatch('/l2assets/:item')
  const { forexMap, getValueInCurrency } = useSystem()

  const selected = match?.params.item ?? 'assets'
  const { assetTitleProps, assetTitleMobileExtendProps, assetBtnStatus, ...assetPanelProps } =
    useGetAssets()
  const { redPackets } = useTargetRedPackets()

  const { sendSocketTopic } = useSocket()

  React.useEffect(() => {
    sendSocketTopic({
      [WsTopicType.account]: true,
    })
  }, [])
  const theme = useTheme()
  const isUnlocked = useAccount().account.readyState === 'ACTIVATED'
  const { setShowTaikoLaunchBanner2, confirmation } = useConfirmation()
  const { isMobile, currency } = useSettings()
  const { marketMap: dualMarketMap } = useDualMap()
  const { account } = useAccount()

  const keys = dualMarketMap ? Object.keys(dualMarketMap) : []
  const dualAPRUpToRaw = max(
    concat(
      keys.map((key) => (dualMarketMap[key] as any).baseTokenApy?.max),
      keys.map((key) => (dualMarketMap[key] as any).quoteTokenApy?.max),
    ),
  )
  const dualAPRUpTo = dualAPRUpToRaw
    ? numberFormatShowInPercent(new Decimal(dualAPRUpToRaw).mul('100').toString())
    : '--'

  const scrollDivRef = React.useRef<HTMLDivElement>(null)
  const [reachedRight, setReachedRight] = React.useState(false)
  const [reachedLeft, setReachedLeft] = React.useState(true)
  const div = scrollDivRef.current
  React.useEffect(() => {
    if (scrollDivRef.current) {
      const div = scrollDivRef.current
      const handleScroll = () => {
        setReachedRight(div.scrollLeft + div.clientWidth >= div.scrollWidth)
        setReachedLeft(div.scrollLeft === 0)
      }
      div.addEventListener('scroll', handleScroll)
      return () => {
        div.removeEventListener('scroll', handleScroll)
      }
    }
  }, [div])
  const {
    toggle: { taikoFarming },
  } = useToggle()
  if (selected.toLowerCase() === 'history') {
    return (
      <Box display={'flex'} alignItems={'stretch'} flexDirection={'column'} marginTop={0} flex={1}>
        <ViewAccountTemplate
          activeViewTemplate={
            <MaxWidthContainer marginTop={5}>
              <HistoryPanel />
            </MaxWidthContainer>
          }
        ></ViewAccountTemplate>
      </Box>
    )
  }


  return (
    <Box
      sx={{
        backgroundImage:
          theme.mode === 'light'
            ? `url(${SoursURL + 'images/asset_page_bg_light.png'})`
            : `url(${SoursURL + 'images/asset_page_bg_dark.png'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        height: '100%',
        overflow: 'scroll',
      }}
    >
      {confirmation.showTaikoLaunchBanner2 && (
        <MaxWidthContainer>
          <Box
            sx={{
              backgroundImage: `url(${SoursURL + 'earn/assets_banner.png'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              height: '140px',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              position: 'relative',
              mt: isMobile ? 6 : 4,
            }}
          >
            <CloseIcon
              className='custom-size'
              sx={{
                color: 'var(--color-white)',
                position: 'absolute',
                top: 8,
                right: 8,
                cursor: 'pointer',
              }}
              style={{ height: 24, width: 24 }}
              onClick={() => {
                setShowTaikoLaunchBanner2(false)
              }}
            />
            <Box
              height={isMobile ? '28px' : '32px'}
              component={'img'}
              src={SoursURL + 'earn/assets_banner_title.png'}
            />
            {isMobile ? (
              <Typography
                mt={1.5}
                textAlign={'center'}
                variant='body2'
                color={'var(--color-white)'}
              >
                {t('labelLoopringDeFiIs')}
              </Typography>
            ) : (
              <Typography
                mt={1.5}
                textAlign={'center'}
                fontSize={'16px'}
                color={'var(--color-white)'}
              >
                {t('labelLoopringDeFiIs21')}
                <br />
                {t('labelLoopringDeFiIs22')}
              </Typography>
            )}
          </Box>
        </MaxWidthContainer>
      )}
      <MaxWidthContainer mt={confirmation.showTaikoLaunchBanner2 ? 3 : 4}>
        {isUnlocked ? (
          <>
            {isMobile && (
              <AssetTitleMobileEarn
                forexMap={forexMap}
                assetBtnStatus={assetBtnStatus}
                {...{ ...assetTitleProps, ...assetTitleMobileExtendProps }}
              />
            )}
            <AssetPanel
              showRedpacketReddot={redPackets ? redPackets?.length > 0 : false}
              assetTitleProps={assetTitleProps}
              assetPanelProps={{ ...assetPanelProps, assetBtnStatus }}
            />
          </>
        ) : (
          <Box
            borderRadius={'24px'}
            px={3}
            py={5}
            width={'100%'}
            bgcolor={'var(--color-box)'}
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
            flexDirection={isMobile ? 'column' : 'row'}
          >
            <Box width={'30%'} alignSelf={'flex-start'}>
              <Typography
                fontSize={isMobile ? '14px' : '16px'}
                color={'var(--color-text-secondary)'}
              >
                {t('labelLoopringDeFiAssets')}
              </Typography>
              <Typography variant={isMobile ? 'h4' : 'h2'} mt={2}>
                {!assetTitleProps.hideL2Assets
                  ? assetTitleProps.assetInfo.totalAsset &&
                    new Decimal(assetTitleProps.assetInfo.totalAsset).gt(0) &&
                    currency &&
                    account.readyState !== 'UN_CONNECT' &&
                    forexMap &&
                    forexMap[currency]
                    ? fiatNumberDisplay(
                        getValueInCurrency(assetTitleProps.assetInfo.totalAsset),
                        currency,
                      )
                    : '--'
                  : HiddenTag}
              </Typography>
            </Box>
            {isMobile ? (
              <Box mt={1}>{<WalletConnectL2Btn width='120px' size={'medium'} />}</Box>
            ) : (
              <Box>{<WalletConnectL2Btn width='180px' size={'large'} />}</Box>
            )}
            {!isMobile && <Box width={'30%'} />}
          </Box>
        )}
      </MaxWidthContainer>
      <MaxWidthContainer mt={3} position={'relative'} mb={8}>
        <Box
          ref={scrollDivRef}
          width={'100%'}
          display={'flex'}
          sx={{ overflowX: 'scroll', scrollbarWidth: 'none' }}
          flexDirection={isMobile ? 'column' : 'row'}
        >
          {taikoFarming.enable && <BottomSection
            title='Taiko Farming'
            subTitle={
              <Box
                component={'img'}
                src={`${SoursURL}${
                  theme.mode === 'dark'
                    ? 'earn/defi_assets_taiko_farming_subtitle_dark.png'
                    : 'earn/defi_assets_taiko_farming_subtitle_light.png'
                }`}
                height={isMobile ? '18px' : '24px'}
              />
            }
            des='Farm Trailblazers points at 60X while unlocking the value of your locked TAIKO to keep trading or earning.'
            imgSrc={`${SoursURL}${
              theme.mode === 'dark'
                ? 'earn/defi_assets_taiko_farming_dark.png'
                : 'earn/defi_assets_taiko_farming_light.png'
            }`}
            link='/#/taiko-farming'
            mr={isMobile ? 0 : 2}
            mb={isMobile ? 4 : 0}
            width={isMobile ? '100%' : undefined}
            isMobile={isMobile}
          />}
          <BottomSection
            title='Dual Investment'
            subTitle={
              <Typography
                color={'var(--color-text-secondary)'}
                fontSize={isMobile ? '9px' : '12px'}
              >
                APR Up To{' '}
                <Typography
                  component={'span'}
                  color={'var(--color-success)'}
                  fontSize={isMobile ? '17px' : '24px'}
                >
                  {dualAPRUpTo}
                </Typography>{' '}
              </Typography>
            }
            des='Bring structured finance from CeFi to DeFi in a trustless manner. Place orders at your preferred price and earn high yields!'
            imgSrc={`${SoursURL}${
              theme.mode === 'dark'
                ? 'earn/defi_assets_dual_dark.png'
                : 'earn/defi_assets_dual_light.png'
            }`}
            link='/#/invest/dual'
            mr={isMobile ? 0 : 2}
            mb={isMobile ? 4 : 0}
            width={isMobile ? '100%' : undefined}
            isMobile={isMobile}
          />
          <BottomSection
            title='Portal'
            des='Trade popular tokens beyond the Ethereum chain, with leverage!'
            imgSrc={`${SoursURL}${
              theme.mode === 'dark'
                ? 'earn/defi_assets_portal_dark.png'
                : 'earn/defi_assets_portal_light.png'
            }`}
            link='/#/portal'
            mr={isMobile ? 0 : 2}
            mb={isMobile ? 4 : 0}
            width={isMobile ? '100%' : undefined}
            isMobile={isMobile}
          />
          <BottomSection
            title='Block Trade'
            des='Swap tokens securely and trustlessly, tapping into CEX liquidity.'
            imgSrc={`${SoursURL}${
              theme.mode === 'dark'
                ? 'earn/defi_assets_btrade_dark.png'
                : 'earn/defi_assets_btrade_light.png'
            }`}
            link='/#/trade/btrade'
            mr={isMobile ? 0 : 2}
            mb={isMobile ? 4 : 0}
            width={isMobile ? '100%' : undefined}
            isMobile={isMobile}
          />
        </Box>
        {!isMobile && !reachedLeft && (
          <LeftButton
            onClick={() => {
              const element = scrollDivRef.current
              if (element) {
                element.scrollTo({ behavior: 'smooth', left: 0 })
              }
            }}
            size={64}
            top={'45%'}
            left={'32px'}
            position={'absolute'}
          />
        )}
        {!isMobile && !reachedRight && (
          <RightButton
            onClick={() => {
              const element = scrollDivRef.current
              if (element) {
                element.scrollTo({ behavior: 'smooth', left: element.scrollLeft + 1000 })
              }
            }}
            size={64}
            top={'45%'}
            right={'32px'}
            position={'absolute'}
          />
        )}
      </MaxWidthContainer>
    </Box>
  )
}
