import { useAccount, useTokenMap } from '@loopring-web/core'
import { Box, Grid, Tab, Tabs, Typography, Divider } from '@mui/material'
import { useData, ProductsIndex } from './hook'
import { Button, CoinIcon, useSettings } from '@loopring-web/component-lib'
import React from 'react'
import { EmptyValueTag, getValuePrecisionThousand, TokenType } from '@loopring-web/common-resources'
import { DualProductTable } from './DualProductTable'
import { useDeposit, useWithdraw } from '../../hooks'
import { useSettle } from '../../hooks/useractions/useSettle'
import * as sdk from '@loopring-web/loopring-sdk'
import { ActionModal } from '../../modal'

export const AssetPage = () => {
  // dualManageConfig.tokenList
  const { account } = useAccount()
  const { tokenMap } = useTokenMap()
  const [value, setValue] = React.useState(ProductsIndex.delivering)
  const {
    assetData,
    assetTotal,
    protocolData,
    protocolTotal,
    delivering,
    progress,
    getProduct,
    deposit,
    withdraw,
    settle,
    products,
    setShowDeposit,
    setShowSettle,
    setShowWithdraw,
    modal: { isShowDeposit, isShowSettle, isShowWithdraw },
  } = useData()
  const depositProps = useDeposit({ setShowDeposit, isShowDeposit })
  const withdrawProps = useWithdraw({ setShowWithdraw, isShowWithdraw })
  const settleProps = useSettle({ isShowSettle, setShowSettle })

  const { coinJson } = useSettings()
  // const [item, setItem] = React.useState(products[value as any])
  return (
    <Box padding={3}>
      <Grid paddingX={3} marginBottom={2} container spacing={4}>
        <Grid item xs={12} md={5} height={'100%'}>
          <Box border={'1px solid var(--color-border)'} borderRadius={1} padding={2}>
            <Typography marginBottom={2} display={'flex'} variant={'h4'}>
              Wallet Assets
            </Typography>
            <Typography marginBottom={2} display={'flex'} variant={'h5'}>
              ${getValuePrecisionThousand(assetTotal, 2, 2)}
            </Typography>
            <Grid container display={'flex'} flex={1}>
              <>
                <Grid item xs={5}>
                  <Typography
                    marginBottom={2}
                    display={'flex'}
                    variant={'body1'}
                    color={'var(--color-text-third)'}
                  >
                    Assets
                  </Typography>
                </Grid>
                <Grid item xs={7}>
                  <Typography
                    marginBottom={2}
                    display={'flex'}
                    variant={'body1'}
                    color={'var(--color-text-third)'}
                  >
                    Wallet Balance
                  </Typography>
                </Grid>
              </>
              {assetData.map((item, index) => {
                return (
                  <React.Fragment key={index}>
                    <Grid item xs={5} display={'flex'} flexDirection={'row'}>
                      <Typography display={'inline-flex'} alignItems={'center'}>
                        <CoinIcon symbol={item.symbol} type={TokenType.single} size={'middle'} />
                        <Typography component={'span'} variant={'h5'} paddingLeft={1}>
                          {item.symbol}
                        </Typography>
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography display={'inline-flex'} alignItems={'center'}>
                        {`${
                          item.amount == '0'
                            ? EmptyValueTag
                            : getValuePrecisionThousand(
                                item.amount,
                                tokenMap[item.symbol].precision,
                                tokenMap[item.symbol].precision,
                                undefined,
                              )
                        }/$${
                          item.value == '0'
                            ? EmptyValueTag
                            : getValuePrecisionThousand(item.value, 2, 2)
                        }`}
                      </Typography>
                    </Grid>
                  </React.Fragment>
                )
              })}
            </Grid>
          </Box>
        </Grid>
        <Grid item xs={12} md={7} height={'100%'}>
          <Box border={'1px solid var(--color-border)'} borderRadius={1} padding={2}>
            <Typography marginBottom={2} display={'flex'} variant={'h4'}>
              Your Protocol Supplies
            </Typography>
            <Typography marginBottom={2} display={'flex'} variant={'h5'}>
              ${getValuePrecisionThousand(protocolTotal, 2, 2)}
            </Typography>
            <Grid container display={'flex'} flex={1}>
              <>
                <Grid item xs={3}>
                  <Typography
                    marginBottom={2}
                    display={'flex'}
                    variant={'body1'}
                    color={'var(--color-text-third)'}
                  >
                    Assets
                  </Typography>
                </Grid>
                <Grid item xs={5}>
                  <Typography
                    marginBottom={2}
                    display={'flex'}
                    variant={'body1'}
                    color={'var(--color-text-third)'}
                  >
                    Your Supply
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography
                    marginBottom={2}
                    paddingLeft={2}
                    display={'flex'}
                    variant={'body1'}
                    color={'var(--color-text-third)'}
                  >
                    Action
                  </Typography>
                </Grid>
              </>
              {protocolData.map((item, index) => {
                return (
                  <React.Fragment key={index}>
                    <Grid item xs={3} display={'flex'} flexDirection={'row'}>
                      <Typography display={'inline-flex'} alignItems={'center'}>
                        <CoinIcon symbol={item.symbol} type={TokenType.single} size={'middle'} />
                        <Typography component={'span'} variant={'h5'} paddingLeft={1}>
                          {item.symbol}
                        </Typography>
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography display={'inline-flex'} alignItems={'center'}>
                        {`${
                          item.amount == '0'
                            ? EmptyValueTag
                            : getValuePrecisionThousand(
                                item.amount,
                                tokenMap[item.symbol].precision,
                                tokenMap[item.symbol].precision,
                                undefined,
                              )
                        }/$${
                          item.value == '0'
                            ? EmptyValueTag
                            : getValuePrecisionThousand(item.value, 2, 2)
                        }`}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography display={'inline-flex'} alignItems={'center'}>
                        <Button variant={'text'} onClick={() => deposit(item.symbol)}>
                          deposit
                        </Button>
                        <Button variant={'text'} onClick={() => withdraw(item.symbol)}>
                          withdraw
                        </Button>
                      </Typography>
                    </Grid>
                  </React.Fragment>
                )
              })}
            </Grid>
          </Box>
        </Grid>
      </Grid>
      <Box margin={3} border={'1px solid var(--color-border)'} borderRadius={1} padding={2}>
        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          <Typography marginBottom={2} display={'flex'} variant={'h4'}>
            Assets in delivering to be supplied
          </Typography>
          <Button variant={'outlined'} onClick={settle}>
            settle
          </Button>
        </Box>
        <Grid container display={'flex'} flex={1}>
          <>
            <Grid item xs={3}>
              <Typography
                marginBottom={2}
                display={'flex'}
                variant={'body1'}
                color={'var(--color-text-third)'}
              >
                Assets
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography
                marginBottom={2}
                display={'flex'}
                variant={'body1'}
                color={'var(--color-text-third)'}
              >
                To be supplied
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography
                marginBottom={2}
                display={'flex'}
                variant={'body1'}
                color={'var(--color-text-third)'}
              >
                To be received
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography
                marginBottom={2}
                display={'flex'}
                variant={'body1'}
                color={'var(--color-text-third)'}
              >
                Your supply
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography
                marginBottom={2}
                display={'flex'}
                variant={'body1'}
                color={'var(--color-text-third)'}
              >
                Status
              </Typography>
            </Grid>
          </>

          {delivering.map((item, index) => {
            return (
              <React.Fragment key={index}>
                <Grid item xs={2} display={'flex'} flexDirection={'row'}>
                  <Typography display={'inline-flex'} alignItems={'center'}>
                    <CoinIcon symbol={item.symbol} type={TokenType.single} size={'middle'} />
                    <Typography component={'span'} variant={'h5'} paddingLeft={1}>
                      {item.symbol}
                    </Typography>
                  </Typography>
                </Grid>
                <Grid item xs={2} display={'flex'}>
                  <Typography display={'inline-flex'} alignItems={'center'}>
                    {`${
                      item.amount == '0'
                        ? EmptyValueTag
                        : getValuePrecisionThousand(
                            item.amount,
                            tokenMap[item.symbol].precision,
                            tokenMap[item.symbol].precision,
                            undefined,
                          )
                    }`}
                  </Typography>
                </Grid>
                <Grid item xs={2} display={'flex'}>
                  <Typography display={'inline-flex'} alignItems={'center'}>
                    {`item.amount == '0'
                      ? EmptyValueTag
                      :${getValuePrecisionThousand(
                        item.amount,
                        tokenMap[item.symbol].precision,
                        tokenMap[item.symbol].precision,
                        undefined,
                      )}`}
                  </Typography>
                </Grid>
                <Grid item xs={2} display={'flex'}>
                  <Typography display={'inline-flex'} alignItems={'center'}>
                    {`${
                      item.amount == '0'
                        ? EmptyValueTag
                        : getValuePrecisionThousand(
                            item.amount,
                            tokenMap[item.symbol].precision,
                            tokenMap[item.symbol].precision,
                            undefined,
                          )
                    }`}
                  </Typography>
                </Grid>
                <Grid item xs={3} display={'flex'}>
                  <Typography display={'inline-flex'} alignItems={'center'}>
                    {item.status}
                  </Typography>
                </Grid>
              </React.Fragment>
            )
          })}
        </Grid>
      </Box>

      <Box margin={3} border={'1px solid var(--color-border)'} borderRadius={1} padding={2}>
        <Typography marginBottom={2} display={'flex'} variant={'h4'}>
          Assets in progress to be supplied
        </Typography>
        <Typography marginBottom={2} display={'flex'} variant={'h5'}>
          ${getValuePrecisionThousand(assetTotal, 2, 2)}
        </Typography>
        <Grid container display={'flex'} flex={1}>
          <>
            <Grid item xs={3}>
              <Typography
                marginBottom={2}
                display={'flex'}
                variant={'body1'}
                color={'var(--color-text-third)'}
              >
                Assets
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography
                marginBottom={2}
                display={'flex'}
                variant={'body1'}
                color={'var(--color-text-third)'}
              >
                To be supplied
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography
                marginBottom={2}
                display={'flex'}
                variant={'body1'}
                color={'var(--color-text-third)'}
              >
                To be received
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography
                marginBottom={2}
                display={'flex'}
                variant={'body1'}
                color={'var(--color-text-third)'}
              >
                Your supply
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography
                marginBottom={2}
                display={'flex'}
                variant={'body1'}
                color={'var(--color-text-third)'}
              >
                Status
              </Typography>
            </Grid>
          </>
          {progress.map((item, index) => {
            return (
              <React.Fragment key={index}>
                <Grid item xs={2} display={'flex'} flexDirection={'row'}>
                  <Typography display={'inline-flex'} alignItems={'center'}>
                    <CoinIcon symbol={item.symbol} type={TokenType.single} size={'middle'} />
                    <Typography component={'span'} variant={'h5'} paddingLeft={1}>
                      {item.symbol}
                    </Typography>
                  </Typography>
                </Grid>
                <Grid item xs={2} display={'flex'}>
                  <Typography display={'inline-flex'} alignItems={'center'}>
                    {`${getValuePrecisionThousand(
                      item.amount,
                      tokenMap[item.symbol].precision,
                      tokenMap[item.symbol].precision,
                      undefined,
                    )}`}
                  </Typography>
                </Grid>
                <Grid item xs={2} display={'flex'}>
                  <Typography display={'inline-flex'} alignItems={'center'}>
                    {`${getValuePrecisionThousand(
                      item.amount,
                      tokenMap[item.symbol].precision,
                      tokenMap[item.symbol].precision,
                      undefined,
                    )}`}
                  </Typography>
                </Grid>
                <Grid item xs={2} display={'flex'}>
                  <Typography display={'inline-flex'} alignItems={'center'}>
                    {`${getValuePrecisionThousand(
                      item.amount,
                      tokenMap[item.symbol].precision,
                      tokenMap[item.symbol].precision,
                      undefined,
                    )}`}
                  </Typography>
                </Grid>
                <Grid item xs={3} display={'flex'}>
                  <Typography display={'inline-flex'} alignItems={'center'}>
                    {item.status}
                  </Typography>
                </Grid>
              </React.Fragment>
            )
          })}
        </Grid>
      </Box>

      <Box margin={3} border={'1px solid var(--color-border)'} borderRadius={1}>
        <Tabs
          value={value}
          onChange={(_, value) => {
            setValue(value)
            getProduct({
              page: 1,
              investmentStatuses:
                value == ProductsIndex.delivering
                  ? [sdk.Layer1DualInvestmentStatus.DUAL_SETTLED]
                  : [
                      sdk.Layer1DualInvestmentStatus.DUAL_CONFIRMED,
                      sdk.Layer1DualInvestmentStatus.DUAL_RECEIVED,
                    ],
            })
            // setItem(products[value])
          }}
        >
          <Tab value={ProductsIndex.delivering} label={'Products in delivering'} />
          <Tab value={ProductsIndex.progress} label={'Products in progress'} />
        </Tabs>
        <Divider />
        <Box flex={1} padding={2}>
          <Typography marginBottom={2} display={'flex'} variant={'h5'}>
            Total Investment ${getValuePrecisionThousand(products.total, 2, 2)}
          </Typography>
          <DualProductTable
            rawData={products.list ?? []}
            showloading={products.productLoading}
            isDelivering={value === ProductsIndex.delivering}
          />
        </Box>
      </Box>
      <ActionModal
        {...{
          isShowDeposit,
          setShowDeposit,
          depositProps,

          isShowWithdraw,
          setShowWithdraw,
          withdrawProps,

          isShowSettle,
          setShowSettle,
          settleProps,
        }}
      />
    </Box>
  )
}
