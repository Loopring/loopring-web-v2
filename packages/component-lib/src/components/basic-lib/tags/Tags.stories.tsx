import { Meta, Story } from '@storybook/react'

import { Box, Grid } from '@mui/material'
import { WithTranslation, withTranslation } from 'react-i18next'
import styled from '@emotion/styled'
import { NewTagIcon } from './index'
import { ButtonProps } from '../btns'

const Styled = styled.div`
  background: var(--color-global-bg);
`

export const Tags: Story<ButtonProps> = withTranslation()(({}: WithTranslation & any) => {
  return (
    <>
      <Styled>
        {/*<MemoryRouter initialEntries={['/']}>*/}
        <h4>Tags</h4>
        <Box>
          <Grid
            container
            spacing={2}
            alignContent={'center'}
            justifyContent={'flex-start'}
            flexWrap={'nowrap'}
          >
            <Grid item xs={6} margin={2}>
              <NewTagIcon />
            </Grid>
          </Grid>
        </Box>
      </Styled>
      {/*</MemoryRouter>*/}
    </>
  )
}) as Story<ButtonProps>

//export const Button = Template.bind({});

export default {
  title: 'resource/tags',
  component: Tags,
  argTypes: {},
} as Meta
// LButton.args = {}
