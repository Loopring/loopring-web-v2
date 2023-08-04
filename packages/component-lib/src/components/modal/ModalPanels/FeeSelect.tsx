import {
  Box,
  BoxProps,
  FormControlLabel,
  Radio,
  ToggleButton,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import styled from '@emotion/styled'
import { MenuBtnStyled } from '../../styled'
import { SendAssetProps } from './Interface'
import { useTranslation } from 'react-i18next'
import {
  AnotherIcon,
  BackIcon,
  ExchangeAIcon,
  IncomingIcon,
  Info2Icon,
  L1L2_NAME_DEFINED,
  L1l2Icon,
  L2l2Icon,
  MapChainId,
  OutputIcon,
  RoundCheckIcon,
  RoundCircle,
  myLog,
} from '@loopring-web/common-resources'
import { useSettings, useToggle } from '../../../stores'
import { FeeSelectProps } from '../../../components/tradePanel'
import { CoinIcon, RadioGroupStyle } from '../../../components/basic-lib'
import React from 'react'

const BoxStyled = styled(Box)`` as typeof Box

// const IconItem = ({ svgIcon }: { svgIcon: string }) => {
//   switch (svgIcon) {
//     case 'IncomingIcon':
//       return <IncomingIcon color={'inherit'} sx={{ marginRight: 1 }} />
//     case 'L2l2Icon':
//       return <L2l2Icon color={'inherit'} sx={{ marginRight: 1 }} />
//     case 'L1l2Icon':
//       return <L1l2Icon color={'inherit'} sx={{ marginRight: 1 }} />
//     case 'ExchangeAIcon':
//       return <ExchangeAIcon color={'inherit'} sx={{ marginRight: 1 }} />
//     case 'OutputIcon':
//       return <OutputIcon color={'inherit'} sx={{ marginRight: 1 }} />
//     case 'AnotherIcon':
//       return <AnotherIcon color={'inherit'} sx={{ marginRight: 1 }} />
//   }
// }
const OptionStyled = styled(Box)<{ checked?: boolean }>`
  border: 1px solid;
  border-color: ${({ checked }) => (checked ? 'var(--color-primary)' : 'var(--color-border)')};
  width: 100%;
  display: flex;
  justify-content: space-between;
  border-radius: ${({ theme }) => theme.unit}px;
  padding: ${({ theme }) => theme.unit * 1.5}px ${({ theme }) => theme.unit * 2}px;
  min-height: ${({ theme }) => theme.unit * 8}px;
  align-items: center;
  cursor: pointer;
`

type OptionType = { checked?: boolean; disabled?: boolean } & BoxProps
const Option = (props: OptionType) => {
  const { checked, children, ...otherProps } = props
  return (
    <OptionStyled checked={checked} {...otherProps}>
      {children}
      {checked ? (
        <RoundCheckIcon fontSize={'large'} fill={'var(--color-primary)'} />
      ) : (
        <RoundCircle fontSize={'large'} />
      )}
    </OptionStyled>
  )
}

export const FeeSelect = (props: FeeSelectProps) => {
  const { chargeFeeTokenList, disableNoToken, feeInfo: selectedFeeInfo } = props

  return (
    <BoxStyled
      flex={1}
      display={'flex'}
      alignItems={'center'}
      justifyContent={'space-between'}
      flexDirection={'column'}
      width={'var(--modal-width)'}
    >
      <Typography marginBottom={3} variant={'h3'}>
        Fee
      </Typography>
      <Box width={'100%'} paddingX={5} marginBottom={10}>
        {chargeFeeTokenList.map((feeInfo, index) => {
          return (
            <Option
              disabled={disableNoToken && !feeInfo.hasToken}
              marginBottom={2}
              checked={selectedFeeInfo.belong == feeInfo.belong}
            >
              <Box display={'flex'}>
                <CoinIcon size={32} symbol={feeInfo.belong} />
                <Box marginLeft={1}>
                  <Typography>{feeInfo.belong}</Typography>
                  <Typography variant={'body2'} color={'var(--color-text-secondary)'}>
                    Available: {feeInfo.fee} Pay: {feeInfo.fee}
                  </Typography>
                </Box>
              </Box>
            </Option>
          )
        })}
      </Box>

      {/* {chargeFeeTokenList?.map((feeInfo, index) => (
        <ToggleButton
          key={feeInfo.belong + index}
          value={index}
          aria-label={feeInfo.belong}
          disabled={disableNoToken && !feeInfo.hasToken}
        >
          {feeInfo.belong}
        </ToggleButton>
      ))} */}
    </BoxStyled>
  )
}

// export const FeeSelect = <C extends FeeInfo>({
//   chargeFeeTokenList,
//   handleToggleChange,
//   feeInfo,
//   disableNoToken = false,
// }: {
//   chargeFeeTokenList: Array<C>
//   handleToggleChange: (value: C) => void
//   feeInfo: C
//   disableNoToken?: boolean
// }) => {
//   return (
//     <MuToggleButtonGroupStyle
//       size={'small'}
//       value={chargeFeeTokenList.findIndex((ele) => feeInfo?.belong === ele.belong)}
//       exclusive
//       onChange={(_e, value: number) => {
//         handleToggleChange(chargeFeeTokenList[value])
//       }}
//     >
//       {chargeFeeTokenList?.map((feeInfo, index) => (
//         <ToggleButton
//           key={feeInfo.belong + index}
//           value={index}
//           aria-label={feeInfo.belong}
//           disabled={disableNoToken && !feeInfo.hasToken}
//         >
//           {feeInfo.belong}
//         </ToggleButton>
//       ))}
//     </MuToggleButtonGroupStyle>
//   )
// }
