import {
  CardStyleItem,
  CollectionItemProps,
  CollectionListProps,
  CollectionMedia,
  EmptyDefault,
  IconButtonStyle,
} from '../../../index'
import {
  Avatar,
  Box,
  Grid,
  Link,
  MenuItem,
  Pagination,
  Popover,
  Radio,
  Typography,
} from '@mui/material'
import {
  CollectionLimit,
  CollectionMeta,
  CopyIcon,
  copyToClipBoard,
  getShortAddr,
  ImageIcon,
  NFT_TYPE_STRING,
  NFTLimit,
  sizeNFTConfig,
  SoursURL,
  ViewMoreIcon,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from '@emotion/styled'
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'
import { sanitize } from 'dompurify'

const BoxStyle = styled(Box)`
  .MuiRadio-root {
    position: absolute;
    right: ${({ theme }) => theme.unit}px;
    top: ${({ theme }) => theme.unit}px;
    transform: scale(1.5);
  }

  .btn-group {
    width: auto;
  }

  .collection:hover {
    .btn-group {
      display: flex;
      width: initial;
    }
  }
` as typeof Box
const BoxLabel = styled(Box)`
  background: var(--color-box-third);
  color: var(--color-text-button);
  border-radius: ${({ theme }) => theme.unit}px;
` as typeof Box
const BoxBtnGroup = styled(Box)`
  position: absolute;
  right: ${({ theme }) => 2 * theme.unit}px;
  top: ${({ theme }) => 2 * theme.unit}px;
  width: 100%;
  //flex-direction: row-reverse;
  &.mobile {
  }
` as typeof Box

const ActionMemo = React.memo(
  <Co extends CollectionMeta>({
    setShowDeploy,
    setShowEdit,
    setShowManageLegacy,
    item,
    account,
    setShowMintNFT,
  }: CollectionItemProps<Co>) => {
    const { t } = useTranslation('common')

    const popupState = usePopupState({
      variant: 'popover',
      popupId: 'collection-action',
    })
    const bindContent = bindMenu(popupState)
    const bindAction = bindTrigger(popupState)

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
              item.extra?.properties?.isCounterFactualNFT &&
              item.extra?.properties?.isEditable &&
              item.owner?.toLowerCase() === account?.accAddress?.toLowerCase() &&
              item?.nftType !== NFT_TYPE_STRING.ERC721
            ) && (
              <MenuItem
                onClick={() => {
                  if (setShowEdit) {
                    setShowEdit(item)
                    popupState.close()
                  }
                }}
              >
                {t('labelCollectionEditBtn')}
              </MenuItem>
            )}
            {!!(
              item.extra?.properties?.isCounterFactualNFT &&
              item.extra?.properties?.isEditable &&
              item.extra?.properties?.isLegacy &&
              item.owner?.toLowerCase() === account?.accAddress?.toLowerCase() &&
              item?.nftType !== NFT_TYPE_STRING.ERC721
            ) && (
              <MenuItem
                onClick={() => {
                  if (setShowManageLegacy) {
                    setShowManageLegacy(item)
                    popupState.close()
                  }
                }}
              >
                {t('labelCollectionImportNFTBtn')}
              </MenuItem>
            )}
            {item.extra?.properties?.isCounterFactualNFT &&
            item.baseUri !== '' &&
            item.deployStatus === sdk.DEPLOYMENT_STATUS.NOT_DEPLOYED &&
            item.owner?.toLowerCase() === account?.accAddress?.toLowerCase() ? (
              <MenuItem
                onClick={(_e) => {
                  setShowDeploy && setShowDeploy(item)
                  popupState.close()
                }}
              >
                {t('labelNFTDeployContract')}
              </MenuItem>
            ) : (
              <></>
              //   <MenuItem
              //   onClick={(e) => {
              //   e.stopPropagation();
              //   window.open(
              //   `${etherscanBaseUrl}address/${item?.contractAddress}`
              //   );
              //   window.opener = null;
              // }}
              //   >
              // {t("labelViewEtherscan")}
              //   <LinkIcon
              //   color={"inherit"}
              //   fontSize={"small"}
              //   style={{
              //   verticalAlign: "middle",
              //   marginLeft: 2,
              // }}
              //   />
              //   </MenuItem>
            )}
            {!!(
              item.extra?.properties?.isCounterFactualNFT &&
              item.extra?.properties?.isMintable &&
              item.owner?.toLowerCase() === account?.accAddress?.toLowerCase() &&
              item?.nftType !== NFT_TYPE_STRING.ERC721
            ) && (
              <MenuItem
                onClick={() => {
                  if (setShowMintNFT) {
                    setShowMintNFT(item)
                    popupState.close()
                  }
                }}
              >
                {t('labelNFTMintSimpleBtn')}
              </MenuItem>
            )}
          </Box>
        </Popover>
      </Grid>
    )
  },
)

export const CollectionItem = React.memo(
  React.forwardRef(
    <Co extends CollectionMeta>(props: CollectionItemProps<Co>, _ref: React.Ref<any>) => {
      const {
        item,
        index,
        setCopyToastOpen,
        noEdit,
        isSelectOnly = false,
        selectCollection,
        onItemClick,
        getIPFSString,
        baseURL,
        size,
      } = props
      const { t } = useTranslation('common')
      const sizeConfig = sizeNFTConfig(size ?? 'large')

      return (
        <CardStyleItem
          ref={_ref}
          className={'collection'}
          size={size as any}
          contentheight={sizeConfig.contentHeight}
        >
          <Box
            position={'absolute'}
            width={'100%'}
            height={'100%'}
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'space-between'}
          >
            <CollectionMedia
              item={item}
              index={index}
              getIPFSString={getIPFSString}
              baseURL={baseURL}
              // onNFTReload={onNFTReload}
              onRenderError={() => undefined}
              onClick={(e) => {
                e.stopPropagation()
                if (onItemClick) {
                  onItemClick(item)
                }
              }}
            />
            {isSelectOnly && (
              <Radio
                size={'medium'}
                checked={
                  selectCollection?.contractAddress?.toLowerCase() ===
                    item?.contractAddress?.toLowerCase() && selectCollection?.id === item.id
                }
                value={item.contractAddress}
                name='radio-collection'
                inputProps={{ 'aria-label': 'selectCollection' }}
              />
            )}
            {!isSelectOnly && !noEdit && (
              <BoxBtnGroup className={'btn-group'}>
                <ActionMemo {...{ ...(props as any) }} />
              </BoxBtnGroup>
            )}
            <BoxLabel
              className={'boxLabel'}
              display={'flex'}
              height={sizeConfig.contentHeight}
              flexDirection={'row'}
              justifyContent={'space-between'}
              alignItems={'center'}
              position={'absolute'}
              bottom={0}
              left={0}
              right={0}
            >
              {(item?.cached?.avatar ?? getIPFSString(item?.avatar ?? '', baseURL)).startsWith(
                'http',
              ) ? (
                <Avatar
                  sx={{
                    bgcolor: 'var(--color-border-disable2)',
                    width: sizeConfig.avatar,
                    height: sizeConfig.avatar,
                    ...(size === 'small' ? { display: 'none' } : {}),
                  }}
                  variant={'circular'}
                  src={item?.cached?.avatar ?? getIPFSString(item?.avatar ?? '', baseURL)}
                />
              ) : (
                <Avatar
                  sx={{
                    bgcolor: 'var(--color-border-disable2)',
                    width: sizeConfig.avatar,
                    height: sizeConfig.avatar,
                    ...(size === 'small' ? { display: 'none' } : {}),
                  }}
                  variant={'circular'}
                >
                  <ImageIcon />
                </Avatar>
              )}

              <Typography
                className={'content'}
                component={'span'}
                marginLeft={size === 'small' ? 0 : 1}
                color={'var(--color-text-button)'}
                whiteSpace={'pre'}
                overflow={'hidden'}
                display={'flex'}
                flexDirection={'column'}
                textOverflow={'ellipsis'}
                variant={'h5'}
                alignItems={'flex-start'}
                justifyContent={'space-evenly'}
                alignSelf={'stretch'}
              >
                <Typography
                  color={'textPrimary'}
                  overflow={'hidden'}
                  textOverflow={'ellipsis'}
                  variant={size == 'small' ? 'body2' : 'body1'}
                  component={'span'}
                  paddingRight={size === 'small' ? 1 / 2 : 1}
                  width={'100%'}
                  dangerouslySetInnerHTML={{
                    __html:
                      sanitize(
                        item?.name
                          ? item.name
                          : t('labelUnknown') +
                              '-' +
                              getShortAddr(item?.contractAddress ?? '', true),
                      ) ?? '',
                  }}
                />
                <Link
                  variant={'body2'}
                  display={'inline-flex'}
                  style={{ color: 'var(--color-text-primary)' }}
                  alignItems={'center'}
                  paddingTop={1}
                  onClick={(e) => {
                    e.stopPropagation()
                    copyToClipBoard(item?.contractAddress ?? '')
                    setCopyToastOpen({ isShow: true, type: 'address' })
                  }}
                >
                  {getShortAddr(item?.contractAddress ?? '')}
                  <CopyIcon color={'inherit'} />
                </Link>
              </Typography>
              <Typography
                component={'span'}
                whiteSpace={'pre'}
                overflow={'hidden'}
                display={'flex'}
                paddingLeft={1}
                flexDirection={'column'}
                alignItems={'center'}
                textOverflow={'ellipsis'}
                justifyContent={'space-evenly'}
              >
                {item?.extends?.count && (
                  <Typography
                    color={'textPrimary'}
                    component={'span'}
                    whiteSpace={'pre'}
                    overflow={'hidden'}
                    textOverflow={'ellipsis'}
                    width={'fit-content'}
                    minWidth={'36px'}
                  >
                    {t(
                      size == 'small'
                        ? 'labelCollectionItemSimpleValue'
                        : 'labelCollectionItemValue',
                      {
                        value:
                          item?.extends?.count?.toString()?.length > 2
                            ? '99+'
                            : item?.extends?.count,
                      },
                    )}
                  </Typography>
                )}
                <Typography
                  component={'span'}
                  color={'textPrimary'}
                  title={item?.nftType}
                  sx={size === 'small' ? { display: 'none' } : {}}
                >
                  {item?.nftType}
                </Typography>
              </Typography>
            </BoxLabel>
          </Box>
        </CardStyleItem>
      )
    },
  ),
)

export const CollectionCardList = <Co extends CollectionMeta>({
  collectionList,
  page,
  total,
  onPageChange,
  setCopyToastOpen,
  setShowDeploy,
  setShowManageLegacy,
  setShowEdit,
  setShowMintNFT,
  setShowTradeIsFrozen,
  toggle,
  account,
  onSelectItem,
  onItemClick,
  isSelectOnly = false,
  selectCollection,
  etherscanBaseUrl,
  isLoading,
  noEdit = false,
  filter,
  size = 'large',
  ...rest
}: CollectionListProps<Co> &
  Partial<CollectionItemProps<Co>> & { onSelectItem?: (item: Co) => void }) => {
  const { t } = useTranslation('common')
  const sizeConfig = sizeNFTConfig(size)

  return (
    <BoxStyle
      flex={1}
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'stretch'}
      marginTop={2}
      width={'100%'}
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
      ) : !collectionList?.length ? (
        <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'center'}>
          <EmptyDefault
            style={{ flex: 1 }}
            height={'100%'}
            message={() => (
              <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                {t('labelNoContent')}
              </Box>
            )}
          />
        </Box>
      ) : (
        <>
          <Grid container spacing={2} paddingBottom={3}>
            {collectionList.map((item, index) => {
              return (
                <Grid
                  xs={sizeConfig.wrap_xs}
                  md={sizeConfig.wrap_md}
                  lg={sizeConfig.wrap_lg}
                  key={index.toString() + (item?.name ?? '')}
                  item
                  flex={'1 1 120%'}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onSelectItem) {
                      onSelectItem(item)
                    }
                  }}
                >
                  <CollectionItem
                    {...{ ...rest }}
                    size={size}
                    onItemClick={onItemClick as any}
                    etherscanBaseUrl={etherscanBaseUrl}
                    selectCollection={selectCollection}
                    isSelectOnly={isSelectOnly}
                    noEdit={noEdit}
                    setShowTradeIsFrozen={setShowTradeIsFrozen as any}
                    account={account}
                    toggle={toggle}
                    setShowDeploy={setShowDeploy as any}
                    setShowEdit={setShowEdit as any}
                    setShowManageLegacy={setShowManageLegacy as any}
                    setShowMintNFT={setShowMintNFT as any}
                    setCopyToastOpen={setCopyToastOpen as any}
                    item={item as any}
                    index={index}
                  />
                </Grid>
              )
            })}
          </Grid>
          {total > CollectionLimit && (
            <Box
              display={'flex'}
              alignItems={'center'}
              justifyContent={'right'}
              marginRight={3}
              marginBottom={2}
            >
              <Pagination
                color={'primary'}
                count={parseInt(String(total / NFTLimit)) + (total % NFTLimit > 0 ? 1 : 0)}
                page={page}
                onChange={(_event, value) => {
                  onPageChange(Number(value), filter ? { ...filter } : undefined)
                }}
              />
            </Box>
          )}
        </>
      )}
    </BoxStyle>
  )
}
