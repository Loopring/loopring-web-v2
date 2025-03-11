import { withTranslation, WithTranslation } from 'react-i18next'
import { AnotherIcon, MapChainId } from '@loopring-web/common-resources'
import React from 'react'
import { useSettings } from '../../../stores'
import { Box, Typography } from '@mui/material'
import { ChevronRight } from '@mui/icons-material'
import { SpaceBetweenBox } from '../../../components/basic-lib'


export interface BridgeProps {
  onClickEthereum: () => void
}

export const BridgePanel = withTranslation('common')(
  ({
    onClickEthereum,
  }: BridgeProps) => {
    return (
      <Box
        height={'var(--min-height)'}
        width={'var(--modal-width)'}
        display={'flex'}
        flexDirection={'column'}
        padding={3}
      >
        <Typography fontSize={24}>Bridge</Typography>

        <Typography variant='body2' mt={7}>
          To other networks
        </Typography>

        <SpaceBetweenBox
          onClick={() => onClickEthereum()}
          height={'64px'}
          border={'1px solid var(--color-border)'}
          borderRadius={'4px'}
          alignItems={'center'}
          justifyContent={'space-between'}
          sx={{ cursor: 'pointer', px: 2, mt: 2 }}
          leftNode={
            <Box display='flex' alignItems='center'>
              <AnotherIcon className='custom-size' sx={{ fontSize: '24px' }}/>
              <Typography ml={1}>To Ethereum</Typography>
            </Box>
          }
          rightNode={<ChevronRight />}
        />
      </Box>
    )
  }
)
