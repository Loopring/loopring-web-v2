import styled from '@emotion/styled';
import { Box, Grid, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { VipPanel as VipView } from '@loopring-web/component-lib';
import { Trans, WithTranslation, withTranslation } from 'react-i18next';
import { useAccount } from '../../../stores/account';
import { LoopringAPI } from '../../../api_wrapper';
import { VipFeeRateInfoMap } from 'loopring-sdk/dist/defs/loopring_defs';

const StylePaper = styled(Grid)`
  width: 100%;
  //height: 100%;
  background: var(--color-box);
  border-radius: ${({theme}) => theme.unit}px;
`


export const RedPockPanel = withTranslation(['common', 'layout'])(({t}: & WithTranslation) => {

    return <StylePaper spacing={2} flex={1} alignItems={'center'} justifyContent={'center'} textAlign={'center'} >
       <Typography component={'h6'} variant={'h1'} padding={4}>
           Coming soon
       </Typography>
        {/*<StylePaper item xs={12}> Developing </StylePaper>*/}
    </StylePaper>
})
