import { Trans, WithTranslation } from 'react-i18next'
import React, { useState } from 'react'
import { bindHover } from 'material-ui-popup-state/es'
import { bindPopper, usePopupState } from 'material-ui-popup-state/hooks'
import { Box, Grid, IconButton, InputAdornment, Typography } from '@mui/material'
import {
  AddressError,
  AssetsRawDataItem,
  CloseIcon,
  ContactIcon,
  copyToClipBoard,
  DropDownIcon,
  EmptyValueTag,
  FeeInfo,
  globalSetup,
  IBData,
  Info2Icon,
  L1L2_NAME_DEFINED,
  LoadingIcon,
  MapChainId,
  NFTWholeINFO,
  TOAST_TIME,
  TradeBtnStatus,
  WALLET_TYPE,
  WithdrawType,
} from '@loopring-web/common-resources'
import { FeeSelect, GridWrapStyle, InputSize, PopoverPure, Toast, ToastType } from '../..'
import { Button, TextField, useSettings } from '../../../index'
import { WithdrawViewProps } from './Interface'
import { BasicACoinTrade } from './BasicACoinTrade'
import { NFTInput } from './BasicANFTTrade'
import { FullAddressType } from './AddressType'
import * as sdk from '@loopring-web/loopring-sdk'

export const WithdrawWrap = <
  T extends IBData<I> | (NFTWholeINFO & IBData<I>),
  I,
  C extends FeeInfo,
>({
  t,
  title,
  disabled,
  walletMap,
  tradeData,
  coinMap,
  type,
  withdrawI18nKey,
  addressDefault,
  accAddr,
  isNotAvailableAddress,
  withdrawTypes = { [sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL]: 'Standard' },
  withdrawType,
  chargeFeeTokenList = [],
  feeInfo,
  lastFailed,
  handleConfirm,
  isFeeNotEnough,
  withdrawBtnStatus,
  handleFeeChange,
  handleWithdrawTypeChange,
  handleOnAddressChange,
  isAddressCheckLoading,
  isCFAddress,
  isLoopringAddress,
  isContractAddress,
  isFastWithdrawAmountLimit,
  addrStatus,
  disableWithdrawList = [],
  wait = globalSetup.wait,
  assetsData = [],
  realAddr,
  isThumb,
  baseURL,
  isToMyself = false,
  sureIsAllowAddress,
  handleSureIsAllowAddress,
  contact,
  isFromContact,
  onClickContact,
  loopringSmartWalletVersion,
  ...rest
}: WithdrawViewProps<T, I, C> &
  WithTranslation & {
    assetsData: AssetsRawDataItem[]
    handleConfirm: (index: number) => void
  }) => {
  const { isMobile, defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]

  const [dropdownStatus, setDropdownStatus] = React.useState<'up' | 'down'>('down')
  const popupState = usePopupState({
    variant: 'popover',
    popupId: `popupId-withdraw`,
  })

  const [copyToastOpen, setCopyToastOpen] = useState(false)
  const onCopy = React.useCallback(
    async (content: string) => {
      copyToClipBoard(content)
      setCopyToastOpen(true)
    },
    [setCopyToastOpen],
  )

  const inputBtnRef = React.useRef()

  const getDisabled = React.useMemo(() => {
    return disabled || withdrawBtnStatus === TradeBtnStatus.DISABLED
  }, [disabled, withdrawBtnStatus])
  const inputButtonDefaultProps = {
    label: t('labelL2toL1EnterToken'),
    // loading: isFeeNotEnough.isOnLoading,
  }

  const handleToggleChange = (value: C) => {
    if (handleFeeChange) {
      handleFeeChange(value)
    }
  }

  const _handleWithdrawTypeChange = React.useCallback(
    (e: WithdrawType) => {
      if (handleWithdrawTypeChange) {
        handleWithdrawTypeChange(e as any)
      }
    },
    [handleWithdrawTypeChange],
  )

  const isInvalidAddressOrENS =
    !isAddressCheckLoading && addressDefault && addrStatus === AddressError.InvalidAddr
  const allowToClickIsSure = React.useMemo(() => {
    return isAddressCheckLoading || addrStatus === AddressError.InvalidAddr || !realAddr
  }, [addrStatus, isAddressCheckLoading, realAddr])

  const label = React.useMemo(() => {
    if (withdrawI18nKey) {
      const key = withdrawI18nKey.split('|')
      return t(
        key[0],
        key && key[1]
          ? {
              arg: key[1],
              l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            }
          : {
              l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            },
      )
    } else {
      return t(
        (tradeData as NFTWholeINFO)?.isCounterFactualNFT &&
          (tradeData as NFTWholeINFO)?.deploymentStatus === 'NOT_DEPLOYED'
          ? `labelSendL1DeployBtn`
          : `labelSendL1Btn`,
        {
          layer2: L1L2_NAME_DEFINED[network].layer2,
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        },
      )
    }
  }, [t, tradeData, withdrawI18nKey])
  const detectedWalletType = loopringSmartWalletVersion?.isLoopringSmartWallet
    ? WALLET_TYPE.Loopring
    : isContractAddress
    ? WALLET_TYPE.OtherSmart
    : WALLET_TYPE.EOA

  return (
    <GridWrapStyle
      container
      paddingLeft={5 / 2}
      paddingRight={5 / 2}
      direction={'column'}
      justifyContent={'space-between'}
      alignItems={'center'}
      flex={1}
      minWidth={240}
      height={'100%'}
      flexWrap={'nowrap'}
      spacing={2}
    >
      <Grid item>
        <Box
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'center'}
          alignItems={'center'} /* marginBottom={2} */
        >
          <Typography
            component={'h4'}
            variant={isMobile ? 'h4' : 'h3'}
            whiteSpace={'pre'}
            marginRight={1}
          >
            {title
              ? title
              : (tradeData as NFTWholeINFO)?.isCounterFactualNFT &&
                (tradeData as NFTWholeINFO)?.deploymentStatus === 'NOT_DEPLOYED'
              ? t('labelL2ToL1DeployTitle', { l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol })
              : isToMyself
              ? t('labelL2ToMyL1Title', { l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol })
              : t('labelL2ToOtherL1Title', { l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol })}
          </Typography>
          <Info2Icon
            {...bindHover(popupState)}
            fontSize={'large'}
            htmlColor={'var(--color-text-third)'}
          />
        </Box>
        <PopoverPure
          className={'arrow-center'}
          {...bindPopper(popupState)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <Typography padding={2} maxWidth={490} variant={'body2'} whiteSpace={'pre-line'}>
            <Trans
              i18nKey='withdrawDescription'
              tOptions={{
                l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              }}
            >
              Your withdrawal will be processed in the next batch, which usually takes 30 minutes to
              2 hours. (There will be a large delay if the Ethereum gas price exceeds 500 GWei.）
            </Trans>
          </Typography>
        </PopoverPure>
      </Grid>

      <Grid item alignSelf={'stretch'} position={'relative'}>
        {type === 'NFT' ? (
          <NFTInput
            {...({
              ...rest,
              isThumb,
              type,
              onCopy,
              t,
              baseURL: baseURL ?? '',
              getIPFSString: rest.getIPFSString ?? (() => '' as any),
              disabled,
              walletMap,
              tradeData,
              coinMap,
              inputNFTDefaultProps: { label: '', size: InputSize.middle },
              inputNFTRef: inputBtnRef,
            } as any)}
          />
        ) : (
          <BasicACoinTrade
            {...{
              ...rest,
              type,
              t,
              disabled,
              walletMap,
              tradeData,
              coinMap,
              inputButtonDefaultProps,
              inputBtnRef: inputBtnRef,
            }}
          />
        )}
      </Grid>

      <Grid item alignSelf={'stretch'} position={'relative'} className={'address-wrap'}>
        {!isToMyself ? (
          <>
            <TextField
              size={'large'}
              className={'text-address'}
              value={addressDefault}
              error={!!(isNotAvailableAddress || isInvalidAddressOrENS)}
              placeholder={t('labelPleaseInputWalletAddress')}
              onChange={(event) => handleOnAddressChange(event?.target?.value)}
              label={t('labelL2toL1Address', {
                l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              })}
              SelectProps={{ IconComponent: DropDownIcon }}
              fullWidth={true}
              InputProps={{
                style: {
                  paddingRight: '0',
                },
                endAdornment: isFromContact ? undefined : (
                  <InputAdornment
                    style={{
                      cursor: 'pointer',
                      paddingRight: '0',
                    }}
                    position='end'
                  >
                    {addressDefault !== '' ? (
                      isAddressCheckLoading ? (
                        <LoadingIcon width={24} />
                      ) : (
                        <IconButton
                          color={'inherit'}
                          size={'small'}
                          aria-label='Clear'
                          onClick={() => handleOnAddressChange('')}
                        >
                          <CloseIcon />
                        </IconButton>
                      )
                    ) : (
                      ''
                    )}
                    <IconButton
                      color={'inherit'}
                      size={'large'}
                      aria-label='Clear'
                      onClick={() => {
                        onClickContact!()
                      }}
                    >
                      <ContactIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </>
        ) : (
          <Typography variant={'body2'} lineHeight={'20px'} color={'var(--color-text-third)'}>
            {t('labelL2toL1MyAddress', { l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol })}

            {!!isAddressCheckLoading && (
              <LoadingIcon width={24} style={{ top: 20, right: '8px', position: 'absolute' }} />
            )}
          </Typography>
        )}
        <Box marginLeft={1 / 2}>
          {isInvalidAddressOrENS ? (
            <Typography
              color={'var(--color-error)'}
              variant={'body2'}
              marginTop={1 / 4}
              alignSelf={'stretch'}
              position={'relative'}
            >
              {t('labelInvalidAddress')}
            </Typography>
          ) : isNotAvailableAddress ? (
            <Typography
              color={'var(--color-error)'}
              variant={'body2'}
              marginTop={1 / 4}
              alignSelf={'stretch'}
              position={'relative'}
            >
              {t(`labelInvalid${isNotAvailableAddress}`, {
                token: type === 'NFT' ? 'NFT' : tradeData.belong,
                way: t(`labelL2toL1`, {
                  layer2: L1L2_NAME_DEFINED[network].layer2,
                  l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                  loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                  l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                  l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                  ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                }),
              })}
            </Typography>
          ) : (
            <>
              {addressDefault && realAddr && !isAddressCheckLoading && (
                <Typography
                  color={'var(--color-text-primary)'}
                  variant={'body2'}
                  marginTop={1 / 4}
                  whiteSpace={'pre-line'}
                  style={{ wordBreak: 'break-all' }}
                >
                  {realAddr}
                </Typography>
              )}
            </>
          )}
        </Box>
      </Grid>
      {!isToMyself && (
        <Grid item alignSelf={'stretch'} position={'relative'} className={'address-type-wrap'}>
          <FullAddressType
            detectedWalletType={detectedWalletType}
            selectedValue={sureIsAllowAddress}
            handleSelected={handleSureIsAllowAddress}
            disabled={allowToClickIsSure}
          />
        </Grid>
      )}

      <Grid item alignSelf={'stretch'} position={'relative'} className={'fee-wrap'}>
        {!chargeFeeTokenList?.length ? (
          <Typography>{t('labelFeeCalculating')}</Typography>
        ) : (
          <>
            <FeeSelect
              chargeFeeTokenList={chargeFeeTokenList}
              handleToggleChange={(feeInfo) => {
                handleToggleChange(feeInfo as C)
                setDropdownStatus('down')
              }}
              feeInfo={feeInfo}
              open={dropdownStatus === 'up'}
              onClose={() => {
                setDropdownStatus('down')
              }}
              withdrawInfos={{
                types: withdrawTypes,
                type: withdrawType as any,
                onChangeType(w) {
                  _handleWithdrawTypeChange(w)
                },
              }}
              onClickFee={() => setDropdownStatus((prev) => (prev === 'up' ? 'down' : 'up'))}
              feeLoading={isFeeNotEnough.isOnLoading}
              isFeeNotEnough={isFeeNotEnough.isFeeNotEnough}
              isFastWithdrawAmountLimit={isFastWithdrawAmountLimit}
            />
          </>
        )}
      </Grid>

      <Grid item alignSelf={'stretch'} paddingBottom={0}>
        {lastFailed && (
          <Typography paddingBottom={1} textAlign={'center'} color={'var(--color-warning)'}>
            {t('labelConfirmAgainByFailedWithBalance', {
              symbol: type === 'NFT' ? 'NFT' : ` ${tradeData?.belong}` ?? EmptyValueTag,
              count: tradeData?.balance,
            })}
          </Typography>
        )}
        <Button
          fullWidth
          variant={'contained'}
          size={'medium'}
          color={'primary'}
          onClick={() => {
            handleConfirm(0)
            // onWithdrawClick(tradeData);
          }}
          loading={withdrawBtnStatus === TradeBtnStatus.LOADING && !getDisabled ? 'true' : 'false'}
          disabled={getDisabled || withdrawBtnStatus === TradeBtnStatus.LOADING}
        >
          {label}
        </Button>
      </Grid>
      <Toast
        alertText={t('labelCopyAddClip')}
        open={copyToastOpen}
        autoHideDuration={TOAST_TIME}
        onClose={() => {
          setCopyToastOpen(false)
        }}
        severity={ToastType.success}
      />
    </GridWrapStyle>
  )
}
