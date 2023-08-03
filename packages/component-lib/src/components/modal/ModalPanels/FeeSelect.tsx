import { Box, Tooltip, Typography } from '@mui/material'
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
} from '@loopring-web/common-resources'
import { useSettings, useToggle } from '../../../stores'

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
export const FeeSelect = () => {
  const { t } = useTranslation('common')
  const { defaultNetwork, isMobile } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const {
    toggle: { send },
  } = useToggle()

  return (
    <BoxStyled
      flex={1}
      display={'flex'}
      alignItems={'center'}
      justifyContent={'space-between'}
      flexDirection={'column'}
      width={'var(--modal-width)'}
    >
      FeeSelect
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
