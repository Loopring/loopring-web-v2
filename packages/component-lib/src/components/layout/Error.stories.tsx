import { Meta, Story } from '@storybook/react/types-6-0'
import { MemoryRouter } from 'react-router-dom'
import { Box, Container, GlobalStyles } from '@mui/material'

import { css, Theme, useTheme } from '@emotion/react'
import { globalCss } from '@loopring-web/common-resources'
import { useTranslation } from 'react-i18next'
import styled from '@emotion/styled'

const StyleBox = styled(Box)`
  background-image: url('https://static.loopring.io/assets/images/error_bg.png');
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position: bottom;
` as typeof Box

const ErrorWrap = () => {
  const { messageKey }: { id?: string; messageKey: string } = {
    messageKey: 'errorMessageTokenMapIsEmpty',
  }
  const { t } = useTranslation('common')
  return (
    <>
      <Container maxWidth='lg'>
        {/*style={{height: '100%' }}*/}
        <Box
          flex={1}
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}
          flexDirection='row'
          marginTop={4}
        >
          <StyleBox height={680} width={120}>
            {t(messageKey)}
          </StyleBox>
        </Box>
      </Container>

      {/*<Footer></Footer>*/}
    </>
  )
}

const Template: Story<any> = () => {
  const theme: Theme = useTheme()
  return (
    <>
      <GlobalStyles
        styles={css`
          ${globalCss({ theme })};

          body:before {
            ${
              theme.mode === 'dark'
                ? ` 
                         background: var(--color-global-bg);
                   `
                : ''
            }
          }
        }
        `}
      ></GlobalStyles>
      <MemoryRouter initialEntries={['/']}>
        <ErrorWrap />
      </MemoryRouter>
    </>
  )
}

export default {
  title: 'components/Layout/Error',
  component: ErrorWrap,
  argTypes: {},
} as Meta

export const ErrorStory = Template.bind({})
// SwitchPanel.args = {}
