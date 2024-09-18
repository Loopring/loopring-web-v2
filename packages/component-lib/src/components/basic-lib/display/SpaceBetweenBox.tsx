import { Box, BoxProps } from '@mui/material'

export type SpaceBetweenProps = {
  leftNode: React.ReactNode,
  rightNode: React.ReactNode
}

export default (props: BoxProps & SpaceBetweenProps) => {
  const { leftNode, rightNode, ...rest } = props
  
  return <Box display={'flex'} justifyContent={'space-between'} {...rest}>
    <Box>{leftNode}</Box>
    <Box>{rightNode}</Box>
  </Box>
}
