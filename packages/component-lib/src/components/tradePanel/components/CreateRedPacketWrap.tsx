import {
  Avatar,
  Box,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  TextField as MuiTextField
} from '@mui/material'
import React from 'react'
import {
  Button,
  CardStyleItem,
  InputButtonProps,
  InputCoin,
  InputSearch,
  NftImageStyle,
  TextField,
} from '../../basic-lib'
import { useTranslation, WithTranslation, withTranslation } from 'react-i18next'
import {
  BackIcon,
  CoinInfo,
  EmptyValueTag,
  FeeInfo,
  getValuePrecisionThousand,
  IBData,
  LuckyRedPacketItem,
  LuckyRedPacketList,
  REDPACKET_ORDER_LIMIT,
  RedPacketOrderData,
  SoursURL,
  TradeBtnStatus,
  REDPACKET_ORDER_NFT_LIMIT,
  Info2Icon,
  RedPacketOrderType,
  ScopePublic,
  HelpIcon,
  TokenType,
  CheckBoxIcon,
  CheckedIcon,
  YEAR_DAY_MINUTE_FORMAT,
  myLog,
  ScopeQR,
  ScopeTarget,
} from '@loopring-web/common-resources'
import { useSettings } from '../../../stores'
import {
  CreateRedPacketViewProps,
  RedPacketStep,
  SwitchData,
  TargetRedPacketStep,
  TargetRedpacktInputAddressStepProps,
  TargetRedpacktSelectStepProps,
} from '../Interface'
import { MenuBtnStyled } from '../../styled'
import styled from '@emotion/styled'
import { BasicACoinTrade } from './BasicACoinTrade'
import { BtnMain } from './tool'
import * as sdk from '@loopring-web/loopring-sdk'
import moment from 'moment'
import { NFTInput } from './BasicANFTTrade'
import { DateTimeRangePicker } from '../../datetimerangepicker'
import BigNumber from 'bignumber.js'
import { isAddress, useNotify, useTokenMap } from '@loopring-web/core'
import { CoinIcons, FeeSelect, Modal } from '../../../components'
import { useTheme } from '@emotion/react'

const StyledTextFiled = styled(TextField)``

const RedPacketBoxStyle = styled(Box)`
  padding-top: ${({ theme }) => theme.unit}px;

  .MuiFormGroup-root {
    align-items: flex-start;
  }

  .coinInput-wrap {
    border: 1px solid var(--color-border);
  }

  .MuiInputLabel-root {
    font-size: ${({ theme }) => theme.fontDefault.body2};
  }

  .MuiButtonBase-root.step {
    padding-left: ${({ theme }) => theme.unit * 4}px;
    padding-right: ${({ theme }) => theme.unit * 4}px;
  }

  //width: 100%;
  //display: flex;
  textarea {
    background: var(--field-opacity);
    border-color: var(--opacity);

    :hover {
      border-color: var(--color-border-hover);
    }
  }
`

export const CreateRedPacketStepWrap = withTranslation()(
  <T extends Partial<RedPacketOrderData<I>>, I, F extends FeeInfo>({
    btnStatus,
    btnInfo,
    disabled,
    tradeType,
    handleFeeChange,
    handleOnDataChange,
    onCreateRedPacketClick,
    walletMap,
    tradeData,
    coinMap,
    tokenMap,
    isFeeNotEnough,
    setActiveStep,
    feeInfo,
    chargeFeeTokenList,
    lastFailed,
    selectedType,
    minimum,
    maximum,
    selectNFTDisabled,
    ...rest
  }: CreateRedPacketViewProps<T, I, F> & {
    selectedType: LuckyRedPacketItem
  } & WithTranslation) => {
    const { t } = useTranslation('common')

    const inputButtonDefaultProps = {
      label:
        selectedType.value.partition == sdk.LuckyTokenAmountType.AVERAGE
          ? t('labelAmountEach')
          : t('labelRedPacketTotalAmount'),
      decimalsLimit: (tokenMap && tokenMap[tradeData?.belong as string])?.precision ?? 8,
      minimum,
      placeholderText: tradeData?.belong
        ? t('labelRedPacketsMinRange', { value: minimum }) +
          (sdk.toBig(maximum ?? 0).lt(sdk.toBig(tradeData.balance ?? 0))
            ? ' - ' + t('labelRedPacketsMaxRange', { value: maximum })
            : '')
        : '0.00',
    }

    const inputNFTButtonDefaultProps: Partial<InputButtonProps<T, I, CoinInfo<I>>> = {
      label:
        selectedType.value.partition == sdk.LuckyTokenAmountType.AVERAGE
          ? t('labelAmountEach')
          : t('labelRedPacketTotalAmount'),
      decimalsLimit: 0,
      minimum,
      placeholderText: '0',
    }
    // const [dayValue, setDayValue] = React.useState<Moment | null>(moment());
    // const [durationValue, setDurationValue] = React.useState<number>(1);

    const getDisabled = React.useMemo(() => {
      return disabled || btnStatus === TradeBtnStatus.DISABLED
    }, [disabled, btnStatus])
    const [showFeeModal, setShowFeeModal] = React.useState(false)
    const inputBtnRef = React.useRef()
    const inputSplitRef = React.useRef()
    const isToken =
      tradeType === RedPacketOrderType.TOKEN ||
      (tradeType === RedPacketOrderType.BlindBox && !tradeData.isNFT)
    const { total: redPacketTotalValue, splitValue } = React.useMemo(() => {
      // if (tradeType == TRADE_TYPE.TOKEN) {
      //
      // } else {
      //   const splitValue =
      //     selectedType.value.value == 2
      //       ? (tradeData?.tradeValue ?? 0) / (tradeData?.numbers ?? 1)
      //       : tradeData?.tradeValue ?? 0;
      //   return {
      //     total: tradeData.tradeValue ?? EmptyValueTag,
      //     splitValue: splitValue && EmptyValueTag,
      //   };
      // }
      if (tradeData?.tradeValue && tradeData.belong && tokenMap) {
        const splitValue =
          selectedType.value.partition == sdk.LuckyTokenAmountType.RANDOM
            ? sdk.toBig(tradeData?.tradeValue ?? 0).div(tradeData?.numbers ?? 1)
            : sdk.toBig(tradeData?.tradeValue ?? 0)
        const total =
          selectedType.value.partition == sdk.LuckyTokenAmountType.AVERAGE
            ? sdk.toBig(tradeData?.tradeValue ?? 0).times(tradeData?.numbers ?? 0)
            : sdk.toBig(tradeData?.tradeValue ?? 0)
        if (isToken) {
          return {
            total:
              getValuePrecisionThousand(
                total,
                tokenMap[tradeData?.belong as string].precision,
                tokenMap[tradeData?.belong as string].precision,
                tokenMap[tradeData?.belong as string].precision,
                false,
                // { isFait: true }
              ) +
              ' ' +
              tradeData.belong,
            splitValue:
              getValuePrecisionThousand(
                splitValue,
                tokenMap[tradeData?.belong as string].precision,
                tokenMap[tradeData?.belong as string].precision,
                tokenMap[tradeData?.belong as string].precision,
                false,
                // { isFait: true }
              ) +
              ' ' +
              tradeData.belong,
          }
        } else {
          return {
            total:
              getValuePrecisionThousand(
                total,
                0,
                0,
                1,
                false,
                // { isFait: true }
              ) +
              ' ' +
              (total.gt(1) ? 'NFTs' : 'NFT'),
            splitValue:
              getValuePrecisionThousand(
                splitValue.toFixed(0, 1),
                0,
                0,
                1,
                false,
                // { isFait: true }
              ) +
              ' ' +
              'NFT',
          }
        }
      } else {
        return {
          total: EmptyValueTag,
          splitValue:
            selectedType.value.partition == sdk.LuckyTokenAmountType.AVERAGE && EmptyValueTag,
        }
      }
    }, [tradeData, tradeData?.numbers, selectedType.value.partition, coinMap, tradeType])
    const inputSplitProps = React.useMemo(() => {
      const inputSplitProps: any = {
        label:
          selectedType.value.partition == sdk.LuckyTokenAmountType.AVERAGE
            ? t('labelQuantity')
            : t('labelSplit'), //t("labelTokenAmount"),
        placeholderText: t('labelQuantity'),
        isHideError: true,
        isShowCoinInfo: false,
        handleCountChange: (ibData: IBData<any>, _name: string, _ref: any) => {
          handleOnDataChange({
            numbers: ibData.tradeValue,
          } as unknown as Partial<T>)
        },
        fullWidth: true,
      }
      let inputSplitExtendProps = {},
        balance: any = undefined
      if (tradeData?.tradeValue && Number(tradeData?.tradeValue) && maximum) {
        if (selectedType.value.partition === sdk.LuckyTokenAmountType.AVERAGE) {
          balance = sdk
            .toBig(tradeData?.balance ?? 0)
            .div(tradeData.tradeValue)
            .toFixed(0, 1)
        } else {
          balance = sdk
            .toBig(tradeData.tradeValue)
            .div(Number(minimum) ?? 1)
            .toFixed(0, 1)
        }

        balance = sdk.toBig(balance).lte(REDPACKET_ORDER_LIMIT) ? balance : REDPACKET_ORDER_LIMIT

        inputSplitExtendProps = {
          // maxAllow: true,
          // subLabel: t("labelAvailable"),
          // handleError: (data: any) => {
          //   handleOnDataChange({
          //     numbers: data.tradeValue,
          //   } as unknown as Partial<T>);
          //   if (data.tradeValue && data.tradeValue > data.balance) {
          //     return {
          //       error: true,
          //     };
          //   }
          //   return {
          //     error: false,
          //   };
          // },
          inputData: {
            belong:
              selectedType.value.partition == sdk.LuckyTokenAmountType.AVERAGE
                ? t('labelQuantity')
                : t('labelSplit'),
            tradeValue: tradeData?.numbers,
            balance: balance,
          },
        }
      } else {
        inputSplitExtendProps = {
          // maxAllow: false,
          // subLabel: "",
          // handleError: () => undefined,
          inputData: {
            belong:
              selectedType.value.partition == sdk.LuckyTokenAmountType.AVERAGE
                ? t('labelAmountEach')
                : t('labelSplit'),
            tradeValue: tradeData?.numbers,
            // count: tradeData?.numbers,
          },
        }
      }
      return {
        ...inputSplitProps,
        ...inputSplitExtendProps,
      }
    }, [tradeData?.numbers, selectedType.value.partition, maximum, minimum, tradeType])
    const handleToggleChange = (value: F) => {
      if (handleFeeChange) {
        handleFeeChange(value)
      }
    }
    const _balance = React.useMemo(() => {
      if (
        tradeData.belong !== undefined &&
        // tradeData?.numbers &&
        // @ts-ignore
        // tradeData.numbers !== "0" &&
        tradeData.balance &&
        tradeType === RedPacketOrderType.NFT
      ) {
        if (selectedType.value.partition == sdk.LuckyTokenAmountType.AVERAGE) {
          const value = BigNumber.min(tradeData.balance, REDPACKET_ORDER_NFT_LIMIT).toString()
          return sdk
            .toBig(value)
            .div(tradeData?.numbers && tradeData?.numbers != 0 ? tradeData?.numbers : 1)
            .toFixed(0, 1)
        } else {
          return BigNumber.min(tradeData.balance, REDPACKET_ORDER_NFT_LIMIT).toString()
        }
      } else if (
        selectedType.value.partition == sdk.LuckyTokenAmountType.AVERAGE &&
        tradeData.belong !== undefined &&
        tradeData?.numbers &&
        // @ts-ignore
        tradeData.numbers !== '0' &&
        tradeData.balance
      ) {
        return sdk.toBig(tradeData.balance).div(tradeData.numbers).toString()
      } else {
        return tradeData.balance
      }
    }, [selectedType.value.partition, tradeData.balance, tradeData?.numbers])
    const { isMobile } = useSettings()

    const startDateTime = tradeData.validSince ? moment(tradeData.validSince) : null
    const endDateTime = tradeData.validUntil ? moment(tradeData.validUntil) : null
    const now = moment()

    const startMinDateTime = endDateTime
      ? moment.max(now, endDateTime.clone().subtract(7, 'days'))
      : now
    const startMaxDateTime = endDateTime ? endDateTime.clone() : now.clone().add(1, 'days')

    const endMinDateTime = startDateTime ? moment.max(now, startDateTime.clone()) : now

    const timeRangeMaxInSeconds = isToken
      ? useNotify().notifyMap?.redPacket.timeRangeMaxInSecondsToken
      : useNotify().notifyMap?.redPacket.timeRangeMaxInSecondsNFT
    // ?? 14 * 24 * 60 * 60;
    const endMaxDateTime = startDateTime
      ? startDateTime.clone().add(timeRangeMaxInSeconds, 'seconds')
      : undefined
    // @ts-ignore
    return (
      <RedPacketBoxStyle className={'redPacket'} justifyContent={'center'}>
        <Box marginY={1} display={'flex'}>
          <Box
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'flex-start'}
            alignItems={'center'}
            marginBottom={1}
          >
            <Typography
              component={'h4'}
              variant={isMobile ? 'body1' : 'h5'}
              whiteSpace={'pre'}
              marginRight={1}
            >
              {t(
                selectedType.value.mode == sdk.LuckyTokenClaimType.BLIND_BOX
                  ? 'labelLuckyBlindBox'
                  : selectedType.value.mode == sdk.LuckyTokenClaimType.RELAY
                  ? 'labelRelayRedPacket'
                  : selectedType.value.partition == sdk.LuckyTokenAmountType.AVERAGE
                  ? 'labelRedPacketSendCommonTitle'
                  : 'labelRedPacketSenRandomTitle',
              ) +
                ' — ' +
                t(`labelRedPacketViewType${tradeData?.type?.scope ?? 0}`)}
            </Typography>
          </Box>
        </Box>
        <Box
          marginY={1}
          display={'flex'}
          alignSelf={'stretch'}
          position={'relative'}
          flexDirection={'column'}
        >
          {isToken ? (
            // @ts-ignore
            <BasicACoinTrade
              {...{
                ...rest,
                t,
                type: 'TOKEN',
                disabled,
                walletMap,
                tradeData:
                  selectedType.value.partition == sdk.LuckyTokenAmountType.AVERAGE &&
                  tradeData?.numbers
                    ? {
                        ...tradeData,
                        balance: _balance,
                      }
                    : (tradeData as T),
                coinMap,
                inputButtonDefaultProps,
                inputBtnRef,
              }}
            />
          ) : (
            <NFTInput
              {...({
                ...rest,
                t,
                fullwidth: true,
                isThumb: true,
                isSelected: true,
                type: tradeType,
                subLabel: t('labelTokenNFTMaxRedPack'),
                disabled,
                tradeData: {
                  ...tradeData,
                  balance:
                    tradeData.type?.mode === sdk.LuckyTokenClaimType.BLIND_BOX
                      ? Math.min(
                          (tradeData.giftNumbers ?? 1) * REDPACKET_ORDER_NFT_LIMIT,
                          tradeData.balance ?? 0,
                        )
                      : tradeData.type?.partition === sdk.LuckyTokenAmountType.AVERAGE
                      ? Math.min(REDPACKET_ORDER_NFT_LIMIT, tradeData.balance ?? 0)
                      : Math.min(
                          (tradeData.numbers ?? 1) * REDPACKET_ORDER_NFT_LIMIT,
                          tradeData.balance ?? 0,
                        ),
                },
                handleError: ({ balance: _balance }: T) => {
                  return { error: false, message: '' }
                },

                onChangeEvent: (_index: 0 | 1, { to, tradeData: newTradeData }: SwitchData<T>) => {
                  if (_index === 1) {
                    if (selectNFTDisabled) return
                    handleOnDataChange({
                      collectionInfo: undefined,
                      tokenId: undefined,
                      tradeValue: undefined,
                      balance: undefined,
                      nftData: undefined,
                      belong: undefined,
                      image: undefined,
                    } as T)
                    if (tradeData.type?.scope === sdk.LuckyTokenViewType.TARGET) {
                      setActiveStep(TargetRedPacketStep.NFTList)
                    } else {
                      setActiveStep(RedPacketStep.NFTList)
                    }
                  } else if (to === 'button') {
                    handleOnDataChange({
                      tradeValue: newTradeData.tradeValue,
                      belong: newTradeData.belong,
                      balance: tradeData.balance,
                      nftData: newTradeData.nftData,
                    } as any)
                  }
                },
                inputNFTDefaultProps: inputNFTButtonDefaultProps,
                inputNFTRef: inputBtnRef,
              } as any)}
            />
          )}

          <Typography
            display={'flex'}
            width={'100%'}
            justifyContent={'flex-end'}
            color={'textSecondary'}
          >
            {t('labelAssetAmount', {
              value: getValuePrecisionThousand(tradeData.balance, 8, 8, 8, false),
            })}
          </Typography>
        </Box>

        {tradeData.type?.mode === sdk.LuckyTokenClaimType.BLIND_BOX && (
          <Box
            marginY={1}
            display={'flex'}
            alignSelf={'stretch'}
            justifyContent={'stretch'}
            flexDirection={'column'}
            position={'relative'}
          >
            <InputCoin<any, I, any>
              // ref={inputSplitRef}
              label={t('labelBlindBoxRedPacketWithGift')}
              placeholderText={t('labelQuantity')}
              isHideError={false}
              isShowCoinInfo={false}
              // handleError={(data: any) => {
              //   handleOnDataChange({
              //     giftNumbers: data.tradeValue,
              //   } as unknown as Partial<T>);
              //   return {
              //     error:
              //       tradeData.giftNumbers &&
              //       tradeData.numbers &&
              //       tradeData.giftNumbers > tradeData.numbers
              //         ? true
              //         : false,
              //   };
              // }}
              name={'giftnumbers'}
              order={'right'}
              handleCountChange={(data) => {
                handleOnDataChange({
                  giftNumbers: data.tradeValue,
                } as unknown as Partial<T>)
              }}
              inputData={{
                belong:
                  selectedType.value.partition == sdk.LuckyTokenAmountType.AVERAGE
                    ? t('labelQuantity')
                    : t('labelSplit'),
                tradeValue: tradeData?.giftNumbers,
              }}
              coinMap={{}}
              coinPrecision={undefined}
              disabled={disabled}
              // inputError={
              //   tradeData.giftNumbers &&
              //   tradeData.numbers &&
              //   tradeData.giftNumbers > tradeData.numbers
              //     ? { error: true }
              //     : { error: false }
              // }
            />
          </Box>
        )}
        <Box
          marginY={1}
          display={'flex'}
          alignSelf={'stretch'}
          justifyContent={'stretch'}
          flexDirection={'column'}
          position={'relative'}
        >
          <InputCoin<any, I, any>
            ref={inputSplitRef}
            {...{
              ...inputSplitProps,
              name: 'numbers',
              order: 'right',
              handleCountChange: (data) => {
                handleOnDataChange({
                  numbers: data.tradeValue,
                } as unknown as Partial<T>)
              },
              coinMap: {},
              coinPrecision: undefined,
            }}
            disabled={disabled}
          />
        </Box>
        <Box marginY={1} display={'flex'} alignSelf={'stretch'}>
          <StyledTextFiled
            label={
              <Typography component={'span'} color={'var(--color-text-third)'}>
                {t('labelRedPacketMemo')}
              </Typography>
            }
            value={tradeData.memo}
            onChange={(event) =>
              handleOnDataChange({
                memo: event.target.value, //event?.target?.value,
              } as unknown as Partial<T>)
            }
            size={'large'}
            inputProps={{
              placeholder: t('labelRedPacketMemoPlaceholder'),
              maxLength: 25,
            }}
            fullWidth={true}
          />
        </Box>
        <Box marginY={1} display={'flex'} alignSelf={'stretch'} flexDirection={'column'}>
          <FormLabel>
            <Typography
              variant={'body1'}
              component={'span'}
              lineHeight={'20px'}
              display={'inline-flex'}
              alignItems={'center'}
              className={'main-label'}
              color={'var(--color-text-third)'}
            >
              {selectedType.value.mode === sdk.LuckyTokenClaimType.BLIND_BOX
                ? t('labelRedPacketTimeRangeBlindbox')
                : t('labelRedPacketTimeRange')}
              <Tooltip
                title={
                  tradeData.type?.mode === sdk.LuckyTokenClaimType.BLIND_BOX
                    ? tradeData.isNFT
                      ? t('labelRedPacketTimeRangeBlindboxDes')!
                      : t('labelRedPacketTimeRangeBlindboxDesERC20')!
                    : t('labelRedPacketTimeRangeDes')!
                }
              >
                <IconButton>
                  <Info2Icon />
                </IconButton>
              </Tooltip>
            </Typography>
          </FormLabel>
          <Box marginTop={1}>
            <DateTimeRangePicker
              startValue={startDateTime}
              startMinDateTime={startMinDateTime}
              startMaxDateTime={startMaxDateTime}
              onStartChange={(m) => {
                handleOnDataChange({
                  validSince: m ? m.toDate().getTime() : undefined,
                  validUntil: m ? m.clone().add(1, 'days').toDate().getTime() : undefined,
                } as unknown as Partial<T>)
              }}
              onStartOpen={() => {
                handleOnDataChange({
                  validUntil: undefined,
                } as unknown as Partial<T>)
              }}
              endValue={endDateTime}
              endMinDateTime={endMinDateTime}
              endMaxDateTime={endMaxDateTime}
              onEndChange={(m) => {
                if (
                  startDateTime &&
                  m &&
                  startDateTime?.toDate().getTime() > m?.toDate().getTime()
                ) {
                  handleOnDataChange({
                    validUntil: endDateTime,
                  } as unknown as Partial<T>)
                } else {
                  const maximunTimestamp = startDateTime
                    ? moment(startDateTime).add(timeRangeMaxInSeconds, 'seconds').toDate().getTime()
                    : 0
                  handleOnDataChange({
                    validUntil: m
                      ? m.toDate().getTime() > maximunTimestamp
                        ? maximunTimestamp
                        : m.toDate().getTime()
                      : undefined,
                  } as unknown as Partial<T>)
                }
              }}
              customeEndInputPlaceHolder={
                tradeData.type?.mode === sdk.LuckyTokenClaimType.BLIND_BOX
                  ? t('labelBlindBoxEndDate2')
                  : undefined
              }
            />
          </Box>
        </Box>
        <Box
          marginY={1}
          display={'flex'}
          alignSelf={'stretch'}
          position={'relative'}
          flexDirection={'column'}
        >
          {!chargeFeeTokenList?.length ? (
            <Typography component={'span'}>{t('labelFeeCalculating')}</Typography>
          ) : (
            <>
              <FeeSelect
                chargeFeeTokenList={chargeFeeTokenList}
                handleToggleChange={(fee: FeeInfo) => {
                  handleToggleChange(fee as F)
                  setShowFeeModal(false)
                }}
                feeInfo={feeInfo as FeeInfo}
                open={showFeeModal}
                onClose={() => {
                  setShowFeeModal(false)
                }}
                isFeeNotEnough={isFeeNotEnough && isFeeNotEnough.isFeeNotEnough}
                feeLoading={isFeeNotEnough && isFeeNotEnough.isOnLoading}
                onClickFee={() => setShowFeeModal((prev) => !prev)}
                floatLeft
              />
            </>
          )}
        </Box>
        <Box marginY={1} display={'flex'} flexDirection={'column'} alignSelf={'stretch'}>
          <Typography
            display={'inline-flex'}
            alignItems={'center'}
            justifyContent={'center'}
            variant={'h3'}
            component={'span'}
            color={'textPrimary'}
            width={'100%'}
            textAlign={'center'}
          >
            {redPacketTotalValue}
          </Typography>
          <Typography
            display={'inline-flex'}
            alignItems={'center'}
            justifyContent={'center'}
            variant={'body2'}
            component={'span'}
            color={'var(--color-text-third)'}
            width={'100%'}
            textAlign={'center'}
          >
            {selectedType.value.partition == sdk.LuckyTokenAmountType.AVERAGE
              ? t('labelRedPacketsSplitCommonDetail', { value: splitValue })
              : t('labelRedPacketsSplitLuckyDetail')}
          </Typography>
        </Box>
        <Box marginY={1} display={'flex'} alignSelf={'stretch'}>
          {lastFailed && (
            <Typography
              component={'span'}
              paddingBottom={1}
              textAlign={'center'}
              color={'var(--color-warning)'}
            >
              {t('labelConfirmAgainByFailed')}
            </Typography>
          )}
        </Box>
        <Box
          marginY={1}
          display={'flex'}
          alignSelf={'stretch'}
          flexDirection={'row'}
          justifyContent={'space-between'}
        >
          <Box width={'48%'}>
            <Button
              variant={'outlined'}
              size={'medium'}
              fullWidth
              className={'step'}
              startIcon={<BackIcon fontSize={'small'} />}
              color={'primary'}
              sx={{ height: 'var(--btn-medium-height)' }}
              onClick={() => {
                if (tradeData.type?.scope === sdk.LuckyTokenViewType.TARGET) {
                  setActiveStep(TargetRedPacketStep.ChooseType)
                } else {
                  setActiveStep(RedPacketStep.ChooseType)
                }
                handleOnDataChange({
                  numbers: undefined,
                  tradeValue: undefined,
                  validSince: Date.now(),
                  validUntil: moment().add('days', 1).toDate().getTime(),
                  giftNumbers: undefined,
                  memo: '',
                } as any)
              }}
            >
              {t(`labelMintBack`)}
            </Button>
          </Box>
          <Box width={'50%'}>
            <Button
              fullWidth
              variant={'contained'}
              size={'medium'}
              color={'primary'}
              onClick={() => {
                onCreateRedPacketClick()
              }}
              loading={!getDisabled && btnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
              disabled={getDisabled || btnStatus === TradeBtnStatus.LOADING}
            >
              {btnInfo?.label ? t(btnInfo.label, btnInfo.params) : t(`labelCreateRedPacketBtn`)}
            </Button>
          </Box>
        </Box>

        <Box marginTop={4} display={'flex'} alignSelf={'stretch'}>
          <Typography
            paddingBottom={0}
            display={'inline-flex'}
            alignItems={'center'}
            justifyContent={'center'}
            variant={'body2'}
            component={'span'}
            color={'textSecondary'}
            width={'100%'}
            textAlign={'center'}
          >
            {tradeData.isNFT
              ? t('labelBlindBoxExpirationExplainationForNFT')
              : tradeData.type?.mode === sdk.LuckyTokenClaimType.BLIND_BOX
              ? t('labelBlindBoxExpirationExplainationForTokenBlindbox')
              : t('labelBlindBoxExpirationExplainationForToken')}
          </Typography>
        </Box>
      </RedPacketBoxStyle>
    )
  },
) as <T extends Partial<RedPacketOrderData<I>>, I, F extends FeeInfo>(
  props: CreateRedPacketViewProps<T, I, F> & {
    selectedType: LuckyRedPacketItem
  },
) => JSX.Element

export const CreateRedPacketStepType = withTranslation()(
  <T extends RedPacketOrderData<I>, I, C = FeeInfo>({
    // handleOnSelectedType,
    tradeType,
    tradeData,
    handleOnDataChange,
    setActiveStep,
    backToScope,
    selectedType,
    disabled = false,
    btnInfo,
    onClickNext,
    showNFT,
    t,
  }: Omit<CreateRedPacketViewProps<T, I, C>, 'tokenMap'> & {
    selectedType: LuckyRedPacketItem
    // setSelectType: (value: LuckyRedPacketItem) => void;
  } & WithTranslation) => {
    const { isMobile } = useSettings()
    const getDisabled = React.useMemo(() => {
      return disabled
    }, [disabled])
    const showERC20Blindbox = useNotify().notifyMap?.redPacket.showERC20Blindbox
    const filteredList = LuckyRedPacketList.filter(
      (item) =>
        (tradeType == RedPacketOrderType.NFT
          ? item.showInNFTS
          : tradeType == RedPacketOrderType.BlindBox
          ? item.showInBlindbox
          : tradeType == RedPacketOrderType.FromNFT
          ? item.showInFromNFT
          : item.showInERC20) &&
        (showERC20Blindbox ? true : item.toolgleWithShowERC20Blindbox ? false : true),
    ).filter((item) => {
      return !(item.isBlindboxNFT && showNFT)
    })

    return (
      <RedPacketBoxStyle
        className={isMobile ? 'mobile redPacket' : ''}
        justifyContent={'flex-start'}
        flexDirection={'column'}
        alignItems={'center'}
        width={'100%'}
        maxWidth={720}
      >
        <Box
          display={'flex'}
          flexDirection={'column'}
          alignItems={'stretch'}
          alignSelf={'stretch'}
          marginY={2}
          minHeight={300}
        >
          {filteredList.map((item: LuckyRedPacketItem, index) => {
            return (
              <React.Fragment key={index}>
                {tradeType == RedPacketOrderType.FromNFT && index === 1 && (
                  <Typography marginTop={1} variant={'h5'} color={'var(--color-text-secondary)'}>
                    {t('labelRedpacketStandard')}
                  </Typography>
                )}
                <Box key={item.value.value} marginBottom={1}>
                  <MenuBtnStyled
                    variant={'outlined'}
                    size={'large'}
                    className={`${isMobile ? 'isMobile' : ''} ${
                      selectedType.value.value === item.value.value
                        ? 'selected redPacketType '
                        : 'redPacketType'
                    }`}
                    fullWidth
                    onClick={(_e) => {
                      if (tradeType === RedPacketOrderType.BlindBox) {
                        handleOnDataChange({
                          isNFT: item.isBlindboxNFT ? true : false,
                          type: {
                            ...tradeData?.type,
                            partition: item.value.partition,
                            mode: item.value.mode,
                          },
                        } as any)
                      } else {
                        handleOnDataChange({
                          type: {
                            ...tradeData?.type,
                            partition: item.value.partition,
                            mode: item.value.mode,
                          },
                        } as any)
                      }
                    }}
                  >
                    {item.icon ? (
                      <Box display={'flex'} alignItems={'center'}>
                        <img width={'32px'} src={item.icon} />
                        <Typography
                          variant={'h5'}
                          display={'inline-flex'}
                          marginLeft={2}
                          alignItems={'flex-start'}
                          component={'span'}
                        >
                          {t(item.labelKey)}
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        <Typography
                          variant={'h5'}
                          display={'inline-flex'}
                          marginBottom={1 / 2}
                          alignItems={'flex-start'}
                          component={'span'}
                        >
                          {t(item.labelKey)}
                        </Typography>
                        <Typography
                          variant={'body1'}
                          display={'inline-flex'}
                          justifyContent={'flex-start'}
                          component={'span'}
                          color={'var(--color-text-secondary)'}
                        >
                          {t(item.desKey)}
                        </Typography>
                      </>
                    )}
                  </MenuBtnStyled>
                </Box>
              </React.Fragment>
            )
          })}
        </Box>

        <Box
          width={'100%'}
          alignSelf={'stretch'}
          paddingBottom={1}
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'space-between'}
        >
          <Box width={'48%'}>
            <Button
              variant={'outlined'}
              size={'medium'}
              fullWidth
              className={'step'}
              startIcon={<BackIcon fontSize={'small'} />}
              color={'primary'}
              sx={{ height: 'var(--btn-medium-height)' }}
              onClick={() => {
                if (tradeType === RedPacketOrderType.FromNFT) {
                  backToScope()
                } else {
                  if (tradeData.type?.scope === sdk.LuckyTokenViewType.TARGET) {
                    setActiveStep(TargetRedPacketStep.TradeType)
                  } else {
                    setActiveStep(RedPacketStep.TradeType)
                  }
                }
              }}
            >
              {t(`labelMintBack`)}
            </Button>
          </Box>
          <Box width={tradeType === RedPacketOrderType.FromNFT ? '100%' : '48%'}>
            <BtnMain
              {...{
                defaultLabel: 'labelContinue',
                fullWidth: true,
                btnInfo: btnInfo,
                disabled: () => getDisabled,
                onClick: () => {
                  onClickNext()
                },
              }}
            />
          </Box>
        </Box>
      </RedPacketBoxStyle>
    )
  },
)
export const CreateRedPacketStepTokenType = withTranslation()(
  <T extends RedPacketOrderData<I>, I, C = FeeInfo>({
    tradeType,
    setActiveStep,
    disabled = false,
    handleOnDataChange,
    btnInfo,
    onClickNext,
    onClickBack,
    showNFT,
    t,
  }: Omit<CreateRedPacketViewProps<T, I, C>, 'tradeData' | 'tokenMap'> & WithTranslation) => {
    const { isMobile } = useSettings()
    const getDisabled = React.useMemo(() => {
      return disabled
    }, [disabled])
    
    return (
      <RedPacketBoxStyle
        display={'flex'}
        flexDirection={'column'}
        width={'100%'}
        maxWidth={720}
        paddingX={isMobile ? 2 : 10}
        className='modalConte'
        position={'absolute'}
        height={'100%'}
        maxHeight={'480px'}
        justifyContent={'space-evenly'}
      >
        <Grid container spacing={2}>
          <Grid item xs={4} display={'flex'} marginBottom={2}>
            <CardStyleItem
              className={
                tradeType === RedPacketOrderType.TOKEN
                  ? 'btnCard column selected'
                  : 'btnCard column'
              }
              sx={{ height: '100%' }}
              onClick={() => handleOnDataChange({ tradeType: RedPacketOrderType.TOKEN } as any)}
            >
              <CardContent sx={{ alignItems: 'center' }}>
                <Typography component={'span'} display={'inline-flex'}>
                  <Avatar
                    variant='rounded'
                    style={{
                      height: 'var(--redPacket-avatar)',
                      width: 'var(--redPacket-avatar)',
                    }}
                    // src={sellData?.icon}
                    src={SoursURL + 'images/redPacketERC20.webp'}
                  />
                </Typography>

                <Typography component={'span'} variant={'h5'} marginTop={2}>
                  {t('labelRedpacketTokens')}
                </Typography>
              </CardContent>
            </CardStyleItem>
          </Grid>
          {showNFT && (
            <Grid item xs={4} display={'flex'} marginBottom={2}>
              <CardStyleItem
                className={
                  tradeType === RedPacketOrderType.NFT
                    ? 'btnCard column selected'
                    : 'btnCard column'
                }
                sx={{ height: '100%' }}
                onClick={() => handleOnDataChange({ tradeType: RedPacketOrderType.NFT } as any)}
              >
                <CardContent sx={{ alignItems: 'center' }}>
                  <Typography component={'span'} display={'inline-flex'}>
                    <Typography component={'span'} display={'inline-flex'}>
                      <Avatar
                        variant='rounded'
                        style={{
                          height: 'var(--redPacket-avatar)',
                          width: 'var(--redPacket-avatar)',
                        }}
                        // src={sellData?.icon}
                        src={SoursURL + 'images/redPacketNFT.webp'}
                      />
                    </Typography>
                  </Typography>
                  <Typography component={'span'} variant={'h5'} marginTop={2}>
                    {t('labelRedpacketNFTS')}
                  </Typography>
                </CardContent>
              </CardStyleItem>
            </Grid>
          )}
          <Grid item xs={4} display={'flex'} marginBottom={2}>
            <CardStyleItem
              className={
                tradeType === RedPacketOrderType.BlindBox
                  ? 'btnCard column selected'
                  : 'btnCard column'
              }
              sx={{ height: '100%' }}
              onClick={() => handleOnDataChange({ tradeType: RedPacketOrderType.BlindBox } as any)}
            >
              <CardContent sx={{ alignItems: 'center' }}>
                <Typography component={'span'} display={'inline-flex'}>
                  <Typography component={'span'} display={'inline-flex'}>
                    <Avatar
                      variant='rounded'
                      style={{
                        height: 'var(--redPacket-avatar)',
                        width: 'var(--redPacket-avatar)',
                      }}
                      // src={sellData?.icon}
                      src={SoursURL + 'images/redPacketBlindbox.png'}
                    />
                  </Typography>
                </Typography>
                <Typography component={'span'} variant={'h5'} marginTop={2}>
                  {t('labelRedpacketBlindBox')}
                </Typography>
              </CardContent>
            </CardStyleItem>
          </Grid>
        </Grid>
        <Box
          width={'100%'}
          alignSelf={'stretch'}
          paddingBottom={1}
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'space-between'}
        >
          <Box width={'48%'}>
            <Button
              variant={'outlined'}
              size={'medium'}
              fullWidth
              className={'step'}
              startIcon={<BackIcon fontSize={'small'} />}
              color={'primary'}
              sx={{ height: 'var(--btn-medium-height)' }}
              onClick={() => {
                onClickBack()
              }}
            >
              {t(`labelMintBack`)}
            </Button>
          </Box>
          <Box width={'48%'}>
            <BtnMain
              {...{
                defaultLabel: 'labelContinue',
                fullWidth: true,
                btnInfo: btnInfo,
                disabled: () => getDisabled,
                onClick: () => {
                  onClickNext()
                },
              }}
            />
          </Box>
        </Box>
      </RedPacketBoxStyle>
    )
  },
)

const ScopeOption = styled(Box)<{ selected?: boolean }>`
  display: flex;
  border: 1px solid
    ${({ selected }) => (selected ? 'var(--color-border-select)' : 'var(--color-border)')};
  padding: ${({ theme }) => 3 * theme.unit}px;
  border-radius: ${({ theme }) => theme.unit}px;
  width: 47%;
  cursor: pointer;
`
type CreateRedPacketScopeProps = {
  selectedScope: sdk.LuckyTokenViewType
  onSelecteScope: (scope: sdk.LuckyTokenViewType) => void
  onClickNext: () => void
  showPalazaPublic: boolean
}
export const CreateRedPacketScope = withTranslation()(
  ({
    selectedScope,
    onClickNext,
    onSelecteScope,
    showPalazaPublic,
    t,
  }: CreateRedPacketScopeProps & WithTranslation) => {
    const theme = useTheme()
    return (
      <Box width={'100%'} display={'flex'} flexDirection={'column'} paddingX={8} paddingTop={4} paddingBottom={8}>
        <Box marginBottom={6}>
          <Box display={'flex'} alignItems={'center'} marginBottom={2}>
            <Typography marginRight={0.5} variant={'h4'}>
              {t('labelLuckyTokenViewTypePublic')}
            </Typography>
            <Tooltip title={t('labelRedPacketPublicTooltip')}>
              <Box>
                <HelpIcon htmlColor={'var(--color-text-secondary)'} fontSize={'large'} />
              </Box>
            </Tooltip>
          </Box>
          <Box display={'flex'} justifyContent={'space-between'}>
            {showPalazaPublic && <ScopeOption
              onClick={() => onSelecteScope(sdk.LuckyTokenViewType.PUBLIC)}
              selected={selectedScope === sdk.LuckyTokenViewType.PUBLIC}
            >
              <Box marginRight={0.5}>
                <Typography>{t('labelRedPacketPlazaPublic')}</Typography>
                <Typography color={'var(--color-text-secondary)'}>
                  {t('labelRedPacketPlazaPublicDes')}
                </Typography>
              </Box>
              <Box width={theme.unit * 8}>
                <ScopePublic color={'var(--color-text-secondary)'} />
              </Box>
              
            </ScopeOption>}
            <ScopeOption
              onClick={() => onSelecteScope(sdk.LuckyTokenViewType.PRIVATE)}
              selected={selectedScope === sdk.LuckyTokenViewType.PRIVATE}
            >
              <Box marginRight={0.5}>
                <Typography>{t('labelRedPacketQRPublic')}</Typography>
                <Typography color={'var(--color-text-secondary)'}>
                  {t('labelRedPacketQRPublicDes')}
                </Typography>
              </Box>
              <Box width={theme.unit * 8}>
                <ScopeQR color={'var(--color-text-secondary)'} />
              </Box>
            </ScopeOption>
          </Box>
        </Box>
        <Box marginBottom={12}>
          <Box display={'flex'} alignItems={'center'} marginBottom={2}>
            <Typography marginRight={0.5} variant={'h4'}>
              {t('labelLuckyTokenViewTypePrivate')}{' '}
            </Typography>
            <Tooltip title={t('labelRedPacketPrivateTooltip')}>
              <Box>
                <HelpIcon htmlColor={'var(--color-text-secondary)'} fontSize={'large'} />
              </Box>
            </Tooltip>
          </Box>
          <Box display={'flex'} justifyContent={'space-between'}>
            <ScopeOption
              onClick={() => onSelecteScope(sdk.LuckyTokenViewType.TARGET)}
              selected={selectedScope === sdk.LuckyTokenViewType.TARGET}
            >
              <Box marginRight={0.5}>
                <Typography>{t('labelRedPacketExclusive')}</Typography>
                <Typography color={'var(--color-text-secondary)'}>
                  {t('labelRedPacketExclusiveDes')}
                </Typography>
              </Box>
              <Box width={theme.unit * 8}>
                <ScopeTarget color={'var(--color-text-secondary)'} />
              </Box>
              

            </ScopeOption>
          </Box>
        </Box>
        <Box width={'100%'}>
          <BtnMain
            {...{
              defaultLabel: 'labelContinue',
              fullWidth: true,
              disabled: () => false,
              onClick: () => {
                onClickNext()
              },
            }}
          />
        </Box>
      </Box>
    )
  },
)

const TargetRedpacktOption = styled(Box)<{ selected: boolean }>`
  display: flex;
  border: 1px solid
    ${({ selected }) => (selected ? 'var(--color-border-select)' : 'var(--color-border)')};
  padding: ${({ theme }) => 2 * theme.unit}px;
  border-radius: ${({ theme }) => 0.5 * theme.unit}px;
  width: 31%;
  margin-right: 2%;
  margin-bottom: 2%;
  flex-direction: column;
  cursor: pointer;
`

export const TargetRedpacktSelectStep = withTranslation()(
  (props: TargetRedpacktSelectStepProps & WithTranslation) => {
    const {
      onClickCreateNew,
      targetRedPackets,
      onClickExclusiveRedpacket,
      onClickViewDetail,
      popRedPacket,
      onCloseRedpacketPop,
      backToScope,
      t,
    } = props
    const theme = useTheme()
    const { coinJson, isMobile } = useSettings()
    const { idIndex } = useTokenMap()
    const [showReceipts, setShowReceipts] = React.useState(false)

    return (
      <RedPacketBoxStyle
        height={'100%'}
        maxHeight={'480px'}
        justifyContent={'left'}
        width={'100%'}
        maxWidth={1152}
        paddingX={isMobile ? 2 : 5}
        position={'absolute'}
      >
        <Box width={'100%'}>
          <Typography marginTop={5} marginBottom={2}>
            {targetRedPackets.length === 0
              ? t('labelRedpacketExclusiveEmpty')
              : t('labelRedpacketExclusiveReady', { count: targetRedPackets.length })}
          </Typography>
          <Box display={'flex'} flexWrap={'wrap'}>
            {targetRedPackets &&
              targetRedPackets.map((redpacket) => (
                <TargetRedpacktOption
                  onClick={() => {
                    onClickExclusiveRedpacket(redpacket.hash)
                  }}
                  selected={false}
                >
                  <Box
                    display={'flex'}
                    marginBottom={1}
                    justifyContent={'space-between'}
                    alignItems={'start'}
                  >
                    <Box display={'flex'}>
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
                            tokenIcon={[coinJson[idIndex[redpacket.tokenId]]]}
                          />
                        </Box>
                      )}
                      <Box marginLeft={1}>
                        <Typography>
                          {redpacket.isNft
                            ? redpacket.nftTokenInfo?.metadata?.base.name
                            : idIndex[redpacket.tokenId]}
                        </Typography>
                        <Typography color={'var(--color-text-secondary)'}>
                          {redpacket.info.memo}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        onClickViewDetail(redpacket.hash)
                      }}
                      variant={'text'}
                    >
                      {t('labelRedPacketExclusiveViewDetails')}
                    </Button>
                  </Box>
                  <hr
                    style={{ background: 'var(--color-border)', border: 'none', height: '0.5px' }}
                  />
                  <Box
                    marginTop={1}
                    marginLeft={5}
                    display={'flex'}
                    justifyContent={'space-between'}
                  >
                    <Typography color={'var(--color-text-secondary)'}>
                      {t('labelRedpacketSentMaxLimit')}
                    </Typography>
                    <Typography color={'var(--color-text-secondary)'}>
                      {redpacket.tokenAmount.totalCount -
                        (redpacket.tokenAmount as any).remainTargetCount}{' '}
                      / {redpacket.tokenAmount.totalCount}
                    </Typography>
                  </Box>
                </TargetRedpacktOption>
              ))}
          </Box>
        </Box>

        <Box width={'100%'} marginTop={20} display={'flex'} justifyContent={'center'}>
          <Box width={'48%'} marginRight={'4%'}>
            <Button
              variant={'outlined'}
              size={'medium'}
              fullWidth
              className={'step'}
              startIcon={<BackIcon fontSize={'small'} />}
              color={'primary'}
              sx={{ height: 'var(--btn-medium-height)' }}
              onClick={() => {
                backToScope()
              }}
            >
              {t(`labelMintBack`)}
            </Button>
          </Box>
          <Box width={'48%'}>
            <BtnMain
              {...{
                defaultLabel: 'labelRedpacketCreateNew',
                fullWidth: true,
                disabled: () => false,
                onClick: () => {
                  onClickCreateNew()
                },
              }}
            />
          </Box>
        </Box>
        <Modal
          open={popRedPacket ? true : false}
          onClose={() => {
            onCloseRedpacketPop()
          }}
          content={
            <Box
              flex={1}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'space-between'}
              flexDirection={'column'}
              width={'var(--modal-width)'}
              padding={5}
              paddingTop={2}
            >
              {popRedPacket?.luckyToken!.isNft ? (
                <NftImageStyle
                  src={popRedPacket?.luckyToken.nftTokenInfo?.metadata?.imageSize['240-240']}
                  style={{
                    width: `${theme.unit * 8}px`,
                    height: `${theme.unit * 8}px`,
                    borderRadius: `${theme.unit * 0.5}px`,
                  }}
                />
              ) : (
                <Box width={theme.unit * 8} height={theme.unit * 8}>
                  <CoinIcons
                    size={theme.unit * 8}
                    type={TokenType.single}
                    tokenIcon={[coinJson[idIndex[popRedPacket?.tokenId ?? 0]]]}
                  />
                </Box>
              )}
              <Typography>20,000 LRC</Typography>
              <Box marginTop={4} width={'100%'} marginBottom={10}>
                {popRedPacket?.luckyToken.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX && (
                  <Box marginBottom={1} display={'flex'} justifyContent={'space-between'}>
                    <Typography color={'var(--color-text-secondary)'}>
                      {t('labelRedpacketGiftRedPacket')}
                    </Typography>
                    <Typography>{popRedPacket.luckyToken.tokenAmount.giftCount}</Typography>
                  </Box>
                )}
                <Box marginBottom={1} display={'flex'} justifyContent={'space-between'}>
                  <Typography color={'var(--color-text-secondary)'}>
                    {t('labelRedpacketRedPacketscount')}
                  </Typography>
                  <Typography>{popRedPacket?.luckyToken.tokenAmount.totalCount}</Typography>
                </Box>
                <Box marginBottom={1} display={'flex'} justifyContent={'space-between'}>
                  <Typography color={'var(--color-text-secondary)'}>
                    {t('labelBlindBoxStartTime')}
                  </Typography>
                  <Typography>
                    {moment(popRedPacket?.luckyToken.validSince).format(YEAR_DAY_MINUTE_FORMAT)}
                  </Typography>
                </Box>
                {popRedPacket?.luckyToken.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX && (
                  <Box marginBottom={1} display={'flex'} justifyContent={'space-between'}>
                    <Typography color={'var(--color-text-secondary)'}>
                      {t('labelRedpacketRevealTime')}
                    </Typography>
                    <Typography>
                      {moment(popRedPacket?.luckyToken.validUntil).format(YEAR_DAY_MINUTE_FORMAT)}
                    </Typography>
                  </Box>
                )}
                <Box marginBottom={1} display={'flex'} justifyContent={'space-between'}>
                  <Typography color={'var(--color-text-secondary)'}>
                    {popRedPacket?.luckyToken.info.memo}
                  </Typography>
                </Box>
              </Box>

              <Button
                onClick={() => {
                  setShowReceipts(true)
                }}
                sx={{ marginBottom: 2 }}
                variant={'text'}
              >
                {t('labelRedpacketRecipients')}
              </Button>
              <Button
                onClick={() => {
                  onCloseRedpacketPop()
                }}
                fullWidth
                variant={'contained'}
              >
                {t('labelClose')}
              </Button>
            </Box>
          }
        />
        <Modal
          open={popRedPacket && showReceipts ? true : false}
          onClose={() => {
            setShowReceipts(false)
          }}
          content={
            <Box
              flex={1}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'space-between'}
              flexDirection={'column'}
              width={'var(--modal-width)'}
              padding={5}
              paddingTop={2}
              paddingBottom={9}
            >
              <Typography variant={'h3'}>{t('labelRedpacketRecipientList')}</Typography>
              <Box
                borderRadius={1}
                bgcolor={'var(--field-opacity)'}
                marginTop={3}
                paddingX={3}
                paddingY={2}
                width={'100%'}
                height={362}
              >
                <Typography>{popRedPacket && (popRedPacket as any).targets.join('\n')}</Typography>
              </Box>
            </Box>
          }
        />
      </RedPacketBoxStyle>
    )
  },
)

const MultiLineInput = styled('textarea')`
  background: transparent;
  height: 150px;
  border: 1px solid var(--color-border);
  outline: none;
  color: var(--color-text-primary);
  padding: ${({theme}) => theme.unit * 1}px;
  border-radius: ${({theme}) => theme.unit * 0.5}px;
`

export const TargetRedpacktInputAddressStep = withTranslation()(
  (props: TargetRedpacktInputAddressStepProps & WithTranslation) => {
    const {
      contacts,
      isRedDot,
      addressListString,
      onChangeIsRedDot,
      onFileInput,
      onClickSend,
      onConfirm,
      onManualInputConfirm,
      showPopUpOption,
      t,
    } = props
    const theme = useTheme()
    const { isMobile } = useSettings()
    const [ showContactModal, setShowContactModal ] = React.useState(false)
    const [ showManualEditModal, setShowManualEditModal ] = React.useState(false)
    const [ manualEditStr, setManualEditStr ] = React.useState('')
    const [ selectedAddresses, setSelectedAddresses ] = React.useState([] as string[])
    const [ search, setSearch ] = React.useState('')
    const getValidAddresses = (input: string) => {
      return input.split(';').map(str => str.trim()).filter((str) => {
        return isAddress(str.trim())
      })
    }

    return (
      <RedPacketBoxStyle
        height={'100%'}
        maxHeight={'480px'}
        justifyContent={'left'}
        maxWidth={1152}
        paddingX={isMobile ? 2 : 5}
        position={'absolute'}
        width={'100%'}
      >
        <Modal
          open={showContactModal}
          onClose={() => {
            setShowContactModal(false)
          }}
          content={
            <Box
              display={'flex'}
              flexDirection={'column'}
              width={'var(--modal-width)'}
              padding={5}
              paddingTop={2}
            >
              <Typography marginBottom={3} variant={'h4'}>
                {t("labelRedpacketContactImport")}
              </Typography>
              <InputSearch
                onChange={(e) => {
                  setSearch(e as unknown as string)
                }}
                value={search}
              />
              <Box height={300} marginTop={2} marginBottom={2} overflow={'scroll'}>
                {contacts
                  ?.filter((contact) => {
                    return search
                      ? contact.address.toLowerCase().includes(search.toLowerCase()) ||
                          contact.name.toLowerCase().includes(search.toLowerCase())
                      : true
                  })
                  .map((contact) => {
                    return (
                      <Box
                        marginBottom={2}
                        key={contact.address}
                        display={'flex'}
                        alignItems={'start'}
                        justifyContent={'space-between'}
                      >
                        <Box display={'flex'}>
                          <Avatar sizes={'32px'} src={contact.avatarURL}></Avatar>
                          <Box marginLeft={1}>
                            <Typography>{contact.name}</Typography>
                            <Typography variant={'body2'}>{contact.address}</Typography>
                          </Box>
                        </Box>
                        <Checkbox
                          onChange={() => {
                            if (selectedAddresses.find((addr) => addr === contact.address)) {
                              setSelectedAddresses(
                                selectedAddresses.filter((addr) => addr !== contact.address),
                              )
                            } else {
                              setSelectedAddresses([...selectedAddresses, contact.address])
                            }
                          }}
                          checked={
                            selectedAddresses.find((addr) => addr === contact.address)
                              ? true
                              : false
                          }
                        />
                      </Box>
                    )
                  })}
              </Box>
              <Typography marginBottom={1}>{t("labelRedpacketExclusiveSelected", {count: selectedAddresses.length})}</Typography>
              <Box>
                <Button
                  onClick={() => {
                    onConfirm(selectedAddresses)
                    setShowContactModal(false)
                  }}
                  variant={'contained'}
                  fullWidth
                >
                  {t("labelConfirm")}
                </Button>
              </Box>
            </Box>
          }
        />
        <Modal
          open={showManualEditModal}
          onClose={() => {
            setShowManualEditModal(false)
          }}
          content={
            <Box
              display={'flex'}
              flexDirection={'column'}
              width={'var(--modal-width)'}
              padding={5}
              paddingTop={2}
            >
              <Typography marginBottom={3} variant={'h4'}>
                {t("labelRedpacketExclusiveManualEdit")}
              </Typography>
              <MultiLineInput
                onChange={(e) => {
                  setManualEditStr(e.currentTarget.value)
                }}
                value={manualEditStr}
              />

              <Box marginTop={3}>
                <Button
                  onClick={() => {
                    onManualInputConfirm(manualEditStr)
                    setShowManualEditModal(false)
                  }}
                  variant={'contained'}
                  fullWidth
                >
                  {t("labelConfirm")}
                </Button>
              </Box>
            </Box>
          }
        />

        <Typography marginTop={4} marginBottom={0.5}>
          {t('labelRedPacketExclusive')}
        </Typography>
        <Typography color={'var(--color-text-secondary)'}>
          {t('labelExclusiveWhitelistDes')}
        </Typography>
        <Box
          marginTop={3}
          marginX={4}
          borderRadius={1}
          paddingX={5}
          paddingY={3}
          border={'1px solid var(--color-border)'}
        >
          <Box overflow={'scroll'} display={'flex'} marginBottom={2}>
            <Typography width={'100%'} height={theme.unit * 30}>
              {addressListString &&
                getValidAddresses(addressListString).map((str) => (
                  <>
                    <Typography
                      color={isAddress(str) ? 'var(--color-text-primary)' : 'var(--color-error)'}
                      component={'span'}
                    >
                      {str}
                    </Typography>{' '}
                    ;<br />
                  </>
                ))}
            </Typography>
          </Box>
          <Box display={'flex'} justifyContent={'space-between'}>
            <Typography>{t("labelRedpacketValidAddresses", {count: getValidAddresses(addressListString).length})}</Typography>
            <Box>
              <Button
                onClick={(e) => {
                  setShowManualEditModal(true)
                  setManualEditStr(addressListString)
                }}
                variant={'outlined'}
                sx={{marginRight: 3.5}}
              >
                {t("labelRedpacketExclusiveManualEdit")}
              </Button>

              <FormControlLabel
                control={
                  <input
                    onChange={(e) => {
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        onFileInput(event.target?.result ? (event.target.result as string) : '')
                      }
                      e.currentTarget.files && reader.readAsText(e.currentTarget.files[0])
                    }}
                    style={{ display: 'none' }}
                    id='file-upload'
                    type='file'
                  />
                }
                label={
                  <Button
                    onClick={(e) => {
                      ;(e.currentTarget.parentNode as any).click()
                    }}
                    variant={'outlined'}
                  >
                    {t('labelRedpacketTextimport')}
                  </Button>
                }
              />
              <Button
                onClick={(e) => {
                  setSelectedAddresses([])
                  setShowContactModal(true)
                }}
                variant={'outlined'}
              >
                {t('labelRedpacketContactImport')}
              </Button>
            </Box>
          </Box>
        </Box>

        <Typography variant={'h5'} marginTop={5} marginBottom={1.5}>
          {t('labelRedpacketNotificationDisplay')}
        </Typography>
        <Box display={'flex'}>
          <Box width={'45%'} marginRight={'10%'}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isRedDot}
                  onChange={(_event: any, state: boolean) => {
                    onChangeIsRedDot(true)
                  }}
                  checkedIcon={<CheckedIcon />}
                  icon={<CheckBoxIcon />}
                  color='default'
                />
              }
              label={t('labelRedpacketBadge')}
            />
            <Box marginLeft={3}>
              <Typography marginBottom={3} color={'var(--color-text-secondary)'}>
                {t('labelRedpacketRedDotDes')}
              </Typography>
              <img width={260} src={SoursURL + 'images/target_option_red_dot.png'} />
            </Box>
          </Box>
          {showPopUpOption && <Box width={'45%'}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!isRedDot}
                  onChange={(_event: any, state: boolean) => {
                    onChangeIsRedDot(false)
                  }}
                  checkedIcon={<CheckedIcon />}
                  icon={<CheckBoxIcon />}
                  color='default'
                />
              }
              label={
                <Typography display={'flex'} alignItems={'center'}>
                  <Typography marginRight={0.5}>{t('labelRedpacketPopUp')}</Typography>{' '}
                  <Tooltip title={t('labelRedpacketPopUpTooltip')}>
                    <span>
                      <Info2Icon />
                    </span>
                  </Tooltip>{' '}
                </Typography>
              }
            />
            <Box marginLeft={3}>
              <Typography marginBottom={3} color={'var(--color-text-secondary)'}>
                {t('labelRedpacketPopPpDes')}
              </Typography>
              <img src={SoursURL + 'images/target_option_pop.png'} />
            </Box>
          </Box>}
        </Box>

        <Box marginTop={10} display={'flex'} justifyContent={'center'}>
          <Box width={'440px'} marginBottom={4}>
            <BtnMain
              {...{
                defaultLabel: 'labelRedpacketPrepareRedPacket',
                fullWidth: true,
                disabled: () => false,
                onClick: () => {
                  onClickSend()
                },
              }}
            />
          </Box>
        </Box>
      </RedPacketBoxStyle>
    )
  },
)
