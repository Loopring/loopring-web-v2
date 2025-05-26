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
import { VaultSwapViewProps, VaultSwapView } from './VaultSwapView';

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
              <Typography>
                {t('labelVaultMaximumCreditDes')}{' '}
                <Box component="span" sx={{ whiteSpace: 'nowrap', display: 'inline' }}>
                  <Typography
                    component={'span'}
                    onClick={onClickMaxCredit}
                    color={'var(--color-primary)'}
                    sx={{ cursor: 'pointer' }}
                  >
                    {t('labelLearnMore2')}
                  </Typography>
                </Box>
              </Typography>
              
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
      <Box
        height={'100%'}
        display={'flex'}
        justifyContent={'center'}
        alignItems={'center'}
        position={'relative'}
      >
        {isLoading && (
          <Loading
            size={40}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
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
              {(() => {
                const unitValue = 10
                const valueForLeverage = (leverage: number) => (leverage - 1) * unitValue
                const leverageForValue = (value: number) => Math.round(value / unitValue) + 1
                return (
                  <Slider
                    aria-label='Always visible'
                    value={currentLeverage ? valueForLeverage(currentLeverage) : 0}
                    onChange={(_, _value) => {
                      onClickLeverage(leverageForValue(_value as number))
                    }}
                    max={valueForLeverage(maxLeverage)}
                    marks={_.range(1, maxLeverage + 1).map((number) => ({
                      value: valueForLeverage(number),
                      label: `${number}x`,
                    }))}
                  />
                )
              })()}
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
                  <Typography color={'var(--color-text-secondary)'}>
                    {t('labelVaultAvailableBorrow')}
                  </Typography>
                }
                rightNode={<Typography>{borrowAvailable}</Typography>}
                marginBottom={2}
              />
              <SpaceBetweenBox
                leftNode={
                  <Typography color={'var(--color-text-secondary)'}>
                    {t('labelVaultBorrowed')}
                  </Typography>
                }
                rightNode={<Typography>{borrowed}</Typography>}
                marginBottom={2}
              />
              <SpaceBetweenBox
                leftNode={
                  <Typography color={'var(--color-text-secondary)'}>
                    {t('labelVaultMaximumCredit')}
                  </Typography>
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
                  onClick={token.onClick}
                  leftNode={
                    <Box display={'flex'} alignItems={'center'}>
                      <CoinIcons type={TokenType.single} tokenIcon={[token.coinJSON]} />
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
                      <CoinIcons type={TokenType.single} tokenIcon={[dust.coinJSON]} />
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
                    placement={'bottom'}
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


export const VaultSwapModal = (props: VaultSwapViewProps) => {
  const { open, onClose } = props

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
      <VaultSwapView {...props} />
    </Modal>
  )
}

export interface SupplyCollateralHintModalProps {
  open: boolean 
  onClose: () => void
  onClickSupply: () => void
}

export const SupplyCollateralHintModal = (props: SupplyCollateralHintModalProps) => {
  const { open, onClose, onClickSupply} = props
  return (
    <Modal open={open} onClose={onClose}>
      <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
        <Box
          bgcolor={'var(--color-box)'}
          width={'450px'}
          borderRadius={1}
          display={'flex'}
          flexDirection={'column'}
          px={2.5}
        >
          <SpaceBetweenBox
            leftNode={
              <Typography py={3} variant='h3'>
                Supply Collateral
              </Typography>
            }
            rightNode={
              <CloseIcon
                className='custom-size'
                sx={{ mt: '12px', fontSize: 24, color: 'var(--color-text-secondary)', cursor: 'pointer' }}
                onClick={onClose}
              />
            }
          />
          <Typography mt={1.5} color={'var(--color-text-secondary)'}>To initiate a trade in Portal, please add collateral to your account.</Typography>
          <Button onClick={onClickSupply} sx={{ mt: 5, mb: 4 }} variant={'contained'} fullWidth>
            Supply Collateral
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

export interface SettleConfirmModalProps {
  open: boolean 
  onClose: () => void
  onConfirm: () => void
}

export const SettleConfirmModal = (props: SettleConfirmModalProps) => {
  const { open, onClose, onConfirm } = props
  const { t } = useTranslation('common')
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'var(--modal-width)',
          maxWidth: '450px',
          bgcolor: 'var(--color-global-bg)',
          // padding: 3,
          px: 4,
          py: 5,
          borderRadius: 2,
        }}
      >
        <IconButton
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
          onClick={onClose}
          aria-label='close'
        >
          <CloseIcon />
        </IconButton>

        <Typography variant='h4' component='h2' textAlign='center' mb={4}>
          Settle
        </Typography>

        <Typography mb={3}>
          You can only settle your account after all existing positions have been closed.
        </Typography>

        <Typography mb={3} variant='body1' color={'var(--color-text-secondary)'}>
          · If there is a loss (due to an unprofitable trade or interest payments), a portion of
          your collateral may be used to cover the deficit. In this case, only the remaining
          collateral will be available for withdrawal from Portal.
        </Typography>

        <Typography color={'var(--color-text-secondary)'} variant='body1'>
          · If your trades are profitable, your full collateral will be available for withdrawal,
          and any profits will be credited to your Loopring DeFi account accordingly.
        </Typography>

        <Box display='flex' gap={2} mt={4}>
          <Button variant='outlined' sx={{height: '40px'}} fullWidth onClick={onClose}>
            Cancel
          </Button>

          <Button variant='contained' fullWidth onClick={onConfirm}>
            Settle
          </Button>
        </Box>
      </Box>
    </Modal>
  )
};

export interface CloseAllConfirmModalProps {
  open: boolean 
  onClose: () => void
  onConfirm: () => void
}

export const CloseAllConfirmModal = (props: CloseAllConfirmModalProps) => {
  const { open, onClose, onConfirm } = props
  return (
    <Modal open={open} onClose={onClose}>
      <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
        <Box
          bgcolor={'var(--color-global-bg)'}
          width={'450px'}
          borderRadius={2}
          display={'flex'}
          flexDirection={'column'}
          p={4}
          position={'relative'}
        >
          <IconButton
            className='custom-size'
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'var(--color-text-secondary)',
              fontSize: '16px'
            }}
            onClick={onClose}
            aria-label='close'
          >
            <CloseIcon />
          </IconButton>
          <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} mb={4}>
            <Typography variant={'h4'} component={'h2'} textAlign={'center'} width={'100%'}>
              Close All Position
            </Typography>
          </Box>

          <Typography mb={5}>
            This operation will close all existing positions in your account.
          </Typography>

          <Box display='flex' gap={2} mt={2}>
            <Button variant='outlined' sx={{height: '40px'}} fullWidth onClick={onClose}>
              Cancel
            </Button>

            <Button variant='contained' fullWidth onClick={onConfirm}>
              Confirm
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

export interface CloseConfirmModalProps {
  open: boolean 
  onClose: () => void
  onConfirm: () => void
}

export const CloseConfirmModal = (props: CloseConfirmModalProps) => {
  const { open, onClose, onConfirm } = props
  return (
    <Modal open={open} onClose={onClose} disableAutoFocus disableEnforceFocus disableScrollLock>
      <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
        <Box
          bgcolor={'var(--color-global-bg)'}
          width={'450px'}
          borderRadius={2}
          display={'flex'}
          flexDirection={'column'}
          p={4}
          position={'relative'}
        >
          <IconButton
            className='custom-size'
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'var(--color-text-secondary)',
              fontSize: '16px'
            }}
            onClick={onClose}
            aria-label='close'
          >
            <CloseIcon />
          </IconButton>
          <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} mb={4}>
            <Typography variant={'h4'} component={'h2'} textAlign={'center'} width={'100%'}>
              Close Position
            </Typography>
          </Box>

          <Typography mb={2}>
            Executing this operation will fully close the SHORT or LONG position associated with the
            selected token, eliminating any positive or negative exposure. Additionally, the
            corresponding debt will be repaid.
          </Typography>
          <Typography color={'var(--color-text-secondary)'} mb={2}>
            · For a LONG position: Your held asset will be sold for USDT, and any USDT debt will be
            repaid.
          </Typography>
          <Typography color={'var(--color-text-secondary)'} mb={4}>
            · For a SHORT position: You will need to borrow USDT to purchase the token required for
            debt repayment. In other words, your debt will shift from the original token to USDT.
          </Typography>

          <Box display='flex' gap={2} mt={2}>
            <Button variant='outlined' sx={{height: '40px'}} fullWidth onClick={onClose}>
              Cancel
            </Button>

            <Button variant='contained' fullWidth onClick={onConfirm}>
              Confirm
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}
export interface AutoRepayModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export const AutoRepayConfirmModal = ({
  open,
  onClose,
  onConfirm,
}: AutoRepayModalProps) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="auto-repay-confirm-modal"
      aria-describedby="auto-repay-confirm-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 480 },
          maxWidth: '100%',
          bgcolor: 'var(--color-box-secondary)',
          px: 4,
          py: 8,
          borderRadius: '8px',
        }}
      >
        <Box>
          <Typography>
            It looks like you're holding the same asset as your debt. To avoid
            extra interest charges, consider repaying your debt with your
            holdings now.
          </Typography>

          <Box display="flex" justifyContent="center" mt={6}>
            <Button
              variant="contained"
              onClick={onConfirm}
              fullWidth
            >
              I Know
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}
