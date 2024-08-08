import { Box, Container, Typography, Grid, Modal, Tooltip, Button, Divider, IconButton } from '@mui/material'
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
  RouterPath,
  VaultKey,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import {
  MarketDetail,
  MenuBtnStyled,
  ModalCloseButton,
  ModalCloseButtonPosition,
  SwitchPanelStyled,
  useOpenModals,
  useSettings,
  VaultAssetsTable,
  Button as MyButton,
  SpaceBetweenBox
} from '@loopring-web/component-lib'
import { useTranslation, Trans } from 'react-i18next'
import { makeVaultLayer2, useSystem, useVaultMap, useVaultTicker, VaultAccountInfoStatus, ViewAccountTemplate } from '@loopring-web/core'
import { useGetVaultAssets } from './hook'
import moment from 'moment'
import { useTheme } from '@emotion/react'
import { useVaultMarket } from '../HomePanel/hook'
import { useHistory } from 'react-router'
import { CollateralDetailsModal, MaximumCreditModal } from './modals'

export const VaultDashBoardPanel = ({
  vaultAccountInfo: _vaultAccountInfo,
}: {
  vaultAccountInfo: VaultAccountInfoStatus
}) => {
  const { vaultAccountInfo, activeInfo } = _vaultAccountInfo
  const { t } = useTranslation()

  const { forexMap, etherscanBaseUrl } = useSystem()
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
  const tableRef = React.useRef<HTMLDivElement>()
  const { detail, setShowDetail, marketProps } = useVaultMarket({ tableRef })
  const walletMap = makeVaultLayer2({ needFilterZero: true }).vaultLayer2Map ?? {}
  const { tokenMap: vaultTokenMap, tokenPrices } = useVaultMap()
  const history = useHistory()
  const {vaultTickerMap} = useVaultTicker()
  
  const [localState, setLocalState] = React.useState({
    modalStatus: 'noModal' as 'noModal' | 'collateralDetails' | 'collateralDetailsMaxCredit' | 'leverage' | 'leverageMaxCredit',
  })
  console.log('vaultTokenMap', vaultTokenMap)

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
                            title={
                              <Box>
                                <Typography marginBottom={1} variant={'body2'}>
                                  {t('labelVaultMarginLevelTooltips')}
                                </Typography>
                                <Typography marginBottom={1} variant={'body2'}>
                                  {t('labelVaultMarginLevelTooltips2')}
                                </Typography>
                                <Typography marginBottom={1} variant={'body2'}>
                                  {t('labelVaultMarginLevelTooltips3')}
                                </Typography>
                                <Typography
                                  color={'var(--color-success)'}
                                  marginBottom={1}
                                  variant={'body2'}
                                >
                                  {t('labelVaultMarginLevelTooltips4')}
                                </Typography>
                                <Typography marginBottom={1} variant={'body2'}>
                                  {t('labelVaultMarginLevelTooltips5')}
                                </Typography>
                                <Typography
                                  color={'var(--color-warning)'}
                                  marginBottom={1}
                                  variant={'body2'}
                                >
                                  {t('labelVaultMarginLevelTooltips6')}
                                </Typography>
                                <Typography marginBottom={1} variant={'body2'}>
                                  {t('labelVaultMarginLevelTooltips7')}
                                </Typography>
                                <Typography
                                  color={'var(--color-error)'}
                                  marginBottom={1}
                                  variant={'body2'}
                                >
                                  {t('labelVaultMarginLevelTooltips8')}
                                </Typography>
                                <Typography marginBottom={1} variant={'body2'}>
                                  {t('labelVaultMarginLevelTooltips9')}
                                </Typography>
                                <Typography
                                  color={'var(--color-error'}
                                  marginBottom={1}
                                  variant={'body2'}
                                >
                                  {t('labelVaultMarginLevelTooltips10')}
                                </Typography>
                                <Typography marginBottom={1} variant={'body2'}>
                                  {t('labelVaultMarginLevelTooltips11')}
                                </Typography>
                              </Box>
                            }
                            placement={'right'}
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
                            alignItems={'center'}
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
                            <Typography
                              variant={'body2'}
                              sx={{ cursor: 'pointer' }}
                              color={'var(--color-primary)'}
                              marginLeft={1}
                              component={'span'}
                              onClick={() => {
                                setLocalState({
                                  ...localState,
                                  modalStatus: 'collateralDetails'
                                })

                              }}
                            >
                              Detail
                            </Typography>
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
                            alignItems={'center'}
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
                            <Typography
                              variant={'body2'}
                              sx={{ cursor: 'pointer' }}
                              color={'var(--color-primary)'}
                              marginLeft={1}
                            >
                              Detail
                            </Typography>
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
                            alignItems={'center'}
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

                            <Typography
                              variant={'body2'}
                              sx={{ cursor: 'pointer' }}
                              color={'var(--color-primary)'}
                              marginLeft={1}
                            >
                              Detail
                            </Typography>
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
                        <Button
                          sx={{ minWidth: 'var(--walletconnect-width)' }}
                          onClick={_vaultAccountInfo.onJoinPop}
                          variant={'contained'}
                        >
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
                <VaultAssetsTable
                  {...assetPanelProps}
                  onRowClick={(index, row) => {
                    // @ts-ignore
                    marketProps.onRowClick(index, {
                      // @ts-ignore
                      ...vaultTokenMap[row.name],
                      // @ts-ignore
                      cmcTokenId: vaultTickerMap[row.erc20Symbol].tokenId,
                      ...vaultTickerMap[row.erc20Symbol],
                    })
                  }}
                  showFilter
                />
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
                          <Typography
                            whiteSpace={'pre-line'}
                            component={'span'}
                            variant={'body1'}
                            color={'textSecondary'}
                            marginBottom={3}
                            textAlign={'left'}
                            width={'100%'}
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
                            />
                          </Typography>
                          <>{dialogBtn}</>
                        </>
                      }
                    />
                  </Box>
                </Box>
              </Modal>

              <Modal
                open={detail?.isShow && !isShowVaultJoin?.isShow}
                onClose={() => setShowDetail({ isShow: false })}
              >
                <SwitchPanelStyled width={'var(--modal-width)'}>
                  <ModalCloseButton
                    t={t}
                    onClose={(_e: any) => setShowDetail({ isShow: false } as any)}
                  />
                  <Box
                    display={'flex'}
                    flexDirection={'column'}
                    alignItems={'flex-start'}
                    alignSelf={'stretch'}
                    justifyContent={'stretch'}
                    marginTop={-5}
                  >
                    <Typography
                      display={'flex'}
                      flexDirection={'row'}
                      component={'header'}
                      alignItems={'center'}
                      height={'var(--toolbar-row-height)'}
                      paddingX={3}
                    >
                      {detail?.detail?.tokenInfo.erc20Symbol ?? detail?.detail?.tokenInfo.symbol}
                    </Typography>
                    <Divider style={{ marginTop: '-1px', width: '100%' }} />
                    <Box
                      maxHeight={'60vh'}
                      overflow={'scroll'}
                      flex={1}
                      display={'flex'}
                      flexDirection={'column'}
                    >
                      {vaultAccountInfo &&
                        walletMap &&
                        ([sdk.VaultAccountStatus.IN_STAKING].includes(
                          vaultAccountInfo?.accountStatus,
                        ) ||
                          activeInfo?.hash) && (
                          <>
                            <Box
                              display='flex'
                              flexDirection={'column'}
                              alignItems={'center'}
                              alignSelf={'center'}
                              justifyContent={'center'}
                              margin={4}
                            >
                              <Typography variant={'h2'} component={'h4'} color={'inherit'}>
                                {!hideAssets
                                  ? walletMap[detail?.detail?.tokenInfo.symbol!]?.count
                                    ? getValuePrecisionThousand(
                                        walletMap[detail?.detail?.tokenInfo.symbol!]?.count ?? 0,
                                        vaultTokenMap[detail?.detail?.tokenInfo.symbol!].precision,
                                        vaultTokenMap[detail?.detail?.tokenInfo.symbol!].precision,
                                        undefined,
                                        false,
                                        {
                                          isFait: false,
                                          floor: true,
                                        },
                                      )
                                    : '0.00'
                                  : HiddenTag}
                              </Typography>
                              <Typography
                                variant={'body1'}
                                color={'textSecondary'}
                                component={'span'}
                              >
                                {!hideAssets
                                  ? walletMap[detail?.detail?.tokenInfo.symbol!]?.count
                                    ? PriceTag[CurrencyToTag[currency]] +
                                      getValuePrecisionThousand(
                                        sdk
                                          .toBig(
                                            walletMap[detail?.detail?.tokenInfo.symbol!]!.count,
                                          )
                                          .times(
                                            tokenPrices?.[detail?.detail?.tokenInfo.symbol!] || 0,
                                          )
                                          .times(forexMap[currency] ?? 0),
                                        2,
                                        2,
                                        2,
                                        false,
                                        {
                                          isFait: false,
                                          floor: true,
                                        },
                                      )
                                    : PriceTag[CurrencyToTag[currency]] + '0.00'
                                  : HiddenTag}
                              </Typography>
                              <Box marginTop={2} display={'flex'} flexDirection={'row'}>
                                <Box
                                  display={'flex'}
                                  flexDirection={'column'}
                                  marginRight={5}
                                  alignItems={'center'}
                                >
                                  <IconButton
                                    sx={{
                                      height: 'var(--svg-size-huge) !important',
                                      width: 'var(--svg-size-huge) !important',
                                      border: 'solid 0.5px var(--color-border)',
                                    }}
                                    size={'large'}
                                    onClick={() => {
                                      history.push(
                                        `${RouterPath.vault}/${VaultKey.VAULT_DASHBOARD}/${VaultAction.VaultLoan}?symbol=${detail?.detail?.tokenInfo.symbol}`,
                                      )
                                    }}
                                  >
                                    <Box
                                      component={'img'}
                                      src={`${SoursURL}svg/vault_loan_${theme.mode}.svg`}
                                    />
                                  </IconButton>
                                  <Typography
                                    marginTop={1 / 2}
                                    component={'span'}
                                    variant={'body2'}
                                    color={'textSecondary'}
                                    display={'inline-flex'}
                                    alignItems={'center'}
                                    textAlign={'center'}
                                    sx={{
                                      textIndent: 0,
                                      textAlign: 'center',
                                    }}
                                  >
                                    {t('labelVaultLoanBtn')}
                                  </Typography>
                                </Box>
                                <Box
                                  display={'flex'}
                                  flexDirection={'column'}
                                  alignItems={'center'}
                                >
                                  <IconButton
                                    sx={{
                                      height: 'var(--svg-size-huge) !important',
                                      width: 'var(--svg-size-huge) !important',
                                      border: 'solid 0.5px var(--color-border)',
                                    }}
                                    size={'large'}
                                    onClick={() => {
                                      history.push(
                                        `${RouterPath.vault}/${VaultKey.VAULT_DASHBOARD}/${VaultAction.VaultSwap}?symbol=${detail?.detail?.tokenInfo.symbol}`,
                                      )
                                    }}
                                  >
                                    <Box
                                      component={'img'}
                                      src={`${SoursURL}svg/vault_trade_${theme.mode}.svg`}
                                    />
                                  </IconButton>
                                  <Typography
                                    component={'span'}
                                    variant={'body2'}
                                    display={'inline-flex'}
                                    textAlign={'center'}
                                    alignItems={'center'}
                                    color={'textSecondary'}
                                    marginTop={1 / 2}
                                    sx={{
                                      textIndent: 0,
                                      textAlign: 'center',
                                    }}
                                  >
                                    {t('labelVaultTradeSimpleBtn')}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                            <Divider style={{ marginTop: '-1px', width: '100%' }} />
                          </>
                        )}
                      <Box padding={3} flex={1} display={'flex'} flexDirection={'column'}>
                        <MarketDetail
                          etherscanBaseUrl={etherscanBaseUrl}
                          isShow={detail.isShow}
                          forexMap={forexMap}
                          isLoading={detail.isLoading}
                          {...{ ...detail?.detail }}
                        />
                      </Box>
                    </Box>
                    {!(
                      (vaultAccountInfo &&
                        [sdk.VaultAccountStatus.IN_STAKING].includes(
                          vaultAccountInfo?.accountStatus,
                        )) ||
                      activeInfo?.hash
                    ) && (
                      <>
                        <Divider style={{ marginTop: '-1px', width: '100%' }} />
                        <Box
                          padding={3}
                          paddingY={1}
                          display={'flex'}
                          flexDirection={'column'}
                          alignItems={'flex-end'}
                          alignSelf={'stretch'}
                          justifyContent={'stretch'}
                        >
                          <MyButton
                            size={'medium'}
                            onClick={() => {
                              setShowDetail({ isShow: false })

                              _vaultAccountInfo.onJoinPop({})
                            }}
                            loading={'false'}
                            variant={'contained'}
                            sx={{ minWidth: 'var(--walletconnect-width)' }}
                            disabled={
                              _vaultAccountInfo.joinBtnStatus === TradeBtnStatus.DISABLED ||
                              _vaultAccountInfo.joinBtnStatus === TradeBtnStatus.LOADING
                            }
                          >
                            {_vaultAccountInfo.joinBtnLabel}
                          </MyButton>
                        </Box>
                      </>
                    )}
                  </Box>
                </SwitchPanelStyled>
              </Modal>
              <CollateralDetailsModal
                open={localState.modalStatus === 'collateralDetails'}
                onClose={() => {
                  setLocalState({
                    ...localState,
                    modalStatus: 'noModal'
                  })
                }}
                onClickMaxCredit={() => {
                  setLocalState({
                    ...localState,
                    modalStatus: 'collateralDetailsMaxCredit'
                  })
                }}
                collateralTokens={[
                  {
                    name: 'LRC',
                    logo: '',
                    amount: '1',
                    valueInUSD: '1',
                  },
                ]}
                maxCredit='11'
                totalCollateral='11'
              />
              <MaximumCreditModal
                open={
                  localState.modalStatus === 'leverageMaxCredit' ||
                  localState.modalStatus === 'collateralDetailsMaxCredit'
                }
                onClose={() => {
                  setLocalState({
                    ...localState,
                    modalStatus: 'noModal',
                  })
                }}
                onClickBack={() => {
                  if (localState.modalStatus === 'collateralDetailsMaxCredit') {
                    setLocalState({
                      ...localState,
                      modalStatus: 'collateralDetails',
                    })
                  } else if (localState.modalStatus === 'leverageMaxCredit') {
                    setLocalState({
                      ...localState,
                      modalStatus: 'leverage',
                    })
                  }
                }}
                collateralFactors={[
                  {
                    name: 'LRC',
                    collateralFactor: '1',
                  },
                  {
                    name: 'BTC',
                    collateralFactor: '0.9',
                  },
                ]}
                maxLeverage={11}
              />
            </>
          }
        />
      </Container>
    </Box>
  )
}
