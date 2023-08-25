import { Box, Button, IconButton, Typography } from '@mui/material'
import styled from '@emotion/styled'
import { AddressTypeTag, InputSearch, TablePagination, Toast, ToastType } from '@loopring-web/component-lib'
import { CopyIcon, EditIcon, SoursURL, TOAST_TIME } from '@loopring-web/common-resources'
import { EditContact } from './add'
import { Delete } from './delete'
import { Send } from './send'
import { useContact, viewHeightOffset, viewHeightRatio } from './hooks'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AddressType } from '@loopring-web/loopring-sdk'
import React from 'react'
import { useRouteMatch } from 'react-router-dom'
import { ContactTransactionsPage } from './history'
import { InitialNameAvatar } from '@loopring-web/component-lib/src/components/tradePanel/components/ContactSelection'
import * as sdk from '@loopring-web/loopring-sdk';
import { ContactType } from '@loopring-web/core';

const ContactPageStyle = styled(Box)`
  background: var(--color-box);
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

export const ContractPanel = () => {
  const {
    setAddOpen,
    addOpen,

    contacts,
    searchValue,
    onChangeSearch,
    onClickDelete,
    selectAddress,
    setSelectAddress,
    toastInfo,
    deleteInfo,
    onCloseDelete,
    submitDeleteContact,
    deleteLoading,
    onClickSend,
    onCloseSend,
    sendInfo,
      closeToast,
      setToast,
    pagination,
    onPageChange,
    showPagination,
  } = useContact()
  const { t } = useTranslation()
  const history = useHistory()

  const noContact = (
    <Box height={'80vh'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
        <Typography compontent={'span'} color={'var(--color-text-third)'}>{t('labelContactsNoContact')}</Typography>
    </Box>
  )

  const normalView = (
    <>
      <Box height={`calc(${viewHeightRatio * 100}vh - ${viewHeightOffset}px)`} overflow={'scroll'}>
        {contacts &&
          contacts.map((data) => {
            // const {  contactName, addressType,contactAddress,...rest } =
            return (
              <Box
                  key={data.contactAddress}
                paddingY={2}
                  display={data.addressType === AddressType.OFFICIAL ? 'none' : 'flex'}
                justifyContent={'space-between'}
              >
                <Box display={'flex'}>
                  <InitialNameAvatar name={data.contactName}/>
                    <Typography component={'p'} marginLeft={1}>
                        <Typography display={'inline-flex'} alignItems={'center'} component={'span'}
                                    paddingRight={1}>
                            <Typography display={'inline-flex'} paddingRight={1} component={'span'}>
                                {data.contactName}
                            </Typography>
                      {data.addressType && <AddressTypeTag addressType={data.addressType}/>}
                            <EditIcon
                                sx={{
                                    paddingLeft: 1
                                }}
                                fontSize={'large'}
                                onClick={() => {
                        setAddOpen(true)
                        setSelectAddress(data as ContactType)
                      }
                      }/>
                    </Typography>
                        <Typography compontent={'span'}>
                      {data.contactAddress}
                      <IconButton
                        onClick={() => {
                          navigator.clipboard.writeText(data.contactAddress)
                            setToast({
                            open: true,
                                type: ToastType.success,
                                content: t('labelContactsCopySuccess')
                          })
                        }}
                      >
                          <CopyIcon/>
                      </IconButton>
                    </Typography>
                    </Typography>
                </Box>
                <Box display={'flex'}>
                  <Box marginRight={2}>
                    <Button
                        onClick={() => onClickSend(data.contactAddress, data.contactName, data.addressType)}
                      variant={'contained'}
                      size={'small'}
                    >
                      {t('labelContactsSend')}
                    </Button>
                  </Box>
                  <Box marginRight={2}>
                    <Button
                      variant={'outlined'}
                      size={'medium'}
                      onClick={() => {
                        history.push('/layer2/contact/transactions?contactAddress=' + data.contactAddress)
                      }}
                    >
                      {t('labelContactsTransactions')}
                    </Button>
                  </Box>
                  <Button
                    variant={'outlined'}
                    size={'medium'}
                    onClick={() => {
                      onClickDelete(data.contactAddress, data.contactName)
                    }}
                  >
                    {t('labelContactsDeleteContactBtn')}
                  </Button>
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

//     <Box height={'80vh'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
//     <img
//   className='loading-gif'
//   alt={'loading'}
//   width='36'
//   src={`${SoursURL}images/loading-line.gif`}
//   />
// </Box>
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
      <EditContact
          // loading={addLoading}
        isEdit={selectAddress ? {item: selectAddress} : false}
        addOpen={addOpen}
        setAddOpen={setAddOpen}
        onClose={() => {
            setSelectAddress(undefined)
            setAddOpen(false)
        }}
        setToast={setToast}
      />
      <Delete
        deleteInfo={deleteInfo}
        onCloseDelete={onCloseDelete}
        submitDeleteContact={submitDeleteContact}
        loading={deleteLoading}
      />
      <Send sendInfo={sendInfo} onCloseSend={onCloseSend} />
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
                  setSelectAddress(undefined)
                setAddOpen(true)
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
            {!contacts || contacts.length === 0 ? noContact : normalView}
        </Box>
      </Box>
    </ContactPageStyle>
  )
}
