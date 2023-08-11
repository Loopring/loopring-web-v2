import { Trans, WithTranslation } from 'react-i18next'
import React from 'react'
import { Grid, Link, Typography } from '@mui/material'
import {
  EmptyValueTag,
  FeeInfo,
  L1L2_NAME_DEFINED,
  MapChainId,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import { Button } from '../../basic-lib'
import { ResetViewProps } from './Interface'
import { useSettings } from '../../../stores'
import { FeeSelect } from '../../../components/modal'

export const ResetWrap = <T extends FeeInfo>({
  t,
  resetBtnStatus,
  onResetClick,
  isNewAccount = false,
  isFeeNotEnough,
  feeInfo,
  disabled = false,
  chargeFeeTokenList = [],
  goToDeposit,
  walletMap,
  isReset = false,
  handleFeeChange,
}: ResetViewProps<T> & WithTranslation) => {
  const [showFeeModal, setShowFeeModal] = React.useState(false)
  const { referralCode, setReferralCode } = useSettings()
  const [value, setValue] = React.useState(referralCode)
  const { isMobile, defaultNetwork } = useSettings()

  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const getDisabled = React.useMemo(() => {
    return disabled || resetBtnStatus === TradeBtnStatus.DISABLED
  }, [disabled, resetBtnStatus])

  const handleToggleChange = (value: T) => {
    if (handleFeeChange) {
      handleFeeChange(value)
    }
  }
  const onRefChange = (e: any) => {
    const regex = /^[0-9\b]+$/
    if (e?.target?.value === '' || regex.test(e?.target.value)) {
      setValue(e.target.value)
      if (e.target.value.length >= 5) {
        setReferralCode(e.target.value)
      }

      // searchParams.set('referralcode', e.target.value)
      // history.replace({ search: searchParams.toString() })
    }
  }

  return (
    <Grid
      container
      direction={'column'}
      justifyContent={'space-between'}
      alignItems={'center'}
      flex={1}
      paddingLeft={5 / 2}
      paddingRight={5 / 2}
      height={'100%'}
      minWidth={320}
    >
      <Grid item marginBottom={2}>
        <Typography
          component={'h4'}
          textAlign={'center'}
          variant={isMobile ? 'h4' : 'h3'}
          whiteSpace={'pre'}
          marginBottom={2}
        >
          {isNewAccount
            ? t('labelActiveAccountTitle', {
                loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              })
            : t('resetTitle', { layer2: L1L2_NAME_DEFINED[network].layer2 })}
        </Typography>
        <Typography component={'p'} variant='body1' color={'var(--color-text-secondary)'}>
          {isNewAccount
            ? t('labelActiveAccountDescription', {
                layer2: L1L2_NAME_DEFINED[network].layer2,
                l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
              })
            : t('labelResetDescription', {
                layer2: L1L2_NAME_DEFINED[network].layer2,
                l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
              })}
        </Typography>
      </Grid>

      <Grid item alignSelf={'stretch'} position={'relative'} marginTop={1}>
        {!chargeFeeTokenList?.length ? (
          <Typography>{t('labelFeeCalculating')}</Typography>
        ) : (
          <>

            <FeeSelect
              disableNoToken={true}
              chargeFeeTokenList={chargeFeeTokenList}
              handleToggleChange={(fee: FeeInfo) => {
                handleToggleChange(fee as T)
                setShowFeeModal(false)
              }}
              feeInfo={feeInfo}
              open={showFeeModal}
              onClose={() => {
                setShowFeeModal(false)
              }}
              middleContent={
                <>
                  {isNewAccount && feeInfo?.fee?.toString() == '0' ? (
                    <Typography color={'var(--color-success)'} marginLeft={1} component={'span'}>
                      {t('labelFriendsPayActivation', {
                        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                      })}
                    </Typography>
                  ) : (
                    ''
                  )}
                  {isNewAccount && (
                    <Typography
                      component={'span'}
                      display={'flex'}
                      alignItems={'center'}
                      variant={'body1'}
                      color={'var(--color-text-secondary)'}
                      marginTop={1}
                      marginBottom={1}
                    >
                      {t('labelYourBalance', {
                        balance:
                          walletMap && feeInfo && feeInfo.belong && walletMap[feeInfo.belong]
                            ? walletMap[feeInfo.belong]?.count + ' ' + feeInfo.belong
                            : EmptyValueTag + ' ' + (feeInfo && feeInfo?.belong),
                        layer2: L1L2_NAME_DEFINED[network].layer2,
                        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                      })}
                    </Typography>
                  )}
                </>
              }
              isFeeNotEnough={isFeeNotEnough && isFeeNotEnough.isFeeNotEnough}
              feeLoading={isFeeNotEnough && isFeeNotEnough.isOnLoading}
              onClickFee={() => setShowFeeModal((prev) => !prev)}
              feeNotEnoughContent={
                <Typography marginLeft={1} component={'span'} color={'var(--color-error)'}>
                  {isNewAccount && goToDeposit ? (
                    <Trans i18nKey={'labelActiveAccountFeeNotEnough'}>
                      Insufficient balance
                      <Link
                        onClick={() => {
                          goToDeposit()
                        }}
                        variant={'body2'}
                      >
                        Add assets
                      </Link>
                    </Trans>
                  ) : (
                    t('labelL2toL2FeeNotEnough')
                  )}
                </Typography>
              }
            />
          </>
        )}
      </Grid>
      {isNewAccount && !isReset && (
        <Grid item alignSelf={'stretch'} position={'relative'} marginTop={2}>
          <Tooltip title={t('labelReferralToolTip').toString()}>
            <Typography
              component={'span'}
              variant={'body1'}
              color={'textSecondary'}
              display={'inline-flex'}
              alignItems={'center'}
              marginBottom={1}
            >
              <Trans i18nKey={'labelReferralCode'}>
                Referral Code (Optional)
                <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
              </Trans>
            </Typography>
          </Tooltip>
          <TextField
            value={value}
            fullWidth
            variant={'outlined'}
            inputProps={{ maxLength: 10 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Typography
                    color={'var(--color-text-third)'}
                    variant={'body1'}
                    component={'span'}
                    paddingX={1 / 2}
                  >
                    #
                  </Typography>
                </InputAdornment>
              ),
            }}
            type={'text'}
            onChange={onRefChange}
            // onChange={(event) =>
            //   handleOnMetaChange({ name: event.target.value } as Partial<T>)
            // }
          />
        </Grid>
      )}

      <Grid item marginTop={4} alignSelf={'stretch'}>
        <Button
          fullWidth
          variant={'contained'}
          size={'medium'}
          color={'primary'}
          onClick={() => {
            if (onResetClick) {
              onResetClick({})
            }
          }}
          loading={!getDisabled && resetBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
          disabled={
            getDisabled ||
            resetBtnStatus === TradeBtnStatus.DISABLED ||
            resetBtnStatus === TradeBtnStatus.LOADING
          }
        >
          {isNewAccount ? t(`labelActiveAccountBtn`) : t(`resetLabelBtn`)}
        </Button>
      </Grid>
    </Grid>
  )
}
