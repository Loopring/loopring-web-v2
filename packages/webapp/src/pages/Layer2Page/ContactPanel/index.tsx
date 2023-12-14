import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Popover,
  Typography,
} from '@mui/material'
import {
  AddressTypeTag,
  InputSearch,
  TablePagination,
  Toast,
  ToastType,
  useSettings,
  InitialNameAvatar,
  MaxWidthContainer,
} from '@loopring-web/component-lib'
import * as sdk from '@loopring-web/loopring-sdk'

import {
  CopyIcon,
  EditIcon,
  getShortAddr,
  MoreIcon,
  TOAST_TIME,
  ContactType,
  Contact,
} from '@loopring-web/common-resources'
import { Delete } from './delete'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import React from 'react'
import { useRouteMatch } from 'react-router-dom'
import { ContactTransactionsPage } from './history'
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'
import styled from '@emotion/styled'
import { useContact } from '@loopring-web/core'

const StyledPaper = styled(Box)`
  width: 100%;
  height: 100%;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`
export enum ContactL3Router {
  list = 'list',
  transactions = 'transactions',
}

export const ContactPage = () => {
  let match: any = useRouteMatch('/layer2/contact/:item')
  const view = React.useMemo(() => {
    return match?.params?.item == 'transactions' ? <ContactTransactionsPage /> : <ContractPanel />
  }, [match?.params?.item])
  return <>{view}</>
}

const ActionMemo = React.memo(
  <N = ContactType,>({
    data,
    onClickSend,
    onClickDelete,
  }: {
    data: ContactType
    onClickSend: (data: Contact) => void
    onClickDelete: (contactAddress: string, contactName: string) => void
  }) => {
    const history = useHistory()
    const { isMobile } = useSettings()
    const { t } = useTranslation('common')
    const popupState = usePopupState({
      variant: 'popover',
      popupId: 'contact-action',
    })
    const bindContent = bindMenu(popupState)
    const bindAction = bindTrigger(popupState)

    const items = React.useMemo(() => {
      return <></>
    }, [])
    return (
      <Grid item marginTop={1}>
        {isMobile ? (
          <>
            <IconButton size={'large'} edge={'end'} {...{ ...bindAction }}>
              <MoreIcon cursor={'pointer'} />
            </IconButton>
            <Popover
              {...bindContent}
              anchorReference='anchorEl'
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <Box borderRadius={'inherit'} minWidth={110}>
                <MenuItem onClick={() => onClickSend(data)}>{t('labelContactsSend')}</MenuItem>
                <MenuItem
                  onClick={() => {
                    history.push(
                      '/layer2/contact/transactions?contactAddress=' + data.contactAddress,
                    )
                  }}
                >
                  {t('labelContactsTransactions')}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    onClickDelete(data.contactAddress, data.contactName)
                  }}
                >
                  {t('labelContactsDeleteContactBtn')}
                </MenuItem>
              </Box>
            </Popover>
          </>
        ) : (
          <>
            <Button
              onClick={() => onClickSend(data)}
              variant={'contained'}
              size={'small'}
              sx={{ marginLeft: 1 }}
            >
              {t('labelContactsSend')}
            </Button>
            <Button
              variant={'outlined'}
              size={'medium'}
              onClick={() => {
                history.push('/layer2/contact/transactions?contactAddress=' + data.contactAddress)
              }}
              sx={{ marginLeft: 1 }}
            >
              {t('labelContactsTransactions')}
            </Button>
            <Button
              variant={'outlined'}
              size={'medium'}
              onClick={() => {
                onClickDelete(data.contactAddress, data.contactName)
              }}
              sx={{ marginLeft: 1 }}
            >
              {t('labelContactsDeleteContactBtn')}
            </Button>
          </>
        )}
      </Grid>
    )
  },
)
export const ContractPanel = ({ viewHeightRatio = 0.85, viewHeightOffset = 130 }) => {
  const {
    contacts,
    searchValue,
    onChangeSearch,
    onClickDelete,
    setShowEditContact,
    toastInfo,
    deleteInfo,
    onCloseDelete,
    submitDeleteContact,
    deleteLoading,
    onClickSend,
    closeToast,
    setToast,
    pagination,
    onPageChange,
    showPagination,
  } = useContact({
    viewHeightRatio,
    viewHeightOffset,
  })
  const { t } = useTranslation()

  const noContact = (
    <Box height={'80vh'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
      <Typography component={'span'} variant={'body1'} color={'var(--color-text-third)'}>
        {t('labelContactsNoContact')}
      </Typography>
    </Box>
  )

  const { isMobile } = useSettings()

  const normalView = (
    <>
      <Box height={`calc(${viewHeightRatio * 100}vh - ${viewHeightOffset}px)`} overflow={'scroll'}>
        {contacts &&
          contacts.map((data) => {
            return (
              <Box
                key={data.contactAddress}
                paddingY={2}
                display={data.addressType === sdk.AddressType.OFFICIAL ? 'none' : 'flex'}
                justifyContent={'space-between'}
              >
                <Box display={'flex'}>
                  <InitialNameAvatar name={data.contactName} />
                  <Typography
                    component={'p'}
                    marginLeft={1}
                    display={'flex'}
                    flexDirection={'column'}
                  >
                    <Typography
                      display={'inline-flex'}
                      alignItems={'center'}
                      component={'span'}
                      paddingRight={1}
                    >
                      <Typography display={'inline-flex'} paddingRight={1} component={'span'}>
                        {data.contactName}
                      </Typography>
                      <AddressTypeTag addressType={data.addressType} />
                      <EditIcon
                        sx={{
                          paddingLeft: 1,
                        }}
                        fontSize={'large'}
                        onClick={() => {
                          setShowEditContact({
                            isShow: true,
                            info: {
                              ...data,
                            },
                          })
                        }}
                      />
                    </Typography>
                    <Typography component={'span'} title={data.contactAddress}>
                      {isMobile ? getShortAddr(data.contactAddress ?? '') : data.contactAddress}
                      <IconButton
                        onClick={() => {
                          navigator.clipboard.writeText(data.contactAddress)
                          setToast({
                            open: true,
                            type: ToastType.success,
                            content: t('labelContactsCopySuccess'),
                          })
                        }}
                      >
                        <CopyIcon />
                      </IconButton>
                    </Typography>
                  </Typography>
                </Box>
                <Box display={'flex'}>
                  <ActionMemo data={data} onClickSend={onClickSend} onClickDelete={onClickDelete} />
                </Box>
              </Box>
            )
          })}
      </Box>
      {showPagination && pagination && (
        <TablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={onPageChange}
        />
      )}
    </>
  )
  return (
    <>
      <Toast
        alertText={toastInfo.content ?? ''}
        severity={toastInfo?.type}
        open={toastInfo.open}
        autoHideDuration={TOAST_TIME}
        onClose={closeToast}
        // onClose={closeToastL}
      />
      <Delete
        deleteInfo={deleteInfo}
        onCloseDelete={onCloseDelete}
        submitDeleteContact={submitDeleteContact}
        loading={deleteLoading}
      />
      <MaxWidthContainer
        sx={{ flexDirection: 'row' }}
        background={'var(--color-global-bg)'}
        display={'flex'}
        justifyContent={'space-between'}
      >
        <Typography
          component={'h3'}
          variant={'h5'}
          paddingX={5 / 2}
          display={'inline-flex'}
          alignItems={'center'}
          paddingY={2}
        >
          {t('labelContacts')}
        </Typography>
        <Box display={'flex'} alignItems={'center'}>
          <InputSearch
            value={searchValue}
            onChange={(e) => {
              onChangeSearch(e as unknown as string)
            }}
          />
          <Box marginLeft={2}>
            <Button
              variant={'contained'}
              size={'small'}
              onClick={() => {
                setShowEditContact({ isShow: true })
                // setSelectAddress(undefined)
                // setAddOpen(true)
              }}
            >
              {t('labelContactsAddContactBtn')}
            </Button>
          </Box>
        </Box>
      </MaxWidthContainer>
      <Divider />
      <MaxWidthContainer
        background={'var(--color-pop-bg)'}
        display={'flex'}
        justifyContent={'space-between'}
        paddingY={2}
        flexDirection={'column'}
      >
        <StyledPaper
          className={'MuiPaper-elevation2'}
          margin={0}
          marginBottom={2}
          paddingX={2}
          paddingY={2}
        >
          <Box className='table-divide'>
            {!contacts || contacts.length === 0 ? noContact : normalView}
          </Box>
        </StyledPaper>
      </MaxWidthContainer>
    </>
  )
}
