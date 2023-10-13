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
  TradeBtnStatus,
  AccountStatus,
  L1L2_NAME_DEFINED,
  SoursURL,
  MapChainId,
  VaultAction,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import {
  MenuBtnStyled,
  ModalCloseButtonPosition,
  useSettings,
  VaultAssetsTable,
  Button,
} from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import {
  useAccount,
  useSystem,
  VaultAccountInfoStatus,
  WalletConnectL2Btn,
} from '@loopring-web/core'
import { useGetVaultAssets } from './hook'
import moment from 'moment'

export const VaultDashBoardPanel = ({
  vaultAccountInfo: _vaultAccountInfo,
}: {
  vaultAccountInfo: VaultAccountInfoStatus
}) => {
  const { joinBtnStatus, joinBtnLabel, onJoinPop, vaultAccountInfo } = _vaultAccountInfo
  const { t } = useTranslation()
  const history = useHistory()
  const { forexMap } = useSystem()
  const { isMobile, currency, defaultNetwork } = useSettings()
  const priceTag = PriceTag[CurrencyToTag[currency]]
  const { account } = useAccount()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]

  const { onActionBtnClick, showNoVaultAccount, setShowNoVaultAccount, ...assetPanelProps } =
    useGetVaultAssets({ vaultAccountInfo: _vaultAccountInfo })
  const { totalAsset, hideAssets } = assetPanelProps
  const viewTemplate = React.useMemo(() => {
    switch (account.readyState) {
      case AccountStatus.UN_CONNECT:
      case AccountStatus.LOCKED:
      case AccountStatus.NO_ACCOUNT:
      case AccountStatus.NOT_ACTIVE:
        return <WalletConnectL2Btn />
      case AccountStatus.DEPOSITING:
        return (
          <Box
            flex={1}
            display={'flex'}
            justifyContent={'center'}
            flexDirection={'column'}
            alignItems={'center'}
          >
            <img
              className='loading-gif'
              alt={'loading'}
              width='60'
              src={`${SoursURL}images/loading-line.gif`}
            />
            <Typography marginY={3} variant={isMobile ? 'h4' : 'h1'} textAlign={'center'}>
              {t('describeTitleOpenAccounting', {
                l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              })}
            </Typography>
          </Box>
        )
        break
      case AccountStatus.ERROR_NETWORK:
        return (
          <Box
            flex={1}
            display={'flex'}
            justifyContent={'center'}
            flexDirection={'column'}
            alignItems={'center'}
          >
            <Typography marginY={3} variant={isMobile ? 'h4' : 'h1'} textAlign={'center'}>
              {t('describeTitleOnErrorNetwork', {
                connectName: account.connectName,
              })}
            </Typography>
          </Box>
        )
        break
      case AccountStatus.ACTIVATED:
        return (
          <Button
            size={'medium'}
            className={'vaultInProcessing'}
            onClick={onJoinPop}
            loading={'false'}
            variant={'contained'}
            fullWidth={true}
            sx={{ minWidth: 'var(--walletconnect-width)' }}
            loading={(joinBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false') as any}
            disabled={
              joinBtnStatus === TradeBtnStatus.DISABLED || joinBtnStatus === TradeBtnStatus.LOADING
            }
          >
            {joinBtnLabel}
          </Button>
        )
      default:
        break
    }
  }, [account.readyState, account.connectName, isMobile])

  return (
    <Box flex={1} display={'flex'} flexDirection={'column'}>
      <Modal open={showNoVaultAccount} onClose={() => setShowNoVaultAccount(false)}>
        <>
          <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
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
              <ModalCloseButtonPosition
                right={2}
                top={2}
                t={t}
                onClose={() => setShowNoVaultAccount(false)}
              />
              <Typography marginBottom={3} variant={'h3'}>
                TODO label What is Vault
              </Typography>
              <Typography marginBottom={3} variant={'h3'}>
                TODO label What is des
              </Typography>
              <>{viewTemplate}</>
            </Box>
          </Box>
        </>
      </Modal>
      <Container
        maxWidth='lg'
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
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
                        {totalAsset
                          ? getValuePrecisionThousand(
                              sdk.toBig(totalAsset ?? 0).times(forexMap[currency] ?? 0),
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
                    color={'textSecondary'}
                    paddingRight={1}
                  >
                    {t('labelVaultOpenDate')}
                  </Typography>
                  <Typography component={'span'} variant={'h4'} color={'textPrimary'}>
                    {vaultAccountInfo?.accountStatus == sdk.VaultAccountStatus.IN_STAKING
                      ? moment(new Date(vaultAccountInfo?.collateralInfo?.openDate)).format(
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
                  <Typography component={'span'} variant={'h4'} color={'textSecondary'}>
                    <MarginLevelIcon />
                  </Typography>
                </Box>
                <Box>
                  <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                    {t('labelVaultTotalCollateral')}
                  </Typography>
                  <Typography
                    component={'span'}
                    variant={'h4'}
                    color={'textSecondary'}
                  ></Typography>
                </Box>
                <Box>
                  <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                    {t('labelVaultTotalDebt')}
                  </Typography>
                  <Typography
                    component={'span'}
                    variant={'h4'}
                    color={'textSecondary'}
                  ></Typography>
                </Box>
                <Box>
                  <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                    {t('labelVaultTotalEquity')}
                  </Typography>
                  <Typography
                    component={'span'}
                    variant={'h4'}
                    color={'textSecondary'}
                  ></Typography>
                </Box>
                <Box>
                  <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                    {t('labelVaultProfit')}
                  </Typography>
                  <Typography
                    component={'span'}
                    variant={'h4'}
                    color={'textSecondary'}
                  ></Typography>
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
                  onActionBtnClick(VaultAction.VaultLoad)
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
                  <LoadIcon color={'inherit'} fontSize={'inherit'} sx={{ marginRight: 1 / 2 }} />
                  {t('labelVaultLoadBtn')}
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
                  <MarginIcon color={'inherit'} fontSize={'inherit'} sx={{ marginRight: 1 / 2 }} />
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
      </Container>
    </Box>
  )
}
