import styled from '@emotion/styled';
import { Box, Grid, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { Trans, WithTranslation, withTranslation } from 'react-i18next';

const StylePaper = styled(Grid)`
  width: 100%;
  //height: 100%;
  background: var(--color-box);
  border-radius: ${({theme}) => theme.unit}px;
`


export const RedPockPanel = withTranslation(['common', 'layout'])(({t}: & WithTranslation) => {

    return <StylePaper spacing={2} flex={1} alignItems={'center'}
                       justifyContent={'center'} textAlign={'center'} className={'MuiPaper-elevation2'}
                       marginBottom={2}>
        <Typography component={'h6'} variant={'h1'} padding={3}>
            Coming soon
        </Typography>
        {/*<StylePaper item xs={12}> Developing </StylePaper>*/}
    </StylePaper>
})
