import { Box, IconButton, ListItem, ListItemText, Typography } from '@mui/material'
import { CloseIcon, CompleteIcon, FailedIcon, LoadingIcon } from '@loopring-web/common-resources'
import React, { ForwardedRef } from 'react'
import { IpfsFile } from '../panel'

export const FileListItem = React.memo(
  React.forwardRef(
    (
      {
        file,
        // index,
        onDelete,
        isProcessing,
        error,
      }: IpfsFile & {
        onDelete: () => void
        index: number
      },
      ref: ForwardedRef<any>,
    ) => {
      return (
        <ListItem
          ref={ref}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <ListItemText
            primary={
              <Typography sx={{ display: 'block' }} component='span' variant='body1'>
                {file.name}
              </Typography>
            }
            secondary={
              <Typography sx={{ display: 'inline' }} component='span' variant='body2'>
                size: {file.size}
              </Typography>
            }
          />
          <Box
            className={'status'}
            display={'flex'}
            justifyContent={'flex-end'}
            alignItems={'center'}
          >
            <Typography color={'primay'}>
              {isProcessing ? (
                <LoadingIcon color={'inherit'} />
              ) : error ? (
                <FailedIcon color={'error'} />
              ) : (
                <CompleteIcon color={'success'} />
              )}
            </Typography>
            <IconButton edge={'end'} onClick={onDelete}>
              <CloseIcon color={'error'} />
            </IconButton>
          </Box>
        </ListItem>
      )
    },
  ),
)
