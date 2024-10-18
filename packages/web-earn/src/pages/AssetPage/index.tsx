import { useRouteMatch } from 'react-router-dom'

import { Box, BoxProps, Button, Typography } from '@mui/material'
import { AssetTitleMobile, useSettings } from '@loopring-web/component-lib'
import { CloseIcon, SoursURL, subMenuLayer2 } from '@loopring-web/common-resources'

import HistoryPanel from './HistoryPanel'
import React from 'react'
import {
  useAccount,
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

export * from './HistoryPanel/hooks'
export const subMenu = subMenuLayer2

interface BottomSectionProps {
  title: string
  subTitle?: React.ReactNode
  des: string
  imgSrc: string
  link: string
}

const BottomSection = ({
  title,
  subTitle,
  des,
  imgSrc,
  link,
  ...rest
}: BottomSectionProps & BoxProps) => {
  const theme = useTheme()
  return (
    <Box
      borderRadius={'24px'}
      px={4}
      py={8}
      minHeight={'100%'}
      bgcolor={'var(--color-box)'}
      display={'flex'}
      flexDirection={'column'}
      minWidth={'400px'}
      // alignContent={'space-around'}
      justifyContent={'space-between'}
      {...rest}
    >
      <Box>
        <Box display={'flex'} justifyContent={'space-between'}>
          <Typography mt={1.5} variant={'h2'}>
            {title}
          </Typography>
          <Box
            component={'img'}
            src={`${SoursURL}${
              theme.mode === 'dark' ? 'earn/nav_button_dark.png' : 'earn/nav_button_light.png'
            }`}
            sx={{ cursor: 'pointer' }}
            height={'44px'}
            width={'44px'}
            onClick={() => {
              window.open(link, '_blank')
            }}
          />
        </Box>
        {subTitle && <Box mt={2}>{subTitle}</Box>}
        <Typography color={'var(--color-text-secondary)'} mt={2} mb={8}>
          {des}
        </Typography>
      </Box>

      <Box width={'100%'} display={'flex'} justifyContent={'center'}>
        <Box component={'img'} src={imgSrc} mt={'auto'} height={'160px'} />
      </Box>
    </Box>
  )
}

export const AssetPage = () => {
  let match: any = useRouteMatch('/l2assets/:item')
  const { forexMap } = useSystem()

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
  const {setShowTaikoLaunchBanner2, confirmation} = useConfirmation()
  if (selected.toLowerCase() === 'history') {
    return <Box
    display={'flex'}
    alignItems={'stretch'}
    flexDirection={'column'}
    marginTop={0}
    flex={1}
  >
    <ViewAccountTemplate activeViewTemplate={<MaxWidthContainer marginTop={5}>
    <HistoryPanel />
    </MaxWidthContainer>}></ViewAccountTemplate> 
  </Box>
    
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
      {confirmation.showTaikoLaunchBanner2 && <MaxWidthContainer>
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
          }}
        >
          <CloseIcon
            className='custom-size'
            sx={{
              color: 'var(--color-text-secondary)',
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
          <Box height={'32px'} component={'img'} src={SoursURL + 'earn/assets_banner_title.png'} />
          <Typography mt={1.5} textAlign={'center'} fontSize={'16px'}>
            Loopring DeFi is expanding to various EVM-compatible networks using its trustless,
            time-tested ZK-Rollup protocol. The first <br /> deployment will be on Taiko. Join us
            for an exciting journey ahead!
          </Typography>
        </Box>
      </MaxWidthContainer>}
      <MaxWidthContainer mt={confirmation.showTaikoLaunchBanner2 ? 3 : 4}>
        {isUnlocked ? (
          <AssetPanel
            showRedpacketReddot={redPackets ? redPackets?.length > 0 : false}
            assetTitleProps={assetTitleProps}
            assetPanelProps={{ ...assetPanelProps, assetBtnStatus }}
          />
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
          >
            <Box width={'30%'}>
              <Typography fontSize={'16px'} color={'var(--color-text-secondary)'}>
                Loopring DeFi Assets
              </Typography>
              <Typography variant={'h2'} mt={2}>
                --
              </Typography>
            </Box>
            <Box>{<WalletConnectL2Btn width='180px' size={'large'} />}</Box>
            <Box width={'30%'} />
          </Box>
        )}
      </MaxWidthContainer>
      <MaxWidthContainer mt={3} mb={8}>
        <Box width={'100%'} display={'flex'} sx={{ overflowX: 'scroll', scrollbarWidth: 'none' }}>
          <BottomSection
            title='Taiko Farming'
            subTitle={
              <Box
                component={'img'}
                src={`${SoursURL}${
                  theme.mode === 'dark'
                    ? 'earn/defi_assets_taiko_farming_subtitle_dark.png'
                    : 'earn/defi_assets_taiko_farming_subtitle_light.png'
                }`}
                height={'24px'}
              />
            }
            des='Farm Trailblazer points at 60X while unlocking the value of your locked TAIKO to keep trading or earning.'
            imgSrc={`${SoursURL}${
              theme.mode === 'dark'
                ? 'earn/defi_assets_taiko_farming_dark.png'
                : 'earn/defi_assets_taiko_farming_light.png'
            }`}
            link='/#/taiko-farming'
            mr={2}
          />
          <BottomSection
            title='Dual Investment'
            subTitle='todo'
            des='Bring structured finance from CeFi to DeFi in a trustless manner. Place orders at your preferred price and earn high yields!'
            imgSrc={`${SoursURL}${
              theme.mode === 'dark'
                ? 'earn/defi_assets_dual_dark.png'
                : 'earn/defi_assets_dual_light.png'
            }`}
            link='/#/invest/dual'
            mr={2}
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
            mr={2}
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
            mr={2}
          />
        </Box>
      </MaxWidthContainer>
    </Box>
  )
}
