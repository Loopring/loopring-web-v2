import {
  Box,
  Container,
  Typography,
  Modal,
  Tooltip,
  Button,
  Divider,
  IconButton,
  Tab, 
  Tabs,
  styled,
} from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import React from 'react'
import {
  MarginLevelIcon,
  PriceTag,
  CurrencyToTag,
  HiddenTag,
  getValuePrecisionThousand,
  EmptyValueTag,
  VaultAction,
  L1L2_NAME_DEFINED,
  UpColor,
  Info2Icon,
  SoursURL,
  RouterPath,
  VaultKey,
  TradeBtnStatus,
  WarningIcon2,
  hexToRGB,
  OrderListIcon,
  ViewIcon,
  HideIcon,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import {
  MarketDetail,
  ModalCloseButton,
  ModalCloseButtonPosition,
  SwitchPanelStyled,
  VaultAssetsTable,
  Button as MyButton,
  VaultJoinPanelModal,
  VaultPositionsTable,
  Toast,
  useSettings,
} from '@loopring-web/component-lib'
import { Trans } from 'react-i18next'
import {
  fiatNumberDisplay,
  useVaultJoin,
  VaultAccountInfoStatus,
  ViewAccountTemplate,
  WalletConnectL2Btn,
} from '@loopring-web/core'
import {
  AutoRepayConfirmModal,
  CloseAllConfirmModal,
  CloseConfirmModal,
  CollateralDetailsModal,
  DebtModal,
  DustCollectorModal,
  DustCollectorUnAvailableModal,
  LeverageModal,
  MaximumCreditModal,
  NoAccountHintModal,
  SmallOrderAlert,
  SupplyCollateralHintModal,
  VaultSwapModal
} from './modals'
import { marginLevelTypeToColor } from '@loopring-web/component-lib/src/components/tradePanel/components/VaultWrap/utils'
import { marginLevelType } from '@loopring-web/core/src/hooks/useractions/vault/utils'
import { useVaultDashboard } from '../hooks/useVaultDashBoard'
import { VaultDashBoardPanelUIProps } from '../interface'
import { useVaultSwap } from '../hooks/useVaultSwap'

const BgButton = styled(Button)<{ customBg: string }>`
  background-color: ${({ customBg }) => customBg};
  transition: all 0.2s ease-in-out;
  &:hover {
    background-color: ${({ customBg }) => customBg};
    opacity: 0.8;
  }
  &:disabled {
    background-color: var(--color-button-disabled);
  }
  
`


const VaultDashBoardPanelUI: React.FC<VaultDashBoardPanelUIProps> = ({
  t,
  forexMap,
  theme,
  currency,
  hideAssets,
  upColor,
  showMarginLevelAlert,
  vaultAccountInfo,
  localState,
  setLocalState,
  colors,
  assetPanelProps,
  marketProps,
  vaultTokenMap,
  vaultTickerMap,
  VaultDustCollector,
  isShowVaultJoin,
  detail,
  setShowDetail,
  hideLeverage,
  activeInfo,
  walletMap,
  _vaultAccountInfo,
  tokenPrices,
  getValueInCurrency,
  history,
  etherscanBaseUrl,
  onClickCollateralManagement,
  onClickSettle,
  onClickPortalTrade,
  liquidationThreshold,
  liquidationPenalty,
  assetsTab,
  onChangeAssetsTab,
  onClickRecord,
  vaultPositionsTableProps,
  onClickHideShowAssets,
  vaultAccountActive,
  totalEquity,
  showSettleBtn,
  onClickBuy,
  onClickSell,
  didAccountSignIn
  
}) => {
  const { isMobile } = useSettings()
  const boxSx = {
    my: isMobile ? 2 : 2,
    width: isMobile ? '50%' : '25%',
  }
  const activeView = (
    <>
      {showMarginLevelAlert && (
        <Box
          paddingY={1}
          paddingX={2.5}
          borderRadius={'8px'}
          bgcolor={hexToRGB(theme.colorBase.error, 0.2)}
          display={'flex'}
          marginTop={3}
        >
          <WarningIcon2
            color={'error'}
            style={{
              width: '24px',
              height: '24px',
            }}
          />
          <Typography marginLeft={0.5}>{t('labelVaultMarginLevelAlert')}</Typography>
        </Box>
      )}
      <Box
        display={'flex'}
        flexDirection={'column'}
        mt={3}
        px={4}
        pt={3}
        pb={5}
        border={'1px solid var(--color-border)'}
        borderRadius={1.5}
        position={'relative'}
      >
        <Box
          bgcolor={'var(--color-box-third)'}
          position={'absolute'}
          height={'40px'}
          px={2.5}
          left={0}
          top={0}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          borderRadius={'4px 0 4px 0'}
        >
          <Typography>Cross Account</Typography>
        </Box>
        <Box
          display={'flex'}
          flexDirection={isMobile ? 'column' : 'row'}
          alignItems={isMobile ? 'end' : 'center'}
          alignSelf={'flex-end'}
        >
          <Button onClick={onClickCollateralManagement} sx={{ width: 'auto' }} variant='contained'>
            Collateral Management
          </Button>
          {showSettleBtn && (
            <BgButton
              customBg='var(--color-button-outlined)'
              onClick={onClickSettle}
              sx={{
                width: 'auto',
                ml: 1.5,
                mt: isMobile ? 2 : 0,
                color: theme.mode === 'light' ? 'var(--color-black)' : 'var(--color-white)',
              }}
              variant='contained'
            >
              Settle
            </BgButton>
          )}
        </Box>

        <Box mt={1.5} display={'flex'} alignItems={'center'}>
          <Box mr={0.5}>
            <Typography color={'var(--color-text-secondary)'} variant='h3' fontSize={'14px'}>
              Total Equity
            </Typography>
          </Box>

          {hideAssets ? (
            <HideIcon
              className='custom-size'
              sx={{
                fontSize: '20px',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
              onClick={onClickHideShowAssets}
            />
          ) : (
            <ViewIcon
              className='custom-size'
              sx={{
                fontSize: '20px',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
              onClick={onClickHideShowAssets}
            />
          )}
        </Box>
        <Typography mt={1} variant='h2'>
          {vaultAccountActive ? (hideAssets ? HiddenTag : totalEquity) : EmptyValueTag}
        </Typography>

        <Box mt={isMobile ? 2 : 4} display={'flex'} flexWrap={'wrap'} flexDirection={'row'}>
          <Box sx={boxSx}>
            <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
              {t('labelVaultTotalCollateral')}
            </Typography>
            <Typography
              component={'span'}
              marginTop={1}
              display={'inline-flex'}
              variant={'body1'}
              color={'textPrimary'}
              fontSize={'20px'}
              alignItems={'center'}
            >
              {vaultAccountActive
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
              {vaultAccountActive && (
                <Typography
                  sx={{ cursor: 'pointer' }}
                  color={'var(--color-primary)'}
                  marginLeft={1.5}
                  component={'span'}
                  onClick={() => {
                    setLocalState({
                      ...localState,
                      modalStatus: 'collateralDetails',
                    })
                  }}
                >
                  {t('labelVaultDetails')}
                </Typography>
              )}
            </Typography>
          </Box>
          <Box sx={boxSx}>
            <Typography
              component={'h4'}
              variant={'body1'}
              color={'textSecondary'}
              display={'flex'}
              alignItems={'center'}
            >
              {t('labelVaultMarginLevel')}
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
                    <Typography color={'var(--color-success)'} marginBottom={1} variant={'body2'}>
                      {t('labelVaultMarginLevelTooltips4')}
                    </Typography>
                    <Typography marginBottom={1} variant={'body2'}>
                      {t('labelVaultMarginLevelTooltips5')}
                    </Typography>
                    <Typography color={'var(--color-warning)'} marginBottom={1} variant={'body2'}>
                      {t('labelVaultMarginLevelTooltips6')}
                    </Typography>
                    <Typography marginBottom={1} variant={'body2'}>
                      {t('labelVaultMarginLevelTooltips7')}
                    </Typography>
                    <Typography color={'var(--color-error)'} marginBottom={1} variant={'body2'}>
                      {t('labelVaultMarginLevelTooltips8')}
                    </Typography>
                    <Typography marginBottom={1} variant={'body2'}>
                      {t('labelVaultMarginLevelTooltips9')}
                    </Typography>
                    <Typography
                      color={'var(--color-text-primary)'}
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
                placement={isMobile ? 'bottom' : 'right'}
              >
                <Box display={'flex'} alignItems={'center'}>
                  <Info2Icon color={'inherit'} sx={{ marginLeft: 1 / 2 }} />
                </Box>
              </Tooltip>
            </Typography>

            {(() => {
              if (!vaultAccountActive) {
                return <Typography>{EmptyValueTag}</Typography>
              }
              const item = vaultAccountInfo?.marginLevel ?? '0'
              return (
                <>
                  {vaultAccountInfo?.marginLevel ? (
                    <Typography
                      component={'span'}
                      display={'inline-flex'}
                      alignItems={'center'}
                      marginTop={1}
                      variant={'body1'}
                      fontSize={'16px'}
                      color={marginLevelTypeToColor(marginLevelType(item))}
                    >
                      <MarginLevelIcon
                        className='custom-size'
                        sx={{ fontSize: '20px', marginRight: 1 / 2 }}
                      />
                      {item}
                    </Typography>
                  ) : (
                    <Typography
                      component={'span'}
                      display={'inline-flex'}
                      alignItems={'center'}
                      marginTop={1}
                      variant={'body1'}
                      fontSize={'16px'}
                      color={'textSecondary'}
                    >
                      <MarginLevelIcon
                        className='custom-size'
                        sx={{ fontSize: '20px', marginRight: 1 / 2 }}
                      />
                      {EmptyValueTag}
                    </Typography>
                  )}
                </>
              )
            })()}
          </Box>
          <Box sx={boxSx}>
            <Tooltip title={t('labelVaultTotalDebtTooltips').toString()} placement={'top'}>
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
              fontSize={'20px'}
              alignItems={'center'}
            >
              {vaultAccountActive
                ? hideAssets
                  ? HiddenTag
                  : PriceTag[CurrencyToTag[currency]] +
                    getValuePrecisionThousand(
                      Number(vaultAccountInfo?.totalDebtOfUsdt ?? 0) * (forexMap[currency] ?? 0),
                      2,
                      2,
                      2,
                      false,
                      { isFait: true, floor: true },
                    )
                : EmptyValueTag}
              {vaultAccountActive && (
                <Typography
                  sx={{ cursor: 'pointer' }}
                  color={'var(--color-primary)'}
                  marginLeft={1.5}
                  component={'span'}
                  onClick={() => {
                    setLocalState({
                      ...localState,
                      modalStatus: 'debt',
                    })
                  }}
                >
                  {t('labelVaultDetails')}
                </Typography>
              )}
            </Typography>
          </Box>
          <Box sx={boxSx}>
            <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
              {t('labelVaultProfit')}
            </Typography>
            <Typography
              component={'span'}
              display={'flex'}
              marginTop={1}
              variant={'body1'}
              color={'textPrimary'}
              fontSize={'20px'}
            >
              {(() => {
                const profit =
                  (vaultAccountInfo as any)?.accountType === 0
                    ? sdk
                        .toBig(vaultAccountInfo?.totalEquityOfUsdt ?? 0)
                        .minus(vaultAccountInfo?.totalCollateralOfUsdt ?? 0)
                    : sdk
                        .toBig(vaultAccountInfo?.totalBalanceOfUsdt ?? 0)
                        .minus(vaultAccountInfo?.totalDebtOfUsdt ?? 0)
                const colorsId = upColor === UpColor.green ? [0, 1] : [1, 0]
                const colorIs = profit.gte(0) ? colorsId[0] : colorsId[1]
                return (
                  <>
                    {vaultAccountActive ? (
                      <Box display={'flex'} alignItems={'center'}>
                        <Typography
                          component={'span'}
                          display={'flex'}
                          variant={'body1'}
                          color={'textPrimary'}
                          fontSize={'20px'}
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
                          display={'flex'}
                          variant={'body1'}
                          marginLeft={1.5}
                          color={colors[colorIs]}
                          fontSize={'20px'}
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
                      </Box>
                    ) : (
                      EmptyValueTag
                    )}
                  </>
                )
              })()}
            </Typography>
          </Box>
          {!hideLeverage && (
            <Box sx={boxSx} position={'relative'}>
              <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                {t('labelVaultLeverage')}
              </Typography>
              <Typography
                component={'span'}
                marginTop={1}
                display={'inline-flex'}
                variant={'body1'}
                color={'textPrimary'}
                fontSize={'20px'}
                alignItems={'center'}
              >
                {vaultAccountInfo?.leverage && vaultAccountActive
                  ? `${vaultAccountInfo?.leverage}x`
                  : EmptyValueTag}
                {vaultAccountActive && (
                  <Typography
                    sx={{ cursor: 'pointer' }}
                    color={'var(--color-primary)'}
                    marginLeft={1.5}
                    component={'span'}
                    onClick={() => {
                      setLocalState({
                        ...localState,
                        modalStatus: 'leverage',
                      })
                    }}
                  >
                    {t('labelVaultDetails')}
                  </Typography>
                )}
              </Typography>
              <Typography
                marginTop={0.5}
                width={'200px'}
                color={'var(--color-text-secondary)'}
                variant={'body2'}
              >
                {t('labelVaultMaximumCredit')}:{' '}
                {(vaultAccountInfo as any)?.maxCredit &&
                getValueInCurrency((vaultAccountInfo as any)?.maxCredit) &&
                vaultAccountActive
                  ? fiatNumberDisplay(
                      getValueInCurrency((vaultAccountInfo as any)?.maxCredit),
                      currency,
                    )
                  : EmptyValueTag}
              </Typography>
            </Box>
          )}
          <Box sx={boxSx} position={'relative'}>
            <Tooltip
              title={
                'The minimum health factor (margin level) at which a position becomes subject to forced liquidation.'
              }
              placement={'top'}
            >
              <Typography
                component={'h4'}
                variant={'body1'}
                color={'textSecondary'}
                display={'flex'}
                alignItems={'center'}
              >
                Liquidation Threshold
                <Info2Icon color={'inherit'} sx={{ marginLeft: 1 / 2 }} />
              </Typography>
            </Tooltip>

            <Typography
              component={'span'}
              marginTop={1}
              display={'inline-flex'}
              variant={'body1'}
              color={'textPrimary'}
              fontSize={'20px'}
              alignItems={'center'}
            >
              {vaultAccountActive ? liquidationThreshold : EmptyValueTag}
            </Typography>
          </Box>
          <Box sx={boxSx} position={'relative'}>
            <Tooltip
              title={
                'The percentage of the position size deducted during liquidation to prevent bad debt.'
              }
              placement={'top'}
            >
              <Typography
                component={'h4'}
                variant={'body1'}
                color={'textSecondary'}
                display={'flex'}
                alignItems={'center'}
              >
                Liquidation Penalty
                <Info2Icon color={'inherit'} sx={{ marginLeft: 1 / 2 }} />
              </Typography>
            </Tooltip>
            <Typography
              component={'span'}
              marginTop={1}
              display={'inline-flex'}
              variant={'body1'}
              color={'textPrimary'}
              fontSize={'20px'}
              alignItems={'center'}
            >
              {vaultAccountActive ? liquidationPenalty : EmptyValueTag}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        flex={1}
        display={'flex'}
        flexDirection={'column'}
        border={'var(--color-border) 1px solid'}
        borderRadius={1.5}
        marginY={3}
        paddingY={2}
        px={2}
      >
        <Box mb={3} display={'flex'} justifyContent={'space-between'} alignItems={'flex-start'}>
          <Tabs
            variant={'scrollable'}
            value={assetsTab}
            onChange={(_, value) => onChangeAssetsTab(value)}
          >
            <Tab value={'assetsView'} label={'Assets'} />
            <Tab value={'positionsView'} label={'Positions'} />
          </Tabs>

          <Button
            variant={'text'}
            startIcon={<OrderListIcon fontSize={'inherit'} color={'inherit'} />}
            sx={{ mr: 2, mt: 1.5, color: 'var(--color-text-primary)' }}
            onClick={onClickRecord}
          >
            {t('labelVaultRecord')}
          </Button>
        </Box>

        {assetsTab === 'assetsView' ? (
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
            onClickDustCollector={() => {
              if (VaultDustCollector.enable) {
                setLocalState({
                  ...localState,
                  modalStatus: 'dustCollector',
                })
              } else {
                setLocalState({
                  ...localState,
                  modalStatus: 'dustCollectorUnavailable',
                })
              }
            }}
            showFilter
          />
        ) : (
          <VaultPositionsTable {...vaultPositionsTableProps} />
        )}

        <Button
          onClick={onClickPortalTrade}
          size={isMobile ? 'medium' : 'large'}
          variant='contained'
          sx={{ mt: isMobile ? 3 : 5, mb: 3, alignSelf: 'center', width: '200px' }}
        >
          Portal Trade
        </Button>
      </Box>

      <Modal
        open={detail?.isShow && !isShowVaultJoin?.isShow}
        onClose={() => setShowDetail({ isShow: false })}
      >
        <SwitchPanelStyled width={'var(--modal-width)'}>
          <ModalCloseButton t={t} onClose={(_e: any) => setShowDetail({ isShow: false } as any)} />
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
                ([sdk.VaultAccountStatus.IN_STAKING].includes(vaultAccountInfo?.accountStatus) ||
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
                      <Typography variant={'body1'} color={'textSecondary'} component={'span'}>
                        {!hideAssets
                          ? walletMap[detail?.detail?.tokenInfo.symbol!]?.count
                            ? PriceTag[CurrencyToTag[currency]] +
                              getValuePrecisionThousand(
                                sdk
                                  .toBig(walletMap[detail?.detail?.tokenInfo.symbol!]!.count)
                                  .times(tokenPrices?.[detail?.detail?.tokenInfo.symbol!] || 0)
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
                  showBtns={
                    vaultAccountInfo &&
                    [sdk.VaultAccountStatus.IN_STAKING].includes(vaultAccountInfo?.accountStatus)
                  }
                  onClickBuy={() => onClickBuy(detail?.detail)}
                  onClickSell={() => onClickSell(detail?.detail)}
                  {...{ ...detail?.detail }}
                />
              </Box>
            </Box>
            {!(
              (vaultAccountInfo &&
                [sdk.VaultAccountStatus.IN_STAKING].includes(vaultAccountInfo?.accountStatus)) ||
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
    </>
  )
  const inactiveView = (
    <Box display={'flex'} mt={3} justifyContent={'space-between'} alignItems={'center'}>
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'center'}
        alignItems={'flex-start'}
        padding={2}
        minHeight={'400px'}
        width={'100%'}
        marginTop={10}
      >
        <Typography
          variant={'h4'}
          mb={2}
          maxWidth={'90%'}
        >
          Loopring Portal functions as an isolated margin account allowing users to borrow and lend tokens using collateral.
        </Typography>
        <Typography
          variant={'h4'}
          mb={5}
          maxWidth={'90%'}
        >
          It enables leveraged trading and provides access to assets beyond Ethereum.
        </Typography>
        <WalletConnectL2Btn width='250px' size={'large'} />
      </Box>
      <Box
        component={'img'}
        width={'40%'}
        mt={8}
        src={
          SoursURL +
          (theme.mode === 'dark' ? '/images/portal_demo_dark.png' : '/images/portal_demo_light.png')
        }
      />
    </Box>
  )
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
        {didAccountSignIn ? activeView : inactiveView}
      </Container>
    </Box>
  )
}

export const VaultDashBoardPanel = ({
  vaultAccountInfo: _vaultAccountInfo,
  closeShowLeverage,
  showLeverage,
}: {
  vaultAccountInfo: VaultAccountInfoStatus
  closeShowLeverage: () => void
  showLeverage: { show: boolean; closeAfterChange: boolean }
}) => {
  const {
    collateralDetailsModalProps,
    maximumCreditModalProps,
    leverageModalProps,
    debtModalProps,
    dustCollectorModalProps,
    dustCollectorUnAvailableModalProps,
    vaultDashBoardPanelUIProps,
    noAccountHintModalProps,
    supplyCollateralHintModalProps,
    closeConfirmModalProps,
    autoRepayModalProps
  } = useVaultDashboard({ showLeverage, closeShowLeverage })
  const {vaultSwapModalProps, smallOrderAlertProps, toastProps, closeAllConfirmModalProps} = useVaultSwap()
  const joinVaultProps = useVaultJoin()
  return (
    <>
      <VaultDashBoardPanelUI
        {...vaultDashBoardPanelUIProps}
        vaultAccountInfo={_vaultAccountInfo.vaultAccountInfo}
      />
      <VaultJoinPanelModal {...joinVaultProps} />
      <CollateralDetailsModal {...collateralDetailsModalProps} />
      <MaximumCreditModal {...maximumCreditModalProps} />
      <LeverageModal {...leverageModalProps} />
      <DebtModal {...debtModalProps} />
      <DustCollectorModal {...dustCollectorModalProps} />
      <DustCollectorUnAvailableModal {...dustCollectorUnAvailableModalProps} />
      <NoAccountHintModal {...noAccountHintModalProps} />
      <VaultSwapModal {...vaultSwapModalProps} />
      <SmallOrderAlert {...smallOrderAlertProps} />
      <SupplyCollateralHintModal {...supplyCollateralHintModalProps} />
      <Toast {...toastProps} />
      <CloseConfirmModal {...closeConfirmModalProps}/>
      <CloseAllConfirmModal {...closeAllConfirmModalProps}/>
      <AutoRepayConfirmModal {...autoRepayModalProps}/>
    </>
  ) 
}
