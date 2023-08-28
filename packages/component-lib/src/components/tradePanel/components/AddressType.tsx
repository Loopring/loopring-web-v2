import { Box, IconButton, MenuItem, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import styled from '@emotion/styled'
import React, { ForwardedRef } from 'react'
import { AddressItemType, CloseIcon, EXCHANGE_TYPE, Info2Icon, RoundCheckIcon, RoundCircle, WALLET_TYPE, hexToRGB } from '@loopring-web/common-resources'
import { MenuItemProps, TextField } from '../../basic-lib'
import { useOpenModals } from '../../../stores'
import { useAddressTypeLists } from './hook/useAddressType'
import { useTheme } from '@emotion/react'

const MenuItemStyle = styled(MenuItem)<MenuItemProps<any> & { maxWidth?: string | number }>`
  height: auto;
  max-width: ${({ maxWidth }) => (maxWidth ? maxWidth : 'auto')};
  border: 1px solid;
  border-color: ${({ checked }) => (checked ? 'var(--color-primary)' : 'var(--color-border)')};
  width: 100%;
  display: flex;
  justify-content: space-between;
  border-radius: ${({ theme }) => theme.unit}px;
  padding: ${({ theme }) => 2 * theme.unit}px;
  min-height: ${({ theme }) => theme.unit * 8}px;
  align-items: center;
  cursor: pointer;
  flex-direction: row;
  margin-top:  ${({ theme }) => 2 * theme.unit}px;

` as (props: MenuItemProps<any> & { maxWidth?: string | number }) => JSX.Element

const WarningBoxStyled = styled(Box)`
  width: 100%;
  display: flex;
  justify-content: space-between;
  border-radius: ${({ theme }) => theme.unit}px;
  padding: ${({ theme }) => 2 * theme.unit}px;
  min-height: ${({ theme }) => theme.unit * 8}px;
  align-items: center;
  cursor: pointer;
  flex-direction: row;
  background: ${({ theme }) => hexToRGB(theme.colorBase.warning,0.2)};

`

export const WalletItemOptions = React.memo(
  React.forwardRef(
    <T extends WALLET_TYPE | EXCHANGE_TYPE>(
      {
        description,
        label,
        myValue,
        selectedValue,
        maxWidth,
        disabled = false,
        handleSelected,
      }: {
        myValue: T
        handleSelected: (value: WALLET_TYPE | EXCHANGE_TYPE) => void
        selectedValue: T | undefined
      } & AddressItemType<T>,
      ref: ForwardedRef<any>,
    ) => {
      return (
        <MenuItemStyle
          ref={ref}
          disabled={disabled}
          value={myValue}
          maxWidth={maxWidth}
          // onClick={}
          // sx={{ maxWidth: maxWidth ? maxWidth : "fit-content" }}
          onClick={() => {
            handleSelected(myValue)
          }}
        >
          <Box width={'100%'} component={'span'}>
            <Typography color={'textPrimary'}>{label}</Typography>
            <Typography
              component={'span'}
              whiteSpace={'pre-line'}
              variant={'body2'}
              color={'textSecondary'}
            >
              {description}
            </Typography>
          </Box>
          {selectedValue === myValue ? (
            <RoundCheckIcon fontSize={'large'} fill={'var(--color-primary)'} />
          ) : (
            <RoundCircle fontSize={'large'} />
          )}
        </MenuItemStyle>
      )
    },
  ),
)
export const TransferAddressType = <T extends WALLET_TYPE>({
  selectedValue,
  handleSelected,
  disabled,
  detectedWalletType,
}: {
  selectedValue: WALLET_TYPE | EXCHANGE_TYPE | undefined
  handleSelected: (value: WALLET_TYPE | EXCHANGE_TYPE) => void
  disabled: boolean
  detectedWalletType: WALLET_TYPE
}) => {
  const { t } = useTranslation('common')
  const { walletListFn } = useAddressTypeLists<T>()
  const theme = useTheme()
  const desMenuItem = React.useMemo(() => {
    return (
      <WarningBoxStyled>
        <Info2Icon fontSize={'large'} htmlColor={theme.colorBase.warning}></Info2Icon>
        <Typography marginLeft={1} fontSize={'13px'} >{t('labelWalletTypeDes')}</Typography>
      </WarningBoxStyled>
    )
  }, [t])

  const [open, setOpen] = React.useState(false)
  const onClose = () => {
    setOpen(false)
  }
  const {
    setShowOtherExchange,
    modals: { isShowOtherExchange },
  } = useOpenModals()

  React.useEffect(() => {
    if (isShowOtherExchange.agree) {
      handleSelected(EXCHANGE_TYPE.Others)
      onClose()
    }
  }, [isShowOtherExchange.agree])

  const onOpen = () => {
    setOpen(true)
    setShowOtherExchange({ isShow: false, agree: false })
  }
  // const walletType = WALLET_TYPE.EOA
  return (
    <TextField
      size={'large'}
      select
      disabled={disabled}
      fullWidth
      variant='outlined'
      value={selectedValue ?? ''}
      SelectProps={{
        open,
        onClose,
        onOpen,
        autoWidth: false,
        renderValue: (selectedValue) =>
          walletListFn(detectedWalletType).find((item) => item.value === selectedValue)?.label ??
          '',
      }}
      label={
        <Typography color={'var(--color-text-third)'}>{t('labelL2toL1AddressType')}</Typography>
      }
    >
      <Box maxWidth={'480px'} padding={5}>
        <IconButton
          sx={{
            position: 'absolute',
            right: 20,
            top: 20,
          }}
          size={'large'}
          edge={'end'}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
        <Typography textAlign={'center'} marginBottom={3} variant={'h3'}>
          {t('labelL2toL1AddressType')}
        </Typography>
        {desMenuItem}
        {walletListFn(detectedWalletType).map(
          ({ value, label, description, disabled, maxWidth }) => (
            <WalletItemOptions
              key={value}
              value={value}
              myValue={value}
              handleSelected={(value) => {
                if (value === EXCHANGE_TYPE.Others) {
                  setShowOtherExchange({ isShow: true })
                } else {
                  handleSelected(value as T)
                  onClose()
                }
                // handleSelected(value);
                // onClose();
              }}
              maxWidth={maxWidth}
              selectedValue={selectedValue}
              label={label}
              description={description}
              disabled={disabled}
            />
          ),
        )}
      </Box>
    </TextField>
  )
}

export const FullAddressType = <T extends EXCHANGE_TYPE>({
  selectedValue,
  handleSelected,
  disabled,
  detectedWalletType,
}: {
  selectedValue: WALLET_TYPE | EXCHANGE_TYPE | undefined
  handleSelected: (value: WALLET_TYPE | EXCHANGE_TYPE) => void
  disabled: boolean
  detectedWalletType: WALLET_TYPE
}) => {
  const { t } = useTranslation('common')
  const { walletListFn } = useAddressTypeLists<T>()
  const {
    setShowOtherExchange,
    modals: { isShowOtherExchange },
  } = useOpenModals()
  const [open, setOpen] = React.useState(false)
  const onClose = () => {
    setOpen(false)
  }
  React.useEffect(() => {
    if (isShowOtherExchange.agree) {
      handleSelected(EXCHANGE_TYPE.Others)
      onClose()
    }
  }, [isShowOtherExchange.agree])

  const onOpen = () => {
    setOpen(true)
    setShowOtherExchange({ isShow: false, agree: false })
  }

  return (
    <TextField
      size={'large'}
      select
      disabled={disabled}
      fullWidth
      variant='outlined'
      value={selectedValue ?? ''}
      SelectProps={{
        open,
        onClose,
        onOpen,
        autoWidth: false,
        renderValue: (selectedValue) =>
          walletListFn(detectedWalletType).find((item) => item.value === selectedValue)?.label ??
          '',
      }}
      label={<Typography color={'var(--color-text-third)'}>{t('labelL2toL1AddressType')}</Typography>}
    >
      <Box maxWidth={'480px'} padding={5}>
        <IconButton
          sx={{
            position: 'absolute',
            right: 20,
            top: 20,
          }}
          size={'large'}
          edge={'end'}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
        <Typography textAlign={'center'} marginBottom={3} variant={'h3'}>
          {t("labelL2toL1AddressType")}
        </Typography>
        <MenuItemStyle disabled={true} value={-1}>
          <Typography component={'span'}>{t('labelExchangeTypeDes')}</Typography>
        </MenuItemStyle>
        {walletListFn(detectedWalletType).map(
          ({ value, label, description, disabled, maxWidth }) => (
            <WalletItemOptions
              key={value}
              value={value}
              myValue={value}
              handleSelected={async (value) => {
                if (value === EXCHANGE_TYPE.Others) {
                  setShowOtherExchange({ isShow: true })
                } else {
                  handleSelected(value)
                  onClose()
                }
              }}
              selectedValue={selectedValue}
              label={label}
              maxWidth={maxWidth}
              description={description}
              disabled={disabled}
            />
          ),
        )}
      </Box>
    </TextField>
  )
}
