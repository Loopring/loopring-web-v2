import { BackIcon, DropDownIcon, getShortAddr } from '@loopring-web/common-resources'
import { useTranslation } from 'react-i18next'
import { Box, ListItemText, Typography } from '@mui/material'
import { useSettings } from '../../../stores'
import { CheckImportCollectionProps } from './Interface'
import React from 'react'
import { Button, MenuItem, TextField } from '../../basic-lib'

export const CheckImportCollection = ({
  // account,
  value,
  onChange,
  loading = false,
  contractList = [],
  disabled = false,
  onClick,
}: CheckImportCollectionProps) => {
  const { t } = useTranslation('common')

  const { isMobile } = useSettings()
  // const disabled = () => {
  //   return gDisabled || !tradeData.tokenAddress || !tradeData.collectionMeta;
  // };
  return (
    <Box
      flex={1}
      display={'flex'}
      alignItems={'center'}
      flexDirection={'column'}
      paddingBottom={4}
      width={'100%'}
    >
      <Typography
        component={'h3'}
        variant={isMobile ? 'h4' : 'h3'}
        whiteSpace={'pre'}
        marginBottom={3}
        marginTop={-1}
      >
        {t('labelCheckImportCollectionTitle')}
      </Typography>
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'center'}
        flex={1}
        alignItems={'stretch'}
        alignSelf={'stretch'}
        className='modalContent'
        paddingX={5 / 2}
      >
        <TextField
          id='transferFeeType'
          select
          label={'label'}
          value={value}
          onChange={(event: React.ChangeEvent<any>) => {
            onChange(event.target?.value)
          }}
          inputProps={{ IconComponent: DropDownIcon }}
          fullWidth={true}
        >
          {contractList.map((item) => {
            return (
              <MenuItem key={item} value={item} withnocheckicon={'true'}>
                <ListItemText
                  primary={
                    <Typography
                      sx={{ display: 'inline' }}
                      component='span'
                      variant='body1'
                      color='text.primary'
                    >
                      {getShortAddr(item)}
                    </Typography>
                  }
                />
              </MenuItem>
            )
          })}
        </TextField>
        <Button
          size={'large'}
          variant={'contained'}
          fullWidth
          className={'step'}
          endIcon={<BackIcon fontSize={'small'} sx={{ transform: 'rotate(180deg)' }} />}
          loading={!disabled && loading ? 'true' : 'false'}
          disabled={disabled}
          onClick={() => onClick(value)}
        >
          {t('labelContinue')}
        </Button>
      </Box>
    </Box>
  )
}
