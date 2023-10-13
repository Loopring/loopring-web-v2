import { useTheme } from '@emotion/react'
import { useHistory, useRouteMatch, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  RedPacketReceiveTable,
  RedPacketRecordTable,
  useSettings,
  RedPacketBlindBoxReceiveTable,
} from '@loopring-web/component-lib'
import { redpacketService, StylePaper, useSystem } from '@loopring-web/core'
import React from 'react'
import {
  useMyRedPacketBlindBoxReceiveTransaction,
  useMyRedPacketReceiveTransaction,
  useMyRedPacketRecordTransaction,
} from './hooks'
import {
  BackIcon,
  RedPacketRouterIndex,
  RouterPath,
  TokenType,
  RedPacketRecordsTabIndex,
} from '@loopring-web/common-resources'
import { Box, Button, Checkbox, FormControlLabel, Tab, Tabs, Typography } from '@mui/material'
import styled from '@emotion/styled'
import { useNotify } from '@loopring-web/core'

const SelectButton = styled(Button)<{ selected?: boolean }>`
  color: ${({ selected, theme }) => (selected ? theme.colorBase.textPrimary : 'auto')};
  border-color: ${({ selected, theme }) => (selected ? theme.colorBase.borderHover : 'auto')};
  background-color: transparent;
  :hover {
    background-color: transparent;
    border-color: ${({ selected, theme }) => theme.colorBase.borderHover};
  }
`

export const MyRedPacketPanel = ({ setToastOpen }: { setToastOpen: (props: any) => void }) => {
  const theme = useTheme()
  const history = useHistory()
  const { t } = useTranslation()
  const { isMobile } = useSettings()
  const { etherscanBaseUrl, forexMap } = useSystem()
  let match: any = useRouteMatch('/redPacket/records/:item/:type?')

  const container = React.useRef<HTMLDivElement>(null)
  const [currentTab, setCurrentTab] = React.useState<RedPacketRecordsTabIndex>(
    match?.params.item ?? RedPacketRecordsTabIndex.Received,
  )
  const isUnClaimed =
    currentTab === RedPacketRecordsTabIndex.BlindBoxUnClaimed ||
    currentTab === RedPacketRecordsTabIndex.NFTsUnClaimed
  const pageSize = 10

  const {
    showLoading: showloadingRecord,
    getMyRedPacketRecordTxList,
    myRedPacketRecordList,
    myRedPacketRecordTotal,
    onItemClick,
  } = useMyRedPacketRecordTransaction({
    setToastOpen,
  })

  const [showActionableRecords, setShowActionableRecords] = React.useState(true)
  const onChangeShowActionableRecords = React.useCallback(() => {
    setShowActionableRecords(!showActionableRecords)
  }, [showActionableRecords])
  const {
    showLoading: showloadingReceive,
    getRedPacketReceiveList,
    redPacketReceiveList,
    redPacketReceiveTotal,
    onItemClick: onReceiveItemClick,
    onClaimItem: onReceiveClaimItem,
  } = useMyRedPacketReceiveTransaction({
    setToastOpen,
    // showActionableRecords
  })
  const {
    showLoading: showloadingReceive_BlindBox,
    getRedPacketReceiveList: getRedPacketReceiveList_BlindBox,
    redPacketReceiveList: redPacketReceiveList_BlindBox,
    redPacketReceiveTotal: redPacketReceiveTotal_BlindBox,
    onItemClick: onReceiveItemClick_BlindBox,
  } = useMyRedPacketBlindBoxReceiveTransaction({
    setToastOpen,
    // showActionableRecords
  })
  const handleTabChange = (value: RedPacketRecordsTabIndex) => {
    history.push(`/redPacket/records/${value}`)
    setCurrentTab(value)
  }

  const isRecieve = [
    RedPacketRecordsTabIndex.Received,
    RedPacketRecordsTabIndex.BlindBoxReceived,
    RedPacketRecordsTabIndex.NFTReceived,
    RedPacketRecordsTabIndex.BlindBoxUnClaimed,
    RedPacketRecordsTabIndex.NFTsUnClaimed,
  ].includes(currentTab)
  const tabType = [RedPacketRecordsTabIndex.Received, RedPacketRecordsTabIndex.Send].includes(
    currentTab,
  )
    ? 'tokens'
    : [RedPacketRecordsTabIndex.NFTReceived, RedPacketRecordsTabIndex.NFTSend].includes(currentTab)
    ? 'NFTs'
    : 'blindBox'

  const showNFT = useNotify().notifyMap?.redPacket.showNFT
  const tabsView = isUnClaimed ? (
    <Tabs
      value={currentTab}
      onChange={(_event, value) => {
        handleTabChange(value)
      }}
      aria-label='l2-history-tabs'
      variant='scrollable'
    >
      <Tab
        key={'NFTs'}
        label={t('labelRedPacketTabNFTs')}
        value={RedPacketRecordsTabIndex.NFTsUnClaimed}
      />
      <Tab
        key={'Blind Box'}
        label={t('labelRedPacketTabBlindBox')}
        value={RedPacketRecordsTabIndex.BlindBoxUnClaimed}
      />
    </Tabs>
  ) : (
    <>
      <Tabs
        value={isRecieve ? 'Received' : 'Sent'}
        onChange={(_event, value) => {
          if (tabType === 'tokens' && value === 'Received') {
            handleTabChange(RedPacketRecordsTabIndex.Received)
          } else if (tabType === 'tokens' && value === 'Sent') {
            handleTabChange(RedPacketRecordsTabIndex.Send)
          } else if (tabType === 'NFTs' && value === 'Received') {
            handleTabChange(RedPacketRecordsTabIndex.NFTReceived)
          } else if (tabType === 'NFTs' && value === 'Sent') {
            handleTabChange(RedPacketRecordsTabIndex.NFTSend)
          } else if (tabType === 'blindBox' && value === 'Received') {
            handleTabChange(RedPacketRecordsTabIndex.BlindBoxReceived)
          } else if (tabType === 'blindBox' && value === 'Sent') {
            handleTabChange(RedPacketRecordsTabIndex.BlindBoxSend)
          }
        }}
        aria-label='l2-history-tabs'
        variant='scrollable'
      >
        <Tab key={'Received'} label={t('labelRedPacketTabReceived')} value={'Received'} />
        <Tab key={'Sent'} label={t('labelRedPacketTabSent')} value={'Sent'} />
      </Tabs>
      <Box paddingX={2} marginTop={3} display={'flex'} justifyContent='space-between'>
        <Box>
          <SelectButton
            onClick={() => {
              isRecieve
                ? handleTabChange(RedPacketRecordsTabIndex.Received)
                : handleTabChange(RedPacketRecordsTabIndex.Send)
            }}
            selected={[RedPacketRecordsTabIndex.Send, RedPacketRecordsTabIndex.Received].includes(
              currentTab,
            )}
            style={{ marginRight: `${theme.unit}px` }}
            variant={'outlined'}
          >
            {t('labelRedpacketTokensShort')}
          </SelectButton>
          {showNFT && (
            <>
              <SelectButton
                onClick={() => {
                  isRecieve
                    ? handleTabChange(RedPacketRecordsTabIndex.NFTReceived)
                    : handleTabChange(RedPacketRecordsTabIndex.NFTSend)
                }}
                selected={[
                  RedPacketRecordsTabIndex.NFTReceived,
                  RedPacketRecordsTabIndex.NFTSend,
                ].includes(currentTab)}
                style={{ marginRight: `${theme.unit}px` }}
                variant={'outlined'}
              >
                {t('labelRedpacketNFTS')}
              </SelectButton>

              <SelectButton
                onClick={() => {
                  isRecieve
                    ? handleTabChange(RedPacketRecordsTabIndex.BlindBoxReceived)
                    : handleTabChange(RedPacketRecordsTabIndex.BlindBoxSend)
                }}
                selected={[
                  RedPacketRecordsTabIndex.BlindBoxReceived,
                  RedPacketRecordsTabIndex.BlindBoxSend,
                ].includes(currentTab)}
                variant={'outlined'}
              >
                {t('labelRedpacketBlindBox')}
              </SelectButton>
            </>
          )}
        </Box>
        {isRecieve && (tabType === 'NFTs' || tabType === 'blindBox') && (
          <FormControlLabel
            control={
              <Checkbox
                checked={showActionableRecords}
                onChange={() => {
                  onChangeShowActionableRecords()
                }}
              />
            }
            label={t('labelRedpacketHideInactionable')}
          />
        )}
      </Box>
    </>
  )
  const [pageReceive, setReceivePage] = React.useState(1)
  const [pageBlindBox, setBlindBoxPage] = React.useState(1)

  const onRefresh = React.useCallback(async () => {
    if (
      currentTab === RedPacketRecordsTabIndex.NFTReceived ||
      currentTab === RedPacketRecordsTabIndex.NFTSend ||
      currentTab ===
        RedPacketRecordsTabIndex.NFTsUnClaimed[
          (RedPacketRecordsTabIndex.NFTsUnClaimed,
          RedPacketRecordsTabIndex.NFTReceived,
          RedPacketRecordsTabIndex.NFTSend)
        ].includes(currentTab)
    ) {
      await getRedPacketReceiveList({
        offset: (pageReceive - 1) * (pageSize ?? 12),
        limit: pageSize ?? 12,
        filter: {
          statuses: showActionableRecords ? [0] : undefined,
          isNft: true,
        },
      })
    } else if (
      [
        RedPacketRecordsTabIndex.BlindBoxReceived,
        RedPacketRecordsTabIndex.BlindBoxUnClaimed,
      ].includes(currentTab)
    ) {
    }
    getRedPacketReceiveList_BlindBox({ pageBlindBox })
  }, [currentTab])

  const subject = React.useMemo(() => redpacketService.onRefresh(), [])
  React.useEffect(() => {
    const subscription = subject.subscribe(() => {
      onRefresh()
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [subject])

  return (
    <Box
      flex={1}
      display={'flex'}
      flexDirection={'column'}
      sx={isMobile ? { maxWidth: 'calc(100vw - 32px)' } : {}}
    >
      <Box display={'flex'} flexDirection={isMobile ? 'column' : 'row'} marginBottom={2}>
        <Button
          startIcon={<BackIcon fontSize={'small'} />}
          variant={'text'}
          size={'medium'}
          sx={{ color: 'var(--color-text-secondary)' }}
          color={'inherit'}
          onClick={() => {
            if (isUnClaimed) {
              history.push(
                `${RouterPath.l2assetsDetail}/${AssetRedPacketRecordsTabIndex.RedPacket}`,
              )
            } else {
              history.push(`${RouterPath.redPacket}/${RedPacketRouterIndex.markets}`)
            }
          }}
        >
          {isUnClaimed ? t('labelViewMore') : t('labelRedPacketRecordTitle')}
        </Button>
      </Box>

      <StylePaper overflow={'scroll'} ref={container} flex={1}>
        {tabsView}
        {[
          RedPacketRecordsTabIndex.Received,
          RedPacketRecordsTabIndex.NFTReceived,
          RedPacketRecordsTabIndex.NFTsUnClaimed,
        ].includes(currentTab) && (
          <Box
            className='tableWrapper table-divide-short'
            display={'flex'}
            flexDirection={'column'}
            flex={1}
          >
            {currentTab == RedPacketRecordsTabIndex.NFTReceived && isUnClaimed && (
              <Typography component={'h4'} paddingX={2} variant={'body1'} color={'textSecondary'}>
                {t('labelNFTRedPackAskClaim')}
              </Typography>
            )}
            <RedPacketReceiveTable
              {...{
                tokenType:
                  currentTab === RedPacketRecordsTabIndex.NFTReceived ||
                  currentTab === RedPacketRecordsTabIndex.NFTSend ||
                  currentTab === RedPacketRecordsTabIndex.NFTsUnClaimed
                    ? TokenType.nft
                    : TokenType.single,
                page: pageReceive,
                setPage: setReceivePage,
                onItemClick: onReceiveItemClick,
                onClaimItem: onReceiveClaimItem,
                showloading: showloadingReceive,
                forexMap,
                etherscanBaseUrl,
                rawData: redPacketReceiveList,
                getRedPacketReceiveList,
                pagination: {
                  pageSize: pageSize,
                  total: redPacketReceiveTotal,
                },
                showActionableRecords,
                isUncliamedNFT: currentTab === RedPacketRecordsTabIndex.NFTsUnClaimed,
              }}
            />
          </Box>
        )}
        {[
          RedPacketRecordsTabIndex.BlindBoxReceived,
          RedPacketRecordsTabIndex.BlindBoxUnClaimed,
        ].includes(currentTab) && (
          <Box
            className='tableWrapper table-divide-short'
            display={'flex'}
            flexDirection={'column'}
            flex={1}
          >
            <RedPacketBlindBoxReceiveTable
              onItemClick={onReceiveItemClick_BlindBox}
              showloading={showloadingReceive_BlindBox}
              forexMap={forexMap}
              etherscanBaseUrl={etherscanBaseUrl}
              rawData={redPacketReceiveList_BlindBox}
              getRedPacketReceiveList={getRedPacketReceiveList_BlindBox}
              pagination={{
                pageSize: pageSize,
                total: redPacketReceiveTotal_BlindBox,
              }}
              page={pageBlindBox}
              setPage={setBlindBoxPage}
              showActionableRecords={showActionableRecords}
              isUnclaimed={currentTab === RedPacketRecordsTabIndex.BlindBoxUnClaimed}
            />
          </Box>
        )}
        {[
          RedPacketRecordsTabIndex.Send,
          RedPacketRecordsTabIndex.NFTSend,
          RedPacketRecordsTabIndex.BlindBoxSend,
        ].includes(currentTab) && (
          <Box className='tableWrapper table-divide-short'>
            <RedPacketRecordTable
              {...{
                tokenType: /nft/gi.test(currentTab) ? TokenType.nft : TokenType.single,
                showloading: showloadingRecord,
                etherscanBaseUrl,
                forexMap,
                rawData: myRedPacketRecordList,
                getMyRedPacketRecordTxList,
                pagination: {
                  pageSize: pageSize,
                  total: myRedPacketRecordTotal,
                },
                onItemClick,
                tableType:
                  currentTab === RedPacketRecordsTabIndex.Send
                    ? 'token'
                    : currentTab === RedPacketRecordsTabIndex.NFTSend
                    ? 'NFT'
                    : 'blindbox',
              }}
            />
          </Box>
        )}
      </StylePaper>
    </Box>
  )
}
