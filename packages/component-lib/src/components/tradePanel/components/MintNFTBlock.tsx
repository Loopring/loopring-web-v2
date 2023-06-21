import { NFTMetaBlockProps } from './Interface'
import { Trans, useTranslation } from 'react-i18next'
import React from 'react'
import { Box, FormLabel, Grid, GridProps, Tooltip, Typography } from '@mui/material'
import {
  CoinInfo,
  CoinMap,
  CollectionMeta,
  FeeInfo,
  Info2Icon,
  MintTradeNFT,
  myLog,
  NFTMETA,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import { Button, InputCoin, InputSize, TextareaAutosizeStyled, TextField } from '../../basic-lib'

import styled from '@emotion/styled'
import { useSettings } from '../../../stores'
import { NFTInput } from './BasicANFTTrade'
import { Properties } from './tool/Property'
import { CollectionInput } from './tool'

const GridStyle = styled(Grid)<GridProps>`
  .coinInput-wrap {
    border: 1px solid var(--color-border);
  }

  .MuiInputLabel-root {
    font-size: ${({ theme }) => theme.fontDefault.body2};
  }

  .main-label,
  .sub-label {
    color: var(--color-text-secondary);
    font-size: ${({ theme }) => theme.fontDefault.body1};
  }
` as (props: GridProps) => JSX.Element

export const MintNFTBlock = <
  T extends Partial<NFTMETA>,
  Co extends CollectionMeta,
  I extends Partial<MintTradeNFT<any>>,
  C extends FeeInfo,
>({
  disabled,
  nftMeta,
  mintData,
  btnInfo,
  // collection,
  nftMetaBtnStatus,
  handleOnMetaChange,
  handleMintDataChange,
  baseURL,
  domain,
  collectionInputProps,
  onMetaClick,
}: NFTMetaBlockProps<T, Co, I, C>) => {
  const { t } = useTranslation(['common'])
  const { isMobile } = useSettings()
  const inputBtnRef = React.useRef()
  const [_collection, setCollection] = React.useState<Co | undefined>(
    collectionInputProps?.collection ?? undefined,
  )
  React.useEffect(() => {
    setCollection(collectionInputProps.collection)
  }, [collectionInputProps?.collection?.contractAddress])
  const getDisabled = React.useMemo(() => {
    return disabled || nftMetaBtnStatus === TradeBtnStatus.DISABLED
  }, [disabled, nftMetaBtnStatus])
  myLog('mint nftMeta', nftMeta, mintData)

  const _handleMintDataChange = React.useCallback(
    (_mintData: Partial<I>) => {
      handleMintDataChange({ ..._mintData })
    },
    [handleMintDataChange],
  )
  // @ts-ignore
  return (
    <Box flex={1} flexDirection={'column'} display={'flex'} alignContent={'space-between'}>
      <GridStyle
        className={isMobile ? 'isMobile' : ''}
        flex={1}
        display={'flex'}
        container
        spacing={2}
        alignContent={'flex-start'}
      >
        <Grid item xs={12} md={6}>
          <TextField
            value={nftMeta.name}
            fullWidth
            disabled={disabled}
            inputProps={{ maxLength: 32 }}
            label={
              <Typography component={'span'} variant={'body1'} color={'textSecondary'}>
                <Trans i18nKey={'labelMintName'}>
                  Name
                  <Typography component={'span'} variant={'inherit'} color={'error'}>
                    {'\uFE61'}
                  </Typography>
                </Trans>
              </Typography>
            }
            type={'text'}
            onChange={(event) => handleOnMetaChange({ name: event.target.value } as Partial<T>)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CollectionInput
            {...{
              ...collectionInputProps,
              collection: _collection,
              domain,
              isRequired: true,
              onSelected: (item: Co) => {
                setCollection(item)
                handleOnMetaChange({
                  collection: item,
                } as any)
              },
            }}
            size={isMobile ? 'small' : 'medium'}
            fullWidth={true}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <InputCoin
            handleCountChange={(data) =>
              handleOnMetaChange({
                royaltyPercentage: data.tradeValue,
              } as unknown as Partial<T>)
            }
            {...{
              maxAllow: true,
              placeholderText: '0',
              allowDecimals: false,
              handleError: (data) => {
                if (data.tradeValue && data.tradeValue > data.balance) {
                  return {
                    error: true,
                  }
                }
                return {
                  error: false,
                }
              },
              // size = InputSize.middle,
              isHideError: true,
              isShowCoinInfo: false,
              order: 'right',
              noBalance: '0',
              coinPrecision: 0,
              subLabel: t('labelMintRoyaltyPercentageRange'),
              label: (
                <Tooltip
                  title={t('labelMintRoyaltyPercentageTooltips').toString()}
                  placement={'top'}
                >
                  <Typography
                    component={'span'}
                    variant={'inherit'}
                    display={'inline-flex'}
                    alignItems={'center'}
                  >
                    <Trans i18nKey={'labelMintRoyaltyPercentage'}>
                      Royalty(%)
                      <Typography component={'span'} variant={'inherit'} color={'error'}>
                        {'\uFE61'}
                      </Typography>
                      <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                    </Trans>
                  </Typography>
                </Tooltip>
              ),
              size: InputSize.small,
              inputData: {
                balance: 10,
                tradeValue: nftMeta.royaltyPercentage ?? 0,
                belong: 'royaltyPercentage' as any,
              },
              disabled,
              coinMap: {} as CoinMap<I, CoinInfo<I>>,
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <NFTInput
            {...({ t } as any)}
            isThumb={false}
            baseURL={baseURL}
            isBalanceLimit={true}
            inputNFTDefaultProps={{
              subLabel: t('tokenNFTMaxMINT'),
              size: InputSize.small,
              isHideError: false,
              label: (
                <Trans i18nKey={'labelNFTMintInputTitle'}>
                  Amount
                  <Typography component={'span'} variant={'inherit'} color={'error'}>
                    {'\uFE61'}
                  </Typography>
                </Trans>
              ),
            }}
            // disabled={!(nftMintData.nftId && nftMintData.tokenAddress)}
            type={'NFT'}
            inputNFTRef={inputBtnRef}
            onChangeEvent={(_index, data) =>
              _handleMintDataChange({
                ...data.tradeData,
              } as unknown as Partial<I>)
            }
            handleError={(data) => {
              if (!data.tradeValue || data.tradeValue > data.balance) {
                return {
                  error: true,
                  // message: `Not enough ${belong} perform a deposit`,
                }
              }
              return {
                error: false,
              }
            }}
            // handleError={(data: I, ref) => {
            //   if (amountHandleError) {
            //     amountHandleError(data, ref);
            //   }
            // }}
            tradeData={
              {
                ...mintData,
                belong: mintData.tokenAddress ?? 'NFT',
                balance: mintData.nftBalance,
              } as any
            }
            disabled={disabled}
            walletMap={{}}
          />
        </Grid>
        <Grid item xs={12} md={12} flex={1}>
          <FormLabel>
            <Tooltip title={t('labelMintDescriptionTooltips').toString()} placement={'top'}>
              <Typography
                variant={'body2'}
                component={'span'}
                lineHeight={'20px'}
                display={'inline-flex'}
                alignItems={'center'}
                className={'main-label'}
              >
                <Trans i18nKey={'labelMintDescription'}>
                  Description
                  <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                </Trans>
              </Typography>
            </Tooltip>
          </FormLabel>
          <TextareaAutosizeStyled
            aria-label='NFT Description'
            minRows={2}
            maxRows={5}
            disabled={disabled}
            style={{
              overflowX: 'hidden',
              resize: 'vertical',
            }}
            maxLength={1000}
            onChange={(event) =>
              handleOnMetaChange({
                description: event.target.value,
              } as unknown as Partial<T>)
            }
            draggable={true}
          />
        </Grid>
        <Grid item xs={12} md={12}>
          <FormLabel>
            <Tooltip title={t('labelMintPropertyTooltips').toString()} placement={'top'}>
              <Typography
                component={'span'}
                variant={'body2'}
                lineHeight={'20px'}
                display={'inline-flex'}
                alignItems={'center'}
                className={'main-label'}
              >
                <Trans i18nKey={'labelMintProperty'}>
                  Properties
                  <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                </Trans>
              </Typography>
            </Tooltip>
          </FormLabel>
          <Box marginTop={1}>
            <Properties
              disabled={disabled}
              handleChange={(properties) =>
                handleOnMetaChange({
                  properties: properties,
                } as unknown as Partial<T>)
              }
              properties={nftMeta.properties ?? [{ key: '', value: '' }]}
            />
          </Box>
        </Grid>
        <Grid item xs={12} display={'flex'}>
          {btnInfo?.label === 'labelNFTMintNoMetaBtn' && (
            <Typography
              color={'var(--color-warning)'}
              component={'p'}
              variant={'body1'}
              marginBottom={1}
              style={{ wordBreak: 'break-all' }}
            >
              <Trans i18nKey={'labelNFTMintNoMetaDetail'}>
                Your NFT nftMeta should identify
                <em style={{ fontWeight: 600 }}>
                  name, image & royalty_percentage(number from 0 to 10)
                </em>
                .
              </Trans>
            </Typography>
          )}
          <Button
            fullWidth
            variant={'contained'}
            size={'medium'}
            color={'primary'}
            onClick={() => {
              onMetaClick(nftMeta as T)
            }}
            loading={!getDisabled && nftMetaBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
            disabled={getDisabled || nftMetaBtnStatus === TradeBtnStatus.LOADING}
          >
            {btnInfo ? t(btnInfo.label, btnInfo.params) : t(`labelNFTMetaBtn`)}
          </Button>
        </Grid>
      </GridStyle>
    </Box>
  )
}
