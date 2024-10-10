import { SoursURL } from '@loopring-web/common-resources'
import { Box, BoxProps } from '@mui/material'

export type LoadingProps = {
  size?: number
  withContainer?: boolean
}

export const Loading = (props: BoxProps & LoadingProps) => {
  const { size = 40, withContainer, ...rest } = props
  const loading = (
    <Box
      component={'img'}
      src={`${SoursURL}/images/loading-line.gif`}
      width={size}
      height={size}
      {...rest}
    />
  )
  return withContainer ? (
    <Box
      height={'100%'}
      width={'100%'}
      display={'flex'}
      justifyContent={'center'}
      alignItems={'center'}
    >
      {loading}
    </Box>
  ) : (
    loading
  )
}