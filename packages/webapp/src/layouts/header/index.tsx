import {
  ButtonComponentsMap,
  CloseIcon,
  headerRoot,
  hexToRGB,
  toolBarAvailableItem,
  toolBarMobileAvailableItem,
} from '@loopring-web/common-resources'

import { Box, IconButton, Toolbar, Typography } from '@mui/material'

import { useHeader } from './hook'
import { confirmation, useSystem, useAccount, useTargetRedPackets, useTokenMap } from '@loopring-web/core'
import { withTranslation } from 'react-i18next'

import {
  BottomRule,
  Header as HeaderUI,
  HideOnScroll,
  RedPacketViewStep,
  useOpenModals,
  useSettings,
} from '@loopring-web/component-lib'
import { withRouter, useLocation } from 'react-router-dom'
import { RouteComponentProps } from 'react-router'
import React from 'react'

const Header = withTranslation('common')(
  withRouter(
    ({
      t,
      location,
      isHideOnScroll = false,
      isLandPage = false,
      isWrap = false,
      ...rest
    }: any & RouteComponentProps) => {
      const { headerToolBarData, headerMenuData, notifyMap, headerMenuLandingData } = useHeader()
      const { isMobile, coinJson } = useSettings()
      const { pathname } = useLocation()
      const { confirmWrapper } = confirmation.useConfirmation()
      const { allowTrade, chainId } = useSystem()
      const { account } = useAccount()
      const [view, setView] = React.useState(false)
      const { redPackets, setShowRedPacketsPopup} = useTargetRedPackets()
      const popUpRedpackets = redPackets ? redPackets.filter(redpacket => (redpacket as any).notifyType === "NOTIFY_WINDOW") : []
      const showExclusiveRedpacket = popUpRedpackets.length > 0
      const exclusiveRedpacketCount = popUpRedpackets.length
      const { setShowRedPacket, setShowTargetRedpacketPop } = useOpenModals()
      const { idIndex } = useTokenMap()
      const onClickExclusiveredPacket = () => {
        if (exclusiveRedpacketCount > 1) {
          setShowTargetRedpacketPop({
            isShow: true,
            info: {
              exclusiveRedPackets: popUpRedpackets.map(redpacket => {
                return {
                  ...redpacket,
                  tokenName: 
                    redpacket.isNft
                    ? (redpacket.nftTokenInfo?.metadata?.base.name ?? '')
                    : idIndex[redpacket.tokenId],
                  tokenIcon: coinJson[idIndex[redpacket.tokenId ?? 0]] 
                }
              })
            }
          })
        } else {
          setShowRedPacket({
            isShow: true,
            info: {
              ...popUpRedpackets[0],
            },
            step: RedPacketViewStep.OpenPanel,
          })
        }
      } 

      return (
        <>
          {isHideOnScroll ? (
            <HideOnScroll window={undefined}>
              <HeaderUI
                account={account}
                isWrap={isLandPage || isWrap}
                chainId={chainId}
                {...rest}
                isLandPage={isLandPage}
                isMobile={isMobile}
                allowTrade={allowTrade}
                headerMenuData={
                  /(guardian)|(depositto)/gi.test(pathname) ? headerMenuLandingData : headerMenuData
                }
                toolBarAvailableItem={isMobile ? toolBarMobileAvailableItem : toolBarAvailableItem}
                toolBarMap={ButtonComponentsMap}
                headerToolBarData={headerToolBarData}
                notification={notifyMap}
                selected={location.pathname === '/' ? headerRoot : location.pathname}
                onClickExclusiveredPacket={onClickExclusiveredPacket}
                showExclusiveRedpacket={showExclusiveRedpacket}
                exclusiveRedpacketCount={exclusiveRedpacketCount}
              />
            </HideOnScroll>
          ) : (
            <HeaderUI
              {...rest}
              account={account}
              allowTrade={allowTrade}
              isMobile={isMobile}
              chainId={chainId}
              headerMenuData={
                /(guardian)|(depositto)/gi.test(pathname) ? headerMenuLandingData : headerMenuData
              }
              toolBarAvailableItem={isMobile ? toolBarMobileAvailableItem : toolBarAvailableItem}
              toolBarMap={ButtonComponentsMap}
              headerToolBarData={headerToolBarData}
              notification={notifyMap}
              selected={location.pathname === '/' ? headerRoot : location.pathname}
              onClickExclusiveredPacket={onClickExclusiveredPacket}
              showExclusiveRedpacket={showExclusiveRedpacket}
              exclusiveRedpacketCount={exclusiveRedpacketCount}
            />
          )}
          <Toolbar id='back-to-top-anchor' />
          {/* <BottomRule isShow={!confirmation?.confirmed} */}
          <BottomRule
            isShow={false}
            content={t('labelAgreeLoopringTxt')}
            btnTxt={t('labelCookiesAgree')}
            clickToConfirm={() => confirmWrapper()}
          />

          <Box
            display={view ? 'flex' : 'none'}
            alignItems={'center'}
            justifyContent={'center'}
            position={'fixed'}
            top={58}
            right={0}
            left={0}
            sx={{ background: hexToRGB('#FBA95C', '0.8') }}
            width={'100%'}
          >
            <Typography color={'white'} padding={2}></Typography>
            <IconButton
              size={'large'}
              aria-label={t('labelClose')}
              color={'inherit'}
              onClick={(event) => {
                setView(false)
              }}
            >
              <CloseIcon htmlColor={'white'} />
            </IconButton>
          </Box>
        </>
      )
    },
  ),
)

export default Header
