import { useHistory } from 'react-router-dom'

import { Box, Container, Typography, Grid, Modal } from '@mui/material'
import React from 'react'
import {
  ConvertToIcon,
  CloseOutIcon,
  LoadIcon,
  MarginIcon,
  MarginLevelIcon,
  VaultTradeIcon,
  PriceTag,
  CurrencyToTag,
  HiddenTag,
  getValuePrecisionThousand,
  EmptyValueTag,
  YEAR_DAY_MINUTE_FORMAT,
  VaultAction,
  L1L2_NAME_DEFINED,
  MapChainId,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import {
  AssetTitleMobile,
  MenuBtnStyled,
  ModalCloseButtonPosition,
  useSettings,
  VaultAssetsTable,
} from '@loopring-web/component-lib'
import { useTranslation, Trans } from 'react-i18next'
import { useSystem, VaultAccountInfoStatus, ViewAccountTemplate } from '@loopring-web/core'
import { useGetVaultAssets } from './hook'
import moment from 'moment'
import { HistoryPanel } from '../../AssetPage/HistoryPanel'
import { AssetPanel } from '../../AssetPage/AssetPanel'

export const VaultDashBoardPanel = ({
  vaultAccountInfo: _vaultAccountInfo,
}: {
  vaultAccountInfo: VaultAccountInfoStatus
}) => {
  const { vaultAccountInfo } = _vaultAccountInfo
  const { t } = useTranslation()
  const history = useHistory()

  const { forexMap } = useSystem()
  const { isMobile, currency, hideL2Assets: hideAssets, defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]

  const priceTag = PriceTag[CurrencyToTag[currency]]
  const {
    onActionBtnClick,
    dialogBtn,
    showNoVaultAccount,
    setShowNoVaultAccount,
    whichBtn,
    btnProps,
    onBtnClose,
    ...assetPanelProps
  } = useGetVaultAssets({ vaultAccountInfo: _vaultAccountInfo })
  const colors = ['var(--color-success)', 'var(--color-error)', 'var(--color-warning)']
  const profitUI = React.useMemo(() => {
    const profit = sdk
      .toBig(vaultAccountInfo?.totalEquityOfUsdt ?? 0)
      .minus(vaultAccountInfo?.totalCollateralOfUsdt ?? 0)
      .times(forexMap[currency] ?? 0)
    const colorIs = profit.gte(0) ? 0 : 1

    return (
      <>
        {vaultAccountInfo?.accountStatus == sdk.VaultAccountStatus.IN_STAKING ? (
          <>
            <Typography
              component={'span'}
              display={'inline-flex'}
              variant={'body1'}
              color={'textPrimary'}
            >
              {hideAssets
                ? HiddenTag
                : PriceTag[CurrencyToTag[currency]] +
                  getValuePrecisionThousand(profit.toString(), 2, 2, 2, false, {
                    isFait: false,
                    floor: true,
                  })}
            </Typography>
            <Typography
              component={'span'}
              display={'inline-flex'}
              variant={'body1'}
              marginLeft={1 / 2}
              color={colors[colorIs]}
            >
              {getValuePrecisionThousand(
                profit.div(vaultAccountInfo?.totalCollateralOfUsdt ?? 1).times(100),
                4,
                4,
                4,
                false,
                {
                  isFait: false,
                  floor: true,
                },
              )}
              %
            </Typography>
          </>
        ) : (
          EmptyValueTag
        )}
      </>
    )
  }, [hideAssets, vaultAccountInfo?.totalEquityOfUsdt, vaultAccountInfo?.accountStatus])
  const marginUI = React.useMemo(() => {
    const colorIs = sdk.toBig('1.5').gte(vaultAccountInfo?.marginLevel ?? 0)
      ? 1
      : sdk.toBig('1.3').gte(vaultAccountInfo?.marginLevel ?? 0)
      ? 3
      : 0
    return (
      <>
        {vaultAccountInfo?.marginLevel ? (
          <Typography
            component={'span'}
            display={'inline-flex'}
            alignItems={'center'}
            marginTop={1}
            variant={'body1'}
            color={colors[colorIs]}
          >
            <MarginLevelIcon sx={{ marginRight: 1 / 2 }} />
            {vaultAccountInfo?.marginLevel}
          </Typography>
        ) : (
          <Typography
            component={'span'}
            display={'inline-flex'}
            alignItems={'center'}
            marginTop={1}
            variant={'body1'}
            color={'textSecondary'}
          >
            <MarginLevelIcon sx={{ marginRight: 1 / 2 }} />
            {EmptyValueTag}
          </Typography>
        )}
      </>
    )
  }, [hideAssets, vaultAccountInfo?.marginLevel, vaultAccountInfo?.accountStatus])

  return (
    <Box flex={1} display={'flex'} flexDirection={'column'}>
      <Container
        maxWidth='lg'
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <ViewAccountTemplate
          activeViewTemplate={
            <>
              <Modal open={showNoVaultAccount} onClose={onBtnClose}>
                <Box
                  height={'100%'}
                  display={'flex'}
                  justifyContent={'center'}
                  alignItems={'center'}
                >
                  <Box
                    padding={5}
                    bgcolor={'var(--color-box)'}
                    width={'var(--modal-width)'}
                    borderRadius={1}
                    display={'flex'}
                    alignItems={'center'}
                    flexDirection={'column'}
                    position={'relative'}
                  >
                    {/* <Box></Box> */}
                    <ModalCloseButtonPosition right={2} top={2} t={t} onClose={onBtnClose} />
                    <Typography marginBottom={2} variant={'h4'}>
                      {t(btnProps.title)}
                    </Typography>
                    <Typography
                      whiteSpace={'pre-line'}
                      component={'span'}
                      variant={'body1'}
                      color={'textSecondary'}
                      marginBottom={3}
                    >
                      <Trans
                        i18nKey={btnProps.des}
                        tOptions={{
                          layer2: L1L2_NAME_DEFINED[network].layer2,
                          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                        }}
                        // components={{
                        //   p: (
                        //     <Typography
                        //       whiteSpace={'pre-line'}
                        //       component={'span'}
                        //       variant={'body1'}
                        //       display={'block'}
                        //       marginBottom={3}
                        //       color={'textSecondary'}
                        //     />
                        //   ),
                        // }}
                      ></Trans>
                    </Typography>

                    <>{dialogBtn}</>
                  </Box>
                </Box>
              </Modal>
              <Grid container spacing={3} marginTop={3}>
                <Grid item sm={9} xs={12} flex={1} display={'flex'}>
                  <Box
                    border={'var(--color-border) 1px solid'}
                    borderRadius={1.5}
                    flex={1}
                    display={'flex'}
                    flexDirection={'column'}
                    padding={2}
                    justifyContent={'space-between'}
                  >
                    <Box
                      display={'flex'}
                      flexDirection={'row'}
                      justifyContent={'space-between'}
                      alignItems={'start'}
                    >
                      <Box>
                        <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                          {t('labelVaultTotalBalance')}
                        </Typography>
                        <Typography
                          component={'span'}
                          display={'flex'}
                          alignItems={'center'}
                          justifyContent={'flex-start'}
                          marginTop={1}
                        >
                          <Typography component={'span'} variant={'h1'}>
                            {!hideAssets && priceTag}
                          </Typography>
                          {!hideAssets ? (
                            <Typography component={'span'} variant={'h1'}>
                              {vaultAccountInfo?.totalBalanceOfUsdt
                                ? getValuePrecisionThousand(
                                    sdk
                                      .toBig(vaultAccountInfo?.totalBalanceOfUsdt ?? 0)
                                      .times(forexMap[currency] ?? 0),
                                    2,
                                    2,
                                    2,
                                    true,
                                    { floor: true },
                                  )
                                : EmptyValueTag}
                            </Typography>
                          ) : (
                            <Typography component={'span'} variant={'h1'}>
                              {HiddenTag}
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                      <Box display={'inline-flex'} flexDirection={'row'} alignItems={'center'}>
                        <Typography
                          component={'span'}
                          variant={'body1'}
                          paddingRight={1}
                          display={'inline-flex'}
                          color={'textSecondary'}
                        >
                          {t('labelVaultOpenDate')}
                        </Typography>
                        <Typography component={'span'} variant={'body1'} color={'textPrimary'}>
                          {vaultAccountInfo?.accountStatus == sdk.VaultAccountStatus.IN_STAKING
                            ? moment(new Date(vaultAccountInfo?.openDate)).format(
                                YEAR_DAY_MINUTE_FORMAT,
                              )
                            : EmptyValueTag}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      display={'flex'}
                      flexWrap={'nowrap'}
                      flexDirection={'row'}
                      justifyContent={'space-between'}
                    >
                      <Box>
                        <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                          {t('labelVaultMarginLevel')}
                        </Typography>
                        <>{marginUI}</>
                      </Box>
                      <Box>
                        <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                          {t('labelVaultTotalCollateral')}
                        </Typography>
                        <Typography
                          component={'span'}
                          marginTop={1}
                          display={'inline-flex'}
                          variant={'body1'}
                          color={'textPrimary'}
                        >
                          {vaultAccountInfo?.accountStatus == sdk.VaultAccountStatus.IN_STAKING
                            ? hideAssets
                              ? HiddenTag
                              : PriceTag[CurrencyToTag[currency]] +
                                getValuePrecisionThousand(
                                  Number(vaultAccountInfo?.totalCollateralOfUsdt ?? 0) *
                                    (forexMap[currency] ?? 0),
                                  2,
                                  2,
                                  2,
                                  false,
                                  { isFait: true, floor: true },
                                )
                            : EmptyValueTag}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                          {t('labelVaultTotalDebt')}
                        </Typography>
                        <Typography
                          component={'span'}
                          marginTop={1}
                          display={'inline-flex'}
                          variant={'body1'}
                          color={'textPrimary'}
                        >
                          {vaultAccountInfo?.accountStatus == sdk.VaultAccountStatus.IN_STAKING
                            ? hideAssets
                              ? HiddenTag
                              : PriceTag[CurrencyToTag[currency]] +
                                getValuePrecisionThousand(
                                  Number(vaultAccountInfo?.totalDebtOfUsdt ?? 0) *
                                    (forexMap[currency] ?? 0),
                                  2,
                                  2,
                                  2,
                                  false,
                                  { isFait: true, floor: true },
                                )
                            : EmptyValueTag}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                          {t('labelVaultTotalEquity')}
                        </Typography>
                        <Typography
                          component={'span'}
                          marginTop={1}
                          display={'inline-flex'}
                          variant={'body1'}
                          color={'textPrimary'}
                        >
                          {vaultAccountInfo?.accountStatus == sdk.VaultAccountStatus.IN_STAKING
                            ? hideAssets
                              ? HiddenTag
                              : getValuePrecisionThousand(
                                  Number(vaultAccountInfo?.totalEquityOfUsdt ?? 0) *
                                    (forexMap[currency] ?? 0),
                                  2,
                                  2,
                                  2,
                                  false,
                                  { isFait: true, floor: true },
                                )
                            : EmptyValueTag}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                          {t('labelVaultProfit')}
                        </Typography>
                        <Typography
                          component={'span'}
                          display={'inline-flex'}
                          marginTop={1}
                          variant={'body1'}
                          color={'textPrimary'}
                        >
                          {profitUI}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                <Grid item sm={3} xs={12}>
                  <Box
                    border={'var(--color-border) 1px solid'}
                    borderRadius={1.5}
                    display={'flex'}
                    flexDirection={'column'}
                    justifyContent={'stretch'}
                    paddingY={3}
                  >
                    <MenuBtnStyled
                      variant={'outlined'}
                      size={'large'}
                      className={`vaultBtn  ${isMobile ? 'isMobile' : ''}`}
                      fullWidth
                      endIcon={<ConvertToIcon fontSize={'medium'} color={'inherit'} />}
                      onClick={(e) => {
                        onActionBtnClick(VaultAction.VaultLoan)
                      }}
                    >
                      <Typography
                        component={'span'}
                        variant={'inherit'}
                        color={'inherit'}
                        display={'inline-flex'}
                        alignItems={'center'}
                        lineHeight={'1.2em'}
                        sx={{
                          textIndent: 0,
                          textAlign: 'left',
                        }}
                      >
                        <LoadIcon
                          color={'inherit'}
                          fontSize={'inherit'}
                          sx={{ marginRight: 1 / 2 }}
                        />
                        {t('labelVaultLoanBtn')}
                      </Typography>
                    </MenuBtnStyled>
                    <MenuBtnStyled
                      variant={'outlined'}
                      size={'large'}
                      className={`vaultBtn  ${isMobile ? 'isMobile' : ''}`}
                      fullWidth
                      endIcon={<ConvertToIcon fontSize={'medium'} color={'inherit'} />}
                      onClick={(e) => {
                        onActionBtnClick(VaultAction.VaultJoin)
                      }}
                    >
                      <Typography
                        component={'span'}
                        variant={'inherit'}
                        color={'inherit'}
                        display={'inline-flex'}
                        alignItems={'center'}
                        lineHeight={'1.2em'}
                        sx={{
                          textIndent: 0,
                          textAlign: 'left',
                        }}
                      >
                        <MarginIcon
                          color={'inherit'}
                          fontSize={'inherit'}
                          sx={{ marginRight: 1 / 2 }}
                        />
                        {t('labelVaultAddBtn')}
                      </Typography>
                    </MenuBtnStyled>
                    <MenuBtnStyled
                      variant={'outlined'}
                      size={'large'}
                      className={`vaultBtn  ${isMobile ? 'isMobile' : ''}`}
                      fullWidth
                      endIcon={<ConvertToIcon fontSize={'medium'} color={'inherit'} />}
                      onClick={(e) => {
                        onActionBtnClick(VaultAction.VaultSwap)
                      }}
                    >
                      <Typography
                        component={'span'}
                        variant={'inherit'}
                        color={'inherit'}
                        display={'inline-flex'}
                        alignItems={'center'}
                        lineHeight={'1.2em'}
                        sx={{
                          textIndent: 0,
                          textAlign: 'left',
                        }}
                      >
                        <VaultTradeIcon
                          color={'inherit'}
                          fontSize={'inherit'}
                          sx={{ marginRight: 1 / 2 }}
                        />
                        {t('labelVaultTradeBtn')}
                      </Typography>
                    </MenuBtnStyled>
                    <MenuBtnStyled
                      variant={'outlined'}
                      size={'large'}
                      className={`vaultBtn  ${isMobile ? 'isMobile' : ''}`}
                      fullWidth
                      endIcon={<ConvertToIcon fontSize={'medium'} color={'inherit'} />}
                      onClick={(e) => {
                        onActionBtnClick(VaultAction.VaultExit)
                      }}
                    >
                      <Typography
                        component={'span'}
                        variant={'inherit'}
                        color={'inherit'}
                        display={'inline-flex'}
                        alignItems={'center'}
                        lineHeight={'1.2em'}
                        sx={{
                          textIndent: 0,
                          textAlign: 'left',
                        }}
                      >
                        <CloseOutIcon
                          color={'inherit'}
                          fontSize={'inherit'}
                          sx={{ marginRight: 1 / 2 }}
                        />
                        {t('labelVaultRedeemBtn')}
                      </Typography>
                    </MenuBtnStyled>
                  </Box>
                </Grid>
              </Grid>
              <Box
                flex={1}
                display={'flex'}
                flexDirection={'column'}
                border={'var(--color-border) 1px solid'}
                borderRadius={1.5}
                marginY={3}
                paddingY={2}
              >
                <VaultAssetsTable {...assetPanelProps} />
              </Box>
            </>
          }
        />
      </Container>
    </Box>
  )
}
