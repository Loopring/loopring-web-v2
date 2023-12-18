import {
  Box,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  Tab,
  Tooltip,
  Typography,
  // TextField as MuiTextField,
} from '@mui/material'
import React from 'react'
import {
  Button,
  CardStyleItem,
  InputButtonProps,
  InputCoin,
  InputSearch,
  NftImageStyle,
  Tabs,
  TextField,
} from '../../basic-lib'
import { useTranslation, WithTranslation, withTranslation, Trans } from 'react-i18next'
import {
  BackIcon,
  CoinInfo,
  EmptyValueTag,
  FeeInfo,
  getValuePrecisionThousand,
  IBData,
  LuckyRedPacketItem,
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
  ScopeQR,
  ScopeTarget,
  isAddress,
  LuckyRedPacketList,
  myLog,
  BlindBoxIcon,
  NormalRedpacketIcon,
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
import { CoinIcons, FeeSelect, InitialNameAvatar, Modal } from '../../../components'
import { useTheme } from '@emotion/react'
import { useHistory } from 'react-router'
import { TFunction } from 'i18next'

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
    idIndex,
    selectNFTDisabled,
    redPacketConfig,
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
              tokenMap[tradeData?.belong as string] &&
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
              tokenMap[tradeData?.belong as string] &&
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
      ? redPacketConfig.timeRangeMaxInSecondsToken
      : redPacketConfig.timeRangeMaxInSecondsNFT
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
                  ? 'labelRedPacketSendAverageTitle'
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
    // handleOnDataChange,
    setActiveStep,
    backToScope,
    selectedType,
    disabled = false,
    btnInfo,
    onClickNext,
    showNFT,
    onSelecteValue,
    redPacketConfig,
    handleOnDataChange,
    t,
  }: Omit<CreateRedPacketViewProps<T, I, C>, 'tokenMap'> & {
    selectedType: LuckyRedPacketItem
    // setSelectType: (value: LuckyRedPacketItem) => void;
  } & WithTranslation) => {
    const { isMobile } = useSettings()
    const getDisabled = React.useMemo(() => {
      return disabled
    }, [disabled])
    const showERC20Blindbox = redPacketConfig.showERC20Blindbox

    const isTokens =
      (tradeType === RedPacketOrderType.BlindBox && !tradeData.isNFT) ||
      tradeType === RedPacketOrderType.TOKEN

    const setIsTokens = React.useCallback(
      (isTokens: boolean) => {
        myLog('isTokens', tradeData)
        myLog('isTokens', isTokens)
        if (tradeType === RedPacketOrderType.BlindBox) {
          handleOnDataChange({
            ...tradeData,
            isNFT: !isTokens,
          })
        } else {
          handleOnDataChange({
            ...tradeData,
            tradeType: isTokens ? RedPacketOrderType.TOKEN : RedPacketOrderType.NFT,
          })
        }
      },
      [tradeData],
    )

    const showList = LuckyRedPacketList.filter((item) =>
      tradeType === RedPacketOrderType.FromNFT
        ? tradeData.type?.mode === sdk.LuckyTokenClaimType.BLIND_BOX
          ? item.tags?.includes('showInBlindBox')
          : item.tags?.includes('showInNormal')
        : tradeType === RedPacketOrderType.BlindBox
        ? item.tags?.includes('showInBlindBox')
        : item.tags?.includes('showInNormal'),
    )

    const enabledList = LuckyRedPacketList.filter((item) =>
      tradeType === RedPacketOrderType.FromNFT
        ? tradeData.type?.mode === sdk.LuckyTokenClaimType.BLIND_BOX
          ? item.tags?.includes('enableInBlindBox')
          : item.tags?.includes('enableInNFTS')
        : tradeType === RedPacketOrderType.BlindBox
        ? item.tags?.includes('enableInBlindBox')
        : tradeType === RedPacketOrderType.TOKEN
        ? item.tags?.includes('enableInERC20')
        : item.tags?.includes('enableInNFTS'),
    ).filter((item) =>
      tradeData.type?.scope === sdk.LuckyTokenViewType.TARGET
        ? !item.tags?.includes('disabledForExclusive')
        : true,
    )
    return (
      <RedPacketBoxStyle
        className={isMobile ? 'mobile redPacket' : ''}
        justifyContent={'flex-start'}
        flexDirection={'column'}
        alignItems={'center'}
        width={'100%'}
        maxWidth={850}
      >
        <Box
          display={'flex'}
          flexDirection={'column'}
          alignItems={'stretch'}
          alignSelf={'stretch'}
          minHeight={300}
          paddingY={2}
          marginTop={2}
          marginBottom={5}
        >
          <Typography
            component={'h4'}
            variant={isMobile ? 'body1' : 'h4'}
            whiteSpace={'pre'}
            marginRight={1}
            marginBottom={2}
            display={'flex'}
            alignItems={'center'}
          >
            {t(
              selectedType.value.mode == sdk.LuckyTokenClaimType.BLIND_BOX
                ? 'labelLuckyBlindBox'
                : 'labelNormalRedPacketTitle',
            ) +
              ' — ' +
              t(`labelRedPacketViewType${tradeData?.type?.scope ?? 0}`)}
            {tradeType === RedPacketOrderType.BlindBox && (
              <Tooltip title={t('labelBlindBoxHint')}>
                <Box marginLeft={1} height={24}>
                  <HelpIcon htmlColor={'var(--color-text-secondary)'} fontSize={'large'} />
                </Box>
              </Tooltip>
            )}
          </Typography>

          {tradeType === RedPacketOrderType.FromNFT ? (
            <Tabs
              value={
                tradeData.type?.mode === sdk.LuckyTokenClaimType.BLIND_BOX ? 'BlindBox' : 'Normal'
              }
              onChange={(_event, value) => {
                handleOnDataChange({
                  ...tradeData,
                  type: {
                    ...tradeData.type,
                    mode:
                      value === 'Normal'
                        ? sdk.LuckyTokenClaimType.COMMON
                        : sdk.LuckyTokenClaimType.BLIND_BOX,
                  },
                })
              }}
              aria-label='l2-history-tabs'
              variant='scrollable'
            >
              <Tab sx={{ marginLeft: -2 }} value={'Normal'} label='Normal' />
              <Tab value={'BlindBox'} label='Blind Box' />
            </Tabs>
          ) : (
            <Tabs
              value={isTokens ? 'Tokens' : 'NFT'}
              onChange={(_event, value) => {
                setIsTokens(value === 'Tokens')
              }}
              aria-label='l2-history-tabs'
              variant='scrollable'
            >
              <Tab sx={{ marginLeft: -2 }} value={'Tokens'} label={t('labelAssetTokens')} />
              {tradeData.type?.scope !== sdk.LuckyTokenViewType.PUBLIC && (
                <Tab value={'NFT'} label={t('labelRedpacketNFTS')} />
              )}
            </Tabs>
          )}
          <Box display={'flex'} justifyContent={'space-between'} marginTop={2}>
            {showList.map((item: LuckyRedPacketItem, index) => {
              const enabled = enabledList.find((enableItem) => enableItem.value === item.value)
              return (
                <Box width={'31.5%'} key={index}>
                  <Box key={item.value.value} marginBottom={1}>
                    <MenuBtnStyled
                      variant={'outlined'}
                      size={'large'}
                      className={`${isMobile ? 'isMobile' : ''} ${
                        selectedType.value.value === item.value.value
                          ? 'selected redPacketType '
                          : 'redPacketType'
                      }`}
                      disabled={!enabled}
                      fullWidth
                      onClick={(_e) => {
                        onSelecteValue && onSelecteValue(item)
                      }}
                      sx={{
                        '&&&&': {
                          borderRadius: 2,
                        },
                        '&&&&.Mui-disabled': {
                          backgroundColor: 'transparent',
                          borderStyle: 'solid',
                          opacity: 0.25,
                        },
                      }}
                    >
                      <Typography
                        variant={'body1'}
                        display={'inline-flex'}
                        marginBottom={1 / 2}
                        alignItems={'flex-start'}
                        component={'span'}
                        color={'var(--color-text-primary)'}
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
                    </MenuBtnStyled>
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Box>

        <Box
          width={'100%'}
          alignSelf={'stretch'}
          paddingBottom={1}
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'center'}
        >
          <Box width={'33%'} marginRight={'2%'}>
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
          <Box width={'33%'}>
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
    // setActiveStep,
    disabled = false,
    btnInfo,
    onClickNext,
    onClickBack,
    showNFT,
    t,
    onChangeTradeType,
  }: Omit<CreateRedPacketViewProps<T, I, C>, 'tradeData' | 'tokenMap'> & WithTranslation) => {
    const { isMobile } = useSettings()
    const getDisabled = React.useMemo(() => {
      return disabled
    }, [disabled])
    const isNormal = tradeType === RedPacketOrderType.TOKEN || tradeType === RedPacketOrderType.NFT

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
        <Grid container spacing={7} justifyContent={'center'}>
          <Grid item xs={4} display={'flex'} marginBottom={2}>
            <CardStyleItem
              className={isNormal ? 'btnCard column selected' : 'btnCard column'}
              sx={{ height: '100%' }}
              onClick={() => onChangeTradeType!(RedPacketOrderType.TOKEN)}
            >
              <CardContent sx={{ alignItems: 'center', paddingTop: 4 }}>
                <Typography component={'span'} display={'inline-flex'}>
                  <NormalRedpacketIcon
                    htmlColor={'var(--color-text-primary)'}
                    style={{ width: 64, height: 64 }}
                  />
                </Typography>
                <Typography component={'span'} variant={'h5'} marginTop={2}>
                  {t('labelLuckyTokenNormal')}
                </Typography>
              </CardContent>
            </CardStyleItem>
          </Grid>
          <Grid item xs={4} display={'flex'} marginBottom={2}>
            <CardStyleItem
              className={
                tradeType === RedPacketOrderType.BlindBox
                  ? 'btnCard column selected'
                  : 'btnCard column'
              }
              sx={{ height: '100%' }}
              onClick={() => onChangeTradeType!(RedPacketOrderType.BlindBox)}
            >
              <CardContent sx={{ alignItems: 'center', paddingTop: 4 }}>
                <Typography component={'span'} display={'inline-flex'}>
                  <Typography component={'span'} display={'inline-flex'}>
                    <BlindBoxIcon
                      htmlColor={'var(--color-text-primary)'}
                      style={{ width: 64, height: 64 }}
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

const ScopeOption = styled(Box)<{ selected?: boolean; disabled?: boolean }>`
  display: flex;
  border: 1px solid
    ${({ selected }) => (selected ? 'var(--color-border-select)' : 'var(--color-border)')};
  padding: ${({ theme }) => 3 * theme.unit}px;
  border-radius: ${({ theme }) => theme.unit}px;
  width: 47%;
  cursor: ${({ disabled }) => (disabled ? '' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? '0.5' : '')};
`
type CreateRedPacketScopeProps = {
  selectedScope: sdk.LuckyTokenViewType
  onSelecteScope: (scope: sdk.LuckyTokenViewType) => void
  onClickNext: () => void
  palazaPublicDisabled: boolean
  exclusiveDisabled: boolean
  showBackBtn: boolean
  showExclusiveOption: boolean
}
export const CreateRedPacketScope = withTranslation()(
  ({
    selectedScope,
    onClickNext,
    onSelecteScope,
    palazaPublicDisabled,
    exclusiveDisabled,
    showBackBtn,
    showExclusiveOption,
    t,
  }: CreateRedPacketScopeProps & WithTranslation) => {
    const theme = useTheme()
    const history = useHistory()
    return (
      <Box
        width={'100%'}
        display={'flex'}
        flexDirection={'column'}
        paddingX={8}
        paddingTop={4}
        paddingBottom={8}
      >
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
            {/* {palazaPublicDisabled && ( */}
            <ScopeOption
              onClick={() => {
                !palazaPublicDisabled && onSelecteScope(sdk.LuckyTokenViewType.PUBLIC)
              }}
              selected={selectedScope === sdk.LuckyTokenViewType.PUBLIC}
              disabled={palazaPublicDisabled}
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
            </ScopeOption>
            {/* )} */}
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
        {showExclusiveOption && (
          <Box marginBottom={12}>
            <Box display={'flex'} alignItems={'center'} marginBottom={2}>
              <Typography marginRight={0.5} variant={'h4'}>
                {t('labelLuckyTokenViewTypePrivate')}{' '}
              </Typography>
              <Tooltip
                title={
                  <Trans
                    i18nKey={'labelRedPacketPrivateTooltip'}
                    components={{
                      p: (
                        <Typography
                          whiteSpace={'pre-line'}
                          component={'span'}
                          variant={'body1'}
                          display={'block'}
                          color={'textSecondary'}
                          paddingY={1}
                        />
                      ),
                      br: <br />,
                      li: (
                        <Typography
                          whiteSpace={'pre-line'}
                          component={'ol'}
                          display={'list-item'}
                          variant={'body1'}
                          color={'textSecondary'}
                        />
                      ),
                    }}
                  />
                }
              >
                <Box>
                  <HelpIcon htmlColor={'var(--color-text-secondary)'} fontSize={'large'} />
                </Box>
              </Tooltip>
            </Box>
            <Box display={'flex'} justifyContent={'space-between'}>
              <ScopeOption
                onClick={() => {
                  !exclusiveDisabled && onSelecteScope(sdk.LuckyTokenViewType.TARGET)
                }}
                selected={selectedScope === sdk.LuckyTokenViewType.TARGET}
                disabled={exclusiveDisabled}
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
        )}
        <Box display={'flex'} justifyContent={'center'} width={'100%'}>
          {showBackBtn && (
            <Box width={'45%'} marginRight={'5%'}>
              <Button
                variant={'outlined'}
                size={'medium'}
                fullWidth
                className={'step'}
                startIcon={<BackIcon fontSize={'small'} />}
                color={'primary'}
                sx={{ height: 'var(--btn-medium-height)' }}
                onClick={() => {
                  history.goBack()
                }}
              >
                {t(`labelMintBack`)}
              </Button>
            </Box>
          )}
          <Box width={'45%'}>
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

export const ReceiptListModal = (props: {
  open: boolean
  onClose: () => void
  targets: string[]
  t: TFunction<'translation', undefined>
}) => {
  const { open, t, onClose, targets } = props
  return (
    <Modal
      open={open}
      onClose={onClose}
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
          <Typography marginTop={0.5} color={'var(--color-text-secondary)'}>
            {t('labelRedPacketTotal', {
              count: targets.length,
            })}
          </Typography>

          {targets.length > 0 ? (
            <Box
              borderRadius={1}
              bgcolor={'var(--field-opacity)'}
              marginTop={3}
              paddingX={3}
              paddingY={2}
              width={'100%'}
              height={362}
              overflow={'scroll'}
            >
              <Typography>{targets.map((target) => target + ';').join('\n')}</Typography>
            </Box>
          ) : (
            <Box
              display={'flex'}
              width={'100%'}
              justifyContent={'center'}
              alignItems={'center'}
              flexDirection={'column'}
              height={362}
            >
              <img width={85} src={SoursURL + '/images/receipt_empty.png'} />
              <Typography textAlign={'center'} width={'50%'} marginTop={2.5} variant={'body2'}>
                {t('labelRedpacketreceiptListEmpty')}
              </Typography>
            </Box>
          )}
        </Box>
      }
    />
  )
}

export const TargetRedpacktSelectStep = withTranslation()(
  (props: TargetRedpacktSelectStepProps & WithTranslation) => {
    const {
      onClickCreateNew,
      targetRedPackets,
      onClickExclusiveRedpacket,
      onClickViewDetail,
      popRedPacket,
      popRedPacketAmountStr,
      onCloseRedpacketPop,
      backToScope,
      idIndex,
      t,
    } = props
    const theme = useTheme()
    const { coinJson, isMobile } = useSettings()
    const [showReceipts, setShowReceipts] = React.useState(false)
    // const [enlarged, setEnlarged] = React.useState(false)

    return (
      <RedPacketBoxStyle
        height={'100%'}
        maxHeight={'580px'}
        justifyContent={'left'}
        width={'100%'}
        maxWidth={1152}
        paddingX={isMobile ? 2 : 5}
        position={'absolute'}
        overflow={'scroll'}
      >
        <Box
          display={'flex'}
          alignItems={'center'}
          flexDirection={'column'}
          marginX={9}
          marginTop={2}
          padding={2.5}
          borderBottom={'1px solid var(--color-border)'}
          height={'216px'}
        >
          <Typography variant={'h4'} width={'100%'} marginBottom={7}>
            {t('labelTargetRedpacketOption1')}
          </Typography>
          <Button
            variant={'contained'}
            onClick={() => {
              onClickCreateNew()
            }}
          >
            {t('labelRedpacketCreateNew')}
          </Button>
        </Box>
        <Box
          // height={'290px'}
          marginX={9}
          marginTop={3}
          // bgcolor={'var(--color-global-bg)'}
          padding={2.5}
          // border={'1px solid var(--color-border)'}
          borderRadius={2}
          position={'relative'}
        >
          <Box display={'flex'} justifyContent={'space-between'} width={'100%'}>
            <Typography variant={'h4'} marginBottom={3}>
              {t('labelTargetRedpacketOption2')}{' '}
            </Typography>
            <Typography fontSize={'13px'} marginBottom={3}>
              {t('labelRedpacketExclusiveReady', { count: targetRedPackets.length })}
            </Typography>
          </Box>
          {targetRedPackets?.length > 0 ? (
            <Box width={'100%'}>
              <Box display={'flex'} flexWrap={'wrap'} maxHeight={'190px'}>
                {targetRedPackets &&
                  targetRedPackets
                    .filter((redpacket) => (redpacket.tokenAmount as any).remainTargetCount > 0)
                    .map((redpacket) => (
                      <TargetRedpacktOption
                        onClick={() => {
                          onClickExclusiveRedpacket({
                            hash: redpacket.hash,
                            remainCount: (redpacket.tokenAmount as any).remainTargetCount as number,
                          })
                        }}
                        selected={false}
                        key={redpacket.hash}
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
                            <Box width={'125px'} marginLeft={1} marginBottom={1}>
                              <Typography
                                textOverflow={'ellipsis'}
                                whiteSpace={'nowrap'}
                                overflow={'hidden'}
                              >
                                {redpacket.isNft
                                  ? redpacket.nftTokenInfo?.metadata?.base.name
                                  : idIndex[redpacket.tokenId]}
                              </Typography>
                              <Typography variant={'body2'} color={'var(--color-text-secondary)'}>
                                {redpacket.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX
                                  ? t('labelLuckyBlindBox')
                                  : redpacket.type.mode === sdk.LuckyTokenClaimType.RELAY
                                  ? t('labelRelayRedPacket')
                                  : redpacket.type.partition === sdk.LuckyTokenAmountType.RANDOM
                                  ? t('labelLuckyRedPacket')
                                  : t('labelNormalRedPacket')}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography
                            onClick={(e) => {
                              e.stopPropagation()
                              onClickViewDetail(redpacket.hash)
                            }}
                            color={'var(--color-primary)'}
                          >
                            {t('labelRedPacketExclusiveViewDetails')}
                          </Typography>
                        </Box>
                        <hr
                          style={{
                            background: 'var(--color-border)',
                            border: 'none',
                            height: '0.5px',
                          }}
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
          ) : (
            <Box
              display={'flex'}
              justifyContent={'center'}
              alignItems={'center'}
              flexDirection={'column'}
              width={'100%'}
            >
              <img
                height={160}
                width={160}
                src={SoursURL + '/images/exclusive_redpacket_empty.png'}
              />
              <Typography marginTop={-2.5} variant={'body2'} textAlign={'center'}>
                {t('labelTargetRedpacketNoRedpacket')}
              </Typography>
              <Typography width={'300px'} marginTop={1} variant={'body2'} textAlign={'center'}>
                {t('labelTargetRedpacketNoRedpacketDes')}
              </Typography>
            </Box>
          )}
        </Box>

        {/* <Box width={'100%'} marginTop={10} display={'flex'} justifyContent={'center'}>
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
        </Box> */}
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
              {popRedPacketAmountStr && <Typography>{popRedPacketAmountStr}</Typography>}
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
                <Box marginBottom={1} display={'flex'} justifyContent={'space-between'}>
                  <Typography color={'var(--color-text-secondary)'}>
                    {popRedPacket?.luckyToken.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX
                      ? t('labelRedpacketRevealTime')
                      : t('labelBlindBoxEndTime')}
                  </Typography>
                  <Typography>
                    {moment(popRedPacket?.luckyToken.validUntil).format(YEAR_DAY_MINUTE_FORMAT)}
                  </Typography>
                </Box>
                <Box marginBottom={1} display={'flex'} justifyContent={'space-between'}>
                  <Typography color={'var(--color-text-secondary)'}>
                    {t('labelRedpacketBestwishes')}
                  </Typography>
                  <Typography>{popRedPacket?.luckyToken.info.memo}</Typography>
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
                  popRedPacket &&
                    onClickExclusiveRedpacket({
                      hash: popRedPacket.hash,
                      remainCount: (popRedPacket?.luckyToken.tokenAmount as any)
                        .remainTargetCount as number,
                    })
                  onCloseRedpacketPop()
                }}
                fullWidth
                variant={'contained'}
              >
                {t('labelContinue')}
              </Button>
            </Box>
          }
        />
        <ReceiptListModal
          open={popRedPacket && showReceipts ? true : false}
          onClose={() => setShowReceipts(false)}
          t={t}
          targets={(popRedPacket && (popRedPacket as any).targets) ?? []}
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
  padding: ${({ theme }) => theme.unit * 1}px;
  border-radius: ${({ theme }) => theme.unit * 0.5}px;
  width: 100%;
  ::placeholder {
    color: var(--color-text-secondary);
    font-family: Roboto;
  }
`
const isAddressValid = (address: string, previousAddress: string[]) => {
  const existed = previousAddress.find(
    (existedAddress) => existedAddress.toLocaleLowerCase() === address.toLocaleLowerCase(),
  )
  return !existed && isAddress(address)
}
const getValidAddresses = (input: string, sentAddress: string[]) => {
  const addresses = input
    .split(';')
    .filter((str) => str.trim())
    .map((str) => str.trim())
  return addresses.filter((str, index) => {
    return isAddressValid(str, addresses.slice(0, index).concat(sentAddress))
  })
}
const getInvalidAddresses = (input: string, sentAddress: string[]) => {
  const addresses = input
    .split(';')
    .filter((str) => str.trim())
    .map((str) => str.trim())
  return addresses.filter((str, index) => {
    return !isAddressValid(str, addresses.slice(0, index).concat(sentAddress))
  })
}

export const TargetRedpacktInputAddressStep = withTranslation()(
  (props: TargetRedpacktInputAddressStepProps & WithTranslation) => {
    const {
      contacts,
      popupChecked,
      addressListString,
      onChangePopupChecked,
      onFileInput,
      onClickSend,
      onConfirm,
      onManualEditInput,
      popUpOptionDisabled,
      maximumTargetsLength,
      onClickBack,
      sentAddresses,
      clearInput,
      t,
    } = props
    const theme = useTheme()
    const { isMobile } = useSettings()
    const [showContactModal, setShowContactModal] = React.useState(false)
    const [showPopUpTips, setShowPopUpTips] = React.useState(false)
    const [inputDisabled, setInputDisabled] = React.useState(false)
    const [showChangeTips, setShowChangeTips] = React.useState<{
      previousInputType?: 'text' | 'contact' | 'edit'
      show: boolean
      confirmCallBack?: () => void
      contactImportCaches?: string[]
    }>({
      show: false,
    })
    const [showAddressReview, setShowAddressReview] = React.useState(false)
    const [selectedAddresses, setSelectedAddresses] = React.useState([] as string[])
    const [search, setSearch] = React.useState('')
    const overMaximum =
      getValidAddresses(addressListString, sentAddresses ?? []).length > maximumTargetsLength

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
                {t('labelRedpacketContactImport')}
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
                    return contact.contactAddress && contact.contactName && search
                      ? contact.contactAddress.toLowerCase().includes(search.toLowerCase()) ||
                          contact.contactName.toLowerCase().includes(search.toLowerCase())
                      : true
                  })
                  .map((contact) => {
                    return (
                      <Box
                        marginBottom={2}
                        key={contact.contactAddress}
                        display={'flex'}
                        alignItems={'start'}
                        justifyContent={'space-between'}
                      >
                        <Box display={'flex'}>
                          <InitialNameAvatar name={contact.contactName} />
                          <Box marginLeft={1}>
                            <Typography>{contact.contactName}</Typography>
                            <Typography variant={'body2'}>{contact.contactAddress}</Typography>
                          </Box>
                        </Box>
                        <Checkbox
                          onChange={() => {
                            const newSelectedAddresses = selectedAddresses.find(
                              (addr) => addr === contact.contactAddress,
                            )
                              ? selectedAddresses.filter((addr) => addr !== contact.contactAddress)
                              : [contact.contactAddress, ...selectedAddresses]
                            setSelectedAddresses(newSelectedAddresses)
                            // if (newSelectedAddresses.length <= maximumTargetsLength) {
                            //   setSelectedAddresses(newSelectedAddresses)
                            // }
                          }}
                          checked={
                            selectedAddresses.find((addr) => addr === contact.contactAddress)
                              ? true
                              : false
                          }
                        />
                      </Box>
                    )
                  })}
              </Box>
              <Typography marginBottom={1}>
                {t('labelRedpacketExclusiveSelected', { count: selectedAddresses.length })}
              </Typography>
              <Box>
                <Button
                  onClick={() => {
                    setShowChangeTips({
                      ...showChangeTips,
                      contactImportCaches: selectedAddresses,
                      previousInputType: 'contact',
                    })
                    setInputDisabled(true)
                    onConfirm(selectedAddresses)
                    setShowContactModal(false)
                  }}
                  variant={'contained'}
                  fullWidth
                  disabled={
                    selectedAddresses.length === 0 ||
                    selectedAddresses.length > maximumTargetsLength
                  }
                >
                  {selectedAddresses.length > maximumTargetsLength
                    ? t('labelRedPacketMaxValueExceeded')
                    : t('labelConfirm')}
                </Button>
              </Box>
            </Box>
          }
        />
        <Modal
          open={showPopUpTips}
          onClose={() => {
            setShowPopUpTips(false)
          }}
          content={
            <Box
              display={'flex'}
              flexDirection={'column'}
              width={'var(--modal-width)'}
              padding={5}
              paddingTop={2}
            >
              <Typography textAlign={'center'} marginBottom={3} variant={'h4'}>
                {t('labelRedpacketTips')}
              </Typography>
              <Typography marginBottom={3}>{t('labelRedpacketPopPpDes')}</Typography>

              <Box marginTop={3}>
                <Button
                  onClick={() => {
                    setShowPopUpTips(false)
                  }}
                  variant={'contained'}
                  fullWidth
                >
                  {t('labelConfirm')}
                </Button>
              </Box>
            </Box>
          }
        />
        <Modal
          open={showChangeTips.show}
          onClose={() => {
            setShowChangeTips({
              ...showChangeTips,
              show: false,
            })
          }}
          content={
            <Box
              display={'flex'}
              flexDirection={'column'}
              width={'var(--modal-width)'}
              padding={5}
              paddingTop={2}
            >
              <Typography textAlign={'center'} marginBottom={3} variant={'h4'}>
                {t('labelRedpacketTips')}
              </Typography>
              <Typography marginBottom={3}>{t('labelRedpacketChangeImportTips')}</Typography>

              <Box height={48} marginTop={3}>
                <Button
                  sx={{
                    width: '48%',
                    height: '100%',
                    marginRight: '4%',
                  }}
                  onClick={() => {
                    setShowChangeTips({
                      ...showChangeTips,
                      show: false,
                    })
                  }}
                  variant={'outlined'}
                >
                  {t('labelCancel')}
                </Button>
                <Button
                  sx={{
                    width: '48%',
                    height: '100%',
                  }}
                  onClick={() => {
                    showChangeTips.confirmCallBack && showChangeTips.confirmCallBack()
                  }}
                  variant={'contained'}
                >
                  {t('labelConfirm')}
                </Button>
              </Box>
            </Box>
          }
        />
        <Modal
          open={showAddressReview}
          onClose={() => {
            setShowAddressReview(false)
          }}
          content={
            <Box
              display={'flex'}
              flexDirection={'column'}
              width={'var(--modal-width)'}
              padding={5}
              paddingTop={2}
            >
              <Typography textAlign={'center'} marginBottom={3} variant={'h4'}>
                {t('labelRedpacketAddressesReview')}
              </Typography>
              <Box
                borderRadius={1}
                padding={1}
                border={'1px solid var(--color-border)'}
                overflow={'scroll'}
              >
                <Typography marginBottom={3} height={theme.unit * 20}>
                  {addressListString &&
                    addressListString
                      .split(';')
                      .filter((str) => str.trim())
                      .map((str, index) => (
                        <>
                          <Typography
                            color={
                              isAddressValid(
                                str.trim(),
                                addressListString
                                  .split(';')
                                  .filter((str) => str.trim())
                                  .slice(0, index)
                                  .concat(sentAddresses ?? []),
                              )
                                ? 'var(--color-text-primary)'
                                : 'var(--color-error)'
                            }
                            component={'span'}
                          >
                            {str}
                          </Typography>{' '}
                          ;<br />
                        </>
                      ))}

                  {/* This list contains 2 valid addresses, <Typography component={'span'} color={'var(--color-error)'}>1 invalid addresses</Typography>.  To proceed, invalid addresses will be automatically removed from the list. */}
                </Typography>
              </Box>
              <Typography marginTop={2} marginBottom={3}>
                {t('labelRedpacketAddressesReviewPart1', {
                  count: getValidAddresses(addressListString, sentAddresses ?? []).length,
                })}{' '}
                <Typography component={'span'} color={'var(--color-error)'}>
                  {t('labelRedpacketAddressesReviewPart2', {
                    count: getInvalidAddresses(addressListString, sentAddresses ?? []).length,
                  })}
                </Typography>
                {t('labelRedpacketAddressesReviewPart3')}
              </Typography>

              <Box height={48} marginTop={3}>
                <Button
                  sx={{
                    width: '48%',
                    height: '100%',
                    marginRight: '4%',
                  }}
                  onClick={() => {
                    setShowAddressReview(false)
                  }}
                  variant={'outlined'}
                >
                  {t('labelCancel')}
                </Button>
                <Button
                  sx={{
                    width: '48%',
                    height: '100%',
                  }}
                  onClick={() => {
                    setShowAddressReview(false)
                    setShowChangeTips({
                      ...showChangeTips,
                      contactImportCaches: undefined,
                      previousInputType: undefined,
                      confirmCallBack: undefined
                    })
                    onClickSend()
                  }}
                  variant={'contained'}
                >
                  {t('labelConfirm')}
                </Button>
              </Box>
              {/* <Box marginTop={3}>

              </Box> */}
            </Box>
          }
        />

        <Typography marginTop={4} marginBottom={0.5}>
          {t('labelRedPacketExclusive')}
        </Typography>
        <Typography color={'var(--color-text-secondary)'}>
          {t('labelExclusiveWhitelistDes')}
        </Typography>

        <Box marginTop={3} borderRadius={1} paddingRight={2}>
          <MultiLineInput
            disabled={inputDisabled}
            onInput={(e) => {
              setShowChangeTips({
                ...showChangeTips,
                previousInputType: 'edit',
              })
              onManualEditInput(e.currentTarget.value)
            }}
            value={addressListString}
            placeholder={`eg:0x60eEB5870ebEf49ce7cDc354dac49906CF8d9285;\n0xF61f3C9cEcB8d206DeA1faEd99A693e6d3BAAEf2;`}
          />
          <Box marginTop={2} display={'flex'} justifyContent={'space-between'}>
            <Box display={'flex'} alignItems={'center'}>
              <Typography
                color={
                  maximumTargetsLength -
                    getValidAddresses(addressListString, sentAddresses ?? []).length <
                  0
                    ? 'var(--color-error)'
                    : ''
                }
                marginRight={2}
              >
                {maximumTargetsLength -
                  getValidAddresses(addressListString, sentAddresses ?? []).length >=
                0
                  ? t('labelSendRedPacketMax', {
                      count:
                        maximumTargetsLength -
                        getValidAddresses(addressListString, sentAddresses ?? []).length,
                    })
                  : t('labelRedPacketMaxValueExceeded')}
              </Typography>
              {
                <Button
                  onClick={(_e) => {
                    onManualEditInput('')
                    setInputDisabled(false)
                    setShowChangeTips({
                      show: false,
                      previousInputType: undefined,
                    })
                  }}
                  variant={'outlined'}
                >
                  {t('labelSendRedPacketClear')}
                </Button>
              }
            </Box>

            <Box>
              <FormControlLabel
                control={
                  <input
                    onInput={(e) => {
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        setInputDisabled(true)
                        onFileInput(event.target?.result ? (event.target.result as string) : '')
                        setShowChangeTips({
                          ...showChangeTips,
                          previousInputType: 'text',
                        })
                      }
                      e.currentTarget.files && reader.readAsText(e.currentTarget.files[0])
                      e.currentTarget.value = ''
                    }}
                    style={{ display: 'none' }}
                    id='file-upload'
                    type='file'
                    accept='.txt'
                  />
                }
                label={
                  <Button
                    onClick={(e) => {
                      const parentNode = e.currentTarget.parentNode as any
                      if (
                        showChangeTips.previousInputType &&
                        showChangeTips.previousInputType !== 'text'
                      ) {
                        setShowChangeTips({
                          ...showChangeTips,
                          show: true,
                          confirmCallBack() {
                            setShowChangeTips((showChangeTips) => ({
                              ...showChangeTips,
                              show: false,
                            }))
                            parentNode.click()
                            onManualEditInput('')
                          },
                        })
                      } else {
                        parentNode.click()
                      }
                    }}
                    variant={'outlined'}
                  >
                    {t('labelRedpacketTextimport')}
                  </Button>
                }
              />
              <Button
                onClick={(_e) => {
                  if (
                    showChangeTips.previousInputType &&
                    showChangeTips.previousInputType !== 'contact'
                  ) {
                    setShowChangeTips({
                      ...showChangeTips,
                      show: true,
                      confirmCallBack() {
                        setShowChangeTips((showChangeTips) => ({
                          ...showChangeTips,
                          show: false,
                        }))
                        onManualEditInput('')
                        setSelectedAddresses([])
                        setShowContactModal(true)
                      },
                    })
                  } else {
                    setSelectedAddresses(showChangeTips.contactImportCaches ?? [])
                    setShowContactModal(true)
                  }
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
                  // checked={popupChecked}
                  checked
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
          <Box width={'45%'}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={popupChecked}
                  onChange={(_event: any, _state: boolean) => {
                    if (popUpOptionDisabled) {
                      setShowPopUpTips(true)
                    } else {
                      onChangePopupChecked(!popupChecked)
                    }
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
              <img width={300} src={SoursURL + 'images/target_option_pop.png'} />
            </Box>
          </Box>
        </Box>

        <Box marginTop={10} display={'flex'} justifyContent={'center'}>
          <Box width={'40%'} marginRight={'10%'} marginBottom={4}>
            <Button
              variant={'outlined'}
              size={'medium'}
              fullWidth
              className={'step'}
              startIcon={<BackIcon fontSize={'small'} />}
              color={'primary'}
              sx={{ height: 'var(--btn-medium-height)' }}
              onClick={() => {
                setShowChangeTips({ show: false })
                setInputDisabled(false)
                onClickBack()
                clearInput()
              }}
            >
              {t('labelMintBack')}
            </Button>
          </Box>
          <Box width={'40%'} marginBottom={4}>
            {overMaximum ? (
              <Button
                variant={'contained'}
                size={'medium'}
                fullWidth
                color={'primary'}
                sx={{ height: 'var(--btn-medium-height)' }}
                disabled
              >
                {t('labelRedPacketMaxValueExceeded')}
              </Button>
            ) : (
              <BtnMain
                {...{
                  defaultLabel: 'labelRedpacketPrepareRedPacket',
                  fullWidth: true,
                  disabled: () => {
                    return (
                      getValidAddresses(addressListString, sentAddresses ?? []).length === 0 ||
                      overMaximum
                    )
                  },
                  onClick: () => {
                    if (getInvalidAddresses(addressListString, sentAddresses ?? []).length > 0) {
                      setShowAddressReview(true)
                    } else {
                      setShowChangeTips({
                        ...showChangeTips,
                        contactImportCaches: undefined,
                        previousInputType: undefined,
                        confirmCallBack: undefined
                      })
                      onClickSend()
                    }
                  },
                }}
              />
            )}
          </Box>
        </Box>
      </RedPacketBoxStyle>
    )
  },
)
