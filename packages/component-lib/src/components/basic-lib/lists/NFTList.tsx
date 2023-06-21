import {
  Box,
  Checkbox,
  Grid,
  MenuItem,
  Pagination,
  Popover,
  Radio,
  Typography,
} from '@mui/material'
import {
  Account,
  CollectionMeta,
  EmptyValueTag,
  GET_IPFS_STRING,
  getShortAddr,
  NFTLimit,
  NFTWholeINFO,
  sizeNFTConfig,
  SoursURL,
  ViewMoreIcon,
} from '@loopring-web/common-resources'
import { AccountStep, CardStyleItem, EmptyDefault, NFTMedia } from '../../index'
import { useTranslation, WithTranslation, withTranslation } from 'react-i18next'
import { sanitize } from 'dompurify'
import { IconButtonStyle } from '../../../'
import { ToggleState, useSettings } from '../../../stores'
import { XOR } from '../../../types/lib'
import React from 'react'
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'
import styled from '@emotion/styled'
import { DEPLOYMENT_STATUS } from '@loopring-web/loopring-sdk'

const BoxBtnGroup = styled(Box)`
  position: absolute;
  right: ${({ theme }) => 2 * theme.unit}px;
  top: ${({ theme }) => 2 * theme.unit}px;
  z-index: 99;
  //flex-direction: row-reverse;
  &.mobile {
  }
` as typeof Box

export type NFTItemBasicProps = {
  toggle?: ToggleState
  setNFTMetaNotReady: (props: any) => void
  setShowNFTDeploy: (props: any) => void
  setShowNFTDetail: (props: any) => void
  setShowNFTTransfer: (props: any) => void
  setShowNFTWithdraw: (props: any) => void
  setShowTradeIsFrozen: (props: any) => void
  setShowRedPacket: (props: any) => void
  setShowAccount: (props: any) => void
}

const ActionMemo = React.memo(
  <NFT extends NFTWholeINFO>({
    account,
    toggle,
    setShowNFTDeploy,
    // setShowNFTDetail,
    setShowNFTTransfer,
    setShowNFTWithdraw,
    setShowAccount,
    setShowTradeIsFrozen,
    setNFTMetaNotReady,
    setShowRedPacket,
    item,
  }: NFTItemBasicProps & { item: NFT; account?: Account }) => {
    const { t } = useTranslation('common')

    const popupState = usePopupState({
      variant: 'popover',
      popupId: 'collection-action',
    })
    const bindContent = bindMenu(popupState)
    const bindAction = bindTrigger(popupState)
    const [isKnowNFTNoMeta, setIsKnowNFTNoMeta] = React.useState<boolean>(
      !!(item?.name !== '' && item.image && item.image !== ''),
    )
    React.useEffect(() => {
      setIsKnowNFTNoMeta((_state) => {
        return !!(item.name !== '' && item.image && item.image !== '')
      })
    }, [item.name, item.image])

    return (
      <Grid item marginTop={1}>
        <IconButtonStyle size={'large'} edge={'end'} {...{ ...bindAction }}>
          <ViewMoreIcon />
        </IconButtonStyle>
        <Popover
          {...bindContent}
          anchorReference='anchorEl'
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Box borderRadius={'inherit'} minWidth={110}>
            {!!(
              item.isCounterFactualNFT &&
              item.deploymentStatus === DEPLOYMENT_STATUS.NOT_DEPLOYED &&
              item.minter?.toLowerCase() === account?.accAddress.toLowerCase()
            ) && (
              <MenuItem
                onClick={() =>
                  toggle?.deployNFT?.enable
                    ? setShowNFTDeploy({
                        ...item,
                      })
                    : setShowTradeIsFrozen({
                        isShow: true,
                        type: t('nftDeployDescription'),
                      })
                }
              >
                {t('labelNFTDeployContract')}
              </MenuItem>
            )}
            <MenuItem
              onClick={() => {
                setShowNFTTransfer({ ...item })
                setShowNFTWithdraw({ ...item })
                isKnowNFTNoMeta
                  ? setShowAccount({
                      isShow: true,
                      step: AccountStep.SendNFTGateway,
                      info: { ...item },
                    })
                  : setNFTMetaNotReady({
                      isShow: false,
                      info: { method: 'Send' },
                    })
              }}
            >
              {t('labelNFTSendBtn')}
            </MenuItem>
            <MenuItem
              onClick={() => {
                isKnowNFTNoMeta
                  ? setShowRedPacket({ ...item })
                  : setNFTMetaNotReady({
                      isShow: false,
                      info: { method: 'Send' },
                    })
              }}
            >
              {t('labelNFTRedpacketBtn')}
            </MenuItem>
          </Box>
        </Popover>
      </Grid>
    )
  },
)

export const NFTList = withTranslation('common')(
  <NFT extends NFTWholeINFO, Co = CollectionMeta>({
    baseURL,
    nftList,
    getIPFSString,
    size = 'large',
    total,
    page,
    isLoading,
    onClick,
    selected = undefined,
    isSelectOnly = false,
    isMultipleSelect = false,
    onPageChange,
    setNFTMetaNotReady,
    isEdit,
    t,
    ...props
  }: {
    getIPFSString: GET_IPFS_STRING
    baseURL: string
    isManage?: boolean
    nftList: Partial<NFT>[]
    etherscanBaseUrl?: string
    size?: 'large' | 'medium' | 'small'
    onClick?: (item: Partial<NFT>) => Promise<void>
    onNFTReload?: (item: Partial<NFT>, index: number) => Promise<void>
    total: number
    page: number
    isLoading: boolean
    selected?: Partial<NFT>[]
    onPageChange?: (page: number) => void
    setNFTMetaNotReady: (props: any) => void
    account?: Account
    toggle?: any
    collectionMeta?: Co
    // onSelected: (item: Partial<NFT>) => void;
  } & ((NFTItemBasicProps & { isEdit: true }) | { isEdit?: false }) &
    XOR<
      { isSelectOnly: true; isMultipleSelect: true; selected: Partial<NFT>[] },
      | { isSelectOnly: true; isMultipleSelect?: false; selected: NFT }
      | {
          isSelectOnly?: false
          isMultipleSelect?: false
        }
    > &
    WithTranslation) => {
    const sizeConfig = sizeNFTConfig(size)
    const { isMobile } = useSettings()
    return (
      <Box
        flex={1}
        // className={"MuiPaper-elevation2"}
        marginTop={2}
        marginBottom={2}
        className={'nft-list-wrap'}
        paddingX={isMobile ? 0 : 2}
        display={'flex'}
        flexDirection={'column'}
      >
        {isLoading ? (
          <Box
            flex={1}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            height={'90%'}
          >
            <img
              className='loading-gif'
              alt={'loading'}
              width='36'
              src={`${SoursURL}images/loading-line.gif`}
            />
          </Box>
        ) : nftList && nftList.length ? (
          <>
            <Grid container spacing={2}>
              {nftList.map((item, index) => (
                <Grid
                  xs={sizeConfig.wrap_xs}
                  md={sizeConfig.wrap_md}
                  lg={sizeConfig.wrap_lg}
                  key={(item?.nftId ?? '') + index.toString()}
                  item
                  flex={'1 1 120%'}
                >
                  <CardStyleItem
                    size={size}
                    contentheight={sizeConfig.contentHeight}
                    className={'nft-item'}
                    style={{
                      backgroundColor: 'var(--color-box-secondary)',
                      border: 'none'
                    }}
                  >
                    {isEdit && (
                      <BoxBtnGroup className={'btn-group'}>
                        <ActionMemo
                          {...{ ...(props as any) }}
                          item={item as any}
                          setNFTMetaNotReady={setNFTMetaNotReady}
                        />
                      </BoxBtnGroup>
                    )}
                    <Box
                      position={'absolute'}
                      width={'100%'}
                      height={'100%'}
                      display={'flex'}
                      flexDirection={'column'}
                      justifyContent={'space-between'}
                      onClick={(e) => {
                        e.isPropagationStopped()
                        onClick && onClick(item)
                      }}
                    >
                      <NFTMedia
                        item={item}
                        index={index}
                        shouldPlay={false}
                        onNFTError={() => undefined}
                        isOrigin={false}
                        getIPFSString={getIPFSString}
                        baseURL={baseURL}
                      />

                      {isSelectOnly &&
                        (isMultipleSelect ? (
                          <Checkbox
                            size={'medium'}
                            checked={
                              !!selected?.find((_item) => {
                                return item.nftData === _item.nftData
                              })
                            }
                            // color={"default"}
                            value={item.nftData}
                            name='radio-nft'
                            inputProps={{ 'aria-label': 'selectNFT' }}
                          />
                        ) : (
                          <Radio
                            size={'medium'}
                            // @ts-ignore
                            checked={selected?.nftData === item.nftData}
                            value={item.nftData}
                            name='radio-nft'
                            inputProps={{ 'aria-label': 'selectNFT' }}
                          />
                        ))}
                      <Box
                        padding={2}
                        className={'boxLabel'}
                        height={sizeConfig.contentHeight}
                        display={'flex'}
                        flexDirection={'row'}
                        alignItems={'center'}
                        justifyContent={'space-between'}
                      >
                        <Box display={'flex'} flexDirection={'column'} width={'60%'}>
                          <Typography
                            color={'text.primary'}
                            component={'h6'}
                            whiteSpace={'pre'}
                            overflow={'hidden'}
                            textOverflow={'ellipsis'}
                            dangerouslySetInnerHTML={{
                              __html: sanitize(item?.name ?? EmptyValueTag) ?? '',
                            }}
                          />
                          <Typography
                            color={'textSecondary'}
                            component={'p'}
                            paddingTop={1}
                            variant={size == 'small' ? 'body2' : 'body1'}
                            minWidth={164}
                            textOverflow={'ellipsis'}
                            title={item?.nftId?.toString()}
                          >
                            {t('labelNFTTokenID')} #{' ' + getShortAddr(item?.nftId ?? '')}
                          </Typography>
                        </Box>

                        <Box display={'flex'} flexDirection={'column'} alignItems={'flex-end'}>
                          <Typography
                            color={'textSecondary'}
                            component={'span'}
                            whiteSpace={'pre'}
                            overflow={'hidden'}
                            textOverflow={'ellipsis'}
                          >
                            {t(
                              size == 'small' ? 'labelNFTAmountSimpleValue' : 'labelNFTAmountValue',
                              { value: item.total },
                            )}
                          </Typography>
                          <Typography
                            color={'--color-text-primary'}
                            component={'p'}
                            paddingTop={1}
                            whiteSpace={'pre-line'}
                            minWidth={1}
                            textOverflow={'ellipsis'}
                            title={item?.nftId?.toString()}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </CardStyleItem>
                </Grid>
              ))}
            </Grid>
            {total > NFTLimit && onPageChange && (
              <Box
                display={'flex'}
                alignItems={'center'}
                justifyContent={'right'}
                marginRight={3}
                marginTop={1}
                marginBottom={2}
              >
                <Pagination
                  color={'primary'}
                  count={parseInt(String(total / NFTLimit)) + (total % NFTLimit > 0 ? 1 : 0)}
                  page={page}
                  onChange={(_event, value) => {
                    onPageChange(Number(value))
                  }}
                />
              </Box>
            )}
          </>
        ) : (
          <Box flex={1} alignItems={'center'}>
            <EmptyDefault
              message={() => (
                <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                  No NFT
                </Box>
              )}
            />
          </Box>
        )}
      </Box>
    )
  },
)
