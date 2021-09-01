import {
    Column,
    generateColumns,
    generateRows,
    SortableHeaderCell,
    SortableHeaderCellProps,
    Table
} from '../basic-lib';
import { Trans, WithTranslation, withTranslation } from 'react-i18next';
import styled from '@emotion/styled';
import { Box, Button, Divider, Grid, Typography } from '@material-ui/core';
import { TypographyStrong, VipStyled } from '../styled';

interface Row {
    level: string;
    orderBook: string;
    AMM: string;
    deposit: string;
    withdraw: string;
    setPublicKey: string;
}
const StyledPaper = styled(Grid)`
  width: 100%;
  height: 100%;
  //flex: 1;
  background-color: var(-color-pop-bg);
  ${({theme}) => theme.border.defaultFrame({c_key: 'blur', d_R: 1})};
`
const rawData: Array<Array<any>> = [
    ['VIP 0', '< 10,000 LRC', '1,000.00', '1,000.00', '1,000.00', '--'],
    ['VIP 1', '< 10,000 LRC', '1,000.00', '1,000.00', '1,000.00', '--'],
    ['VIP 2', '< 10,000 LRC', '1,000.00', '1,000.00', '1,000.00', '--'],
    ['VIP 3', '< 10,000 LRC', '1,000.00', '1,000.00', '1,000.00', '--'],
    ['VIP 4', '< 10,000 LRC', '1,000.00', '1,000.00', '1,000.00', '--'],
];
const DividerBlock = styled(Divider)`
  margin: 0;
  flex: 1;
  width: 1px;
  height: ${({theme}) => theme.unit * 3}px;
  background: var(--color-divide)
`



export const VipPanel = withTranslation(['common', 'layout'])(({t, ...rest}: & WithTranslation) => {
    const columnModeDefault: readonly Column<Row, unknown>[] = [
        {
            key: 'level', name: 'labelLevel',
            headerRenderer: (props: SortableHeaderCellProps<Row>) => <SortableHeaderCell {...props}
                                                                                         children={<Typography
                                                                                             variant={'body1'}
                                                                                             paddingLeft={2}
                                                                                             component={'span'}>{t('labelLevel')}</Typography>}/>,
            formatter: ({row}) => <Typography variant={'body1'} paddingLeft={2}
                                              component={'span'}>{row.level}</Typography>
        },
        {key: 'orderBook', name: 'labelOrderbook'},
        {key: 'AMM', name: 'AMM'},
        {key: 'deposit', name: 'labelDeposit'},
        {key: 'withdraw', name: 'labelWithdraw'},
        {key: 'setPublicKey', name: 'labelSetPublicKey'}
    ];


    const vipTableArgs = {
        rawData: rawData,
        columnMode: columnModeDefault,
        generateRows: generateRows,
        generateColumns: generateColumns,
    };
    return <StyledPaper item xs={12} display={'flex'} flexDirection={'column'} marginBottom={2} paddingY={2}>
        <Box component={'section'} display={'flex'} flexDirection={'column'}>
            <Typography variant={'h6'} component={'h4'} paddingX={2}>{t('labelTitleResetL2Keypair')}</Typography>
            {/*<StyledDivider/>*/}
            <Grid container display={'flex'} flexDirection={'row'} justifyContent={'stretch'}
                  alignItems={'flex-start'} paddingX={2} marginBottom={2}>
                <Grid item xs={8} display={'flex'} flexDirection={'column'}>
                    <Typography variant={'body1'} component={'p'}>
                        <Trans i18nKey="resetDescription">
                            Create a new signing key for layer-2 authentication (no backup needed). This will
                            <TypographyStrong component={'span'}>cancel all your pending orders</TypographyStrong>.
                        </Trans>
                    </Typography>
                </Grid>
                <Grid item xs={4} display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}
                      alignItems={'flex-end'} alignSelf={'stretch'}>
                    <Button variant={'outlined'} size={'medium'} color={'primary'}>{t('labelBtnReset')}</Button>
                    <Typography variant={'body1'} component={'p'}
                                paddingTop={1}>{t('labelHadChangPassword', {passDay: '14 hours'})}</Typography>
                </Grid>
            </Grid>
        </Box>


        <Box component={'section'} display={'flex'} flexDirection={'column'}>
            <Typography variant={'h6'} component={'h4'} paddingX={2}>{t('labelTitleExportAccount')}</Typography>
            {/*<StyledDivider/>*/}
            <Grid container display={'flex'} flexDirection={'row'} justifyContent={'stretch'}
                  alignItems={'flex-start'} paddingX={2} marginBottom={2}>
                <Grid item xs={7} display={'flex'} flexDirection={'column'}>
                    <Typography variant={'body1'} component={'p'}>{t('descriptionExportAccount')}</Typography>
                </Grid>
                <Grid item xs={5} display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}
                      alignItems={'flex-end'} alignSelf={'stretch'}>
                    <Grid item> <Button variant={'outlined'} size={'medium'}
                                        color={'primary'}>{t('labelBtnExportAccount')}</Button></Grid>
                </Grid>
            </Grid>
        </Box>
        <Table<Row, unknown> {...{...vipTableArgs, t, ...rest}}  />
        {/*<Typography variant={'body1'} component={'h3'} color={'textColorSecondary'}>*/}
        {/*    {t('typographyVipDescription1')}*/}
        {/*    {t('typographyVipDescription2')}*/}
        {/*</Typography>*/}
        <Typography variant={'h5'} component={'h3'} marginY={1} display={'flex'} flexDirection={'row'}
                    alignItems={'center'} justifyContent={'space-between'}>
            <Typography component={'p'} flexDirection={'row'} display={'flex'} alignSelf={'flex-end'}>
                <Typography variant={'h5'} component={'span'} paddingRight={1}>
                    {t('labelTradeFeeLevel')}
                </Typography>
                {/*<VipStyled component={'span'} variant={'body2'} > {'VIP 1'} </VipStyled>*/}
                <Typography variant={'body1'} component={'span'} display={'flex'} flexDirection={'row'}
                            alignItems={'center'} paddingRight={1}>
                    <VipStyled component={'span'} variant={'body2'}> {'VIP 1'} </VipStyled>
                    {/*<Typography  padding={1} component={'div'} width={200}>*/}
                    {/*    <BorderLinearProgress variant="determinate" value={50}/>*/}
                    {/*</Typography>*/}
                    {/*<VipStyled component={'span'} variant={'body2'} > {'VIP 2'} </VipStyled>*/}
                </Typography>
            </Typography>

            <Typography variant={'body1'} component={'section'} display={'flex'} flexDirection={'row'}
                        justifyContent={'flex-end'} alignItems={'center'}>
                <Typography component={'div'} display={'flex'} flexDirection={'column'} width={120}
                            alignItems={'center'}>
                    <Typography component={'span'} variant={'body1'}
                                color={'textColorSecondary'}> {t('labelMaker')}  </Typography>
                    <Typography component={'span'} variant={'h4'}>0.075% </Typography>
                </Typography>
                <DividerBlock/>
                <Typography component={'div'} display={'flex'} flexDirection={'column'} width={120}
                            alignItems={'center'}>
                    <Typography component={'span'} variant={'body1'}> {t('labelTaker')}  </Typography>
                    <Typography component={'span'} variant={'h4'}> 0.075%</Typography>
                </Typography>

            </Typography>
        </Typography>

    </StyledPaper>

})