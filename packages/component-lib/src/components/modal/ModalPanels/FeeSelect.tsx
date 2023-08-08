import {
  Box,
  BoxProps,
  FormControlLabel,
  Modal as MuiModal,
  Radio,
  ToggleButton,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import styled from '@emotion/styled'
import { MenuBtnStyled } from '../../styled'
import { SendAssetProps } from './Interface'
import { TransProps, TranslationProps, WithTranslation, useTranslation, withTranslation } from 'react-i18next'
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
  WithdrawType,
  myLog,
} from '@loopring-web/common-resources'
import { useSettings, useToggle } from '../../../stores'
import { FeeSelectProps, Modal } from '../../../components/tradePanel'
import { CoinIcon, RadioGroupStyle } from '../../../components/basic-lib'
import React from 'react'
import { WithdrawData } from '@loopring-web/core'

const BoxStyled = styled(Box)`` as typeof Box

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
const FeeTypeStyled = styled(Box)<{ checked?: boolean }>`
  border: 1px solid;
  border-color: ${({ checked }) => (checked ? 'var(--color-primary)' : 'var(--color-border)')};
  display: flex;
  justify-content: space-between;
  border-radius: ${({ theme }) => theme.unit}px;
  padding: ${({ theme }) => theme.unit * 0.5}px ${({ theme }) => theme.unit * 1.5}px;
  align-items: center;
  cursor: pointer;
  margin-right: ${({ theme }) => 2 * theme.unit}px;
`
// type FeeTypeType = BoxProps
// const FeeType = (props: FeeTypeType) => {
//   const { content } = props
//   return (
//     <FeeTypeStyled>
//       {content}
//     </FeeTypeStyled>
//   )
// }

{/* <Box marginTop={1}>
                  <RadioGroup
                    aria-label='withdraw'
                    name='withdraw'
                    value={withdrawType}
                    onChange={(e) => {
                      _handleWithdrawTypeChange(e)
                    }}
                  >
                    {Object.keys(withdrawTypes).map((key) => {
                      return (
                        <FormControlLabel
                          key={key}
                          disabled={isFeeNotEnough.isOnLoading}
                          value={key.toString()}
                          control={<Radio />}
                          label={`${t('withdrawTypeLabel' + withdrawTypes[key])}`}
                        />
                      )
                    })}
                  </RadioGroup>
                </Box> */}

export const FeeSelect = (props: FeeSelectProps) => {
  const {
    open,
    chargeFeeTokenList,
    disableNoToken,
    feeInfo: selectedFeeInfo,
    handleToggleChange,
    onClose,
    withdrawInfos
    // withdrawTypes,
    
  } = props


  const {t} = useTranslation()

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose()
      }}
      content={
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
            {withdrawInfos && <Box marginBottom={3} display={'flex'}>
              {Object.keys(withdrawInfos.types).map((key) => {
                const type = Number(key)
                return (
                  <FeeTypeStyled onClick={() => {
                    withdrawInfos.onChangeType(Number(key))
                  }} checked={withdrawInfos.type === type} key={key}>
                    <Typography>{t('withdrawTypeLabel' + withdrawInfos.types[key])}</Typography>
                  </FeeTypeStyled>
                )
              })}
            </Box>}
            {chargeFeeTokenList.map((feeInfo, index) => {
              return (
                <Option
                  disabled={disableNoToken && !feeInfo.hasToken}
                  marginBottom={2}
                  checked={selectedFeeInfo?.belong == feeInfo.belong}
                  onClick={() => handleToggleChange(feeInfo)}
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
        </BoxStyled>
      }
    />
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
