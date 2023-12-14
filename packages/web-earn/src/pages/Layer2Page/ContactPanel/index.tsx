import { Box, Grid, IconButton, MenuItem, Popover, Typography } from '@mui/material'
import styled from '@emotion/styled'
import {
  AddressTypeTag,
  InputSearch,
  TablePagination,
  Toast,
  ToastType,
  useSettings,
  InitialNameAvatar,
  Button,
} from '@loopring-web/component-lib'
import * as sdk from '@loopring-web/loopring-sdk'
import { useContact } from '@loopring-web/core'

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

const ContactPageStyle = styled(Box)`
  background: var(--color-box-third);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 85vh;
  /* padding-bottom: 5%  */
  width: 100%;
  border-radius: ${({ theme }) => theme.unit}px;
`

const Line = styled('div')`
  border-radius: ${({ theme }) => theme.unit / 2}px;
  height: 1px;
  margin-top: ${({ theme }) => theme.unit * 2}px;
  background: var(--color-divide);
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
    index,
    btnLoading,
  }: {
    data: ContactType
    index: number
    onClickSend: (data: Contact, index: number) => void
    onClickDelete: (contactAddress: string, contactName: string) => void
    btnLoading: { index: number; loading: boolean }
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
                <MenuItem onClick={() => onClickSend(data, index)}>
                  {t('labelContactsSend')}
                </MenuItem>
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
              onClick={() => onClickSend(data, index)}
              variant={'contained'}
              size={'small'}
              sx={{ marginLeft: 1 }}
              loading={btnLoading.index == index && btnLoading.loading ? 'true' : 'false'}
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
    btnLoading,
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

  return (
    <ContactPageStyle className={'MuiPaper-elevation2'} paddingX={4} paddingY={3}>
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
      <Box display={'flex'} justifyContent={'space-between'}>
        <Typography variant={'h2'} paddingRight={2}>
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
              }}
            >
              {t('labelContactsAddContactBtn')}
            </Button>
          </Box>
        </Box>
      </Box>
      <Box className='table-divide'>
        <Line />
        <Box>
          {!contacts || contacts.length === 0 ? (
            noContact
          ) : (
            <>
              <Box
                height={`calc(${viewHeightRatio * 100}vh - ${viewHeightOffset}px)`}
                overflow={'scroll'}
              >
                {contacts &&
                  contacts.map((data, index) => {
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
                              <Typography
                                display={'inline-flex'}
                                paddingRight={1}
                                component={'span'}
                              >
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
                              {isMobile
                                ? getShortAddr(data.contactAddress ?? '')
                                : data.contactAddress}
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
                          <ActionMemo
                            data={data}
                            btnLoading={btnLoading}
                            index={index}
                            onClickSend={onClickSend}
                            onClickDelete={onClickDelete}
                          />
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
          )}
        </Box>
      </Box>
    </ContactPageStyle>
  )
}
