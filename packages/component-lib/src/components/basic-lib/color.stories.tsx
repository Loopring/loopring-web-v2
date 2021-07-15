import { Meta, Story } from '@storybook/react/types-6-0'
import { WithTranslation, withTranslation } from "react-i18next";
import { Box, Grid, Typography } from '@material-ui/core/';
import { ColorDarkDefault } from 'static-resource';
import styled from '@emotion/styled';
import React from 'react';

const Styled = styled.div`
  background: ${({theme}) => theme.colorBase.background().bg};
  color: #fff;

  svg {
    height: 24px;
    width: 24px;
  }
`


export const ColorList: Story<any> = withTranslation()(({}: WithTranslation & any) => {
    const view = Object.keys(ColorDarkDefault).map((key,indx) => {
        if(key!== 'background' && key !== 'border'){
            return <Grid item  width={120} key={indx} padding={2} display={'flex'} flexDirection={'column'} alignItems={'center'}>
                <Box width={60} height={60} style={{background:ColorDarkDefault[key], border:'1px solid #fff'}}></Box>
                <Typography padding={1} variant={'body2'} color={'rgb(104 107 208)'}>{key}</Typography>
            </Grid>
        }else{
            return <React.Fragment key={indx}></React.Fragment>
        }

    })

    return <>
        <Styled>
            {/*<MemoryRouter initialEntries={['/']}>*/}
            <Styled>
                {/*<MemoryRouter initialEntries={['/']}>*/}
                <Grid container style={{background:'#fff'}} >
                    {view}
                </Grid>
                <Grid container style={{background:'#000'}} >
                    {view}
                </Grid>

            </Styled>

        </Styled>
        {/*</MemoryRouter>*/}
    </>
}) as Story<any>;

//export const Button = Template.bind({});

export default {
    title: 'Resource/ColorsList',
    component: ColorList,
    argTypes: {},
} as Meta
// LButton.args = {}
