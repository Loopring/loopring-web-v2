import { Box, Grid } from '@mui/material'
import { useRouteMatch, useLocation } from 'react-router-dom'
import React from 'react'
import { EmptyDefault, LoadingBlock } from '@loopring-web/component-lib'
import Template from 'easy-template-string'
import gfm from 'remark-gfm'
import ReactMarkdown from 'react-markdown'
import { useTheme } from '@emotion/react'

import { useTranslation } from 'react-i18next'
import { MarkdownStyle } from '@loopring-web/common-resources'

const url_path = 'https://static.loopring.io/documents'

const formatInput = async (textContent: string): Promise<string> => {
  // let [data, content] = args;
  const data = await fetch('https://api3.loopring.io/api/v2/exchange/feeInfo')
    .then((res) => res.json())
    .then((data) => data.data)
  let { ORDERBOOK_TRADING_FEES_STABLECOIN, ORDERBOOK_TRADING_FEES, AMM_TRADING_FEES } = data
  ORDERBOOK_TRADING_FEES_STABLECOIN = Object.keys(ORDERBOOK_TRADING_FEES_STABLECOIN).reduce(
    (pre, key) => {
      pre['ORDERBOOK_TRADING_FEES_STABLECOIN.' + key] = (
        ORDERBOOK_TRADING_FEES_STABLECOIN[key].takerRate / 100
      ).toFixed(2)
      return pre
    },
    {},
  )
  ORDERBOOK_TRADING_FEES = Object.keys(ORDERBOOK_TRADING_FEES).reduce((pre, key) => {
    pre['ORDERBOOK_TRADING_FEES.' + key] = (ORDERBOOK_TRADING_FEES[key].takerRate / 100).toFixed(2)
    return pre
  }, {})
  AMM_TRADING_FEES = Object.keys(AMM_TRADING_FEES).reduce((pre, key) => {
    pre['AMM_TRADING_FEES.' + key] = (AMM_TRADING_FEES[key].takerRate / 100).toFixed(2)
    return pre
  }, {})
  const template1 = new Template(textContent)
  return template1.interpolate({
    ...ORDERBOOK_TRADING_FEES_STABLECOIN,
    ...ORDERBOOK_TRADING_FEES,
    ...AMM_TRADING_FEES,
  })
}
const list = ['wallet_fees_zh.md', 'wallet_fees_en.md', 'dex_fees_en.md', 'dex_fees_zh.md']
export const MarkdownPage = () => {
  const location = useLocation()
  const path = location.pathname.split('/').slice(2).join('/')
  const [input, setInput] = React.useState<string>('')
  const { t } = useTranslation('common')
  React.useEffect(() => {
    if (path) {
      try {
        const _path = `markdown/${path}`
        fetch(url_path + '/' + _path)
          .then((response) => response.text())
          .then((input) => {
            if (list.findIndex((f) => f === path) !== -1) {
              return formatInput(input)
            } else {
              return input
            }
          })
          .then((input) => {
            setInput(input)
          })
          .catch(() => {})
      } catch (e: any) {}
    }
  }, [path])
  const theme = useTheme()

  return (
    <MarkdownStyle
      container
      minHeight={'calc(100% - 260px)'}
      flex={1}
      marginTop={3}
      marginBottom={2}
    >
      <Grid item xs={12}>
        {path ? (
          input ? (
            <Box
              flex={1}
              padding={3}
              boxSizing={'border-box'}
              className={`${theme.mode}  ${theme.mode}-scheme markdown-body MuiPaper-elevation2`}
            >
              <ReactMarkdown remarkPlugins={[gfm]} children={input} />
            </Box>
          ) : (
            <LoadingBlock />
          )
        ) : (
          <EmptyDefault
            height={'100%'}
            message={() => (
              <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                {t('labelNoContent')}
              </Box>
            )}
          />
        )}
      </Grid>
    </MarkdownStyle>
  )
}

export * from './notifyMarkdown'
export * from './investMarkdown'
