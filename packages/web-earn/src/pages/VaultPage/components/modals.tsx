import { Box, Typography, Modal, Divider, IconButton, Slider, Checkbox, Tooltip, Popover, Switch, Grid, Button as MuiButton, Input, Select, MenuItem, ButtonProps, styled, CircularProgress } from '@mui/material'
import { AvatarCoin, Button, CoinIcon, CoinIcons, CountDownIcon, IconButtonStyled, InputSearch, Loading, LoadingStyled, ModalCloseButtonPosition, SpaceBetweenBox, SwapTradeData } from '@loopring-web/component-lib'
import { BackIcon, CheckBoxIcon, CheckedIcon, CloseIcon, CompleteIcon, EmptyValueTag, hexToRGB, Info2Icon, InfoIcon, LoadingIcon, mapSpecialTokenName, MarginLevelIcon, OrderListIcon, ReverseIcon, SwapSettingIcon, TokenType, WaitingIcon } from '@loopring-web/common-resources'
import { numberFormat, VaultTradeTradeData, ViewAccountTemplate } from '@loopring-web/core'
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import _ from 'lodash';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useTranslation } from 'react-i18next';
import Decimal from 'decimal.js';
import {
  CollateralDetailsModalProps,
  MaximumCreditModalProps,
  LeverageModalProps,
  DebtModalProps,
  DustCollectorProps,
  DustCollectorUnAvailableModalProps
} from '../interface';
// import styled from '@emotion/styled';
import { RiskComponent, RiskInformation, SlippagePanel } from '@loopring-web/component-lib/src/components/tradePanel/components';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useTheme } from '@emotion/react';
import { current } from '@reduxjs/toolkit';
import React from 'react';
import { marginLevelTypeToColor } from '@loopring-web/component-lib/src/components/tradePanel/components/VaultWrap/utils';
import EastIcon from '@mui/icons-material/East';
import { marginLevelType } from '@loopring-web/core/src/hooks/useractions/vault/utils';

export const CollateralDetailsModal = (props: CollateralDetailsModalProps) => {
  const { open, onClose, collateralTokens, totalCollateral, maxCredit, onClickMaxCredit, coinJSON } = props
  const { t } = useTranslation()
  return (
    <Modal open={open} onClose={onClose}>
      <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
        <Box
          bgcolor={'var(--color-box)'}
          width={'var(--modal-width)'}
          height={'600px'}
          borderRadius={1}
          display={'flex'}
          flexDirection={'column'}
        >
          <Box
            paddingX={1.5}
            paddingY={1.5}
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <Typography variant={'h5'}>{t('labelVaultCollateralDetails')}</Typography>
            <CloseIcon
              style={{
                height: '20px',
                width: '20px',
              }}
              sx={{
                cursor: 'pointer',
                fontSize: '24px',
                marginRight: 1.5,
                color: 'var(--color-text-third)',
              }}
              onClick={onClose}
            />
          </Box>
          <Divider style={{ marginTop: '-1px', width: '100%' }} />
          <Box paddingX={3}>
            <Box marginTop={3}>
              <Box>
                <Typography variant={'body2'} color={'var(--color-text-third)'}>
                  {t('labelVaultTotalCollateral')}
                </Typography>
                <Typography mt={0.5} variant={'h4'}>
                  {totalCollateral}
                </Typography>
              </Box>
              <Box mt={3}>
                <Typography variant={'body2'} color={'var(--color-text-third)'}>
                  {t('labelVaultMaximumCredit')}
                </Typography>
                <Typography mt={0.5} variant={'h4'}>
                  {maxCredit}
                </Typography>
              </Box>
            </Box>
            
            <Typography
              marginBottom={3}
              marginTop={2}
              variant='body2'
              color={'var(--color-text-secondary)'}
              px={2}
              py={1}
              bgcolor={'var(--color-box-secondary)'}
              borderRadius={'8px'}
              display={'flex'}
              flexDirection={'row'}
            >
              <InfoIcon sx={{ mt: 0.5, marginRight: 1, color: 'var(--color-text-secondary)' }} />
              <Typography>{t('labelVaultMaximumCreditDes')}{' '}
              <Typography
                component={'span'}
                onClick={onClickMaxCredit}
                color={'var(--color-primary)'}
                sx={{ cursor: 'pointer' }}
              >
                {t('labelLearnMore2')}
              </Typography></Typography>
              
            </Typography>
            {collateralTokens.map((token) => {
              return (
                <Box
                  borderRadius={'8px'}
                  border={'1px solid var(--color-border)'}
                  paddingX={2}
                  paddingY={1.5}
                  marginBottom={2}
                  key={token.name}
                >
                  <SpaceBetweenBox
                    alignItems={'center'}
                    leftNode={
                      <Box display={'flex'} alignItems={'center'}>
                        <CoinIcons type={TokenType.single} tokenIcon={[coinJSON]} />
                        <Typography marginLeft={1}>{mapSpecialTokenName(token.name)}</Typography>
                      </Box>
                    }
                    rightNode={
                      <Box>
                        <Typography textAlign={'right'}>{token.amount}</Typography>
                        <Typography
                          color={'var(--color-text-secondary)'}
                          textAlign={'right'}
                          variant={'body2'}
                        >
                          {token.valueInCurrency}
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              )
            })}
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}
export const MaximumCreditModal = (props: MaximumCreditModalProps) => {
  const { open, onClose, onClickBack, collateralFactors, maxLeverage } = props
  const { t } = useTranslation()
  return (
    <Modal open={open} onClose={onClose}>
      <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
        <Box
          bgcolor={'var(--color-box)'}
          width={'var(--modal-width)'}
          height={'600px'}
          borderRadius={1}
          display={'flex'}
          flexDirection={'column'}
          sx={{
            overflowY: 'scroll'
          }}
        >
          <Box
            paddingX={1.5}
            paddingY={1.5}
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <Box display={'flex'} alignItems={'center'}>
              <BackIcon sx={{ marginRight: 2,cursor: 'pointer' }} onClick={onClickBack}/>
              <Typography variant={'h5'}>{t('labelVaultMaximumCredit')}</Typography>
            </Box>
            <CloseIcon
              style={{
                height: '20px',
                width: '20px',
              }}
              sx={{
                cursor: 'pointer',
                fontSize: '24px',
                marginRight: 1.5,
                color: 'var(--color-text-third)',
              }}
              onClick={onClose}
            />
          </Box>
          <Divider style={{ marginTop: '-1px', width: '100%' }} />
          <Box paddingX={3}>
            <Typography
              marginTop={2}
              marginBottom={2}
              color={'var(--color-warning)'}
            >
              {t('labelVaultMaximumLeverage')}: {maxLeverage}x
            </Typography>
            <Typography
              marginTop={3}
              marginBottom={2}
              variant='body2'
              color={'var(--color-text-secondary)'}
            >
              {t('labelVaultMaximumCreditDesLong')}{' '}
            </Typography>
            <Typography marginBottom={2} variant='body2' color={'var(--color-text-secondary)'}>
              {t('labelVaultMaximumCreditFormula')}
            </Typography>
            <Typography  marginTop={4} color={'var(--color-text-secondary)'} variant='h5'>
              {t('labelVaultPriceFactor')}
            </Typography>
            <Box
              marginTop={2}
              marginBottom={3}
              padding={2.5}
              bgcolor={'var(--color-box-secondary)'}
              borderRadius={'8px'}
            >
              {collateralFactors.map((collateralFactor, index) => {
                return (
                  <SpaceBetweenBox
                    key={collateralFactor.name}
                    marginTop={index === 0 ? 0 : 2}
                    leftNode={
                      <Typography color={'var(--color-text-secondary)'}>
                        {collateralFactor.name}
                      </Typography>
                    }
                    rightNode={<Typography>{collateralFactor.collateralFactor}</Typography>}
                  />
                )
              })}
            </Box>
            
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

export const LeverageModal = (props: LeverageModalProps) => {
  const {
    open,
    onClose,
    onClickMaxCredit,
    currentLeverage,
    onClickReduce,
    onClickAdd,
    maxLeverage,
    onClickLeverage,
    borrowAvailable,
    borrowed,
    maximumCredit,
    isLoading
  } = props
  const { t } = useTranslation()
  return (
    <Modal open={open} onClose={onClose}>
      <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'} position={'relative'}>
        {isLoading && <Loading size={40} sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}/>}
        <Box
          bgcolor={'var(--color-box)'}
          width={'var(--modal-width)'}
          height={'620px'}
          borderRadius={1}
          display={'flex'}
          flexDirection={'column'}
        >
          <Box
            paddingX={1.5}
            paddingY={1.5}
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <Typography variant={'h5'}>{t('labelVaultLeverage')}</Typography>
            <CloseIcon
              style={{
                height: '20px',
                width: '20px',
              }}
              sx={{
                cursor: 'pointer',
                fontSize: '24px',
                marginRight: 1.5,
                color: 'var(--color-text-third)',
              }}
              onClick={onClose}
            />
          </Box>
          <Divider style={{ marginTop: '-1px', width: '100%' }} />
          <Box paddingX={3}>
            <Box
              borderRadius={'4px'}
              padding={1}
              justifyContent={'space-between'}
              marginTop={4}
              marginBottom={2.5}
              display={'flex'}
              bgcolor={'var(--color-box-secondary)'}
              alignItems={'center'}
            >
              <IconButton onClick={onClickReduce}>
                <RemoveIcon
                  sx={{
                    cursor: 'pointer',
                    color: 'var(--color-text-secondary)',
                    fontSize: '16px',
                  }}
                />
              </IconButton>

              <Typography>
                {currentLeverage
                  ? `${numberFormat(currentLeverage, { fixed: 0 })}x`
                  : EmptyValueTag}
              </Typography>
              <IconButton onClick={onClickAdd}>
                <AddIcon
                  sx={{
                    cursor: 'pointer',
                    color: 'var(--color-text-secondary)',
                    fontSize: '16px',
                  }}
                />
              </IconButton>
            </Box>
            <Box sx={{ width: '100%' }}>
              <Slider
                aria-label='Always visible'
                value={currentLeverage ? ((currentLeverage - 1) / maxLeverage) * 100 : 0}
                onChange={(_, _value) => {
                  const value = _value as number
                  const leverage = value / 100 * maxLeverage + 1
                  
                  onClickLeverage(Math.round(leverage))
                }}
                max={90}
                marks={_.range(0, maxLeverage).map((number) => ({
                  value: (number / maxLeverage) * 100,
                  label: `${number + 1}x`,
                }))}
              />
            </Box>
            <Box
              marginTop={2}
              marginBottom={3}
              padding={2.5}
              bgcolor={'var(--color-box-secondary)'}
              borderRadius={'8px'}
            >
              <SpaceBetweenBox
                leftNode={
                  <Typography color={'var(--color-text-secondary)'}>{t('labelVaultAvailableBorrow')}</Typography>
                }
                rightNode={<Typography>{borrowAvailable}</Typography>}
                marginBottom={2}
              />
              <SpaceBetweenBox
                leftNode={<Typography color={'var(--color-text-secondary)'}>{t('labelVaultBorrowed')}</Typography>}
                rightNode={<Typography>{borrowed}</Typography>}
                marginBottom={2}
              />
              <SpaceBetweenBox
                leftNode={
                  <Typography color={'var(--color-text-secondary)'}>{t('labelVaultMaximumCredit')}</Typography>
                }
                rightNode={<Typography>{maximumCredit}</Typography>}
              />
            </Box>
            <Typography
              marginBottom={3}
              marginTop={3}
              variant='body2'
              color={'var(--color-text-secondary)'}
            >
              {t('labelVaultMaximumCreditDes')}{' '}
              <Typography
                component={'span'}
                onClick={onClickMaxCredit}
                variant='body2'
                color={'var(--color-primary)'}
                sx={{ cursor: 'pointer' }}
              >
                {t('labelLearnMore2')}
              </Typography>
            </Typography>
          </Box>
          <Divider style={{ marginTop: '-1px', width: '100%' }} />
          <Box paddingX={3} marginTop={3}>
            <Typography marginBottom={2} variant='body2' color={'var(--color-text-secondary)'}>
              {t('labelVaultLeverageRisk1')}
            </Typography>
            <Typography marginBottom={2} variant='body2' color={'var(--color-text-secondary)'}>
              {t('labelVaultLeverageRisk2')}
            </Typography>
            <Typography marginBottom={2} variant='body2' color={'var(--color-text-secondary)'}>
              {t('labelVaultLeverageRisk3')}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

export const DebtModal = (props: DebtModalProps) => {
  const {
    open,
    onClose,
    borrowedVaultTokens,
    totalFundingFee,
    totalBorrowed,
    totalDebt,
  } = props
  const { t } = useTranslation()
  return (
    <Modal open={open} onClose={onClose}>
      <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
        <Box
          bgcolor={'var(--color-box)'}
          width={'var(--modal-width)'}
          height={'620px'}
          borderRadius={1}
          display={'flex'}
          flexDirection={'column'}
        >
          <Box
            paddingX={1.5}
            paddingY={1.5}
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <Typography variant={'h5'}>{t('labelVaultDebt')}</Typography>
            <CloseIcon
              style={{
                height: '20px',
                width: '20px',
              }}
              sx={{
                cursor: 'pointer',
                fontSize: '24px',
                marginRight: 1.5,
                color: 'var(--color-text-third)',
              }}
              onClick={onClose}
            />
          </Box>
          <Divider style={{ marginTop: '-1px', width: '100%' }} />
          <Box paddingX={3}>
            <Box
              borderRadius={'8px'}
              padding={2}
              marginTop={4}
              marginBottom={2}
              bgcolor={'var(--color-box-secondary)'}
            >
              <Typography marginBottom={2} fontSize={'16px'}>{t('labelVaultDebtDetails')}</Typography>
              <SpaceBetweenBox
                marginBottom={2}
                leftNode={
                  <Typography color={'var(--color-text-secondary)'}>
                    {t('labelVaultTotalDebt')}
                  </Typography>
                }
                rightNode={
                  <Typography>
                    {totalDebt}
                  </Typography>
                }
              />
              <SpaceBetweenBox
                marginBottom={2}
                leftNode={
                  <Typography color={'var(--color-text-secondary)'}>
                    {t('labelVaultTotalBorrowed')}
                  </Typography>
                }
                rightNode={
                  <Typography>
                    {totalBorrowed}
                  </Typography>
                }
              />
              <SpaceBetweenBox
                leftNode={
                  <Typography color={'var(--color-text-secondary)'}>
                    {t('labelVaultTotalFundingFee')}
                  </Typography>
                }
                rightNode={
                  <Typography>
                    {totalFundingFee}
                  </Typography>
                }
              />
            </Box>  
            <Typography fontSize={'16px'} marginBottom={2}>{t('labelVaultBorrowed')}</Typography>
          </Box>
          <Divider style={{ width: '100%' }} />
          <Box paddingX={3} marginTop={3}>
            {borrowedVaultTokens && borrowedVaultTokens.length > 0 ? borrowedVaultTokens.map(token => {
              return (
                <SpaceBetweenBox
                  key={token.symbol}
                  marginBottom={2}
                  paddingX={2}
                  paddingY={1.5}
                  borderRadius={'8px'}
                  border={'1px solid var(--color-border)'}
                  alignItems={'center'}
                  sx={{
                    cursor: 'pointer'
                  }}
                  onClick={token.onClick}
                  leftNode={
                    <Box display={'flex'} alignItems={'center'}>
                      <CoinIcons type={TokenType.vault} tokenIcon={[token.coinJSON]} />
                      <Typography marginLeft={1}>{token.symbol}</Typography>
                    </Box>
                  }
                  rightNode={
                    <Box display={'flex'} alignItems={'center'}>
                      <Box marginRight={1}>
                        <Typography textAlign={'right'}>{token.amount}</Typography>
                        <Typography
                          color={'var(--color-text-secondary)'}
                          textAlign={'right'}
                          variant={'body2'}
                        >
                          {token.valueInCurrency}
                        </Typography>
                      </Box>
                      <ArrowForwardIosIcon sx={{ color: 'var(--color-text-primary)' }} />
                    </Box>
                  }
                />
              )
            }) : <Typography mt={4} textAlign={'center'} color={'var(--color-text-third)'} >{t('labelEmptyDefault')}</Typography>}
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

export const DustCollectorModal = (props: DustCollectorProps) => {
  const {
    open,
    converting,
    onClose,
    totalValueInUSDT,
    totalValueInCurrency,
    onClickConvert,
    convertBtnDisabled,
    onClickRecords,
  } = props
  const { t } = useTranslation()
  return (
    <Modal open={open} onClose={onClose}>
      <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
        <Box
          bgcolor={'var(--color-box)'}
          width={'var(--modal-width)'}
          height={'500px'}
          borderRadius={1}
          display={'flex'}
          flexDirection={'column'}
          sx={{ overflowY: 'scroll' }}
          position={'relative'}
        >
          {converting && <Loading size={40} sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}/>}
          <Box
            paddingX={1.5}
            paddingY={1.5}
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <Typography variant={'h5'}>{t('labelDustCollectorDetail')}</Typography>
            <Box>
              <OrderListIcon
                style={{
                  height: '20px',
                  width: '20px',
                }}
                sx={{
                  cursor: 'pointer',
                  marginRight: 1.5,
                  color: 'var(--color-text-third)',
                }}
                onClick={onClickRecords}
              />
              <CloseIcon
                style={{
                  height: '20px',
                  width: '20px',
                }}
                sx={{
                  cursor: 'pointer',
                  marginRight: 1.5,
                  color: 'var(--color-text-third)',
                }}
                onClick={onClose}
              />
            </Box>
          </Box>
          <Divider style={{ marginTop: '-1px', width: '100%' }} />
          <Box paddingX={3} paddingTop={5} paddingBottom={4}>
            {(props.dusts && props.dusts.length > 0) ? props.dusts.map((dust) => {
              return (
                <SpaceBetweenBox
                  marginBottom={1}
                  key={dust.symbol}
                  leftNode={
                    <Box display={'flex'} alignItems={'center'}>
                      <Checkbox
                        checked={dust.checked}
                        checkedIcon={<CheckedIcon />}
                        icon={<CheckBoxIcon />}
                        color='default'
                        onChange={dust.onCheck}
                      />
                      <CoinIcons type={TokenType.vault} tokenIcon={[dust.coinJSON]} />
                      <Typography sx={{ marginLeft: 1 }}>{dust.symbol}</Typography>
                    </Box>
                  }
                  rightNode={
                    <Box>
                      <Typography textAlign={'right'}>{dust.amount}</Typography>
                      <Typography
                        color={'var(--color-text-secondary)'}
                        textAlign={'right'}
                        variant={'body2'}
                      >
                        {dust.valueInCurrency}
                      </Typography>
                    </Box>
                  }
                />
              )
            }) : <Typography textAlign={'center'} color={'var(--color-text-third)'} >{t('labelVaultNoDust')}</Typography>}
          </Box>
          <Divider style={{ width: '100%' }} />
          <Box paddingX={3}>
            <SpaceBetweenBox
              marginTop={3}
              leftNode={
                <Typography display={'flex'} alignItems={'center'} color={'var(--color-text-third)'}>
                  {t('labelVaultValueEst')}
                  <Tooltip
                    title={
                      'The token price changes dynamically, the dust value you see here may be inconsistent with the final value.'
                    }
                    placement={'top'}
                  >
                    <IconButton>
                      <Info2Icon sx={{ color: 'var(--color-text-secondary)', marginLeft: 1 / 2 }} />
                    </IconButton>
                  </Tooltip>
                </Typography>
              }
              rightNode={
                <Typography>
                  {totalValueInUSDT} USDT / {totalValueInCurrency}
                </Typography>
              }
            />
            <Typography marginBottom={3} color={'var(--color-text-secondary)'} marginTop={5}>
              {t('labelVaultDustCollectorDes')}
            </Typography>
            <Button
              sx={{ marginTop: 6, marginBottom: 4 }}
              disabled={convertBtnDisabled}
              fullWidth
              onClick={onClickConvert}
              variant={'contained'}
            >
              {t('labelVaultConvert')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

export const DustCollectorUnAvailableModal = (props: DustCollectorUnAvailableModalProps) => {
  const {
    open,
    onClose,
  } = props
  const { t } = useTranslation()
  return (
    <Modal open={open} onClose={onClose}>
      <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
        <Box
          bgcolor={'var(--color-box)'}
          width={'var(--modal-width)'}
          height={'200px'}
          borderRadius={1}
          display={'flex'}
          flexDirection={'column'}
          justifyContent={'center'}
          alignItems={'center'}
          position={'relative'}
        >
          <CloseIcon
            style={{
              height: '20px',
              width: '20px',
            }}
            sx={{
              cursor: 'pointer',
              fontSize: '24px',
              marginRight: 1.5,
              color: 'var(--color-text-third)',
              position: 'absolute',
              top: 16,
              right: 16,
            }}
            onClick={onClose}
          />
          <Typography variant={'h3'}>{t('labelVaultDustCollectorUnavailableTitle')}</Typography>
          <Typography color={'var(--color-text-secondary)'} mt={6}>
            {t('labelVaultDustCollectorUnavailableDes')}
          </Typography>
        </Box>
      </Box>
    </Modal>
  )
}
export interface NoAccountHintModalProps {

    open: boolean
    onClose: () => void
    dialogBtn: React.ReactNode
    title: string
    des: React.ReactNode
}
export const NoAccountHintModal = (props: NoAccountHintModalProps) => {
  const { open, onClose, title, dialogBtn, des } = props
  const { t } = useTranslation()
  return (
    <Modal open={open} onClose={onClose} sx={{ zIndex: 1000 }}>
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
          <ModalCloseButtonPosition right={2} top={2} t={t} onClose={onClose} />
          <ViewAccountTemplate
            className={'inModal'}
            activeViewTemplate={
              <>
                <Typography marginBottom={3} variant={'h4'}>
                  {t(title)}
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
                  {des}
                </Typography>
                <>{dialogBtn}</>
              </>
            }
          />
        </Box>
      </Box>
    </Modal>
  )
}
export interface SmallOrderAlertProps {
  open: boolean
  handleClose: () => void
  handleConfirm: () => void
  estimatedFee: string
  feePercentage: string
  minimumReceived: string
}
export const SmallOrderAlert = (props: SmallOrderAlertProps) => {
  const { open, handleClose, handleConfirm, estimatedFee, feePercentage, minimumReceived } = props
  const { t } = useTranslation('common')
  const label: RiskInformation[] = [
    {
      label: t('labelSmallOrderAlertLine3'),
      value: `${estimatedFee}`,
      color: 'var(--color-text-primary)',
    },
    {
      label: t('labelSmallOrderAlertLine5'),
      value: `${minimumReceived}`,
      color: 'var(--color-text-primary)',
    },
    {
      label: t('labelSmallOrderAlertLine4'),
      value: `${feePercentage}%`,
      color: 'var(--color-error)',
    },
  ]

  return (
    <RiskComponent
      title={t('labelSmallOrderAlertLine')}
      open={open}
      infos={label}
      handleClose={handleClose}
      handleConfirm={handleConfirm}
    />
  )
}




const PopoverStyled = styled(Popover)`
  .MuiPaper-elevation2 {
    box-shadow: none;
    padding: 0;
    width: 250px;
  }

  .MuiBackdrop-root {
    background: transparent;
  }
`


const BgButton = styled(MuiButton)<{ customBg: string }>`
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

export interface VaultSwapModalProps {
  open: boolean
  onClose: () => void
  setting: {
    hideLeverage?: boolean
    onClickSettingLeverage: () => void
    leverage: number
    onSwitchChange: () => void
    secondConfirmationChecked: boolean
    settingPopoverOpen: boolean
    onCloseSettingPopover: () => void
    onClickSettingBtn: () => void
    slippageList: string[]
    currentSlippage: string
    onSlippageChange: (slippage: string, customSlippage: string) => void
  }
  countdown: {
    countDownSeconds: number
    onRefreshData: () => void
    ref: React.RefObject<any>
  }
  isLongOrShort: 'long' | 'short'
  onClickBalance: () => void
  onClickToken: () => void
  balance: string
  token: {
    symbol: string
    coinJSON: any
  }
  onInputAmount: (amount: string) => void
  amountInput: string
  inputPlaceholder: string
  inputAlert: {
    show: boolean
    message: string
    type: 'error' | 'warning' | 'success'
    icon?: 'completed' | 'wait'
  }
  swapRatio: string
  onClickReverse: () => void
  maxTradeValue: string
  borrowed: string
  totalQuota: string
  marginLevelChange: {
    from: {
      type: 'danger' | 'safe' | 'warning'
      marginLevel: string
    }
    to?: {
      type: 'danger' | 'safe' | 'warning'
      marginLevel: string
    } 
  }
  hourlyInterestRate: string
  tradingFee: string
  slippageTolerance: string
  myPositions:
    | {
        tokenSymbol: string
        longOrShort: 'long' | 'short'
        marginLevel: string
        leverage: string
        amount: string
        // marketPrice: string
        onClickLeverage: () => void
        onClickTrade: () => void
        onClickClose: () => void
      }[]
    | undefined
  positionTypeSelection: {
    onChange: (value: string) => void
    items: [
      {
        label: string
        value: string
      },
    ]
    value: string
  }
  leverageSelection: {
    onChange: (value: string) => void
    items: [
      {
        label: string
        value: string
      },
    ]
    value: string
  }
  ratioSlider: {
    currentRatio?: number
    onClickRatio: (no: number) => void
  }
  hideOther: boolean
  onClickHideOther: () => void
  onClickLongShort: (v: 'long' | 'short') => void
  tokenSelection: {
    show: boolean,
    search: string,
    onInputSearch: (search: string) => void
    tokens: {
      coinJSON: any,
      symbol: string,
      amount: string,
      onClick: () => void
    }[]
    onClickCancel: () => void
  }
  tradeBtn: {
    disabled: boolean,
    label?: string
    onClick: () => void
    loading?: boolean
  }
  mainViewRef: React.RefObject<HTMLDivElement>
}

export const VaultSwapModal = (props: VaultSwapModalProps) => {
  const {
    open,
    onClose,
    setting: {
      hideLeverage,
      onClickSettingLeverage,
      leverage,
      onSwitchChange,
      secondConfirmationChecked,
      onCloseSettingPopover,
      settingPopoverOpen,
      onClickSettingBtn,
      slippageList,
      currentSlippage,
      onSlippageChange,
    },
    countdown,
    isLongOrShort,
    onClickBalance,
    balance,
    onClickToken,
    token,
    onInputAmount,
    amountInput,
    inputPlaceholder,
    inputAlert,
    swapRatio,
    onClickReverse,
    maxTradeValue,
    borrowed,
    totalQuota,
    marginLevelChange,
    hourlyInterestRate,
    tradingFee,
    slippageTolerance ,
    myPositions,
    leverageSelection,
    positionTypeSelection,
    ratioSlider,
    hideOther,
    onClickHideOther,
    onClickLongShort,
    tokenSelection,
    tradeBtn,
    mainViewRef
  } = props
  const { t } = useTranslation()
  const theme = useTheme()
  const settingPopoverId = 'setting'
  const anchorRef = React.useRef<HTMLButtonElement>(null);

  const mainView = (
    <Box
      bgcolor={'var(--color-box)'}
      width={'var(--modal-width)'}
      height={'700px'}
      overflow={'auto'}
      ref={mainViewRef}
      borderRadius={1}
      display={'flex'}
      alignItems={'center'}
      flexDirection={'column'}
      position={'relative'}
    >
      <Box
        px={3}
        py={2.5}
        borderBottom={'1px solid var(--color-divide)'}
        display={'flex'}
        justifyContent={'space-between'}
        width={'100%'}
        alignItems={'center'}
      >
        <Typography variant='h4'>Portal Trade</Typography>
        <Box display={'flex'} alignItems={'center'}>
          <Box>
            <IconButtonStyled
              onClick={(e) => {
                onClickSettingBtn()
              }}
              sx={{ backgroundColor: 'var(--field-opacity)' }}
              className={'switch outlined'}
              aria-label='to Transaction'
              aria-describedby={settingPopoverId}
              size={'large'}
              ref={anchorRef}
            >
              <SwapSettingIcon htmlColor={'var(--color-logo)'} />
            </IconButtonStyled>
            <PopoverStyled
              id={settingPopoverId}
              open={settingPopoverOpen}
              onClose={onCloseSettingPopover}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              sx={{ background: 'transparent' }}
              anchorEl={anchorRef.current}
            >
              <Box
                paddingX={2}
                paddingTop={2}
                paddingBottom={4}
                display={'flex'}
                flexDirection={'column'}
              >
                <Box paddingBottom={1}>
                  <Typography marginBottom={1} component={'span'}>
                    {t('labelSwapSettingTitle')}
                  </Typography>
                  <Typography
                    marginBottom={1}
                    paddingLeft={1}
                    variant={'body2'}
                    color={'var(--color-text-third)'}
                    component={'span'}
                  >
                    {t('swapTolerance')}
                  </Typography>
                </Box>
                <SlippagePanel
                  t={t}
                  max={100}
                  slippageList={slippageList}
                  slippage={currentSlippage}
                  handleChange={(slippage, customSlippage) => {
                    onSlippageChange(slippage, customSlippage)
                  }}
                />

                {!hideLeverage && (
                  <Grid
                    container
                    justifyContent={'space-between'}
                    direction={'row'}
                    alignItems={'center'}
                    height={24}
                    marginTop={2.5}
                  >
                    <Typography
                      component={'span'}
                      variant='body2'
                      color={'textSecondary'}
                      display={'inline-flex'}
                      alignItems={'center'}
                    >
                      {' ' + t('labelVaultLeverage')}
                    </Typography>
                    <Typography
                      component={'span'}
                      variant='body2'
                      color={'textSecondary'}
                      display={'inline-flex'}
                      alignItems={'center'}
                      sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                      mr={1.5}
                      onClick={onClickSettingLeverage}
                    >
                      {leverage}x
                    </Typography>
                  </Grid>
                )}
                <Grid
                  container
                  justifyContent={'space-between'}
                  direction={'row'}
                  alignItems={'center'}
                  height={24}
                  marginTop={1}
                >
                  <Tooltip
                    title={t('labelSwapSettingSecondConfirmTootip').toString()}
                    placement={'bottom'}
                  >
                    <Typography
                      component={'span'}
                      variant='body2'
                      color={'textSecondary'}
                      display={'inline-flex'}
                      alignItems={'center'}
                    >
                      <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                      {' ' + t('labelSwapSettingSecondConfirm')}
                    </Typography>
                  </Tooltip>
                  <Switch
                    onChange={() => {
                      onSwitchChange()
                    }}
                    checked={secondConfirmationChecked}
                  />
                </Grid>
              </Box>
            </PopoverStyled>
          </Box>

          <Box display={'inline-block'} ml={2} component={'span'}>
            <CountDownIcon {...countdown} />
          </Box>
          <IconButton
            sx={{
              ml: 1,
            }}
            size={'large'}
            aria-label={t('labelClose')}
            color={'inherit'}
            onClick={(event) => {
              onClose()
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Box mt={4} width={'100%'} px={3}>
        <BgButton
          variant='contained'
          sx={{
            clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0 100%, 0 0)',
            width: '52%',
            borderRadius: '4px',
            borderTopRightRadius: '0',
            borderBottomRightRadius: '0',
          }}
          customBg={
            isLongOrShort === 'long' ? 'var(--color-success)' : 'var(--color-box-secondary)'
          }
          onClick={() => onClickLongShort('long')}
        >
          Buy / Long
        </BgButton>
        <BgButton
          variant='contained'
          sx={{
            clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%, 10% 0)',
            width: '52%',
            borderRadius: '4px',
            borderTopLeftRadius: '0',
            borderBottomLeftRadius: '0',
            ml: '-4%',
          }}
          customBg={isLongOrShort === 'short' ? 'var(--color-error)' : 'var(--color-box-secondary)'}
          onClick={() => onClickLongShort('short')}
        >
          Sell / Short
        </BgButton>
      </Box>

      <Box mt={3} width={'100%'} px={3}>
        <Select
          value={positionTypeSelection.value}
          onChange={(e, v) => positionTypeSelection.onChange(e.target.value)}
          displayEmpty
          size='small'
        >
          {positionTypeSelection.items.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </Select>
        <Select
          value={leverageSelection.value}
          sx={{ ml: 2 }}
          size='small'
          onChange={(e, v) => leverageSelection.onChange(e.target.value)}
          displayEmpty
        >
          {leverageSelection.items.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <Box mt={3} width={'100%'} px={3}>
        <SpaceBetweenBox
          mb={0.5}
          leftNode={
            <Typography fontSize={'14px'} color={'var(--color-text-third)'}>
              Amount
            </Typography>
          }
          rightNode={
            <Typography
              component={'p'}
              onClick={onClickBalance}
              sx={{ textDecoration: 'underline', cursor: 'pointer' }}
              fontSize={'14px'}
              color={'var(--color-text-secondary)'}
            >
              Available: {balance}
            </Typography>
          }
        />
        <Input
          sx={{
            height: '48px',
            bgcolor: 'var(--color-bg-secondary)',
            textAlign: 'right',
            px: 2,
            fontSize: '20px',
          }}
          placeholder={inputPlaceholder}
          disableUnderline
          fullWidth
          startAdornment={
            <Box
              display={'flex'}
              alignItems={'center'}
              component={'div'}
              sx={{ cursor: 'pointer' }}
              onClick={onClickToken}
            >
              <CoinIcons type={TokenType.single} tokenIcon={[token.coinJSON]} />
              <Typography ml={0.5} fontSize={'16px'} color={'var(--color-text-primary)'}>
                {token.symbol}
              </Typography>
              <KeyboardArrowDownIcon
                sx={{ ml: 0.5, color: 'var(--color-text-secondary)' }}
              ></KeyboardArrowDownIcon>
            </Box>
          }
          inputProps={{ sx: { textAlign: 'right' } }}
          onInput={(e: any) => onInputAmount(e.target.value)}
          value={amountInput}
        />
        <Box
          display={'flex'}
          justifyContent={'end'}
          alignItems={'center'}
          sx={{
            opacity: inputAlert.show ? 1 : 0,
            mt: -1,
            color:
              inputAlert.type === 'error'
                ? 'var(--color-error)'
                : inputAlert.type === 'warning'
                ? 'var(--color-warning)'
                : 'var(--color-success)',
          }}
        >
          {inputAlert.icon === 'wait' ? (
            <WaitingIcon />
          ) : (
            inputAlert.icon === 'completed' && <CompleteIcon />
          )}
          <Typography
            sx={{
              textAlign: 'right',
              color:
                inputAlert.type === 'error'
                  ? 'var(--color-error)'
                  : inputAlert.type === 'warning'
                  ? 'var(--color-warning)'
                  : 'var(--color-success)',
              fontSize: '12px',
              ml: 0.5,
            }}
          >
            {inputAlert.message || '--'}
          </Typography>
        </Box>
      </Box>
      <Box mt={4} width={'100%'} display={'flex'} justifyContent={'center'}>
        <Typography display={'flex'} alignItems={'center'}>
          {swapRatio} <ReverseIcon sx={{ ml: 0.5, cursor: 'pointer' }} onClick={onClickReverse} />
        </Typography>
      </Box>
      <Box pb={4} mt={4} width={'100%'} px={3} borderBottom={'1px solid var(--color-border)'}>
        <SpaceBetweenBox
          leftNode={
            <Tooltip title={'todo'}>
              <Typography
                display={'flex'}
                alignItems={'center'}
                variant={'body2'}
                color={'var(--color-text-third)'}
              >
                Max <Info2Icon sx={{ ml: 0.5 }} />
              </Typography>
            </Tooltip>
          }
          rightNode={
            <Typography variant={'body2'} color={'var(--color-text-primary)'}>
              {maxTradeValue}
            </Typography>
          }
        />
        <Box sx={{ width: '100%' }}>
          <Slider
            value={ratioSlider.currentRatio ? ratioSlider.currentRatio * 100 : 0}
            onChange={(e, value) => {
              ratioSlider.onClickRatio(
                new Decimal(value as number).div(100).toDecimalPlaces(2).toNumber(),
              )
            }}
            min={0}
            max={100}
            valueLabelDisplay='auto'
            valueLabelFormat={(value) => `${value}%`}
            marks={[
              { value: 0, label: '0%' },
              { value: 25, label: '25%' },
              { value: 50, label: '50%' },
              { value: 75, label: '75%' },
              { value: 100, label: '100%' },
            ]}
            size='small'
          />
        </Box>
        <SpaceBetweenBox
          mt={2}
          leftNode={
            <Tooltip title={'todo'}>
              <Typography
                display={'flex'}
                alignItems={'center'}
                variant={'body2'}
                color={'var(--color-text-third)'}
              >
                Borrowed <Info2Icon sx={{ ml: 0.5 }} />
              </Typography>
            </Tooltip>
          }
          rightNode={
            <Typography variant={'body2'} color={'var(--color-text-primary)'}>
              {borrowed}
            </Typography>
          }
        />
        <SpaceBetweenBox
          mt={1}
          leftNode={
            <Tooltip title={'todo'}>
              <Typography
                display={'flex'}
                alignItems={'center'}
                variant={'body2'}
                color={'var(--color-text-third)'}
              >
                Total Quota <Info2Icon sx={{ ml: 0.5 }} />
              </Typography>
            </Tooltip>
          }
          rightNode={
            <Typography variant={'body2'} color={'var(--color-text-primary)'}>
              {totalQuota}
            </Typography>
          }
        />
      </Box>
      <Box mt={2} width={'100%'} px={3}>
        <SpaceBetweenBox
          leftNode={
            <Typography
              display={'flex'}
              alignItems={'center'}
              variant={'body2'}
              color={'var(--color-text-third)'}
            >
              Margin Level
            </Typography>
          }
          rightNode={
            <Box display={'flex'} alignItems={'center'}>
              {marginLevelChange ? (
                <>
                  <Typography color={marginLevelTypeToColor(marginLevelChange.from.type)}>
                    {numberFormat(marginLevelChange.from.marginLevel, { fixed: 2 })}
                  </Typography>
                  {marginLevelChange.to && (
                    <>
                      <EastIcon sx={{ marginX: 0.5 }} />
                      <Typography color={marginLevelTypeToColor(marginLevelChange.to.type)}>
                        {numberFormat(marginLevelChange.to.marginLevel, { fixed: 2 })}
                      </Typography>
                    </>
                  )}
                </>
              ) : (
                EmptyValueTag
              )}
            </Box>
          }
        />
        <SpaceBetweenBox
          mt={1}
          leftNode={
            <Tooltip title={'todo'}>
              <Typography
                display={'flex'}
                alignItems={'center'}
                variant={'body2'}
                color={'var(--color-text-third)'}
              >
                Hourly Interest Rate <Info2Icon sx={{ ml: 0.5 }} />
              </Typography>
            </Tooltip>
          }
          rightNode={
            <Typography variant={'body2'} color={'var(--color-text-primary)'}>
              {hourlyInterestRate}
            </Typography>
          }
        />
        <SpaceBetweenBox
          mt={1}
          leftNode={
            <Tooltip title={'todo'}>
              <Typography
                display={'flex'}
                alignItems={'center'}
                variant={'body2'}
                color={'var(--color-text-third)'}
              >
                Trading Fee (est.) <Info2Icon sx={{ ml: 0.5 }} />
              </Typography>
            </Tooltip>
          }
          rightNode={
            <Typography variant={'body2'} color={'var(--color-text-primary)'}>
              {tradingFee}
            </Typography>
          }
        />
        <SpaceBetweenBox
          mt={1}
          leftNode={
            <Tooltip title={'todo'}>
              <Typography
                display={'flex'}
                alignItems={'center'}
                variant={'body2'}
                color={'var(--color-text-third)'}
              >
                Slippage Tolerance <Info2Icon sx={{ ml: 0.5 }} />
              </Typography>
            </Tooltip>
          }
          rightNode={
            <Typography variant={'body2'} color={'var(--color-text-primary)'}>
              {slippageTolerance}
            </Typography>
          }
        />
      </Box>
      <Box width={'100%'} mt={2} px={3}>
        <BgButton
          variant='contained'
          customBg={isLongOrShort === 'long' ? 'var(--color-success)' : 'var(--color-error)'}
          size='large'
          fullWidth
          onClick={tradeBtn.onClick}
          disabled={tradeBtn.disabled}
        >
          {tradeBtn.loading ? (
            <LoadingIcon className='custom-size' sx={{ fontSize: 24 }} />
          ) : tradeBtn.label ? (
            tradeBtn.label
          ) : isLongOrShort === 'long' ? (
            'Buy/Long'
          ) : (
            'Sell/Short'
          )}
        </BgButton>
      </Box>
      <Box width={'100%'} mt={2} mb={3} px={3} borderRadius={'8px'}>
        <Box bgcolor={'var(--color-box-secondary)'} px={3} py={2}>
          <Typography variant='h4' mb={2}>
            My Positions
          </Typography>
          <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
            <Typography display={'flex'} alignItems={'center'}>
              <Checkbox
                checked={hideOther}
                onChange={() => {
                  onClickHideOther()
                }}
                sx={{
                  width: '16px',
                  height: '16px',
                  mr: 1,
                  ml: -0.25,
                }}
                checkedIcon={<CheckedIcon />}
                icon={<CheckBoxIcon />}
                color='default'
              />
              Hide other tokens
            </Typography>
            {myPositions && myPositions.length > 0 && (
              <BgButton variant='contained' size='small' customBg='var(--color-button-outlined)'>
                Close All
              </BgButton>
            )}
          </Box>

          <Box>
            {myPositions?.length === 0 && (
              <Box
                width={'100%'}
                height={'150px'}
                display={'flex'}
                justifyContent={'center'}
                alignItems={'center'}
              >
                <Typography variant='body2'>No positions</Typography>
              </Box>
            )}
            {myPositions?.map((item) => {
              return (
                <Box key={item.tokenSymbol} py={3} borderBottom={'1px solid var(--color-border)'}>
                  <Box display={'flex'} alignItems={'center'}>
                    <Typography fontSize={'17px'}>{item.tokenSymbol}</Typography>
                    <Typography
                      ml={1}
                      fontSize={'12px'}
                      borderRadius={'4px'}
                      px={1}
                      color={
                        item.longOrShort === 'long'
                          ? theme.colorBase.success
                          : theme.colorBase.error
                      }
                      bgcolor={hexToRGB(
                        item.longOrShort === 'long'
                          ? theme.colorBase.success
                          : theme.colorBase.error,
                        0.5,
                      )}
                    >
                      {item.longOrShort}
                    </Typography>
                    <Box
                      color={
                        marginLevelType(item.marginLevel) === 'warning'
                          ? theme.colorBase.warning
                          : marginLevelType(item.marginLevel) === 'danger'
                          ? theme.colorBase.error
                          : theme.colorBase.success
                      }
                      bgcolor={hexToRGB(
                        marginLevelType(item.marginLevel) === 'warning'
                          ? theme.colorBase.warning
                          : marginLevelType(item.marginLevel) === 'danger'
                          ? theme.colorBase.error
                          : theme.colorBase.success,
                        0.5,
                      )}
                      ml={1}
                      display={'flex'}
                      alignItems={'center'}
                      fontSize={'13px'}
                      borderRadius={'4px'}
                      py={0.15}
                      px={0.5}
                    >
                      <MarginLevelIcon sx={{ mr: 0.5 }} />
                      {item.marginLevel}
                    </Box>
                  </Box>
                  <Typography variant='body2'>{item.leverage}</Typography>
                  <Box display={'flex'} alignItems={'center'} mt={2.5}>
                    <Box>
                      <Typography variant='body2'>Amount</Typography>
                      <Typography>{item.amount}</Typography>
                    </Box>
                    {/* <Box ml={'30%'}>
                      <Typography variant='body2'>Market Price (USDT)</Typography>
                      <Typography>{item.marketPrice}</Typography>
                    </Box> */}
                  </Box>
                  <Box display={'flex'} alignItems={'center'} mt={2.5}>
                    {/* <BgButton
                      variant='contained'
                      size='small'
                      sx={{
                        bgcolor: 'var(--color-button-outlined)',
                        width: '32%',
                        borderRadius: '4px',
                      }}
                      onClick={item.onClickLeverage}
                    >
                      Leverage
                    </BgButton> */}
                    <BgButton
                      variant='contained'
                      size='small'
                      customBg='var(--color-button-outlined)'
                      sx={{
                        width: '32%',
                        borderRadius: '4px',
                      }}
                      onClick={item.onClickTrade}
                    >
                      Trade
                    </BgButton>
                    <BgButton
                      variant='contained'
                      size='small'
                      customBg='var(--color-button-outlined)'
                      sx={{
                        width: '32%',
                        ml: '2%',
                        borderRadius: '4px',
                      }}
                      onClick={item.onClickClose}
                    >
                      Close
                    </BgButton>
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  )

  const tokenSelectionModal = (
    <Modal
      sx={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      open={open}
      onClose={onClose}
    >
      <Box
        bgcolor={'var(--color-box)'}
        width={'350px'}
        height={'400px'}
        overflow={'auto'}
        borderRadius={1}
        display={'flex'}
        flexDirection={'column'}
        py={4}
        
      >
        <Box px={2.5} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          <InputSearch
            value={tokenSelection.search}
            style={{ width: '80%' }}
            onChange={(value: string) => {
              tokenSelection.onInputSearch(value)
            }}
          />
          <Typography sx={{ cursor: 'pointer' }} onClick={tokenSelection.onClickCancel}>
            Cancel
          </Typography>
        </Box>
        <Box
          display={'flex'}
          flexDirection={'column'}
          mt={2}
          height={'85%'}
          
          sx={{ overflowY: 'auto' }}
        >
          {tokenSelection.tokens.map((item) => (
            <SpaceBetweenBox
              px={2.5}
              onClick={item.onClick}
              py={1}
              alignItems={'center'}
              leftNode={
                <Box display={'flex'} alignItems={'center'}>
                  <CoinIcons type={TokenType.single} tokenIcon={[item.coinJSON, undefined]} />
                  <Typography ml={1.5}>{item.symbol}</Typography>
                </Box>
              }
              rightNode={
                <Typography color={'var(--color-text-secondary)'}>{item.amount}</Typography>
              }
              key={item.symbol}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'var(--color-box-hover)',
                },
              }}
            />
          ))}
        </Box>
      </Box>
    </Modal>
  )

  return (
    <Modal
      sx={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      open={open}
      onClose={onClose}
    >
      <>
        {mainView}
        {tokenSelection.show && tokenSelectionModal}
      </>
    </Modal>
  )
}


 {/* <Modal
        contentClassName={'vault-wrap'}
        open={isShowVaultSwap.isShow}
        onClose={() => {
          if (
            (tradeCalcData as any)?.isVault &&
            (tradeCalcData as any).step !== VaultSwapStep.Edit
          ) {
            setOpenCancel({ openCancel: true, shouldClose: true })
          } else {
            setShowVaultSwap({ isShow: false })
          }
        }}
        content={
          tradeData ? (
            // @ts-ignore
            <SwapPanel
              _width={'var(--modal-width)'}
              classWrapName={'vaultSwap'}
              titleI8nKey={'labelVaultSwap'}
              tokenBuyProps={{
                tokenImageKey: tradeData?.buy?.belong?.slice(2),
                belongAlice: tradeData?.buy?.belong?.slice(2),
                tokenType: TokenType.vault,
                disableInputValue: isMarketInit,
                disabled: isSwapLoading || isMarketInit,
                decimalsLimit: vaultTokenMao[tradeData?.buy?.belong?.toString() ?? '']?.precision,
                allowDecimals: vaultTokenMao[tradeData?.buy?.belong?.toString() ?? '']?.precision
                  ? true
                  : false,
              }}
              covertOnClickPreCheck={() => {
                if (
                  (tradeCalcData as any)?.isVault &&
                  (tradeCalcData as any).step !== VaultSwapStep.Edit
                ) {
                  setOpenCancel({ openCancel: true, shouldClose: true })
                  return false
                } else {
                  return true
                }
              }}
              onCancelClick={() => {
                setOpenCancel({ openCancel: true, shouldClose: false })
              }}
              BtnEle={BtnEle}
              tokenSellProps={{
                decimalsLimit:
                  vaultTokenMao[tradeData?.sell?.belong?.toString() ?? '']?.vaultTokenAmounts
                    ?.qtyStepScale,
                allowDecimals: vaultTokenMao[tradeData?.sell?.belong?.toString() ?? '']
                  ?.vaultTokenAmounts?.qtyStepScale
                  ? true
                  : false,
                tokenImageKey: tradeData?.sell?.belong?.slice(2),
                belongAlice: tradeData?.sell?.belong?.slice(2),
                tokenType: TokenType.vault,
                subEle: maxEle,
                subLabel: undefined,
                disableInputValue: isMarketInit,
                disabled: isSwapLoading || isMarketInit,
                placeholderText:
                  tradeCalcData.sellMaxAmtStr && tradeCalcData.sellMaxAmtStr !== ''
                    ? t('labelBtradeSwapMiniMax', {
                        minValue: tradeCalcData.sellMinAmtStr,
                        maxValue: tradeCalcData.sellMaxAmtStr,
                      })
                    : t('labelBtradeSwapMini', {
                        minValue: tradeCalcData.sellMinAmtStr,
                      }),
              }}
              campaignTagConfig={campaignTagConfig}
              tradeCalcData={tradeCalcData}
              tradeData={tradeData as any}
              onSwapClick={onSwapClick}
              swapBtnI18nKey={swapBtnI18nKey}
              swapBtnStatus={swapBtnStatus}
              handleSwapPanelEvent={handleSwapPanelEvent}
              onRefreshData={refreshData}
              refreshRef={refreshRef}
              tradeVault={tradeVault}
              market={market}
              isMobile={isMobile}
              marginLevelChange={marginLevelChange!}
              vaultLeverage={{
                onClickLeverage: onClickLeverage,
                leverage: vaultAccountInfo?.leverage ?? '0',
                hideLeverage
              }}
              refreshTime={10}
            />
          ) : (
            <></>
          )
        }
      /> */}