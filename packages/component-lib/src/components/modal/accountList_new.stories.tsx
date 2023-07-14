import styled from '@emotion/styled'
import React from 'react'
import { Meta, Story } from '@storybook/react/types-6-0'
import { WithTranslation, withTranslation } from 'react-i18next'
import { MemoryRouter } from 'react-router-dom'
import { Box, Button, Grid, Typography } from '@mui/material'
import { ModalWalletConnect } from './WalletConnect'

import {
  AccountBaseProps,
  AccountStep as AccountStep,
  CreateAccount_Approve_Denied,
  CreateAccount_Approve_Submit,
  CreateAccount_Approve_WaitForAuth,
  CreateAccount_Denied,
  CreateAccount_Failed,
  CreateAccount_Submit,
  CreateAccount_WaitForAuth,
  Deposit_Approve_Denied,
  Deposit_Approve_WaitForAuth,
  Deposit_Denied,
  Deposit_Failed,
  Deposit_Submit,
  Deposit_WaitForAuth,
  ExportAccount_Approve_WaitForAuth,
  ExportAccount_Failed,
  ExportAccount_Success,
  ExportAccount_User_Denied,
  HadAccount,
  NoAccount,
  Transfer_Failed,
  Transfer_First_Method_Denied,
  Transfer_In_Progress,
  Transfer_Success,
  Transfer_User_Denied,
  Transfer_WaitForAuth,
  UpdateAccount,
  UpdateAccount_Approve_WaitForAuth,
  UpdateAccount_Failed,
  UpdateAccount_First_Method_Denied,
  UpdateAccount_Success,
  UpdateAccount_User_Denied,
  Withdraw_Failed,
  Withdraw_First_Method_Denied,
  Withdraw_In_Progress,
  Withdraw_Success,
  Withdraw_User_Denied,
  Withdraw_WaitForAuth,
} from './ModalPanels'
import { account } from '../../static'
import { ConnectProviders } from '@loopring-web/web3-provider'
import { gatewayList } from '@loopring-web/common-resources'

const Style = styled.div`
  flex: 1;
  height: 100%;
`

const Template: Story<any> = withTranslation()((rest: WithTranslation) => {
  gatewayList[0] = {
    ...gatewayList[0],
    handleSelect: () => console.log('metaMask 11'),
  }

  const mainBtn = React.useMemo(() => {
    return (
      <Button variant={'contained'} fullWidth size={'medium'} onClick={() => {}}>
        {'unlock'}
      </Button>
    )
  }, [])
  const accountInfoProps: AccountBaseProps = {
    ...account,
    level: 'VIP 1',
    etherscanUrl: 'https://material-ui.com/components/material-icons/',
  }
  // const accAddress = '0xcEd11e039a5C50927a17a8D4632616DFa8F72BF6'

  const retryBtn = React.useMemo(() => {
    return {
      btnTxt: 'retry',
      callback: () => {},
    }
  }, [])

  const closeBtn = React.useMemo(() => {
    return {
      btnTxt: 'close',
      callback: () => {},
    }
  }, [])

  const { nameList0, accountList0 } = React.useMemo(() => {
    const accountMap = {
      [AccountStep.NoAccount]: {
        view: (
          <NoAccount
            goActiveAccount={function (): void {
              throw new Error('Function not implemented.')
            }}
            onClose={function (_e?: any): void {
              throw new Error('Function not implemented.')
            }}
            clearDepositHash={function (): void {
              throw new Error('Function not implemented.')
            }}
            {...{
              chainInfos: { depositHashes: {} },
              ...accountInfoProps,
              goAddAssetsFromL1: () => {},
            }}
          />
        ),
      },
      [AccountStep.UpdateAccount]: {
        view: (
          <UpdateAccount
            clearDepositHash={function (): void {
              throw new Error('Function not implemented.')
            }}
            {...{
              ...accountInfoProps,
              chainInfos: { depositHashes: {} },
              ...rest,
            }}
            goUpdateAccount={() => undefined}
          />
        ),
      },
      [AccountStep.HadAccount]: {
        view: (
          <HadAccount
            clearDepositHash={function (): void {
              throw new Error('Function not implemented.')
            }}
            onClose={function (_e?: any): void {
              throw new Error('Function not implemented.')
            }}
            mainBtn={mainBtn}
            {...{
              ...accountInfoProps,
              chainInfos: { depositHashes: {} },
            }}
          />
        ),
      },
    }

    return {
      nameList0: Object.keys(accountMap),
      accountList0: Object.values(accountMap),
    }
  }, [])

  const { nameList, accountList } = React.useMemo(() => {
    const accountMap = {
      [AccountStep.Deposit_Sign_WaitForRefer]: {
        view: (
          <Deposit_Approve_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },
      [AccountStep.Deposit_Approve_WaitForAuth]: {
        view: (
          <Deposit_Approve_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },
      [AccountStep.Deposit_Approve_Denied]: {
        view: (
          <Deposit_Approve_Denied
            btnInfo={retryBtn}
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },

      [AccountStep.Deposit_WaitForAuth]: {
        view: (
          <Deposit_WaitForAuth
            providerName={ConnectProviders.WalletConnect}
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },
      [AccountStep.Deposit_Denied]: {
        view: (
          <Deposit_Denied
            btnInfo={retryBtn}
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },
      [AccountStep.Deposit_Failed]: {
        view: (
          <Deposit_Failed
            btnInfo={closeBtn}
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },
      [AccountStep.Deposit_Submit]: {
        view: (
          <Deposit_Submit
            txCheck={{
              route: '',
              callback: () => {},
            }}
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },
    }

    return {
      nameList: Object.keys(accountMap),
      accountList: Object.values(accountMap),
    }
  }, [])

  const { nameList2, accountList2 } = React.useMemo(() => {
    const accountMap = {
      [AccountStep.Transfer_WaitForAuth]: {
        view: (
          <Transfer_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },
      [AccountStep.Transfer_First_Method_Denied]: {
        view: (
          <Transfer_First_Method_Denied
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },
      [AccountStep.Transfer_User_Denied]: {
        view: (
          <Transfer_User_Denied
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },
      [AccountStep.Transfer_In_Progress]: {
        view: (
          <Transfer_In_Progress
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },
      [AccountStep.Transfer_Success]: {
        view: (
          <Transfer_Success
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },
      [AccountStep.Transfer_Failed]: {
        view: (
          <Transfer_Failed
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },
    }

    return {
      nameList2: Object.keys(accountMap),
      accountList2: Object.values(accountMap),
    }
  }, [])

  const { nameList3, accountList3 } = React.useMemo(() => {
    const accountMap = {
      [AccountStep.Withdraw_WaitForAuth]: {
        view: (
          <Withdraw_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },
      [AccountStep.Withdraw_First_Method_Denied]: {
        view: (
          <Withdraw_First_Method_Denied
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },
      [AccountStep.Withdraw_User_Denied]: {
        view: (
          <Withdraw_User_Denied
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },
      [AccountStep.Withdraw_In_Progress]: {
        view: (
          <Withdraw_In_Progress
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },
      [AccountStep.Withdraw_Success]: {
        view: (
          <Withdraw_Success
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },
      [AccountStep.Withdraw_Failed]: {
        view: (
          <Withdraw_Failed
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },
    }

    return {
      nameList3: Object.keys(accountMap),
      accountList3: Object.values(accountMap),
    }
  }, [])

  const { nameList4, accountList4 } = React.useMemo(() => {
    const accountMap = {
      [AccountStep.CreateAccount_Approve_WaitForAuth]: {
        view: (
          <CreateAccount_Approve_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },
      [AccountStep.CreateAccount_Approve_Denied]: {
        view: (
          <CreateAccount_Approve_Denied
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },
      [AccountStep.CreateAccount_Approve_Submit]: {
        view: (
          <CreateAccount_Approve_Submit
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },
      [AccountStep.CreateAccount_WaitForAuth]: {
        view: (
          <CreateAccount_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },
      [AccountStep.CreateAccount_Denied]: {
        view: (
          <CreateAccount_Denied
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },
      [AccountStep.CreateAccount_Failed]: {
        view: (
          <CreateAccount_Failed
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },
      [AccountStep.CreateAccount_Submit]: {
        view: (
          <CreateAccount_Submit
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              symbol: 'LRC',
              value: '1.2121',
            }}
          />
        ),
      },
    }

    return {
      nameList4: Object.keys(accountMap),
      accountList4: Object.values(accountMap),
    }
  }, [])

  const { nameList5, accountList5 } = React.useMemo(() => {
    const accountMap = {
      [AccountStep.UpdateAccount_Approve_WaitForAuth]: {
        view: (
          <UpdateAccount_Approve_WaitForAuth
            {...{
              ...rest,
              providerNam: 'MetaMask',
            }}
          />
        ),
      },
      [AccountStep.UpdateAccount_First_Method_Denied]: {
        view: (
          <UpdateAccount_First_Method_Denied
            btnInfo={retryBtn}
            {...{
              ...rest,
            }}
          />
        ),
      },
      [AccountStep.UpdateAccount_User_Denied]: {
        view: (
          <UpdateAccount_User_Denied
            btnInfo={retryBtn}
            {...{
              ...rest,
            }}
          />
        ),
      },
      [AccountStep.UpdateAccount_Success]: {
        view: (
          <UpdateAccount_Success
            btnInfo={closeBtn}
            {...{
              ...rest,
            }}
          />
        ),
      },
      [AccountStep.UpdateAccount_Success]: {
        view: (
          <UpdateAccount_Success
            btnInfo={closeBtn}
            {...{
              ...rest,
            }}
          />
        ),
      },
      [AccountStep.UpdateAccount_Failed]: {
        view: (
          <UpdateAccount_Failed
            btnInfo={closeBtn}
            {...{
              ...rest,
            }}
          />
        ),
      },

      [AccountStep.ResetAccount_Approve_WaitForAuth]: {
        view: (
          <UpdateAccount_Approve_WaitForAuth
            patch={{ isReset: true }}
            {...{
              ...rest,
              providerNam: 'MetaMask',
            }}
          />
        ),
      },
      [AccountStep.ResetAccount_First_Method_Denied]: {
        view: (
          <UpdateAccount_First_Method_Denied
            patch={{ isReset: true }}
            btnInfo={retryBtn}
            {...{
              ...rest,
            }}
          />
        ),
      },
      [AccountStep.ResetAccount_User_Denied]: {
        view: (
          <UpdateAccount_User_Denied
            patch={{ isReset: true }}
            btnInfo={retryBtn}
            {...{
              ...rest,
            }}
          />
        ),
      },
      [AccountStep.ResetAccount_Success]: {
        view: (
          <UpdateAccount_Success
            patch={{ isReset: true }}
            btnInfo={closeBtn}
            {...{
              ...rest,
            }}
          />
        ),
      },

      [AccountStep.ExportAccount_Approve_WaitForAuth]: {
        view: (
          <ExportAccount_Approve_WaitForAuth
            patch={{ isReset: true }}
            btnInfo={closeBtn}
            {...{
              ...rest,
            }}
          />
        ),
      },
      [AccountStep.ExportAccount_User_Denied]: {
        view: (
          <ExportAccount_User_Denied
            patch={{ isReset: true }}
            btnInfo={retryBtn}
            {...{
              ...rest,
            }}
          />
        ),
      },
      [AccountStep.ExportAccount_Success]: {
        view: (
          <ExportAccount_Success
            patch={{ isReset: true }}
            btnInfo={closeBtn}
            {...{
              ...rest,
            }}
          />
        ),
      },
      [AccountStep.ExportAccount_Failed]: {
        view: (
          <ExportAccount_Failed
            patch={{ isReset: true }}
            btnInfo={closeBtn}
            {...{
              ...rest,
            }}
          />
        ),
      },
    }

    return {
      nameList5: Object.keys(accountMap),
      accountList5: Object.values(accountMap),
    }
  }, [])

  const fontSize = '30px'
  const color = 'white'
  const width = 400

  const w = 540
  const h = 600

  return (
    <>
      <Style>
        <MemoryRouter initialEntries={['/']}>
          <Box
            paddingTop={2}
            paddingX={2}
            width={width}
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <Typography fontSize={fontSize} color={color} variant={'body2'}>
              {' '}
              Old Version{' '}
            </Typography>
          </Box>
          <Grid container spacing={0}>
            {accountList0.map((panel: any, index: number) => {
              return (
                <>
                  <Box
                    key={index}
                    display={'flex'}
                    flexDirection={'column'}
                    width={w}
                    height={h}
                    padding={2}
                    justifyContent={'center'}
                    alignItems={'stretch'}
                  >
                    <Typography
                      marginTop={2}
                      variant={'body2'}
                      color={'textSecondary'}
                      style={{ wordBreak: 'break-all' }}
                    >
                      {AccountStep[nameList0[index]]}
                    </Typography>

                    {panel.view}
                  </Box>
                </>
              )
            })}
          </Grid>

          <Box
            paddingTop={2}
            paddingX={2}
            width={width}
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <Typography fontSize={fontSize} color={color} variant={'body2'}>
              {' '}
              Deposit
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {accountList.map((panel, index) => {
              return (
                <>
                  <Box
                    key={index}
                    display={'flex'}
                    flexDirection={'column'}
                    width={w}
                    height={h}
                    padding={2}
                    justifyContent={'center'}
                    alignItems={'stretch'}
                  >
                    <Typography
                      marginTop={2}
                      variant={'body2'}
                      color={'textSecondary'}
                      style={{ wordBreak: 'break-all' }}
                    >
                      {AccountStep[nameList[index]]}
                    </Typography>

                    {panel.view}
                  </Box>
                </>
              )
            })}
          </Grid>

          <Box
            paddingTop={2}
            paddingX={2}
            width={width}
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <Typography fontSize={fontSize} color={color} variant={'body2'}>
              {' '}
              Transfer{' '}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {accountList2.map((panel, index) => {
              return (
                <>
                  <Box
                    key={index}
                    display={'flex'}
                    flexDirection={'column'}
                    width={w}
                    height={h}
                    padding={2}
                    justifyContent={'center'}
                    alignItems={'stretch'}
                  >
                    <Typography
                      marginTop={2}
                      variant={'body2'}
                      color={'textSecondary'}
                      style={{ wordBreak: 'break-all' }}
                    >
                      {AccountStep[nameList2[index]]}
                    </Typography>

                    {panel.view}
                  </Box>
                </>
              )
            })}
          </Grid>

          <Box
            paddingTop={2}
            paddingX={2}
            width={width}
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <Typography fontSize={fontSize} color={color} variant={'body2'}>
              Withdraw
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {accountList3.map((panel, index) => {
              return (
                <>
                  <Box
                    key={index}
                    display={'flex'}
                    flexDirection={'column'}
                    width={w}
                    height={h}
                    padding={2}
                    justifyContent={'center'}
                    alignItems={'stretch'}
                  >
                    <Typography
                      marginTop={2}
                      variant={'body2'}
                      color={'textSecondary'}
                      style={{ wordBreak: 'break-all' }}
                    >
                      {AccountStep[nameList3[index]]}
                    </Typography>

                    {panel.view}
                  </Box>
                </>
              )
            })}
          </Grid>

          <Box
            paddingTop={2}
            paddingX={2}
            width={width}
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <Typography fontSize={fontSize} color={color} variant={'body2'}>
              {' '}
              Create Layer2 Account{' '}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {accountList4.map((panel, index) => {
              return (
                <>
                  <Box
                    key={index}
                    display={'flex'}
                    flexDirection={'column'}
                    width={w}
                    height={h}
                    padding={2}
                    justifyContent={'center'}
                    alignItems={'stretch'}
                  >
                    <Typography
                      marginTop={2}
                      variant={'body2'}
                      color={'textSecondary'}
                      style={{ wordBreak: 'break-all' }}
                    >
                      {AccountStep[nameList4[index]]}
                    </Typography>

                    {panel.view}
                  </Box>
                </>
              )
            })}
          </Grid>

          <Box
            paddingTop={2}
            paddingX={2}
            width={width}
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <Typography fontSize={fontSize} color={color} variant={'body2'}>
              {' '}
              Update Layer2 Account{' '}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {accountList5.map((panel, index) => {
              return (
                <>
                  <Box
                    key={index}
                    display={'flex'}
                    flexDirection={'column'}
                    width={w}
                    height={h}
                    padding={2}
                    justifyContent={'center'}
                    alignItems={'stretch'}
                  >
                    <Typography
                      marginTop={2}
                      variant={'body2'}
                      color={'textSecondary'}
                      style={{ wordBreak: 'break-all' }}
                    >
                      {AccountStep[nameList5[index]]}
                    </Typography>

                    {panel.view}
                  </Box>
                </>
              )
            })}
          </Grid>
        </MemoryRouter>
      </Style>
    </>
  )
}) as Story<any>

// @ts-ignore
export const ModalListStory = Template.bind({})

export default {
  title: 'components/account_list_new',
  component: ModalWalletConnect,
  argTypes: {},
} as Meta
