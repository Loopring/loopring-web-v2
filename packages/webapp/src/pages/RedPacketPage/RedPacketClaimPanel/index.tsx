import React from 'react'
import {
  LoopringAPI,
  StylePaper,
  useAccount,
  useSystem,
  useTargetRedPackets,
  useToast,
  useTokenMap,
  useWalletLayer2,
} from '@loopring-web/core'
import {
  CoinIcons,
  Modal,
  NftImageStyle,
  RedPacketClaimTable,
  RedPacketViewStep,
  Toast,
  ToastType,
  TransactionTradeViews,
  useOpenModals,
  useSettings,
} from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { useClaimNFTRedPacket, useClaimRedPacket } from './hooks'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  CloseIcon,
  RecordTabIndex,
  RedPacketColorConfig,
  RedPacketIcon,
  SagaStatus,
  TOAST_TIME,
  TokenType,
  RouterPath,
  RedPacketRouterIndex,
} from '@loopring-web/common-resources'
import { LuckyTokenClaimType, LuckyTokenItemForReceive, SoursURL } from '@loopring-web/loopring-sdk'
import styled from '@emotion/styled'
import { useTheme } from '@emotion/react'

const RedPacktButton = styled(Button)`
  background: ${RedPacketColorConfig.default.btnColor};
  :hover {
    background: ${RedPacketColorConfig.default.btnColor};
    opacity: 0.7;
  }
`

export const RedPacketClaimPanel = ({ hideAssets }: { hideAssets?: boolean }) => {
  const container = React.useRef<HTMLDivElement>(null)
  const { etherscanBaseUrl, forexMap } = useSystem()
  const { toastOpen, setToastOpen, closeToast } = useToast()
  const { status: walletLayer2Status } = useWalletLayer2()
  const { t } = useTranslation()
  const { isMobile } = useSettings()
  const history = useHistory()

  const {
    redPacketClaimList,
    showNFTsPanel,
    showLoading,
    getClaimRedPacket,
    onItemClick,
    onViewMoreClick,
    onCloseNFts,
  } = useClaimRedPacket(setToastOpen)
  const {
    onItemClick: onItemNFTClick,
    redPacketNFTClaimList,
    showLoading: showNFTLoading,
    getClaimNFTRedPacket,
  } = useClaimNFTRedPacket({ setToastOpen })
  const {
    redPackets: exclusiveRedPackets,
    setShowRedPacketsPopup
  } = useTargetRedPackets()
  React.useEffect(() => {
    if (getClaimRedPacket && walletLayer2Status === SagaStatus.UNSET) {
      getClaimRedPacket()
    }
  }, [walletLayer2Status, exclusiveRedPackets?.length])

  const { account } = useAccount()
  const [totalLuckyTokenNFTBalance, setTotalLuckyTokenNFTBalance] = React.useState(
    undefined as number | undefined,
  )
  const [blindboxBalance, setBlindboxBalance] = React.useState(undefined as number | undefined)

  
  const { setShowRedPacket, setShowTargetRedpacketPop } = useOpenModals()

  React.useEffect(() => {
    LoopringAPI.luckTokenAPI
      ?.getLuckTokenClaimHistory(
        {
          isNft: true,
          // @ts-ignore
          statuses: '0',
        },
        account.apiKey,
      )
      .then((response) => {
        const sum = response.list?.reduce((acc, cur) => acc + Number(cur.claim.amount), 0)
        setTotalLuckyTokenNFTBalance(sum)
      })
    LoopringAPI.luckTokenAPI
      ?.getLuckTokenClaimedBlindBox(
        {
          isNft: true,
          statuses: [0],
          fromId: 0,
        },
        account.apiKey,
      )
      .then((response) => {
        setBlindboxBalance(response.totalNum)
      })
  }, [exclusiveRedPackets?.length]) // if open exclusiveRedPacket then refresh
  const theme = useTheme()
  const { coinJson } = useSettings()
  const { idIndex } = useTokenMap()
  return (
    <Box
      flex={1}
      display={'flex'}
      flexDirection={'column'}
      sx={isMobile ? { maxWidth: 'calc(100vw - 32px)' } : {}}
      paddingTop={2}
      position={'relative'}
    >
      <Box
        position={'absolute'}
        display={'flex'}
        alignItems={'center'}
        sx={{
          right: 0,
          top: -42,
          zIndex: 99,
        }}
      >
        <Button
          variant={'text'}
          target='_self'
          rel='noopener noreferrer'
          href={`/#${RouterPath.l2records}/${RecordTabIndex.Transactions}?types=${TransactionTradeViews.redPacket}`}
        >
          {t('labelTransactionsLink')}
        </Button>
        <Button
          startIcon={<RedPacketIcon fontSize={'small'} />}
          variant={'contained'}
          size={'small'}
          // sx={{ color: "var(--color-text-secondary)" }}
          color={'primary'}
          onClick={() => history.push(`${RouterPath.redPacket}/${RedPacketRouterIndex.markets}`)}
        >
          {t('labelRedPacketMarketsBtn')}
        </Button>
      </Box>
      <StylePaper ref={container} flex={1} display={'flex'} flexDirection={'column'}>
        {exclusiveRedPackets && exclusiveRedPackets.length > 0 && (
          <Box paddingX={2} paddingY={1} bgcolor={'var(--color-box-hover)'} borderRadius={0.5}>
            <Typography>
              {t('labelRedPacketHaveExclusive', { count: exclusiveRedPackets.length })}{' '}
              <Button
                onClick={() => {
                  setShowTargetRedpacketPop({
                    isShow: true,
                    info: {
                      exclusiveRedPackets: exclusiveRedPackets.map(redpacket => {
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
                  // setShowRedPacketsPopup(true)
                }}
                variant={'text'}
              >
                {t('labelRedPacketExclusiveViewDetails')}
              </Button>{' '}
            </Typography>
          </Box>
        )}
        <Box className='tableWrapper table-divide-short'>
          <RedPacketClaimTable
            {...{
              rawData: redPacketClaimList,
              showloading: showLoading,
              forexMap,
              onItemClick,
              etherscanBaseUrl,
              getClaimRedPacket,
              onViewMoreClick,
              hideAssets,
            }}
            totalLuckyTokenNFTBalance={totalLuckyTokenNFTBalance}
            blindBoxBalance={blindboxBalance}
          />
        </Box>
        <Dialog
          maxWidth={'lg'}
          open={showNFTsPanel}
          onClose={() => {
            onCloseNFts()
          }}
        >
          <DialogTitle>
            <Typography variant={'h3'} textAlign={'center'}>
              {t('labelBlindBoxRecievedRedPackets')}
            </Typography>
            <IconButton
              size={'medium'}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
              color={'inherit'}
              onClick={() => {
                onCloseNFts()
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ width: '960px' }}>
            <RedPacketClaimTable
              isNFT
              rawData={redPacketNFTClaimList}
              showloading={showNFTLoading}
              forexMap={forexMap}
              onItemClick={onItemNFTClick}
              etherscanBaseUrl={etherscanBaseUrl}
              getClaimRedPacket={getClaimNFTRedPacket}
            />
          </DialogContent>
        </Dialog>
        
      </StylePaper>
      <Toast
        alertText={toastOpen?.content ?? ''}
        severity={toastOpen?.type ?? ToastType.success}
        open={toastOpen?.open ?? false}
        autoHideDuration={TOAST_TIME}
        onClose={closeToast}
      />
    </Box>
  )
}
