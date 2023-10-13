import { NFTMintViewProps } from './Interface'
import { useTranslation } from 'react-i18next'
import React from 'react'
import { Box, Grid, Link, Typography } from '@mui/material'
import {
  EmptyValueTag,
  FeeInfo,
  getShortAddr,
  IPFS_LOOPRING_SITE,
  LinkIcon,
  MetaProperty,
  MintTradeNFT,
  NFTMETA,
  RefreshIcon,
  RowConfig,
  SoursURL,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import {
  Button,
  Column,
  EmptyDefault,
  NftImage,
  Table,
  TextareaAutosizeStyled,
} from '../../basic-lib'
import styled from '@emotion/styled'
import { useSettings } from '../../../stores'
import { FeeSelect } from '../../../components/modal'

const GridStyle = styled(Grid)`
  .coinInput-wrap {
    border: 1px solid var(--color-border);
  }

  .MuiInputLabel-root {
    font-size: ${({ theme }) => theme.fontDefault.body2};
  }
` as typeof Grid
const TableStyle = styled(Table)`
  &.rdg {
    min-height: 60px;
    height: ${(props: any) => {
      if (props.currentheight) {
        return props.currentheight + 2 + 'px'
      } else {
        return '100%'
      }
    }};
  }
`

export const MintNFTConfirm = <
  ME extends Partial<NFTMETA>,
  MI extends Partial<MintTradeNFT<any>>,
  I,
  C extends FeeInfo,
>({
  disabled,
  tradeData: nftMintData,
  metaData,
  btnInfo,
  nftMintBtnStatus,
  isFeeNotEnough,
  handleFeeChange,
  chargeFeeTokenList,
  feeInfo,
  baseURL,
  onNFTMintClick,
  mintService,
  getIPFSString,
}: NFTMintViewProps<ME, MI, I, C>) => {
  const { t, ...rest } = useTranslation(['common'])
  const { isMobile } = useSettings()
  const [showFeeModal, setShowFeeModal] = React.useState(false)
  const getDisabled = React.useMemo(() => {
    return disabled || nftMintBtnStatus === TradeBtnStatus.DISABLED
  }, [disabled, nftMintBtnStatus])
  const [error, setError] = React.useState(false)
  const [src, setSrc] = React.useState(getIPFSString(metaData?.image, baseURL))
  React.useEffect(() => {
    setError(false)
    setSrc(getIPFSString(metaData?.image ?? '', baseURL))
  }, [metaData?.image])
  const handleToggleChange = (value: C) => {
    if (handleFeeChange) {
      handleFeeChange(value)
    }
  }
  const rawData =
    metaData.properties?.reduce((prev, item) => {
      if (!!item.key?.trim() && !!item.value?.trim()) {
        return [...prev, item]
      } else {
        return prev
      }
    }, [] as Array<MetaProperty>) ?? []

  // myLog("mint nftMintData", nftMintData);

  // @ts-ignore
  return (
    <Box
      flex={1}
      flexDirection={'column'}
      display={'flex'}
      alignContent={'space-between'}
      padding={5 / 2}
    >
      <GridStyle container flex={1} spacing={2}>
        <Grid item xs={12} md={5} alignItems={'center'}>
          <Box>
            <Grid container maxWidth={'inherit'} spacing={2}>
              <Grid item xs={12}>
                <Box flex={1} display={'flex'} position={'relative'} width={'auto'} minHeight={200}>
                  <img
                    style={{
                      opacity: 0,
                      width: '100%',
                      padding: 16,
                      height: '100%',
                      display: 'block',
                    }}
                    alt={'ipfs'}
                    src={SoursURL + 'svg/ipfs.svg'}
                  />
                  <Box
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      left: 0,
                      bottom: 0,
                      height: '100%',
                      width: '100%',
                    }}
                  >
                    {metaData.image ? (
                      <Box
                        alignSelf={'stretch'}
                        flex={1}
                        display={'flex'}
                        style={{ background: 'var(--field-opacity)' }}
                        alignItems={'center'}
                        height={'100%'}
                        justifyContent={'center'}
                      >
                        {error ? (
                          <Box
                            flex={1}
                            display={'flex'}
                            alignItems={'center'}
                            justifyContent={'center'}
                            sx={{ cursor: 'pointer' }}
                            onClick={async (event) => {
                              event.stopPropagation()
                              setError(false)
                              setSrc(getIPFSString(metaData?.image, baseURL))
                            }}
                          >
                            <RefreshIcon style={{ height: 36, width: 36 }} />
                          </Box>
                        ) : (
                          <NftImage alt={src} src={src} onError={() => setError(true)} />
                        )}
                      </Box>
                    ) : (
                      <Box
                        flex={1}
                        display={'flex'}
                        alignItems={'center'}
                        height={'100%'}
                        justifyContent={'center'}
                      >
                        <EmptyDefault
                          // width={"100%"}
                          height={'100%'}
                          message={() => (
                            <Box
                              flex={1}
                              display={'flex'}
                              alignItems={'center'}
                              justifyContent={'center'}
                            >
                              {t('labelNoContent')}
                            </Box>
                          )}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} alignSelf={'stretch'}>
                {!chargeFeeTokenList?.length ? (
                  <Typography>{t('labelFeeCalculating')}</Typography>
                ) : (
                  <>
                    <FeeSelect
                      chargeFeeTokenList={chargeFeeTokenList}
                      handleToggleChange={(fee: FeeInfo) => {
                        handleToggleChange(fee as C)
                        setShowFeeModal(false)
                      }}
                      feeInfo={feeInfo as FeeInfo}
                      open={showFeeModal}
                      onClose={() => {
                        setShowFeeModal(false)
                      }}
                      isFeeNotEnough={isFeeNotEnough.isFeeNotEnough}
                      feeLoading={isFeeNotEnough.isOnLoading}
                      onClickFee={() => setShowFeeModal((prev) => !prev)}
                    />
                  </>
                )}
              </Grid>
            </Grid>
          </Box>
        </Grid>
        <Grid item xs={12} md={7}>
          <Typography component={'h4'} variant={'h5'} marginBottom={2}>
            {t('labelConfirmMint')}
          </Typography>
          <Box>
            <Grid container maxWidth={'inherit'} spacing={2}>
              <Grid item xs={12} alignSelf={'stretch'}>
                <Typography
                  component={'span'}
                  display={'inline-flex'}
                  flexDirection={isMobile ? 'column' : 'row'}
                  variant={'body1'}
                >
                  <Typography color={'textSecondary'} component={'span'} marginRight={1}>
                    {t('labelNFTName')}
                  </Typography>
                  <Typography
                    component={'span'}
                    color={'var(--color-text-third)'}
                    whiteSpace={'break-spaces'}
                    style={{ wordBreak: 'break-all' }}
                    title={metaData.name}
                  >
                    {metaData.name ?? EmptyValueTag}
                  </Typography>
                </Typography>
              </Grid>
              <Grid item xs={12} alignSelf={'stretch'}>
                <Typography
                  component={'span'}
                  display={'inline-flex'}
                  flexDirection={isMobile ? 'column' : 'row'}
                  variant={'body1'}
                >
                  <Typography component={'span'} color={'textSecondary'} marginRight={1}>
                    {t('labelNFTID')}
                  </Typography>
                  <Link
                    whiteSpace={'break-spaces'}
                    style={{
                      wordBreak: 'break-all',
                      color: 'var(--color-text-third)',
                    }}
                    display={'inline-flex'}
                    title={nftMintData.nftId}
                    href={`${IPFS_LOOPRING_SITE}${nftMintData.cid}`}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    #
                    {' ' +
                      getShortAddr(
                        nftMintData?.nftIdView ? nftMintData.nftIdView : nftMintData.nftId ?? '',
                      )}{' '}
                    <LinkIcon color={'inherit'} fontSize={'medium'} />
                  </Link>
                </Typography>
              </Grid>
              <Grid item xs={12} alignSelf={'stretch'}>
                <Typography
                  component={'span'}
                  display={'inline-flex'}
                  flexDirection={isMobile ? 'column' : 'row'}
                  variant={'body1'}
                >
                  <Typography component={'span'} color={'textSecondary'} marginRight={1}>
                    {t('labelNFTContractAddress')}
                  </Typography>
                  <Typography
                    component={'span'}
                    color={'var(--color-text-third)'}
                    whiteSpace={'break-spaces'}
                    style={{ wordBreak: 'break-all' }}
                  >
                    {nftMintData.tokenAddress}
                  </Typography>
                </Typography>
              </Grid>
              <Grid item xs={12} alignSelf={'stretch'}>
                <Typography
                  display={'inline-flex'}
                  flexDirection={isMobile ? 'column' : 'row'}
                  variant={'body1'}
                >
                  <Typography component={'span'} color={'textSecondary'} marginRight={1}>
                    {t('labelNFTType')}
                  </Typography>
                  <Typography
                    component={'span'}
                    color={'var(--color-text-third)'}
                    whiteSpace={'break-spaces'}
                    style={{ wordBreak: 'break-all' }}
                    title={'ERC1155'}
                  >
                    {'ERC1155'}
                  </Typography>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography
                  display={'inline-flex'}
                  flexDirection={isMobile ? 'column' : 'row'}
                  variant={'body1'}
                >
                  <Typography component={'span'} color={'textSecondary'} marginRight={1}>
                    {t('labelNFTAmount')}
                  </Typography>
                  <Typography
                    component={'span'}
                    color={'var(--color-text-third)'}
                    whiteSpace={'break-spaces'}
                    style={{ wordBreak: 'break-all' }}
                    title={'ERC1155'}
                  >
                    {nftMintData.tradeValue}
                  </Typography>
                </Typography>
              </Grid>
              <Grid item xs={12} alignSelf={'stretch'}>
                <Typography color={'textSecondary'} marginRight={1}>
                  {t('labelNFTDescription')}
                </Typography>
                <Box flex={1}>
                  {metaData.description ? (
                    <TextareaAutosizeStyled
                      aria-label='NFT Description'
                      minRows={2}
                      maxRows={5}
                      disabled={true}
                      value={metaData.description}
                    />
                  ) : (
                    <Typography
                      color={'var(--color-text-third)'}
                      whiteSpace={'break-spaces'}
                      style={{ wordBreak: 'break-all' }}
                      title={'ERC1155'}
                      component={'span'}
                    >
                      {EmptyValueTag}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} alignSelf={'stretch'}>
                <Typography variant={'body1'} color={'textSecondary'}>
                  {t('labelNFTProperty')}
                </Typography>
                {rawData.length ? (
                  <Box marginTop={1} sx={{ backgroundColor: 'var(--color-global-bg)' }}>
                    <TableStyle
                      className={'properties_table'}
                      rawData={rawData}
                      {...{
                        ...rest,
                        tReady: true,
                        t,
                        currentheight: (rawData.length + 1) * RowConfig.rowHeight,
                        columnMode: [
                          {
                            key: 'key',
                            name: t('labelMintPropertyKey'),
                            // formatter: ({ row }: any) => <>{row?.key}</>,
                          },
                          {
                            key: 'value',
                            name: t('labelMintPropertyValue'),
                            // formatter: ({ row }: any) => <>{row?.value}</>,
                          },
                        ],
                        generateRows: (rawData: any) => rawData,
                        generateColumns: ({ columnsRaw }: any) =>
                          columnsRaw as Column<any, unknown>[],
                      }}
                    />
                  </Box>
                ) : (
                  <Typography
                    color={'var(--color-text-third)'}
                    whiteSpace={'break-spaces'}
                    style={{ wordBreak: 'break-all' }}
                    title={'ERC1155'}
                    component={'span'}
                  >
                    {EmptyValueTag}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={4} alignSelf={'stretch'}>
                <Button
                  fullWidth
                  variant={'outlined'}
                  size={'medium'}
                  sx={{ height: 40 }}
                  color={'primary'}
                  onClick={() => {
                    mintService.backMetaDataSetup()
                  }}
                >
                  {t('labelMintPreview')}
                </Button>
              </Grid>
              <Grid item xs={8} alignSelf={'stretch'}>
                <Button
                  fullWidth
                  variant={'contained'}
                  size={'medium'}
                  color={'primary'}
                  onClick={() => {
                    onNFTMintClick()
                  }}
                  loading={
                    !getDisabled && nftMintBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'
                  }
                  disabled={getDisabled || nftMintBtnStatus === TradeBtnStatus.LOADING}
                >
                  {btnInfo ? t(btnInfo.label, btnInfo.params) : t(`labelNFTMintBtn`)}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </GridStyle>
    </Box>
  )
}
