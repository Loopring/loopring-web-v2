import { Box, Container, Typography, Grid, Modal, Tooltip, Button } from '@mui/material'
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
  UpColor,
  Info2Icon,
  SoursURL,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import {
  MenuBtnStyled,
  ModalCloseButtonPosition,
  useOpenModals,
  useSettings,
  VaultAssetsTable,
} from '@loopring-web/component-lib'
import { useTranslation, Trans } from 'react-i18next'
import { useSystem, VaultAccountInfoStatus, ViewAccountTemplate } from '@loopring-web/core'
import { useGetVaultAssets } from './hook'
import moment from 'moment'
import { useTheme } from '@emotion/react'

export const VaultDashBoardPanel = ({
  vaultAccountInfo: _vaultAccountInfo,
}: {
  vaultAccountInfo: VaultAccountInfoStatus
}) => {
  const { vaultAccountInfo } = _vaultAccountInfo
  const { t } = useTranslation()

  const { forexMap } = useSystem()
  const { isMobile, currency, hideL2Assets: hideAssets, upColor, defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const {
    // setShowNoVaultAccount,
    modals: {
      isShowVaultJoin,
      // isShowNoVaultAccount: { isShow: showNoVaultAccount, whichBtn, ...btnProps },
    },
  } = useOpenModals()
  const priceTag = PriceTag[CurrencyToTag[currency]]
  const {
    onActionBtnClick,
    dialogBtn,
    showNoVaultAccount,
    setShowNoVaultAccount,
    whichBtn,
    btnProps,
    onBtnClose,
    positionOpend,
    onClcikOpenPosition,
    ...assetPanelProps
  } = useGetVaultAssets({ vaultAccountInfo: _vaultAccountInfo })
  const colors = ['var(--color-success)', 'var(--color-error)', 'var(--color-warning)']
  const profitUI = React.useMemo(() => {
    const profit = sdk
      .toBig(vaultAccountInfo?.totalEquityOfUsdt ?? 0)
      .minus(vaultAccountInfo?.totalCollateralOfUsdt ?? 0)
    const colorsId = upColor === UpColor.green ? [0, 1] : [1, 0]
    const colorIs = profit.gte(0) ? colorsId[0] : colorsId[1]
    return (
      <>
        {vaultAccountInfo?.accountStatus === sdk.VaultAccountStatus.IN_STAKING ? (
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
                  getValuePrecisionThousand(
                    profit.times(forexMap[currency] ?? 0).toString(),
                    2,
                    2,
                    2,
                    false,
                    {
                      isFait: false,
                      floor: true,
                    },
                  )}
            </Typography>
            <Typography
              component={'span'}
              display={'inline-flex'}
              variant={'body1'}
              marginLeft={1 / 2}
              color={colors[colorIs]}
            >
              {getValuePrecisionThousand(
                profit
                  ?.div(
                    Number(vaultAccountInfo?.totalCollateralOfUsdt)
                      ? vaultAccountInfo?.totalCollateralOfUsdt
                      : 1,
                  )
                  .times(100) ?? 0,
                2,
                2,
                2,
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
  }, [
    vaultAccountInfo?.totalEquityOfUsdt,
    vaultAccountInfo?.totalCollateralOfUsdt,
    vaultAccountInfo?.accountStatus,
    upColor,
    hideAssets,
    currency,
    forexMap,
    colors,
  ])
  const marginUI = React.useMemo(() => {
    const item = vaultAccountInfo?.marginLevel ?? 0
    //@ts-ignore
    const colorIs = sdk.toBig('1.5').lte(item) ? 0 : sdk.toBig('1.3').lte(item) ? 2 : 1
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
            {item}
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
  }, [colors, vaultAccountInfo?.marginLevel])
  const theme = useTheme()
  

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
                            {!hideAssets &&
                              !sdk.toBig(vaultAccountInfo?.totalBalanceOfUsdt ?? 0).eq('0') &&
                              priceTag}
                          </Typography>
                          {!hideAssets ? (
                            <Typography component={'span'} variant={'h1'}>
                              {vaultAccountInfo?.totalBalanceOfUsdt &&
                              !sdk.toBig(vaultAccountInfo?.totalBalanceOfUsdt ?? 0).eq('0')
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
                          {vaultAccountInfo?.accountStatus === sdk.VaultAccountStatus.IN_STAKING
                            ? moment(new Date(vaultAccountInfo?.openDate)).format(
                                YEAR_DAY_MINUTE_FORMAT,
                              )
                            : EmptyValueTag}
                        </Typography>
                      </Box>
                    </Box>
                    {positionOpend ? (
                      <Box
                        display={'flex'}
                        flexWrap={'nowrap'}
                        flexDirection={'row'}
                        justifyContent={'space-between'}
                      >
                        <Box>
                          <Tooltip
                            title={t('labelVaultMarginLevelTooltips').toString()}
                            placement={'top'}
                          >
                            <Typography
                              component={'h4'}
                              variant={'body1'}
                              color={'textSecondary'}
                              display={'flex'}
                              alignItems={'center'}
                            >
                              {t('labelVaultMarginLevel')}
                              <Info2Icon color={'inherit'} sx={{ marginLeft: 1 / 2 }} />
                            </Typography>
                          </Tooltip>
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
                            {vaultAccountInfo?.accountStatus === sdk.VaultAccountStatus.IN_STAKING
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
                          <Tooltip
                            title={t('labelVaultTotalDebtTooltips').toString()}
                            placement={'top'}
                          >
                            <Typography
                              component={'h4'}
                              variant={'body1'}
                              color={'textSecondary'}
                              display={'flex'}
                              alignItems={'center'}
                            >
                              {t('labelVaultTotalDebt')}
                              <Info2Icon color={'inherit'} sx={{ marginLeft: 1 / 2 }} />
                            </Typography>
                          </Tooltip>
                          <Typography
                            component={'span'}
                            marginTop={1}
                            display={'inline-flex'}
                            variant={'body1'}
                            color={'textPrimary'}
                          >
                            {vaultAccountInfo?.accountStatus === sdk.VaultAccountStatus.IN_STAKING
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
                            {vaultAccountInfo?.accountStatus === sdk.VaultAccountStatus.IN_STAKING
                              ? hideAssets
                                ? HiddenTag
                                : PriceTag[CurrencyToTag[currency]] +
                                  getValuePrecisionThousand(
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
                    ) : (
                      <Box>
                        <Button onClick={onClcikOpenPosition} variant={'contained'}>
                          {t('labelVaultJoinBtn')}
                        </Button>
                      </Box>
                    )}
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
                      onClick={(_e) => {
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
                        <Box
                          marginRight={1}
                          component={'img'}
                          src={`${SoursURL}svg/vault_loan_${theme.mode}.svg`}
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
                      onClick={(_e) => {
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
                        <Box
                          marginRight={1}
                          component={'img'}
                          src={`${SoursURL}svg/vault_margin_${theme.mode}.svg`}
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
                      onClick={(_e) => {
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
                        <Box
                          marginRight={1}
                          component={'img'}
                          src={`${SoursURL}svg/vault_trade_${theme.mode}.svg`}
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
                      onClick={(_e) => {
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
                        <Box
                          marginRight={1}
                          component={'img'}
                          src={`${SoursURL}svg/vault_close_${theme.mode}.svg`}
                        ></Box>
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
                <VaultAssetsTable {...assetPanelProps} showFilter />
              </Box>
              <Modal
                open={showNoVaultAccount && !isShowVaultJoin?.isShow}
                onClose={onBtnClose}
                sx={{ zIndex: 1000 }}
              >
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
                    <ModalCloseButtonPosition right={2} top={2} t={t} onClose={onBtnClose} />
                    <ViewAccountTemplate
                      className={'inModal'}
                      activeViewTemplate={
                        <>
                          <Typography marginBottom={3} variant={'h4'}>
                            {t(btnProps.title)}
                          </Typography>
                          <Typography width={'100%'} marginBottom={3}>
                            {t("labelVaultOpenPositionDes")}
                          </Typography>
                          <>{dialogBtn}</>
                        </>
                      }
                    />
                  </Box>
                </Box>
              </Modal>
            </>
          }
        />
      </Container>
    </Box>
  )
}
