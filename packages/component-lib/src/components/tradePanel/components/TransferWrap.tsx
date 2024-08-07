import { Trans, WithTranslation } from 'react-i18next'
import React from 'react'
import {
  Box,
  Checkbox,
  FormControlLabel as MuiFormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Typography,
} from '@mui/material'
import { bindHover } from 'material-ui-popup-state/es'
import { bindPopper, usePopupState } from 'material-ui-popup-state/hooks'
import {
  AddressError,
  AlertIcon,
  BackIcon,
  CheckBoxIcon,
  CheckedIcon,
  CloseIcon,
  ContactIcon,
  copyToClipBoard,
  DropDownIcon,
  EmptyValueTag,
  EXCHANGE_TYPE,
  FeeInfo,
  fontDefault,
  globalSetup,
  hexToRGB,
  IBData,
  Info2Icon,
  L1L2_NAME_DEFINED,
  LoadingIcon,
  MapChainId,
  myLog,
  NFTWholeINFO,
  TOAST_TIME,
  TradeBtnStatus,
  WALLET_TYPE,
} from '@loopring-web/common-resources'
import {
  Button,
  FeeSelect,
  GridWrapStyle,
  InputSize,
  TextField,
  Toast,
  ToastType,
} from '../../index'
import { PopoverPure } from '../../'
import { TransferViewProps } from './Interface'
import { BasicACoinTrade } from './BasicACoinTrade'
import { NFTInput } from './BasicANFTTrade'
import { useSettings } from '../../../stores'
import { TransferAddressType } from './AddressType'
import { useTheme } from '@emotion/react'

export const TransferWrap = <T extends IBData<I> & Partial<NFTWholeINFO>, I, C extends FeeInfo>({
  t,
  disabled,
  walletMap,
  tradeData,
  // @ts-ignore
  coinMap,
  transferI18nKey,
  type,
  memo,
  chargeFeeTokenList,
  activeAccountPrice,
  feeInfo,
  lastFailed,
  isFeeNotEnough,
  handleSureItsLayer2,
  handleFeeChange,
  isThumb,
  transferBtnStatus,
  addressDefault,
  handleOnAddressChange,
  sureItsLayer2,
  wait = globalSetup.wait,
  assetsData = [],
  realAddr,
  isLoopringAddress,
  addrStatus,
  handleConfirm,
  handleOnMemoChange,
  isAddressCheckLoading,
  isSameAddress,
  isSmartContractAddress,
  baseURL,
  isActiveAccount,
  isActiveAccountFee,
  feeWithActive,
  handleOnFeeWithActive,
  contact,
  isFromContact,
  onClickContact,
  loopringSmartWalletVersion,
  isENSWrong,
  ens,
  geUpdateContact,
  // addressType,
  ...rest
}: TransferViewProps<T, I, C> &
  WithTranslation & {
    assetsData: any[]
    handleConfirm: (index: number) => void
  }) => {
  const inputBtnRef = React.useRef()
  const { isMobile, defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]

  // addressType

  const inputButtonDefaultProps = {
    label: t('labelL2toL2EnterToken'),
    size: InputSize.middle,
  }

  const [showFeeModal, setShowFeeModal] = React.useState(false)

  const popupState = usePopupState({
    variant: 'popover',
    popupId: `popupId-transfer`,
  })

  const getDisabled = React.useMemo(() => {
    return disabled || transferBtnStatus === TradeBtnStatus.DISABLED
  }, [disabled, transferBtnStatus])

  const [copyToastOpen, setCopyToastOpen] = React.useState(false)
  const onCopy = React.useCallback(
    async (content: string) => {
      await copyToClipBoard(content)
      setCopyToastOpen(true)
    },
    [setCopyToastOpen],
  )
  const handleToggleChange = (value: C) => {
    if (handleFeeChange) {
      handleFeeChange(value)
    }
  }
  const isInvalidAddressOrENS =
    !isAddressCheckLoading &&
    addressDefault &&
    [AddressError.InvalidAddr, AddressError.IsNotLoopringContract].includes(addrStatus)
  const detectedWalletType =
    loopringSmartWalletVersion === undefined
      ? undefined
      : loopringSmartWalletVersion.isLoopringSmartWallet
      ? WALLET_TYPE.Loopring
      : isSmartContractAddress
      ? WALLET_TYPE.OtherSmart
      : WALLET_TYPE.EOA

  const isExchange = React.useMemo(() => {
    return !!(sureItsLayer2 && sureItsLayer2 in EXCHANGE_TYPE)
  }, [sureItsLayer2, sureItsLayer2])

  const isOtherSmartWallet = detectedWalletType === WALLET_TYPE.OtherSmart
  const theme = useTheme()
  myLog('transferWrap', realAddr)
  const view = React.useMemo(() => {
    if (isOtherSmartWallet && realAddr) {
      return (
        <Typography
          color={'var(--color-error)'}
          variant={'body2'}
          marginTop={1 / 4}
          alignSelf={'stretch'}
          position={'relative'}
        >
          {t('labelNotOtherSmartWallet', {
            loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
            l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
            ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          })}
        </Typography>
      )
    } else if (isInvalidAddressOrENS && addressDefault) {
      return (
        <Typography
          color={'var(--color-error)'}
          variant={'body2'}
          marginTop={1 / 4}
          alignSelf={'stretch'}
          position={'relative'}
        >
          {t(`labelL2toL2${addrStatus}`)}
        </Typography>
      )
    } else if (isExchange && addressDefault) {
      return (
        <Typography
          color={'var(--color-error)'}
          variant={'body2'}
          marginTop={1 / 4}
          alignSelf={'stretch'}
          position={'relative'}
        >
          {t('labelNotExchangeEOA', {
            layer2: L1L2_NAME_DEFINED[network].layer2,
            l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
            ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          })}
        </Typography>
      )
    } else if (isSameAddress && addressDefault) {
      return (
        <Typography
          color={'var(--color-error)'}
          variant={'body2'}
          marginTop={1 / 4}
          alignSelf={'stretch'}
          position={'relative'}
        >
          {t('labelInvalidisSameAddress', {
            way: t('labelL2toL2', {
              layer2: L1L2_NAME_DEFINED[network].layer2,
              l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            }),
          })}
        </Typography>
      )
    } else {
      return (
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
          {!isAddressCheckLoading &&
            addressDefault &&
            addrStatus === AddressError.NoError &&
            isActiveAccount === false && (
              <Box>
                {isActiveAccount === false && realAddr && (
                  <Typography
                    color={'var(--color-error)'}
                    lineHeight={1.2}
                    variant={'body2'}
                    marginTop={1 / 2}
                    marginLeft={'-2px'}
                    display={'inline-flex'}
                  >
                    <Trans
                      i18nKey={'labelL2toL2AddressNotLoopring'}
                      tOptions={{
                        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                      }}
                    >
                      <AlertIcon color={'inherit'} fontSize={'medium'} sx={{ marginRight: 1 }} />
                      This address does not have an activated Loopring L2. Please ensure the
                      recipient can access Loopring L2 before sending.
                    </Trans>
                  </Typography>
                )}
                {!isActiveAccountFee && realAddr ? (
                  <MuiFormControlLabel
                    sx={{
                      alignItems: 'flex-start',
                      marginTop: 1 / 2,
                    }}
                    control={
                      <Checkbox
                        checked={feeWithActive}
                        onChange={(_event: any, state: boolean) => {
                          handleOnFeeWithActive(state)
                        }}
                        checkedIcon={<CheckedIcon />}
                        icon={<CheckBoxIcon />}
                        color='default'
                      />
                    }
                    label={
                      <Typography
                        whiteSpace={'pre-line'}
                        component={'span'}
                        variant={'body1'}
                        display={'block'}
                        color={'textSecondary'}
                        paddingTop={1 / 2}
                      >
                        {t('labelL2toL2AddressFeeActiveFee', {
                          value: activeAccountPrice,
                          layer2: L1L2_NAME_DEFINED[network].layer2,
                          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                        })}
                      </Typography>
                    }
                  />
                ) : (
                  <></>
                )}
              </Box>
            )}
        </>
      )
    }
  }, [
    addressDefault,
    isActiveAccount,
    isActiveAccountFee,
    feeWithActive,
    addrStatus,
    realAddr,
    isAddressCheckLoading,
    activeAccountPrice,
    isInvalidAddressOrENS,
    isExchange,
    isOtherSmartWallet,
    isSameAddress,
    isLoopringAddress,
    isAddressCheckLoading,
  ])

  return (
    <GridWrapStyle
      className={'transfer-wrap'}
      container
      paddingLeft={isMobile ? 2 : 5 / 2}
      paddingRight={isMobile ? 2 : 5 / 2}
      direction={'column'}
      alignItems={'stretch'}
      flex={1}
      height={'100%'}
      minWidth={240}
      spacing={2}
      flexWrap={'nowrap'}
    >
      <Grid item>
        <Box
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'center'}
          alignItems={'center'}
          marginBottom={2}
        >
          <Typography
            component={'h4'}
            variant={isMobile ? 'h4' : 'h3'}
            whiteSpace={'pre'}
            marginRight={1}
          >
            {t('labelL2toL2Title', {
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            })}
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
          <Typography padding={2} maxWidth={450} variant={'body1'} whiteSpace={'pre-line'}>
            <Trans
              i18nKey='transferDescription'
              tOptions={{
                l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
                loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
              }}
            >
              Transfer to any valid Ethereum addresses instantly. Please make sure the recipient
              address accepts Loopring layer-2 payments before you proceed.
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

      <Grid item alignSelf={'stretch'} position={'relative'}>
        <TextField
          size={'large'}
          className={'text-address'}
          value={addressDefault}
          error={!!(isInvalidAddressOrENS || isSameAddress || isENSWrong)}
          label={t('labelL2toL2Address')}
          placeholder={t('labelL2toL2AddressInput')}
          onChange={(event) => handleOnAddressChange(event?.target?.value)}
          disabled={!chargeFeeTokenList.length}
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
                  paddingRight: '4px',
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
                  onClick={() => {
                    onClickContact()
                  }}
                >
                  <ContactIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Box marginLeft={1 / 2}>{view}</Box>
        {isENSWrong && (
          <>
            <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
              {ens}
            </Typography>
            <Button
              variant={'contained'}
              sx={{
                fontSize: fontDefault.body1,
                marginTop: 2,
                padding: 1,
                color: 'var(--color-text-button)',
                display: 'flex',
                alignItems: 'center',
                background: hexToRGB(theme.colorBase.warning, 0.2),
                textAlign: 'left',
                borderRadius: 2,
                height: 'auto',
                '&:hover': {
                  background: hexToRGB(theme.colorBase.warning, 0.3),
                },
              }}
              onClick={geUpdateContact}
              endIcon={<BackIcon fontSize={'large'} sx={{ transform: 'rotate(180deg)' }} />}
            >
              <Typography component={'span'} color={'inherit'} display={'inline-flex'}>
                <AlertIcon color={'warning'} sx={{ marginRight: 1 / 2, marginTop: '2px' }} />
                {t('labelContactENSAlert')}
              </Typography>
            </Button>
          </>
        )}
      </Grid>

      <Grid item alignSelf={'stretch'} position={'relative'}>
        <TransferAddressType
          detectedWalletType={detectedWalletType!}
          selectedValue={sureItsLayer2}
          handleSelected={handleSureItsLayer2}
          disabled={
            isSameAddress ||
            isAddressCheckLoading ||
            addrStatus !== AddressError.NoError ||
            !realAddr
          }
        />
      </Grid>

      <Grid item alignSelf={'stretch'} position={'relative'}>
        <TextField
          size={'large'}
          value={memo}
          label={t('labelL2toL2Memo')}
          placeholder={t('labelL2toL2MemoPlaceholder')}
          onChange={handleOnMemoChange}
          fullWidth={true}
        />
      </Grid>

      <Grid item alignSelf={'stretch'} position={'relative'}>
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

      <Grid item alignSelf={'stretch'} paddingBottom={0}>
        <Button
          fullWidth
          variant={'contained'}
          size={'medium'}
          color={'primary'}
          onClick={() => {
            handleConfirm(0)
          }}
          loading={!getDisabled && transferBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
          disabled={
            getDisabled ||
            transferBtnStatus === TradeBtnStatus.LOADING ||
            isExchange ||
            isOtherSmartWallet
          }
        >
          {t(transferI18nKey ?? `labelL2toL2Btn`)}
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
