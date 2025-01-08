import { Avatar, Box, InputAdornment, OutlinedInput, Typography } from '@mui/material'
import { SearchIcon, CloseIcon, SoursURL, hexToRGB } from '@loopring-web/common-resources'
import { useSettings } from '../../../stores'
import { useTheme } from '@emotion/react'
import styled from '@emotion/styled'
import React, { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import * as sdk from '@loopring-web/loopring-sdk'
import { AddressTypeTag } from '../../basic-lib'

type SingleContactProps = {
  editing: boolean
  name: string
  address: string
  addressType?: (typeof sdk.AddressType)[sdk.AddressTypeKeys]
  onSelect: (address: string) => void
  hidden: boolean
}

const AvatarContainer = styled(Box)`
  background-color: white;
  border-radius: 20px;
  width: 40px;
  height: 40px;
`
const getInitials = (name: string) => {
  let initials
  const nameSplit = name.split(' ')
  const nameLength = nameSplit.length
  if (nameLength > 1) {
    initials = nameSplit[0].substring(0, 1) + nameSplit[nameLength - 1].substring(0, 1)
  } else if (nameLength === 1) {
    initials = nameSplit[0].substring(0, 1)
  } else return

  return initials.toUpperCase()
}
// @ts-ignore
export const InitialNameAvatar = React.memo(
  ({
    name,
    ...rest
  }: {
    name: string
  } & any) => {
    const theme = useTheme()
    return (
      <AvatarContainer {...rest}>
        <Avatar
          sx={{
            bgcolor: hexToRGB(theme.colorBase.warning, 0.5),
            color: theme.colorBase.warning,
            fontSize: '16px',
          }}
        >
          {getInitials(name)}
        </Avatar>
      </AvatarContainer>
    )
  },
) as ({
  name,
  ...rest
}: {
  name: string
} & any) => JSX.Element

export const SingleContact = (props: SingleContactProps) => {
  const { editing, name, address, addressType, hidden, onSelect } = props

  return (
    <Box
      style={{ cursor: 'pointer' }}
      paddingY={2}
      display={hidden ? 'none' : 'flex'}
      justifyContent={'space-between'}
      onClick={() => {
        onSelect(address)
      }}
    >
      <Box display={'flex'}>
        <InitialNameAvatar name={name}></InitialNameAvatar>
        <Box marginLeft={1}>
          {editing ? (
            <OutlinedInput size={'small'} value={name} />
          ) : (
            <>
              <Typography component={'span'} display={'flex-inline'} paddingRight={1}>
                {name}
              </Typography>
              <AddressTypeTag addressType={addressType} />
            </>
          )}
          <Typography>{address}</Typography>
        </Box>
      </Box>
    </Box>
  )
}

const CloseIconStyled = styled(CloseIcon)`
  position: absolute;
  top: 55%;
  transform: translateY(-50%);
  right: ${({ theme }) => theme.unit}px;
  cursor: pointer;
`

// OutlinedInput
type ContactSelectionProps = {
  onSelect: (address: string) => void
  scrollHeight: string
} & Pick<sdk.GetContactsResponse, 'contacts'>
export const ContactSelection = (props: ContactSelectionProps) => {
  // const { t } = useTranslation();
  const { onSelect, contacts, scrollHeight } = props
  const { isMobile } = useSettings()
  const theme = useTheme()
  const [inputValue, setInputValue] = React.useState('')
  const handleOnFiler = (value: string) => {
    setInputValue(value)
    // let _contacts = contacts
    // if (value && contacts) {
    //   _contacts = contacts.filter((contact) => {
    //     return (
    //       contact.contactAddress.toLowerCase().includes(value.toLowerCase()) ||
    //       contact.contactName.toLowerCase().includes(value.toLowerCase())
    //     )
    //   })
    // }
  }
  const filterContacts = inputValue
    ? contacts.filter((contact) => {
        return (
          contact.contactAddress.toLowerCase().includes(inputValue.toLowerCase()) ||
          contact.contactName.toLowerCase().includes(inputValue.toLowerCase())
        )
      })
    : contacts
  const { t } = useTranslation()

  const normalView = (
    <>
      <Box width={'100%'}>
        <OutlinedInput
          style={{
            background: theme.colorBase.box,
            borderColor: theme.colorBase.border,
          }}
          fullWidth
          className={'search'}
          aria-label={'search'}
          placeholder={'Search'}
          startAdornment={
            <InputAdornment position='start'>
              <SearchIcon color={'inherit'} />
            </InputAdornment>
          }
          value={inputValue}
          endAdornment={
            <CloseIconStyled
              htmlColor={'var(--color-text-third)'}
              style={{ visibility: inputValue ? 'visible' : 'hidden' }}
              onClick={() => {
                handleOnFiler('')
              }}
            />
          }
          onChange={(e) => {
            handleOnFiler(e.target.value)
          }}
        />
        <Box overflow={'scroll'} height={scrollHeight}>
          {filterContacts &&
            filterContacts.map((contact) => {
              return (
                <SingleContact
                  key={contact.contactAddress}
                  name={contact.contactName}
                  address={contact.contactAddress}
                  addressType={contact.addressType}
                  editing={false}
                  onSelect={onSelect}
                  hidden={contact.addressType === sdk.AddressType.OFFICIAL}
                />
              )
            })}
        </Box>
      </Box>
    </>
  )
  const loadingView = (
    <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
      <img
        className='loading-gif'
        alt={'loading'}
        width='36'
        src={`${SoursURL}images/loading-line.gif`}
      />
    </Box>
  )
  const emptyView = (
    <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
      <Typography color={'var(--color-text-third)'}>{t('labelContactsNoContact')}</Typography>
    </Box>
  )

  return (
    <Box
      // container
      paddingLeft={isMobile ? 2 : 5}
      paddingRight={isMobile ? 2 : 5}
      // fle direction={"column"}
      alignItems={'stretch'}
      flex={1}
      height={'100%'}
      minWidth={240}
      flexWrap={'nowrap'}
      // spacing={2}
    >
      <Box>
        <Box
          display={'flex'}
          flexDirection={'column'}
          justifyContent={'center'}
          alignItems={'center'}
          marginBottom={2}
        >
          <Typography
            component={'h4'}
            variant={isMobile ? 'h4' : 'h3'}
            whiteSpace={'pre'}
            marginRight={1}
          >
            {t('labelContactsSelectReciepient')}
          </Typography>
        </Box>
      </Box>
      {contacts === undefined ? loadingView : contacts.length === 0 ? emptyView : normalView}
    </Box>
  )
}
