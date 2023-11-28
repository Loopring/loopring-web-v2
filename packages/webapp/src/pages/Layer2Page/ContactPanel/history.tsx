import React from 'react'
import { Box, Divider } from '@mui/material'
import {
  Button,
  MaxWidthContainer,
  Toast,
  ToastType,
  TransactionTable,
} from '@loopring-web/component-lib'
import { StylePaper, useAccount, useSystem, useToast, useTokenMap } from '@loopring-web/core'
import { useContractRecord } from './hooks'
import { BackIcon, RowConfig, TOAST_TIME } from '@loopring-web/common-resources'
import { useHistory } from 'react-router-dom'
import { WithTranslation, withTranslation } from 'react-i18next'

export const ContactTransactionsPage = withTranslation('common')(
  (rest: WithTranslation<'common'>) => {
    const history = useHistory()

    const [pageSize, setPageSize] = React.useState(0)

    const { toastOpen, setToastOpen, closeToast } = useToast()
    const { totalCoinMap } = useTokenMap()
    const { etherscanBaseUrl } = useSystem()

    const {
      account: { accAddress, accountId },
    } = useAccount()

    const container = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      let height = container?.current?.offsetHeight
      if (height) {
        // const pageSize = Math.floor((height - 120) / RowConfig.rowHeight) - 3;
        setPageSize(Math.floor((height - 120) / RowConfig.rowHeight) - 3)
        // handleTabChange(currentTab, pageSize);
      }
    }, [container?.current?.offsetHeight])
    const {
      txs: txTableData,
      txsTotal,
      showLoading: showTxsLoading,
      getUserTxnList,
    } = useContractRecord(setToastOpen)

    return (
      <Box flex={1} display={'flex'} flexDirection={'column'}>
        <MaxWidthContainer
          sx={{ flexDirection: 'row' }}
          background={'var(--color-global-bg)'}
          display={'flex'}
          justifyContent={'space-between'}
          padding={2}
        >
          <Button
            startIcon={<BackIcon fontSize={'small'} />}
            variant={'text'}
            size={'medium'}
            sx={{ color: 'var(--color-text-secondary)' }}
            color={'inherit'}
            onClick={history.goBack}
          >
            {rest.t('labelContacts')}
          </Button>
        </MaxWidthContainer>
        <Divider />
        <MaxWidthContainer
          background={'var(--color-pop-bg)'}
          display={'flex'}
          justifyContent={'space-between'}
          paddingY={2}
          flexDirection={'column'}
        >
          <Toast
            alertText={toastOpen?.content ?? ''}
            severity={toastOpen?.type ?? ToastType.success}
            open={toastOpen?.open ?? false}
            autoHideDuration={TOAST_TIME}
            onClose={closeToast}
          />
          <Box
            className='tableWrapper table-divide-short'
            display={'flex'}
            flex={1}
            overflow={'scroll'}
            ref={container}
          >
            <TransactionTable
              {...{
                etherscanBaseUrl,
                rawData: txTableData,
                pagination: {
                  pageSize: pageSize,
                  total: txsTotal,
                },
                filterTokens: totalCoinMap ? (Reflect.ownKeys(totalCoinMap) as string[]) : [],
                showFilter: true,
                showloading: showTxsLoading,
                getTxnList: getUserTxnList,
                accAddress,
                accountId,
                ...rest,
              }}
            />
          </Box>
        </MaxWidthContainer>
      </Box>
    )
  },
)
