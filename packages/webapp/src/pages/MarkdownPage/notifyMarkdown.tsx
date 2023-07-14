import { Box, Grid } from '@mui/material'
import { useRouteMatch } from 'react-router-dom'
import React from 'react'
import { EmptyDefault, LoadingBlock } from '@loopring-web/component-lib'
import gfm from 'remark-gfm'
import ReactMarkdown from 'react-markdown'
import { useTheme } from '@emotion/react'

import { languageMap, MarkdownStyle } from '@loopring-web/common-resources'
import { useTranslation } from 'react-i18next'

const url_path = 'https://static.loopring.io/documents/notification'
export const NotifyMarkdownPage = () => {
  let match: any = useRouteMatch('/notification/:path')
  const { i18n, t } = useTranslation()
  const [input, setInput] = React.useState<string>('')

  const [path, setPath] = React.useState<null | string>(match?.params.path)
  React.useEffect(() => {
    if (path) {
      try {
        const _path =
          path.split('/').length > 1 ? path : `${path.replace('{lng}', languageMap[i18n.language])}`

        fetch(url_path + '/' + _path)
          .then((response) => response.text())
          .then((input) => {
            setInput(input)
          })
          .catch(() => {
            setPath(null)
          })
      } catch (e: any) {
        setPath(null)
      }
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
              <ReactMarkdown
                remarkPlugins={[gfm]}
                children={input}
                // escapeHtml={false}
              />
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
