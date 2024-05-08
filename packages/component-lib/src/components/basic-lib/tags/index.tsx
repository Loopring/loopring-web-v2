import { SvgIcon, Chip, SvgIconProps } from '@mui/material'
import * as sdk from '@loopring-web/loopring-sdk'
import { useTranslation } from 'react-i18next'
import styled from '@emotion/styled'
import { fontDefault, myLog } from '@loopring-web/common-resources'

export const NewTagIcon = () => (
  <SvgIcon
    className={'tag'}
    width='25'
    height='12'
    viewBox='0 0 25 12'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M0 6C0 2.68629 2.68629 0 6 0H19C22.3137 0 25 2.68629 25 6C25 9.31371 22.3137 12 19 12H6C2.68629 12 0 9.31371 0 6Z'
      fill='#F46253'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M9.53831 2.54004H8.38131V6.88422L5.38532 2.54004H4.46631V9.16004H5.62331V4.80767L8.6192 9.16004H9.53831V2.54004Z'
      fill='white'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M12.8229 8.21904C12.4264 8.21904 12.1019 8.11638 11.84 7.91884C11.6327 7.75888 11.4848 7.54497 11.3988 7.27004H15.1027L15.1231 7.13377C15.1423 7.00642 15.1519 6.88147 15.1519 6.75904C15.1519 6.0677 14.9287 5.47103 14.4811 4.97824C14.0349 4.4743 13.4535 4.22304 12.7509 4.22304C12.0169 4.22304 11.4068 4.46199 10.9353 4.94644C10.4657 5.42883 10.2329 6.03401 10.2329 6.75004C10.2329 7.4723 10.4689 8.08088 10.945 8.56342L10.9465 8.56493C11.4305 9.04239 12.0548 9.27704 12.8049 9.27704C13.7352 9.27704 14.4487 8.9153 14.9193 8.18686L15.0113 8.04453L14.0637 7.50672L13.9827 7.63808C13.7468 8.0208 13.3715 8.21904 12.8229 8.21904ZM14.7849 8.10009C14.7849 8.10007 14.7849 8.10011 14.7849 8.10009ZM11.393 6.26604C11.4701 5.99196 11.61 5.773 11.8104 5.60308L11.8119 5.60178C12.0545 5.39082 12.3634 5.28104 12.7509 5.28104C13.0751 5.28104 13.3539 5.37992 13.5943 5.57763C13.7894 5.73807 13.9285 5.96388 14.0047 6.26604H11.393ZM14.1999 6.42604C14.1914 6.371 14.1812 6.31767 14.1692 6.26604C14.1014 5.9724 13.9785 5.73383 13.8005 5.55032C14.0098 5.76611 14.1429 6.05791 14.1999 6.42604L11.1941 6.4262C11.1941 6.42625 11.1941 6.42614 11.1941 6.4262L14.1999 6.42604Z'
      fill='white'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M22.0533 4.34004H20.8969L20.0218 7.37085L19.0832 4.34004H18.0914L17.1526 7.3632L16.2775 4.34004H15.1211L16.6153 9.16004H17.6514L18.5872 6.20072L19.523 9.16004H20.5591L22.0533 4.34004Z'
      fill='white'
    />
  </SvgIcon>
)

export const ChipStyle = styled(Chip)`
  font-size: ${fontDefault.body2};
  border-radius: ${({ theme }) => `${theme.unit}`}px;
  height: ${({ theme }) => `${(theme.unit * 5) / 2}`}px;
`
export const AddressTypeTag = ({ addressType }: { addressType }) => {
  const { t } = useTranslation('common')
  myLog('addressType', addressType, sdk.AddressType)
  switch (addressType) {
    case sdk.AddressType.EOA:
      return (
        <ChipStyle
          label={t('labelEOA')}
          size='small'
          sx={{ backgroundColor: 'var(--color-EOA-Bg)', color: 'var(--color-EOA-Text)' }}
        />
      )
    case sdk.AddressType.LOOPRING_HEBAO_CF:
    case sdk.AddressType.LOOPRING_HEBAO_CONTRACT_1_1_6:
    case sdk.AddressType.LOOPRING_HEBAO_CONTRACT_1_2_0:
    case sdk.AddressType.LOOPRING_HEBAO_CONTRACT_2_0_0:
    case sdk.AddressType.LOOPRING_HEBAO_CONTRACT_2_1_0:
    case sdk.AddressType.LOOPRING_HEBAO_CONTRACT_2_2_0:
    case sdk.AddressType.LOOPRING_HEBAO_CONTRACT_3_0_0:
      return (
        <ChipStyle
          label={t('labelLoopringWallet')}
          size='small'
          sx={{ backgroundColor: 'var(--color-Loopring-Bg)', color: 'var(--color-Loopring-Text)' }}
        />
      )
    case sdk.AddressType.CONTRACT:
      return (
        <ChipStyle
          label={t('labelOtherSmart')}
          size='small'
          sx={{
            backgroundColor: 'var(--color-OtherSmart-Bg)',
            color: 'var(--color-OtherSmart-Text)',
          }}
        />
      )
    case sdk.AddressType.EXCHANGE_BINANCE:
      return (
        <ChipStyle
          label={t('labelBinance')}
          size='small'
          sx={{ backgroundColor: 'var(--color-Binance-Bg)', color: 'var(--color-Binance-Text)' }}
        />
      )
    case sdk.AddressType.EXCHANGE_HUOBI:
      return (
        <ChipStyle
          label={t('labelHuobi')}
          size='small'
          sx={{ backgroundColor: 'var(--color-Huobi-Bg)', color: 'var(--color-Huobi-Text)' }}
        />
      )
    case sdk.AddressType.EXCHANGE_OTHER:
      return (
        <ChipStyle
          label={t('labelOtherExchange')}
          size='small'
          sx={{
            backgroundColor: 'var(--color-OtherExchange-Bg)',
            color: 'var(--color-OtherExchange-Text)',
          }}
        />
      )
    case sdk.AddressType.UNKNOWN_ADDRESS:
    default:
      return <></>
  }
}

export const VaultTag = (props: SvgIconProps) => {
  return (
    <svg viewBox='0 0 48 48' {...props}>
      <path
        d='M48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24C0 10.7452 10.7452 0 24 0C37.2548 0 48 10.7452 48 24Z'
        fill='url(#vaultTagLinear)'
      />
      <path d='M17.4545 14.0859H12L19.3636 29.5596L22.0909 23.5596L17.4545 14.0859Z' fill='white' />
      <path
        d='M23.4545 38.0859L21.2727 33.3491L30.5455 14.0859H36L24.5455 38.0859H23.4545Z'
        fill='white'
      />
      <defs>
        <linearGradient
          id='vaultTagLinear'
          x1='24'
          y1='0'
          x2='24'
          y2='48'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#68E19B' />
          <stop offset='1' stopColor='#4EADEB' />
        </linearGradient>
      </defs>
    </svg>
  )
}
