import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSettings } from '../../../stores'
import {
  AddressError,
  CloseIcon,
  L1L2_NAME_DEFINED,
  LoadingIcon,
  MapChainId,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import { Box, Divider, IconButton, InputAdornment, Typography } from '@mui/material'
import { Button, TextField } from '../../basic-lib'
import { FullAddressType } from '../../tradePanel'
import styled from '@emotion/styled'
const BoxStyle = styled(Box)`
  & {
    height: inherit;
    .content-main {
      overflow: scroll;
      align-self: stretch;
      & > div {
        align-self: stretch;
      }
    }
  }
`

export const EditContact = ({
  selectedAddressType,
  detectedWalletType,
  addressDefault,
  isAddressCheckLoading,
  addName,
  onChangeName,
  realAddr,
  isContactExit,
  isEdit,
  handleOnAddressChange,
  allowToClickIsSure,
  onChangeAddressType,
  btnStatus,
  addrStatus,
  submitContact,
  btnLabel,
}) => {
  const { t } = useTranslation(['common'])
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const label = React.useMemo(() => {
    if (btnLabel) {
      const key = btnLabel.split('|')
      return t(
        key[0],
        key && key[1]
          ? {
              arg: key[1].toString(),
              l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            }
          : {
              l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            },
      )
    } else {
      return t(isEdit ? `labelContactsEditContactBtn` : `labelContactsAddContactBtn`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      })
    }
  }, [btnLabel, isEdit])
  const getDisabled = React.useMemo(() => {
    return btnStatus === TradeBtnStatus.DISABLED
  }, [btnStatus])

  const isInvalidAddressOrENS =
    !isAddressCheckLoading && addressDefault && addrStatus === AddressError.InvalidAddr
  return (
    <>
      <Box
        display={'flex'}
        flexDirection={'column'}
        alignItems={'flex-start'}
        alignSelf={'stretch'}
        marginTop={-4}
        justifyContent={'stretch'}
      >
        <Typography
          display={'flex'}
          flexDirection={'row'}
          component={'header'}
          alignItems={'center'}
          height={'var(--toolbar-row-height)'}
          paddingX={3}
        >
          <Typography component={'span'} display={'inline-flex'} color={'textPrimary'}>
            {isEdit ? t('labelContactsEditContact') : t('labelContactsAddContact')}
          </Typography>
        </Typography>
        <Divider style={{ marginTop: '-1px', width: '100%' }} />
      </Box>
      <BoxStyle
        flex={1}
        display={'flex'}
        alignItems={'center'}
        flexDirection={'column'}
        paddingBottom={4}
        width={'100%'}
      >
        <Box
          flex={1}
          display={'flex'}
          flexDirection={'column'}
          alignItems={'center'}
          justifyContent={'space-between'}
          className={'content-main'}
        >
          <Box marginTop={4}>
            <Typography marginBottom={0.5} color={'var(--color-text-third)'}>
              {t('labelContactsAddressTitle')}
            </Typography>
            <>
              <TextField
                size={'large'}
                className={'text-address'}
                value={addressDefault}
                disabled={!!isEdit}
                error={!!isInvalidAddressOrENS}
                placeholder={t('labelPleaseInputWalletAddress')}
                onChange={(event) => handleOnAddressChange(event?.target?.value)}
                fullWidth={true}
                InputProps={{
                  style: {
                    paddingRight: '0',
                  },
                  endAdornment: (
                    <InputAdornment
                      style={{
                        cursor: 'pointer',
                        paddingRight: '.5em',
                      }}
                      position='end'
                    >
                      {addressDefault !== '' ? (
                        isAddressCheckLoading ? (
                          <LoadingIcon width={24} />
                        ) : (
                          !isEdit && (
                            <IconButton
                              color={'inherit'}
                              aria-label='Clear'
                              onClick={() => handleOnAddressChange('')}
                            >
                              <CloseIcon />
                            </IconButton>
                          )
                        )
                      ) : (
                        ''
                      )}
                    </InputAdornment>
                  ),
                }}
              />
            </>
            <Box marginLeft={1 / 2}>
              {isInvalidAddressOrENS ? (
                <Typography
                  color={'var(--color-error)'}
                  variant={'body2'}
                  marginTop={1 / 4}
                  alignSelf={'stretch'}
                  position={'relative'}
                >
                  {t('labelInvalidAddress')}
                </Typography>
              ) : isContactExit ? (
                <Typography
                  color={'var(--color-error)'}
                  variant={'body2'}
                  marginTop={1 / 4}
                  alignSelf={'stretch'}
                  position={'relative'}
                >
                  {t('labelContactsContactExisted')}
                </Typography>
              ) : (
                addressDefault &&
                realAddr &&
                !isAddressCheckLoading && (
                  <Typography
                    color={'var(--color-text-primary)'}
                    variant={'body2'}
                    marginTop={1 / 4}
                    whiteSpace={'pre-line'}
                    style={{ wordBreak: 'break-all' }}
                  >
                    {realAddr.toLowerCase() === addressDefault.toLowerCase() ? '' : realAddr}
                  </Typography>
                )
              )}
            </Box>
          </Box>
          <Box marginTop={3}>
            <Typography marginBottom={0.5} color={'var(--color-text-third)'}>
              {t('labelContactsNameTitle')}
            </Typography>
            <TextField
              size={'large'}
              className={'text-address'}
              value={addName}
              placeholder={t('labelContactsNameDes')}
              onChange={(e) => {
                onChangeName(e.target.value)
              }}
              fullWidth={true}
              InputProps={{
                style: {
                  paddingRight: '0',
                },
                endAdornment: (
                  <InputAdornment
                    style={{
                      cursor: 'pointer',
                      paddingRight: '.5em',
                      visibility: addName ? 'visible' : 'hidden',
                    }}
                    position='end'
                  >
                    <IconButton
                      color={'inherit'}
                      aria-label='Clear'
                      onClick={() => onChangeName('')}
                    >
                      <CloseIcon cursor={'pointer'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box marginTop={3}>
            <FullAddressType
              detectedWalletType={detectedWalletType}
              selectedValue={selectedAddressType}
              handleSelected={onChangeAddressType}
              disabled={allowToClickIsSure}
            />
          </Box>
        </Box>
        <Box
          width={'100%'}
          display={'flex'}
          flexDirection={'column'}
          alignItems={'center'}
          justifyContent={'flex-end'}
        >
          <Box alignSelf={'stretch'} paddingX={5}>
            <Button
              fullWidth
              variant={'contained'}
              size={'medium'}
              color={'primary'}
              onClick={() => {
                submitContact()
              }}
              loading={btnStatus === TradeBtnStatus.LOADING && !getDisabled ? 'true' : 'false'}
              disabled={getDisabled || btnStatus === TradeBtnStatus.LOADING}
            >
              {label}
            </Button>
          </Box>
        </Box>
      </BoxStyle>
    </>
  )
}
