import { FeeInfo, TradeBtnStatus, TradeNFT } from '@loopring-web/common-resources'
import { NFTDeployViewProps } from './Interface'
import { useTranslation } from 'react-i18next'
import React from 'react'
import { Box, Grid, Link, Toolbar, Typography } from '@mui/material'
import { Button, ModalBackButton } from '../../basic-lib'
import { FeeSelect } from '../../../components/modal'

export const DeployNFTWrap = <
  T extends TradeNFT<I, any> & { broker: string },
  I,
  C extends FeeInfo,
>({
  tradeData,
  title,
  btnInfo,
  nftDeployBtnStatus,
  onNFTDeployClick,
  chargeFeeTokenList = [],
  feeInfo,
  disabled,
  isFeeNotEnough,
  handleFeeChange,
  onBack,
  assetsData = [],
}: NFTDeployViewProps<T, I, C>) => {
  const { t } = useTranslation(['common'])
  const [showFeeModal, setShowFeeModal] = React.useState(false)

  const getDisabled = React.useMemo(() => {
    if (disabled || nftDeployBtnStatus === TradeBtnStatus.DISABLED) {
      return true
    } else {
      return false
    }
  }, [nftDeployBtnStatus, disabled])

  const handleToggleChange = (value: C) => {
    if (handleFeeChange) {
      handleFeeChange(value)
    }
  }
  // @ts-ignore
  return (
    <Box flex={1}>
      {!!onBack && (
        <Toolbar variant={'dense'}>
          <ModalBackButton marginTop={0} marginLeft={-2} onBack={onBack} t={t} />
        </Toolbar>
      )}
      <Box flex={1}>
        <Grid
          className={assetsData ? '' : 'loading'}
          paddingBottom={3}
          container
          marginTop={0}
          paddingLeft={5 / 2}
          paddingRight={5 / 2}
          direction={'column'}
          justifyContent={'space-between'}
          alignItems={'center'}
          flex={1}
          height={'100%'}
        >
          <Grid item>
            <Box
              display={'flex'}
              flexDirection={'row'}
              justifyContent={'center'}
              alignItems={'center'}
              /* textAlign={'center'} */ marginBottom={2}
            >
              <Typography component={'h4'} variant={'h3'} marginRight={1}>
                {title ? title : t('nftDeployTitle')}
              </Typography>
            </Box>
          </Grid>

          <Grid item marginTop={2} alignSelf={'stretch'}>
            <Box
              display={'flex'}
              alignItems={'flex-start'}
              justifyContent={'space-between'}
              position={'relative'}
              flexDirection={'column'}
            >
              <Typography component={'h6'} color={'text.primary'} variant={'h4'}>
                {t('labelNFTDetail')}
              </Typography>
              {/*<Typography*/}
              {/*  display={"inline-flex"}*/}
              {/*  variant={"body1"}*/}
              {/*  marginTop={2}*/}
              {/*>*/}
              {/*  <Typography color={"var(--color-text-third)"} width={160}>*/}
              {/*    {t("labelNFTName")}*/}
              {/*  </Typography>*/}
              {/*  <Typography*/}
              {/*    color={"var(--color-text-third)"}*/}
              {/*    title={tradeData?.name}*/}
              {/*  >*/}
              {/*    {tradeData?.name}*/}
              {/*  </Typography>*/}
              {/*</Typography>*/}

              {/*<Typography*/}
              {/*  display={"inline-flex"}*/}
              {/*  variant={"body1"}*/}
              {/*  marginTop={2}*/}
              {/*>*/}
              {/*  <Typography color={"var(--color-text-third)"} width={160}>*/}
              {/*    {t("labelNFTID")}*/}
              {/*  </Typography>*/}
              {/*  <Typography*/}
              {/*    color={"var(--color-text-third)"}*/}
              {/*    maxWidth={300}*/}
              {/*    title={tradeData?.nftId}*/}
              {/*  >*/}
              {/*    {tradeData?.nftIdView ?? ""}*/}
              {/*  </Typography>*/}
              {/*</Typography>*/}
              <Typography display={'inline-flex'} variant={'body1'} marginTop={2}>
                <Typography color={'var(--color-text-third)'} width={160}>
                  {t('labelNFTTYPE')}
                </Typography>
                <Typography color={'var(--color-text-third)'} title={tradeData?.nftType}>
                  {tradeData.nftType}
                </Typography>
              </Typography>
              <Typography display={'inline-flex'} variant={'body1'} marginTop={2}>
                <Typography color={'var(--color-text-third)'} width={160}>
                  {t('labelNFTContractAddress')}
                </Typography>
                <Link
                  fontSize={'inherit'}
                  whiteSpace={'break-spaces'}
                  style={{ wordBreak: 'break-all' }}
                >
                  {tradeData.tokenAddress}
                </Link>
              </Typography>
              <Typography display={'inline-flex'} variant={'body1'} marginTop={2}>
                <Typography color={'var(--color-text-third)'} width={160}>
                  {t('labelNFTDeployBroker')}
                </Typography>
                <Link
                  fontSize={'inherit'}
                  whiteSpace={'break-spaces'}
                  style={{ wordBreak: 'break-all' }}
                >
                  {tradeData.broker}
                </Link>
              </Typography>
            </Box>
          </Grid>
          <Grid item alignSelf={'stretch'} position={'relative'} marginTop={2}>
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
          <Grid item marginTop={3} alignSelf={'stretch'}>
            <Button
              fullWidth
              variant={'contained'}
              size={'medium'}
              color={'primary'}
              onClick={() => {
                onNFTDeployClick(tradeData)
              }}
              loading={
                !getDisabled && nftDeployBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'
              }
              disabled={getDisabled || nftDeployBtnStatus === TradeBtnStatus.LOADING}
            >
              {btnInfo ? t(btnInfo.label, btnInfo.params) : t(`labelNFTDeployBtn`)}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
