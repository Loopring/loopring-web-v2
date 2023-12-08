import {
  EmptyValueTag,
  IBData,
  L1L2_NAME_DEFINED,
  MapChainId,
  TokenType,
  TRADE_TYPE,
  TradeBtnStatus,
  VaultBorrowData,
} from '@loopring-web/common-resources'
import { VaultBorrowWrapProps } from './Interface'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSettings } from '../../../../stores'
import { Grid, Typography, Divider, Box } from '@mui/material'
import { BasicACoinTrade } from '../BasicACoinTrade'
import { ButtonStyle } from '../Styled'

export const VaultBorrowWrap = <
  T extends IBData<I> & { erc20Symbol: string },
  V extends VaultBorrowData<T>,
  I,
>({
  disabled,
  vaultBorrowBtnStatus,
  vaultBorrowBtnI18nKey,
  onVaultBorrowClick,
  tokenProps,
  onChangeEvent,
  vaultBorrowData,
  walletMap,
  tradeData,
  coinMap,
  propsExtends,
  ...rest
}: VaultBorrowWrapProps<T, I, V>) => {
  const inputBtnRef = React.useRef()
  const { t, i18n } = useTranslation()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]

  const getDisabled = () => {
    return disabled || vaultBorrowData === undefined || vaultBorrowData?.coinInfoMap === undefined
  }
  const inputButtonDefaultProps = {
    label: t('labelVaultBrowserToken'),
    subLabel: t('labelVaultMaxBrowserLabel'),
    tokenType: TokenType.vault,
    placeholderText: vaultBorrowData.minBorrowStr
      ? t('labelInvestMiniDual', {
          value: vaultBorrowData.minBorrowStr,
        })
      : '0.00',
    tokenImageKey: vaultBorrowData?.tradeData?.erc20Symbol,
  }
  const label = React.useMemo(() => {
    if (vaultBorrowBtnI18nKey) {
      const key = vaultBorrowBtnI18nKey.split('|')
      return t(
        key[0],
        key && key[1]
          ? {
              arg: key[1].toString(),
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
      return t(`labelVaultBorrowBtn`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      })
    }
  }, [vaultBorrowBtnI18nKey])

  return (
    <Box
      className={vaultBorrowData ? '' : 'loading'}
      flexDirection={'column'}
      justifyContent={'space-between'}
      alignItems={'center'}
      flex={1}
      display={'flex'}
      height={'100%'}
    >
      <Box
        flexDirection={'column'}
        display={'flex'}
        alignSelf={'stretch'}
        alignItems={'stretch'}
        // borderBottom={'1px solid var(--color-border)'}
      >
        <BasicACoinTrade
          {...{
            ...rest,
            type: TRADE_TYPE.TOKEN,
            t,
            i18n,
            tReady: true,
            disabled,
            onChangeEvent,
            walletMap,
            tradeData,
            coinMap,
            inputButtonDefaultProps,
            ...tokenProps,
            inputBtnRef,
          }}
        />
      </Box>
      {/*<Divider sx={{ width: '100%', marginY: 3 }} />*/}
      <Grid container spacing={1} alignItems={'stretch'}>
        <Grid
          item
          xs={12}
          direction={'row'}
          display={'flex'}
          marginBottom={1}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <Typography
            component={'p'}
            variant='body2'
            color={'textSecondary'}
            display={'inline-flex'}
            alignItems={'center'}
          >
            {t('labelVaultBorrowed')}
          </Typography>
          <Typography component={'p'} variant='body2' color={'textPrimary'}>
            {vaultBorrowData.borrowedAmt
              ? vaultBorrowData.borrowedStr + ' ' + vaultBorrowData?.belong?.toString()
              : EmptyValueTag}
          </Typography>
        </Grid>
      </Grid>

      <Box
        marginTop={3}
        alignSelf={'stretch'}
        display={'flex'}
        flexDirection={'column'}
        alignItems={'stretch'}
      >
        <ButtonStyle
          variant={'contained'}
          size={'large'}
          color={'primary'}
          onClick={() => {
            onVaultBorrowClick()
          }}
          loading={
            !getDisabled() && vaultBorrowBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'
          }
          disabled={
            getDisabled() ||
            vaultBorrowBtnStatus === TradeBtnStatus.DISABLED ||
            vaultBorrowBtnStatus === TradeBtnStatus.LOADING
          }
          fullWidth={true}
        >
          {label}
        </ButtonStyle>
      </Box>
    </Box>
  )
}
