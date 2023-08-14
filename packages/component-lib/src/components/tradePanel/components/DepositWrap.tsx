import {
  AccountStatus,
  AddressError,
  Bridge,
  CloseIcon,
  globalSetup,
  IBData,
  L1L2_NAME_DEFINED,
  LoadingIcon,
  MapChainId,
  SoursURL,
  TRADE_TYPE,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import { Trans, WithTranslation } from 'react-i18next'
import React from 'react'
import { Box, Grid, Link, Typography } from '@mui/material'
import { Button, DepositTitle, IconClearStyled, TextField, useSettings } from '../../../index'
import { DepositViewProps } from './Interface'
import { BasicACoinTrade } from './BasicACoinTrade'
import * as sdk from '@loopring-web/loopring-sdk'

export const DepositWrap = <
  T extends {
    accountReady?: AccountStatus
    toAddress?: string
    addressError?: { error: boolean; message?: string }
  } & IBData<I>,
  I,
>({
  t,
  disabled,
  walletMap,
  tradeData,
  coinMap,
  title,
  isHideDes,
  description,
  btnInfo,
  depositBtnStatus,
  accountReady,
  onDepositClick,
  isNewAccount,
  handleError,
  addressDefault,
  chargeFeeTokenList,
  onChangeEvent,
  handleClear,
  handleConfirm,
  isAllowInputToAddress,
  toIsAddressCheckLoading,
  // toIsLoopringAddress,
  realToAddress,
  isToAddressEditable,
  toAddressStatus,
  wait = globalSetup.wait,
  allowTrade,
  toAddress,
  handleAddressChange,
  ...rest
}: DepositViewProps<T, I> & {
  accountReady?: AccountStatus
  handleConfirm: (index: number) => void
} & WithTranslation) => {
  const inputBtnRef = React.useRef()
  let { feeChargeOrder, isMobile, defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const [minFee, setMinFee] = React.useState<{ minFee: string } | undefined>(undefined)
  const getDisabled = React.useMemo(() => {
    return disabled || depositBtnStatus === TradeBtnStatus.DISABLED
  }, [depositBtnStatus, disabled])

  const inputButtonDefaultProps = {
    label: t('depositLabelEnterToken'),
  }
  const isNewAlert = React.useMemo(() => {
    if (isNewAccount && chargeFeeTokenList && tradeData && tradeData.belong) {
      const index = chargeFeeTokenList?.findIndex(({ belong }) => belong === tradeData.belong)

      if (index === -1) {
        setMinFee(undefined)
        return (
          <Typography
            color={'var(--color-error)'}
            component={'p'}
            variant={'body1'}
            marginBottom={1}
          >
            {t('labelIsNotFeeToken', {
              l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
              symbol: chargeFeeTokenList.map((item) => item.belong ?? ''),
            })}
          </Typography>
        )
      }
      const Max = sdk
        .toBig(chargeFeeTokenList[index].fee.toString().replaceAll(sdk.SEP, ''))
        .times(4)
      setMinFee({
        minFee: t('labelMinFeeForActive', {
          symbol: tradeData.belong.toString(),
          fee: Max.toString(),
        }),
      })
      if (!tradeData?.tradeValue || Max.lte(tradeData.tradeValue ?? 0)) {
        return <></>
      } else {
        return (
          <>
            <Typography
              color={'var(--color-error)'}
              component={'p'}
              variant={'body1'}
              marginBottom={1}
            >
              {t('labelIsNotEnoughFeeToken', {
                symbol: tradeData.belong,
                fee: Max.toString(),
              })}
            </Typography>
          </>
        )
      }
    } else if (isNewAccount) {
      setMinFee(undefined)
      return (
        // <Typography color={"var(--color-text-secondary)"}>
        //   <Typography></Typography>
        //   <Typography></Typography>
        // </Typography>
        <Typography
          color={'var(--color-text-third)'}
          component={'p'}
          variant={'body1'}
          marginBottom={1}
        >
          {t('labelIsNotFeeToken', {
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
            ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            symbol: chargeFeeTokenList?.map((item) => item.belong ?? '') ?? feeChargeOrder,
          })}
        </Typography>
      )
    } else {
      return <></>
    }
  }, [isNewAccount, chargeFeeTokenList, tradeData, t, feeChargeOrder])

  return (
    <Grid
      className={walletMap ? 'depositWrap' : 'depositWrap loading'}
      container
      paddingTop={isMobile ? 1 : '0'}
      paddingLeft={5 / 2}
      paddingRight={5 / 2}
      direction={'column'}
      justifyContent={'space-between'}
      alignItems={'center'}
      flex={1}
      height={'100%'}
      minWidth={'220px'}
    >
      <DepositTitle title={title ? t(title) : undefined} isHideDes={isHideDes} />
      <Grid item marginTop={2} alignSelf={'stretch'}>
        <BasicACoinTrade
          {...{
            ...rest,
            t,
            type: TRADE_TYPE.TOKEN,
            disabled,
            onChangeEvent,
            walletMap,
            tradeData,
            coinMap,
            inputButtonDefaultProps,
            placeholderText: minFee?.minFee ? minFee.minFee : '0.00',
            inputBtnRef: inputBtnRef,
          }}
        />
        {isNewAccount && <>{isNewAlert}</>}
      </Grid>
      {isAllowInputToAddress ? (
        <Grid item marginTop={2} alignSelf={'stretch'} position={'relative'}>
          <Box display={isToAddressEditable ? 'inherit' : 'none'}>
            <TextField
              className={'text-address'}
              value={toAddress ?? ''}
              error={!!realToAddress && toAddressStatus !== AddressError.NoError}
              label={t('depositLabelTo')}
              disabled={!isToAddressEditable}
              placeholder={t('depositLabelPlaceholder')}
              onChange={(_event) => {
                handleAddressChange && handleAddressChange(_event.target.value)
              }}
              fullWidth={true}
            />
            {toAddress ? (
              toIsAddressCheckLoading ? (
                <LoadingIcon
                  width={24}
                  style={{ top: '32px', right: '8px', position: 'absolute' }}
                />
              ) : (
                isToAddressEditable && (
                  <IconClearStyled
                    color={'inherit'}
                    size={'small'}
                    style={{ top: '30px' }}
                    aria-label='Clear'
                    onClick={() => {
                      handleClear()
                    }}
                  >
                    <CloseIcon />
                  </IconClearStyled>
                )
              )
            ) : (
              ''
            )}

            <Box marginLeft={1 / 2}>
              {realToAddress && toAddressStatus !== AddressError.NoError ? (
                <Typography
                  color={'var(--color-error)'}
                  variant={'body2'}
                  marginTop={1 / 2}
                  alignSelf={'stretch'}
                  position={'relative'}
                >
                  {t('labelInvalidAddress')}
                </Typography>
              ) : toAddress && realToAddress && !toIsAddressCheckLoading ? (
                <Typography
                  color={'var(--color-text-primary)'}
                  variant={'body2'}
                  marginTop={1 / 2}
                  style={{ wordBreak: 'break-all' }}
                  whiteSpace={'pre-line'}
                >
                  {realToAddress}
                </Typography>
              ) : (
                <></>
              )}
            </Box>
          </Box>
          {!isToAddressEditable &&
            (!realToAddress ? (
              <Box>
                <Typography color={'var(--color-text-third)'} variant={'body1'}>
                  {t('labelBridgeSendTo')}
                </Typography>
                <Typography
                  display={'inline-flex'}
                  variant={tradeData.toAddress?.startsWith('0x') ? 'body2' : 'body1'}
                  style={{ wordBreak: 'break-all' }}
                  color={'textSecondary'}
                >
                  {tradeData.toAddress}
                </Typography>
              </Box>
            ) : toIsAddressCheckLoading ? (
              <Box display={'flex'} alignItems={'center'} justifyContent={'center'}>
                <img
                  className='loading-gif'
                  alt={'loading'}
                  width='36'
                  src={`${SoursURL}images/loading-line.gif`}
                />
              </Box>
            ) : realToAddress && toAddressStatus !== AddressError.NoError ? (
              <Typography variant={'body1'} color={'var(--color-warning)'}>
                {toAddressStatus === AddressError.ENSResolveFailed ? (
                  <>{t('labelENSShouldConnect')}</>
                ) : (
                  <Trans
                    i18nKey={'labelInvalidAddressClick'}
                    tOptions={{
                      way: t(`labelPayLoopringL2`, {
                        layer2: L1L2_NAME_DEFINED[network].layer2,
                        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                      }),
                      token: 'ERC20 ',
                    }}
                  >
                    Invalid Wallet Address, Pay Loopring L2 of ERC20 is disabled!
                    <Link
                      alignItems={'center'}
                      display={'inline-flex'}
                      href={Bridge}
                      target={'_blank'}
                      rel={'noopener noreferrer'}
                      color={'textSecondary'}
                    >
                      Click to input another receive address
                    </Link>
                    ,
                  </Trans>
                )}
              </Typography>
            ) : (
              <>
                <Box>
                  <Typography color={'var(--color-text-third)'} minWidth={40}>
                    {t('labelReceiveAddress')}
                  </Typography>
                  <Typography
                    display={'inline-flex'}
                    variant={'body2'}
                    style={{ wordBreak: 'break-all' }}
                    whiteSpace={'pre-line'}
                    color={'textSecondary'}
                  >
                    {realToAddress}
                  </Typography>
                </Box>
              </>
            ))}
        </Grid>
      ) : (
        <>

          {toAddress && toAddressStatus !== AddressError.NoError ? (
            <Typography variant={'body1'} color={'textSecondary'}>
              {toAddressStatus === AddressError.ENSResolveFailed ? (
                <>{t('labelENSShouldConnect')}</>
              ):toAddressStatus === AddressError.TimeOut?
                (<Trans
                  i18nKey={'labelTimeoutAddressClick'}
                  tOptions={{
                    layer2: L1L2_NAME_DEFINED[ network ].layer2,
                    l1ChainName: L1L2_NAME_DEFINED[ network ].l1ChainName,
                    loopringL2: L1L2_NAME_DEFINED[ network ].loopringL2,
                    l2Symbol: L1L2_NAME_DEFINED[ network ].l2Symbol,
                    l1Symbol: L1L2_NAME_DEFINED[ network ].l1Symbol,
                    ethereumL1: L1L2_NAME_DEFINED[ network ].ethereumL1,
                  }}
                  components={{
                    a: <Link
                      alignItems={'center'}
                      display={'inline-flex'}
                      target={'_blank'}
                      onClick={()=>{
                        handleAddressChange && handleAddressChange(toAddress??'')
                      }}
                      rel={'noopener noreferrer'}
                      color={'textPrimary'}
                    />
                  }}
                >
                  L1 Account checking request was rejected or some unknown error occurred, please
                  <a>Retry</a>

                </Trans>): (
                  <Trans
                    i18nKey={'labelInvalidAddressClick'}
                    tOptions={{
                      way: t(`labelPayLoopringL2`, {
                        layer2: L1L2_NAME_DEFINED[ network ].layer2,
                        l1ChainName: L1L2_NAME_DEFINED[ network ].l1ChainName,
                        loopringL2: L1L2_NAME_DEFINED[ network ].loopringL2,
                        l2Symbol: L1L2_NAME_DEFINED[ network ].l2Symbol,
                        l1Symbol: L1L2_NAME_DEFINED[ network ].l1Symbol,
                        ethereumL1: L1L2_NAME_DEFINED[ network ].ethereumL1,
                      }),
                      token: 'ERC20 ',
                    }}
                  >
                    Invalid Wallet Address, Pay Loopring L2 of ERC20 is disabled!
                    <Link
                      alignItems={'center'}
                      display={'inline-flex'}
                      href={Bridge}
                      target={'_blank'}
                      rel={'noopener noreferrer'}
                      color={'textSecondary'}
                    >
                      Click to input another receive address
                    </Link>
                    ,
                  </Trans>
                )}
            </Typography>
          ):<></>}
        </>
      )}

      <Grid item marginTop={2} alignSelf={'stretch'}>
        {tradeData.belong === 'ETH' && (
          <Typography
            color={'var(--color-warning)'}
            component={'p'}
            variant={'body1'}
            marginBottom={1}
          >
            {t('labelIsETHDepositAlert')}
          </Typography>
        )}
        <Button
          fullWidth
          variant={'contained'}
          size={'medium'}
          color={'primary'}
          onClick={() => {
            accountReady == AccountStatus.UN_CONNECT
              ? onDepositClick(tradeData)
              : handleConfirm && handleConfirm(0)
          }}
          loading={!getDisabled && depositBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
          disabled={getDisabled || depositBtnStatus === TradeBtnStatus.LOADING}
        >
          {btnInfo ? t(btnInfo.label, btnInfo.params) : t(`depositLabelBtn`)}
        </Button>
      </Grid>
    </Grid>
  )
}
