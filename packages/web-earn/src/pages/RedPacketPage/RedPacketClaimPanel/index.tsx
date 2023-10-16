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
  RowConfig,
  SagaStatus,
  TOAST_TIME,
  TokenType,
  myLog,
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

  React.useEffect(() => {
    if (getClaimRedPacket && walletLayer2Status === SagaStatus.UNSET) {
      getClaimRedPacket()
    }
  }, [walletLayer2Status])

  const { account } = useAccount()
  const [totalLuckyTokenNFTBalance, setTotalLuckyTokenNFTBalance] = React.useState(
    undefined as number | undefined,
  )
  const [blindboxBalance, setBlindboxBalance] = React.useState(undefined as number | undefined)
  const {redPackets: exclusiveRedPackets, setShowRedPacketsPopup, showPopup,} = useTargetRedPackets()
  const { setShowRedPacket } = useOpenModals()

  const onClickOpenExclusive = React.useCallback((redpacket: LuckyTokenItemForReceive) => {
    setShowRedPacketsPopup(false)
    setShowRedPacket({
      isShow: true,
      info: {
        ...redpacket,
      },
      step: RedPacketViewStep.OpenPanel,
    })
  }, [])
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
  }, [])
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
          href={`/#/l2assets/history/${RecordTabIndex.Transactions}?types=${TransactionTradeViews.redPacket}`}
        >
          {t('labelTransactionsLink')}
        </Button>
        <Button
          startIcon={<RedPacketIcon fontSize={'small'} />}
          variant={'contained'}
          size={'small'}
          // sx={{ color: "var(--color-text-secondary)" }}
          color={'primary'}
          onClick={() => history.push('/redPacket/markets')}
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
                  setShowRedPacketsPopup(true)
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
        <Dialog
          maxWidth={'md'}
          open={showPopup}
          onClose={() => {
            setShowRedPacketsPopup(false)
          }}
        >
          {false ? (
            <DialogContent
              sx={{ width: '480px', height: '480px', display: 'flex', justifyContent: 'center' }}
            >
              <IconButton
                size={'large'}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                }}
                color={'inherit'}
                onClick={() => {
                  setShowRedPacketsPopup(false)
                }}
              >
                <CloseIcon />
              </IconButton>
              <Box
                sx={{
                  backgroundImage: `url(${SoursURL + 'images/target_popup_bg.png'})`,
                  width: '280px',
                  height: '361px',
                  backgroundSize: 'contain',
                  marginX: 6,
                  marginY: 4,
                }}
              >
                <Box
                  marginX={3}
                  marginTop={5}
                  bgcolor={'var(--color-white)'}
                  borderRadius={2}
                  padding={1.5}
                >
                  <Box
                    display={'flex'}
                    flexDirection={'column'}
                    alignItems={'center'}
                    justifyContent={'center'}
                    padding={1}
                    borderRadius={2}
                    border={'1px solid #E1D3A5'}
                  >
                    <Box marginTop={4}>
                      <img width={64} src={SoursURL + 'images/target_airdrop_icon.svg'} />
                    </Box>
                    <Typography variant={'h5'} marginTop={2} color={'black'}>
                      {t('labelRedPacketCongratulations')}
                    </Typography>
                    <Typography textAlign={'center'} marginTop={1} marginBottom={3} color={'black'}>
                      {t('labelRedPacketHaveExclusive', { count: exclusiveRedPackets?.length })}
                    </Typography>
                  </Box>
                </Box>
                <Box marginX={3} marginTop={1.5}>
                  <RedPacktButton
                    onClick={() => {
                      if (exclusiveRedPackets && exclusiveRedPackets.length === 1) {
                        setShowRedPacket({
                          isShow: true,
                          info: {
                            ...exclusiveRedPackets[0],
                          },
                          step: RedPacketViewStep.OpenPanel,
                        })
                      } else {
                        setShowRedPacketsPopup(true)
                      }
                    }}
                    sx={{ background: 'black' }}
                    fullWidth
                    variant={'contained'}
                  >
                    {t('labelRedPacketOpen')}
                  </RedPacktButton>
                </Box>
              </Box>
            </DialogContent>
          ) : (
            <>
              <DialogTitle>
                <Typography variant={'h3'} marginTop={2} textAlign={'center'}>
                  {t('labelExclusiveRedpacket')}
                </Typography>
                <IconButton
                  size={'large'}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                  }}
                  color={'inherit'}
                  onClick={() => {
                    setShowRedPacketsPopup(false)
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent style={{ width: '480px', height: '480px' }}>
                <Box marginTop={5} paddingX={4}>
                  {exclusiveRedPackets && exclusiveRedPackets.map((redpacket) => (
                    <Box
                      display={'flex'}
                      paddingX={2.5}
                      paddingY={1.5}
                      borderRadius={1}
                      bgcolor={'var(--field-opacity)'}
                      justifyContent={'space-between'}
                      marginBottom={2}
                      key={redpacket.hash}
                    >
                      <Box display={'flex'} alignItems={'center'}>
                        {redpacket.isNft ? (
                          <NftImageStyle
                            src={redpacket.nftTokenInfo?.metadata?.imageSize['240-240']}
                            style={{
                              width: `${theme.unit * 4}px`,
                              height: `${theme.unit * 4}px`,
                              borderRadius: `${theme.unit * 0.5}px`,
                            }}
                          />
                        ) : (
                          <Box width={theme.unit * 4} height={theme.unit * 4}>
                            <CoinIcons
                              size={theme.unit * 4}
                              type={TokenType.single}
                              tokenIcon={[coinJson[idIndex[redpacket.tokenId ?? 0]]]}
                            />
                          </Box>
                        )}
                        
                        <Typography whiteSpace={'nowrap'} maxWidth={'150px'} overflow={'hidden'} textOverflow={'ellipsis'} marginLeft={1} marginRight={1}>
                          {redpacket.isNft
                            ? redpacket.nftTokenInfo?.metadata?.base.name
                            : idIndex[redpacket.tokenId]}
                        </Typography>
                        {redpacket.type.mode === LuckyTokenClaimType.BLIND_BOX && <Tooltip title={<>{t('labelRedpacketFromBlindbox')}</>}>
                          <img
                            width={24}
                            height={24}
                            style={{ marginLeft: `${0.5 * theme.unit}px` }}
                            src={
                              theme.mode === 'dark'
                                ? SoursURL + '/images/from_blindbox_dark.png'
                                : SoursURL + '/images/from_blindbox_light.png'
                            }
                          />
                        </Tooltip>}
                      </Box>
                      <Button
                        variant={'contained'}
                        onClick={() => {
                          onClickOpenExclusive(redpacket)
                        }}
                      >
                        {t('labelRedPacketOpen')}
                      </Button>
                    </Box>
                  ))}
                </Box>
              </DialogContent>
            </>
          )}
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
