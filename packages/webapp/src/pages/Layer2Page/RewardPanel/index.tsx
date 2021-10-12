import styled from '@emotion/styled';
import { Box, Grid, Typography } from '@mui/material';
import React from 'react';
import {
    TransactionTable,

} from '@loopring-web/component-lib';
import {  WithTranslation, withTranslation } from 'react-i18next';

import { useUserRewards } from 'stores/userRewards';
import { getValuePrecisionThousand } from '@loopring-web/common-resources';
import { useGetTxs } from '../HistoryPanel/hooks';

const StylePaper = styled(Grid)`
  //width: 100%;
  //height: 100%;
  background: var(--color-box);
  border-radius: ${({theme}) => theme.unit}px;
`
const StyleBox = styled(Box)`
  //width: 100%;
  //height: 100%;
  background: var(--color-box);
  border-radius: ${({theme}) => theme.unit}px;
`


export const RewardPanel = withTranslation(['common', 'layout'])(({t}: & WithTranslation) => {
    const {userRewardsMap} = useUserRewards()
    const {txs: txTableData, txsTotal, showLoading: showTxsLoading, getUserTxnList} = useGetTxs()
    return <StylePaper spacing={2} flex={1} alignItems={'center'}
                       justifyContent={'center'} textAlign={'center'} className={'MuiPaper-elevation2'}
                       marginBottom={2}>
        <Typography component={'h6'} variant={'h1'} padding={3}>
            Coming soon
        </Typography>
        {/*<StylePaper item xs={12}> Developing </StylePaper>*/}
    </StylePaper>
    //  <Grid container spacing={2} flex={1} >
    //     <Grid item xs={12} >
    //         <StylePaper paddingY={3} className={'MuiPaper-elevation2'}>
    //             <Typography paddingX={3} color={'text.secondary'}  variant={'h5'} marginBottom={3}>{t('labelMyRewards')}</Typography>
    //             <Typography paddingX={3} component={'p'} display={'inline-flex'} >
    //                 Coming soon
    //                 {/*<Typography  component={'span'}*/}
    //                 {/*             variant={'h1'}>{assetInfo.totalAsset ? getValuePrecisionThousand(assetInfo.totalAsset, 2, 2, 2, true, { floor: true }) : '0.00'}</Typography>*/}
    //                 {/*<Typography  component={'span'} color={'text.secondary'}*/}
    //                 {/*             variant={'body1'}>*/}
    //                 {/*    {t('labelUnVested')}*/}
    //                 {/*</Typography>*/}
    //             </Typography>
    //        </StylePaper>
    //     </Grid>
    //     <Grid item xs={12} >
    //             <Grid container  spacing={2} >
    //                 <Grid item xs={6} lg={3}  >
    //                     <StyleBox minHeight={80} display={'flex'} alignItems={'center'} padding={3} className={'MuiPaper-elevation2'}>
    //                         Coming soon
    //                     </StyleBox>
    //                 </Grid>
    //                 <Grid item xs={6} lg={3} >
    //                     <StyleBox  minHeight={80} display={'flex'} alignItems={'center'} padding={3} className={'MuiPaper-elevation2'}>
    //                         Coming soon
    //                     </StyleBox>
    //                 </Grid>
    //                 <Grid item xs={6} lg={3}>
    //                     <StyleBox  minHeight={80} display={'flex'} alignItems={'center'} padding={3} className={'MuiPaper-elevation2'}>
    //                         Coming soon
    //                     </StyleBox>
    //                 </Grid>
    //                 <Grid item xs={6} lg={3} >
    //                     <StyleBox  minHeight={80} display={'flex'} alignItems={'center'} padding={3} className={'MuiPaper-elevation2'}>
    //                         Coming soon
    //                     </StyleBox>
    //                 </Grid>
    //             </Grid>
    //     </Grid>
    //     <Grid item xs={12} flex={1} >
    //         <StyleBox flex={1} padding={3}  className={'MuiPaper-elevation2'}>
    //             <Typography paddingX={3} color={'text.secondary'}  variant={'h5'} marginBottom={3}>{t('labelTransactions')}</Typography>
    //
    //             <TransactionTable    {
    //                                      ...{
    //                                          etherscanBaseUrl:'',
    //                                          rawData: [],
    //                                          pagination: {
    //                                              // pageSize: number;
    //                                              // total: number;
    //                                              total:0,
    //                                              pageSize:0
    //                                          },
    //                                          getTxnList: getUserTxnList,
    //                                          // showFilter?: boolean;
    //                                          showloading: true
    //                                      }
    //                                  }
    //             />
    //         </StyleBox>
    //     </Grid>
    // </Grid>
})
