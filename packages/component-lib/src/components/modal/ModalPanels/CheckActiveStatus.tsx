import {
  EmptyValueTag,
  L1L2_NAME_DEFINED,
  MapChainId,
  RowConfig,
} from '@loopring-web/common-resources'
import { useTranslation } from 'react-i18next'
import { Box, Button, Typography } from '@mui/material'
import { useSettings } from '../../../stores'
import { CheckActiveStatusProps } from './Interface'
import { useTheme } from '@emotion/react'
import { DepositRecorder } from './DepositRecorder'
import styled from '@emotion/styled'

const BoxStyle = styled(Box)`
  .modalContent {
    .depositRecord {
      width: 100%;
      padding: 0 ${({ theme }) => theme.unit}px;
      background: initial;
    }
  }
`
export const CheckActiveStatus = ({
  account,
  goSend,
  goDisconnect,
  isFeeNotEnough,
  // isDepositing = false,
  walletMap,
  knowDisable,
  know,
  onIKnowClick,
  chainInfos,
  accAddress,
  clearDepositHash,
  chargeFeeTokenList = [],
  ...props
}: CheckActiveStatusProps) => {
  const { t } = useTranslation('common')
  const theme = useTheme()
  const { isMobile, defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]

  return (
    <BoxStyle
      flex={1}
      display={'flex'}
      alignItems={'center'}
      flexDirection={'column'}
      // paddingBottom={4}
      paddingBottom={4}
      width={'100%'}
    >
      {!know ? (
        <>
          <Typography
            component={'h3'}
            variant={isMobile ? 'h4' : 'h3'}
            whiteSpace={'pre'}
            marginBottom={3}
            marginTop={-1}
          >
            {t('labelActiveAccountTitle', {
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            })}
          </Typography>
          <Box
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'center'}
            flex={1}
            alignItems={'stretch'}
            alignSelf={'stretch'}
            className='modalContent'
            paddingX={5 / 2}
          >
            <>
              {chainInfos &&
              accAddress &&
              chainInfos?.depositHashes &&
              chainInfos?.depositHashes[accAddress] &&
              chainInfos?.depositHashes[accAddress].length &&
              clearDepositHash ? (
                <>
                  <Typography
                    variant={'body1'}
                    color={'var(--color-warning)'}
                    textAlign={'center'}
                    marginBottom={2}
                  >
                    {t('labelDepositWaiting')}
                  </Typography>
                  <DepositRecorder
                    {...({ ...props } as any)}
                    accAddress={accAddress}
                    chainInfos={chainInfos}
                    // clear={clearDepositHash}
                    t={t}
                  />
                  <Box marginTop={3}>
                    <Button
                      size={'large'}
                      variant={'contained'}
                      fullWidth
                      disabled={knowDisable}
                      onClick={onIKnowClick}
                    >
                      {t(
                        isFeeNotEnough.isFeeNotEnough
                          ? 'labelAddAssetGateBtn'
                          : 'labelActiveLayer2Btn',
                        {
                          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                        },
                      )}
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <Typography variant={'body1'} color={'textSecondary'} whiteSpace={'pre-line'}>
                    {t('labelBenefitL2', {
                      l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                      l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                      l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                      ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                    })}
                  </Typography>
                  <Box marginTop={3}>
                    <Button
                      size={'large'}
                      variant={'contained'}
                      fullWidth
                      disabled={knowDisable}
                      onClick={onIKnowClick}
                    >
                      {t('labelIKnow')}
                    </Button>
                  </Box>
                </>
              )}
            </>
          </Box>
        </>
      ) : (
        <>
          <Typography
            component={'h3'}
            variant={isMobile ? 'h4' : 'h3'}
            whiteSpace={'pre'}
            marginTop={-1}
          >
            {t('labelActiveAccountTitle', {
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            })}
          </Typography>
          <Box
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'center'}
            flex={1}
            alignItems={'stretch'}
            alignSelf={'stretch'}
            className='modalContent'
            paddingX={5 / 2}
          >
            {account.isContract ? (
              <>
                <Typography
                  component={'p'}
                  variant={'h5'}
                  color={'error'}
                  marginTop={1}
                  textAlign={'center'}
                >
                  {t('labelActivatedAccountNotSupport', {
                    l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                    loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                    l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                    l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                    ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                  })}
                </Typography>
                <Typography
                  component={'p'}
                  variant={'body1'}
                  color={'textPrimary'}
                  marginTop={1}
                  marginBottom={2}
                >
                  {t('labelActivatedAccountNotSupportDes', {
                    loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                    l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                    l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                    ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                  })}
                </Typography>
                <Button size={'large'} fullWidth onClick={goDisconnect} variant={'contained'}>
                  {t('labelDisconnect')}
                </Button>
              </>
            ) : (
              <>
                {isFeeNotEnough.isOnLoading ? (
                  <Typography
                    color={'var(--color-warning)'}
                    component={'p'}
                    variant={'body1'}
                    marginTop={2}
                  >
                    {t('labelFeeCalculating')}
                  </Typography>
                ) : isFeeNotEnough.isFeeNotEnough ? (
                  <></>
                ) : (
                  // <Typography
                  //   color={"var(--color-warning)"}
                  //   component={"p"}
                  //   variant={"body1"}
                  //   marginTop={2}
                  // >
                  //   {t("labelNotBalancePayForActive")}
                  // </Typography>
                  <Typography color={'textPrimary'} component={'p'} variant={'body1'} marginTop={2}>
                    {t('labelEnoughBalancePayForActive', {
                      l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                      l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                      l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                      ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                    })}
                  </Typography>
                )}
                <Typography
                  component={'p'}
                  variant={'body1'}
                  color={'textPrimary'}
                  marginTop={2}
                  marginBottom={1}
                >
                  {t('labelActivatedAccountChargeFeeList', {
                    loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                  })}
                </Typography>
                <Box marginTop={1}>
                  <Typography
                    height={RowConfig.rowHeight}
                    color={'var(--color-text-third)'}
                    display={'flex'}
                    textAlign={'center'}
                  >
                    <Typography
                      color={'inherit'}
                      variant={'inherit'}
                      width={'30%'}
                      textAlign={'left'}
                    >
                      {t('labelToken')}
                    </Typography>
                    <Typography color={'inherit'} variant={'inherit'} width={'30%'}>
                      {t('labelMinRequirement')}
                    </Typography>
                    <Typography color={'inherit'} variant={'inherit'} width={'40%'}>
                      {t('labelAvailability')}
                    </Typography>
                  </Typography>
                  {chargeFeeTokenList?.map((item, index) => (
                    <Typography
                      key={index + item.belong}
                      height={theme.unit * 4}
                      color={'textPrimary'}
                      display={'flex'}
                      textAlign={'center'}
                    >
                      <Typography
                        variant={'inherit'}
                        color={'inherit'}
                        width={'30%'}
                        textAlign={'left'}
                      >
                        {item.belong}
                      </Typography>
                      <Typography variant={'inherit'} color={'inherit'} width={'30%'}>
                        {item.fee}
                      </Typography>
                      <Typography variant={'inherit'} color={'inherit'} width={'40%'}>
                        {walletMap && walletMap[item.belong]
                          ? walletMap[item.belong].count
                          : EmptyValueTag}
                      </Typography>
                    </Typography>
                  ))}
                </Box>

                {isFeeNotEnough.isOnLoading ? (
                  <Typography
                    color={'var(--color-warning)'}
                    component={'p'}
                    variant={'body1'}
                    marginTop={2}
                  >
                    {t('labelFeeCalculating')}
                  </Typography>
                ) : (
                  isFeeNotEnough.isFeeNotEnough && (
                    <Typography
                      color={'var(--color-text-third)'}
                      component={'p'}
                      variant={'body2'}
                      marginTop={2}
                    >
                      {t('labelHaveInProcessingL1toL2', {
                        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                      })}
                    </Typography>
                  )
                )}
                <Box marginTop={1}>
                  <Button size={'large'} variant={'contained'} fullWidth onClick={goSend}>
                    {t('labelAddAssetGateBtn')}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </>
      )}
    </BoxStyle>
  )
}
