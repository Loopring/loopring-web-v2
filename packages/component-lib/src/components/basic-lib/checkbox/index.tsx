import { useTheme } from '@emotion/react'
import { CheckIcon } from '@loopring-web/common-resources'
import CheckCircleRoundedIcon from '@mui/icons-material/RadioButtonChecked'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { Box, BoxProps, SvgIconProps } from '@mui/material'

type CustomCheckBoxProps = {
  CheckedIcon?: React.ComponentType<SvgIconProps>
  UncheckIcon?: React.ComponentType<SvgIconProps>
  checked: boolean
  onCheck: () => void
}

export const CustomCheckBox = (props: CustomCheckBoxProps & BoxProps) => {
  const theme = useTheme()
  const {
    CheckedIcon = CheckCircleRoundedIcon,
    UncheckIcon = RadioButtonUncheckedIcon,
    checked,
    onCheck,
    ...rest
  } = props
  return (
    <Box component={'div'} onClick={onCheck} {...rest}>
      {checked ? (
        <CheckedIcon
          sx={{
            color: theme.colorBase.primary,
            fontSize: '24px',
          }}
          className='custom-size'
        />
      ) : (
        <UncheckIcon
          sx={{
            fontSize: '24px',
          }}
          className='custom-size'
        />
      )}
    </Box>
  )
}
