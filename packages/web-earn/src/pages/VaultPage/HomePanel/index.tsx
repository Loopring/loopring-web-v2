import { Box, Container, Divider, IconButton, Modal, Typography } from '@mui/material'
import React from 'react'
import {
  CurrencyToTag,
  EmptyValueTag,
  getValuePrecisionThousand,
  HiddenTag,
  LoadIcon,
  PriceTag,
  RouterPath,
  SoursURL,
  TradeBtnStatus,
  VaultAction,
  VaultIcon,
  VaultKey,
  VaultTradeIcon,
} from '@loopring-web/common-resources'
import {
  BoxBannerStyle,
  Button,
  MarketDetail,
  MarketTable,
  ModalCloseButton,
  useSettings,
  SwitchPanelStyled,
  useOpenModals,
} from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import * as sdk from '@loopring-web/loopring-sdk'
import {
  makeVaultLayer2,
  useSystem,
  useVaultLayer2,
  VaultAccountInfoStatus,
  useVaultMap,
} from '@loopring-web/core'
import { useHistory } from 'react-router-dom'
import { useTheme } from '@emotion/react'
import { useVaultMarket } from './hook'

export const VaultHomePanel = ({
  vaultAccountInfo: { joinBtnLabel, joinBtnStatus, onJoinPop },
}: {
  vaultAccountInfo: VaultAccountInfoStatus
}) => {
  const { isMobile } = useSettings()
  const { forexMap, etherscanBaseUrl } = useSystem()
  const theme = useTheme()
  const { t } = useTranslation()
  const { vaultAccountInfo, activeInfo } = useVaultLayer2()
  const { tokenMap: vaultTokenMap, tokenPrices } = useVaultMap()
  const {
    modals: { isShowConfirmedVault, isShowVaultJoin },
  } = useOpenModals()
  const history = useHistory()
  const tableRef = React.useRef<HTMLDivElement>()
  const { marketProps: vaultMarketProps, detail, setShowDetail } = useVaultMarket({ tableRef })
  const walletMap = makeVaultLayer2({ needFilterZero: true }).vaultLayer2Map ?? {}
  const { hideL2Assets, currency } = useSettings()
  return (
    <Box flex={1} display={'flex'} flexDirection={'column'}>
      {/* <BoxBannerStyle className={isMobile ? 'mobile' : ''} direction={'right'}>
        <Container
          maxWidth='lg'
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          <Box marginY={3} display={'flex'} justifyContent={'space-between'}>
            <Box
              flex={1}
              maxWidth={440}
              display={'flex'}
              flexDirection={'column'}
              justifyContent={'center'}
            >
              <Typography component={'h2'} variant={'h3'}>
                {t('labelTitleVault')}
              </Typography>

              <Typography component={'p'} variant={'body1'}>
                {t('labelTitleVaultDes')}
              </Typography>
              <Box marginY={2} display={'flex'} flexDirection={'row'}>
                {(vaultAccountInfo &&
                  [sdk.VaultAccountStatus.IN_STAKING].includes(vaultAccountInfo?.accountStatus)) ||
                activeInfo?.hash ? (
                  <Button
                    size={'medium'}
                    onClick={() => {
                      history.push(`${RouterPath.vault}/${VaultKey.VAULT_DASHBOARD}`)
                    }}
                    loading={'false'}
                    variant={'contained'}
                    sx={{ minWidth: 'var(--walletconnect-width)' }}
                  >
                    {t('labelGoVaultDashBoard')}
                  </Button>
                ) : (
                  <Button
                    size={'medium'}
                    onClick={onJoinPop}
                    loading={'false'}
                    variant={'contained'}
                    sx={{ minWidth: 'var(--walletconnect-width)' }}
                    disabled={
                      joinBtnStatus === TradeBtnStatus.DISABLED ||
                      joinBtnStatus === TradeBtnStatus.LOADING
                    }
                  >
                    {joinBtnLabel}
                  </Button>
                )}
              </Box>
            </Box>
            {!isMobile && (
              <Box>
                <VaultIcon
                  style={{
                    width: 180,
                    height: 180,
                  }}
                  primary={theme.colorBase.textPrimary}
                  secondary={theme.colorBase.textSecondary}
                  fill={theme.colorBase.textPrimary}
                />
              </Box>
            )}
          </Box>
        </Container>
      </BoxBannerStyle> */}
      {/* <Box
        flex={1}
        display={'flex'}
        flexDirection={'column'}
        sx={{
          background: 'var(--color-pop-bg)',
        }}
        mt={6}
      > */}
        <Container
          maxWidth='lg'
          sx={{
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--color-pop-bg)',
            flex: 1,
            mt: 6,
            mb: 4,
            borderRadius: '8px'
          }}
        >
          <MarketTable {...{ ...vaultMarketProps }} hiddenFav={true} />
        </Container>

      <Modal
        open={detail?.isShow && !isShowConfirmedVault?.isShow && !isShowVaultJoin?.isShow}
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
                        {!hideL2Assets
                          ? walletMap[detail?.detail?.tokenInfo.symbol]?.count
                            ? getValuePrecisionThousand(
                                walletMap[detail?.detail?.tokenInfo.symbol]?.count ?? 0,
                                vaultTokenMap[detail?.detail?.tokenInfo.symbol].precision,
                                vaultTokenMap[detail?.detail?.tokenInfo.symbol].precision,
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
                        {!hideL2Assets
                          ? walletMap[detail?.detail?.tokenInfo.symbol]?.count
                            ? PriceTag[CurrencyToTag[currency]] +
                              getValuePrecisionThousand(
                                sdk
                                  .toBig(walletMap[detail?.detail?.tokenInfo.symbol]?.count)
                                  .times(tokenPrices?.[detail?.detail?.tokenInfo.symbol] || 0)
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
                      {/* <Box marginTop={2} display={'flex'} flexDirection={'row'}>
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
                        <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
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
                      </Box> */}
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
                  showBtns={vaultAccountInfo && [sdk.VaultAccountStatus.IN_STAKING].includes(vaultAccountInfo?.accountStatus)}
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
                  <Button
                    size={'medium'}
                    onClick={() => {
                      setShowDetail({ isShow: false })
                      onJoinPop({})
                    }}
                    loading={'false'}
                    variant={'contained'}
                    sx={{ minWidth: 'var(--walletconnect-width)' }}
                    disabled={
                      joinBtnStatus === TradeBtnStatus.DISABLED ||
                      joinBtnStatus === TradeBtnStatus.LOADING
                    }
                  >
                    {joinBtnLabel}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </SwitchPanelStyled>
      </Modal>
    </Box>
  )
}
