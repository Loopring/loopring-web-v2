import {
  CloseIcon,
  LoadingIcon,
  myLog,
  SoursURL,
  TradeBtnStatus,
  TradeNFT,
} from '@loopring-web/common-resources'
import { useTranslation } from 'react-i18next'
import React from 'react'
import { Box, Grid, Typography } from '@mui/material'
import { EmptyDefault, IconClearStyled, InputSize, TGItemData, ToggleButtonGroup } from '../../'
import { Button, TextField, useSettings } from '../../../index'
import { NFTDepositViewProps } from './Interface'
import { NFTInput } from './BasicANFTTrade'
import { NFTType } from '@loopring-web/loopring-sdk'
import styled from '@emotion/styled'

const GridStyle = styled(Grid)`
  .coinInput-wrap {
    .input-wrap {
      //background: var(--field-opacity);
      border-radius: ${({ theme }) => theme.unit / 2}px;
      border: 1px solid var(--color-border);
    }
  }

  .MuiInputLabel-root {
    font-size: ${({ theme }) => theme.fontDefault.body2};
  }
` as typeof Grid
const NFT_TYPE: TGItemData[] = [
  {
    value: NFTType.ERC1155,
    key: 'ERC1155',
    label: 'ERC1155',
    disabled: false,
  },
  {
    value: NFTType.ERC721,
    key: 'ERC721',
    label: 'ERC721', // after 18n
    disabled: false,
  },
]

export const DepositNFTWrap = <T extends TradeNFT<I, any>, I>({
  disabled,
  walletMap,
  tradeData,
  getIPFSString,
  btnInfo,
  baseURL = `https://${process.env.REACT_APP_API_URL}`,
  handleOnNFTDataChange,
  nftDepositBtnStatus,
  isNFTCheckLoading,
  onNFTDepositClick,
}: // wait = globalSetup.wait,
NFTDepositViewProps<T, I>) => {
  const { t } = useTranslation(['common'])

  const inputBtnRef = React.useRef()

  const getDisabled = React.useMemo(() => {
    return disabled || nftDepositBtnStatus === TradeBtnStatus.DISABLED
  }, [nftDepositBtnStatus, disabled])

  React.useMemo(() => {
    return disabled || nftDepositBtnStatus === TradeBtnStatus.DISABLED
  }, [nftDepositBtnStatus, disabled])

  myLog(getDisabled, 'getDisabled')
  const { isMobile } = useSettings()
  // const styles = isMobile
  //   ? { flex: 1, width: "var(--swap-box-width)" }
  //   : { width: "var(--modal-width)" };

  // @ts-ignore
  return (
    <Box
      flex={1}
      flexDirection={'column'}
      display={'flex'}
      paddingX={5 / 2}
      alignContent={'space-between'}
    >
      <GridStyle
        className={walletMap ? '' : 'loading'}
        container
        flex={1}
        marginTop={0}
        spacing={2}
      >
        <Grid item xs={12} md={5} alignItems={'center'} order={isMobile ? 1 : 0}>
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
              {tradeData.image ? (
                <Box
                  flex={1}
                  display={'flex'}
                  alignItems={'center'}
                  height={'100%'}
                  justifyContent={'center'}
                >
                  <img alt={'NFT'} width={'100%'} src={getIPFSString(tradeData?.image, baseURL)} />
                </Box>
              ) : isNFTCheckLoading ? (
                <Box
                  flex={1}
                  display={'flex'}
                  alignItems={'center'}
                  height={'100%'}
                  justifyContent={'center'}
                >
                  <LoadingIcon fontSize={'large'} />
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
        <Grid item xs={12} md={7} paddingBottom={2} order={isMobile ? 0 : 1}>
          <Box>
            <Grid container maxWidth={'inherit'}>
              <Grid item xs={12} marginTop={2} alignSelf={'stretch'}>
                <Box
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                  position={'relative'}
                >
                  <TextField
                    value={tradeData?.tokenAddress}
                    label={t('labelNFTContractAddress')}
                    placeholder={t('depositNFTAddressLabelPlaceholder')}
                    onChange={(event) =>
                      handleOnNFTDataChange({
                        tokenAddress: event.target?.value,
                      } as T)
                    }
                    fullWidth={true}
                  />
                  {tradeData.tokenAddress && tradeData.tokenAddress !== '' ? (
                    isNFTCheckLoading ? (
                      <LoadingIcon
                        width={24}
                        style={{
                          top: '32px',
                          right: '8px',
                          position: 'absolute',
                        }}
                      />
                    ) : (
                      <IconClearStyled
                        color={'inherit'}
                        size={'small'}
                        style={{ top: '30px' }}
                        aria-label='Clear'
                        onClick={() => handleOnNFTDataChange({ tokenAddress: '' } as T)}
                      >
                        <CloseIcon />
                      </IconClearStyled>
                    )
                  ) : (
                    ''
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} marginTop={2} alignSelf={'stretch'}>
                <Box
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                  position={'relative'}
                >
                  <TextField
                    value={tradeData.nftIdView}
                    label={t('labelNFTTId')}
                    placeholder={t('depositNFTIdLabelPlaceholder')}
                    onChange={(event) =>
                      handleOnNFTDataChange({
                        nftIdView: event.target?.value,
                        nftId: '',
                      } as T)
                    }
                    helperText={
                      isMobile ? (
                        <></>
                      ) : (
                        <Typography
                          variant={'body2'}
                          component={'span'}
                          textAlign={'left'}
                          display={'inherit'}
                          whiteSpace={'pre-line'}
                          sx={{ wordBreak: 'break-all' }}
                        >
                          {tradeData.nftId}
                        </Typography>
                      )
                    }
                    fullWidth={true}
                  />
                  {tradeData.nftIdView && tradeData.nftIdView !== '' ? (
                    isNFTCheckLoading ? (
                      <LoadingIcon
                        width={24}
                        style={{
                          top: '32px',
                          right: '8px',
                          position: 'absolute',
                        }}
                      />
                    ) : (
                      <IconClearStyled
                        color={'inherit'}
                        size={'small'}
                        style={{ top: '30px' }}
                        aria-label='Clear'
                        onClick={() =>
                          handleOnNFTDataChange({
                            nftIdView: '',
                            nftId: '',
                          } as T)
                        }
                      >
                        <CloseIcon />
                      </IconClearStyled>
                    )
                  ) : (
                    ''
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} marginTop={2} alignSelf={'stretch'}>
                <Box
                  display={'flex'}
                  flexDirection={'row'}
                  justifyContent={'space-between'}
                  alignContent={'center'}
                >
                  <Box>
                    <Box>
                      <Typography color={'textSecondary'} marginBottom={1} variant={'body2'}>
                        {t('labelNFTType')}
                      </Typography>
                      <ToggleButtonGroup
                        exclusive
                        fullWidth
                        {...{
                          data: NFT_TYPE,
                          value: tradeData?.nftType ?? 0,
                        }}
                        onChange={(_e, value) => {
                          handleOnNFTDataChange({ nftType: value } as T)
                        }}
                        size={'medium'}
                      />
                    </Box>
                    <Box
                      marginTop={2}
                      display={'flex'}
                      alignItems={'center'}
                      justifyContent={'center'}
                    >
                      {isNFTCheckLoading ? (
                        <LoadingIcon fontSize={'large'} />
                      ) : (
                        <NFTInput
                          {...({ t } as any)}
                          isThumb={false}
                          inputNFTDefaultProps={{
                            size: InputSize.small,
                            label: t('labelNFTDepositInputTitle'),
                          }}
                          disabled={
                            !(
                              tradeData.nftIdView &&
                              tradeData.nftId &&
                              tradeData.tokenAddress &&
                              tradeData.balance !== undefined
                            )
                          }
                          baseURL={baseURL}
                          type={'NFT'}
                          inputNFTRef={inputBtnRef}
                          onChangeEvent={(_index, data) =>
                            handleOnNFTDataChange({
                              tradeValue: data.tradeData?.tradeValue ?? '0',
                            } as T)
                          }
                          tradeData={
                            {
                              ...tradeData,
                              belong: tradeData?.tokenAddress ?? undefined,
                            } as any
                          }
                          walletMap={walletMap}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} marginTop={3} alignSelf={'stretch'}>
                <Button
                  fullWidth
                  variant={'contained'}
                  size={'medium'}
                  color={'primary'}
                  onClick={() => {
                    onNFTDepositClick(tradeData)
                  }}
                  loading={
                    !getDisabled && nftDepositBtnStatus === TradeBtnStatus.LOADING
                      ? 'true'
                      : 'false'
                  }
                  disabled={getDisabled || nftDepositBtnStatus === TradeBtnStatus.LOADING}
                >
                  {btnInfo ? t(btnInfo.label, btnInfo.params) : t(`labelNFTDepositBtn`)}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </GridStyle>
    </Box>
  )
}
