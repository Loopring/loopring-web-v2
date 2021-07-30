import { Trans, WithTranslation, withTranslation } from 'react-i18next';
import { Box, Button, Divider, Grid, Typography } from '@material-ui/core/';
import styled from '@emotion/styled';
import {
    BtnLanguage,
    Column,
    generateColumns,
    generateRows,
    OutlineSelect,
    OutlineSelectItem,
    SortableHeaderCell,
    SortableHeaderCellProps,
    Table,
    useSettings,
    VipStyled,
    TypographyStrong
} from '../../';
import Switch from '@material-ui/core/Switch';
import React from 'react';
import { ButtonComponentsMap, Currency, DropDownIcon, headerToolBarData, LanguageKeys, UpColor } from '@loopring-web/common-resources';
import { useTheme } from '@emotion/react';

const StyledPaper = styled(Grid)`
  width: 100%;
  height: 100%;
  //flex: 1;
  background-color: ${({theme}) => theme.colorBase.background().secondary};
  ${({theme}) => theme.border.defaultFrame({c_key: 'blur', d_R: 1})};
`

const StyledSwitch = styled(Switch)(({theme}) => ({
    "& .Mui-checked": {
        color: theme.colorBase.textPrimary,
        '& + .MuiSwitch-track.MuiSwitch-track': {
            border: `solid ${theme.colorBase.success}`,
        },
        '& .MuiSwitch-thumb': {
            backgroundColor: theme.colorBase.success,
        }
    },
    '& .MuiSwitch-track': {
        border: `solid ${theme.colorBase.error}`,
        opacity: 1
    },
    '& .MuiSwitch-thumb': {
        backgroundColor: theme.colorBase.error,
    }
}));

export const BtnCurrency = ({t, currency, label, handleChange}: any) => {
    const [state, setState] = React.useState<string>(currency ? currency : Currency.dollar);
    const _handleChange = React.useCallback((event: React.ChangeEvent<any>) => {
        setState(event.target.value);
        if (handleChange) {

            handleChange(event.target.value)
        }
    }, [handleChange])
    return <OutlineSelect aria-label={t(label)} IconComponent={DropDownIcon}
                          labelId="language-selected"
                          id="language-selected"
                          value={state} autoWidth
                          onChange={_handleChange}>
        <OutlineSelectItem value={Currency.dollar}>$ {t('labelUSDollar')}</OutlineSelectItem>
        <OutlineSelectItem value={Currency.yen}>¥ {t('labelCNYYuan')}</OutlineSelectItem>
    </OutlineSelect>
}

const StyledDivider = styled(Divider)`
  margin: ${({theme}) => theme.unit}px 0 ${({theme}) => theme.unit}px 0px;
`
const DividerBlock = styled(Divider)`
  margin: 0;
  flex: 1;
  width: 1px;
  height: ${({theme}) => theme.unit * 3}px;
  background: ${({theme}) => theme.colorBase.focus};
`


interface Row {
    level: string;
    orderBook: string;
    AMM: string;
    deposit: string;
    withdraw: string;
    setPublicKey: string;
}

const rawData: Array<Array<any>> = [
    ['VIP 0', '< 10,000 LRC', '1,000.00', '1,000.00', '1,000.00', '--'],
    ['VIP 1', '< 10,000 LRC', '1,000.00', '1,000.00', '1,000.00', '--'],
    ['VIP 2', '< 10,000 LRC', '1,000.00', '1,000.00', '1,000.00', '--'],
    ['VIP 3', '< 10,000 LRC', '1,000.00', '1,000.00', '1,000.00', '--'],
    ['VIP 4', '< 10,000 LRC', '1,000.00', '1,000.00', '1,000.00', '--'],
];


export const SettingPanel = withTranslation(['common', 'layout'])(({t, ...rest}: & WithTranslation) => {
    const theme = useTheme();
    const {setUpColor, setCurrency, setLanguage, currency, upColor} = useSettings()

    // const handleOnLanguageChange = (value: any) => {
    //
    //     setLanguage(value)
    // }
    const handleOnCurrencyChange = (value: any) => {
        setCurrency(value);
    }
    const handleColorChange = (e: any) => {
        if (e.target.checked) {
            setUpColor(UpColor.green);
        } else {
            setUpColor(UpColor.red);
        }
    }
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
    return <Grid container direction={'column'} justifyContent={'space-between'} alignItems={'stretch'}>
        <Typography variant={'h4'} component={'h3'} marginY={1}>{t('labelTitleSecurity')}</Typography>
        <StyledPaper item xs={12} display={'flex'} flexDirection={'column'} marginBottom={2} paddingY={2}>
            <Box component={'section'} display={'flex'} flexDirection={'column'}>
                <Typography variant={'h5'} component={'h4'} paddingX={2}>{t('labelTitleResetL2Keypair')}</Typography>
                <StyledDivider/>
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
            {/*<Box component={'section'} display={'flex'} flexDirection={'column'}>*/}
            {/*    <Typography variant={'h5'} component={'h4'} paddingX={2}>{t('labelTitleForceWithdraw')}</Typography>*/}
            {/*    <StyledDivider/>*/}
            {/*    <Grid container display={'flex'} flexDirection={'row'} justifyContent={'stretch'}*/}
            {/*          alignItems={'flex-start'} paddingX={2} marginBottom={2}>*/}
            {/*        <Grid item xs={7} display={'flex'} flexDirection={'column'}>*/}
            {/*            <Typography variant={'body1'} component={'p'}>{t('descriptionForceWithdraw')}</Typography>*/}
            {/*        </Grid>*/}
            {/*        <Grid item xs={5} display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}*/}
            {/*              alignItems={'flex-end'} alignSelf={'stretch'}>*/}
            {/*            <Grid item> <Button variant={'outlined'} size={'medium'}*/}
            {/*                                color={'primary'}>{t('labelBtnForceWithdraw')}</Button></Grid>*/}
            {/*        </Grid>*/}
            {/*    </Grid>*/}
            {/*</Box>*/}

            <Box component={'section'} display={'flex'} flexDirection={'column'}>
                <Typography variant={'h5'} component={'h4'} paddingX={2}>{t('labelTitleExportAccount')}</Typography>
                <StyledDivider/>
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
        </StyledPaper>

        <Typography variant={'h4'} component={'h3'} marginY={1}>{t('labelTitlePreferences')}</Typography>
        <StyledPaper item xs={12} display={'flex'} flexDirection={'column'} marginBottom={2} paddingY={2}>
            <Box component={'section'} display={'flex'} flexDirection={'column'}>
                <Typography variant={'h5'} component={'h4'} paddingX={2}>{t('labelTitleLayout')}</Typography>
                <StyledDivider/>
                <Grid container display={'flex'} flexDirection={'row'} justifyContent={'stretch'}
                      alignItems={'flex-start'} paddingX={2} marginBottom={2}>
                    <Grid item xs={7} display={'flex'} flexDirection={'column'}>
                        <Typography variant={'body1'} component={'p'}>{t('labelLanguage')}</Typography>
                    </Grid>
                    <Grid item xs={5} display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}
                          alignItems={'flex-end'} alignSelf={'stretch'}>
                        <Grid item>
                            <BtnLanguage {...{
                                t,
                                ...rest,
                                ...headerToolBarData[ ButtonComponentsMap.Language ],
                                handleChange: (language: LanguageKeys) => {
                                    setLanguage(language)
                                }
                            }}></BtnLanguage>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid container display={'flex'} flexDirection={'row'} justifyContent={'stretch'}
                      alignItems={'flex-start'} paddingX={2} marginBottom={2}>
                    <Grid item xs={7} display={'flex'} flexDirection={'column'}>
                        <Typography variant={'body1'} component={'p'}>{t('labelCurrency')}</Typography>
                    </Grid>
                    <Grid item xs={5} display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}
                          alignItems={'flex-end'} alignSelf={'stretch'}>
                        <Grid item>
                            <BtnCurrency {...{
                                t, ...rest,
                                currency,
                                label: 'currencySetting',
                                handleChange: handleOnCurrencyChange
                            }}></BtnCurrency>

                        </Grid>
                    </Grid>
                </Grid>
                <Grid container display={'flex'} flexDirection={'row'} justifyContent={'stretch'}
                      alignItems={'flex-start'} paddingX={2}>
                    <Grid item xs={7} display={'flex'} flexDirection={'column'}>
                        <Typography variant={'body1'} component={'p'}>{t('labelColors')}</Typography>
                    </Grid>
                    <Grid item xs={5} display={'flex'} flexDirection={'row'} justifyContent={'flex-end'}
                          alignItems={'center'} alignSelf={'stretch'}>
                        <Typography variant={'body1'} component={'span'} paddingX={2}>
                            <Trans i18nKey="whichColorIsUp">
                                <span style={{
                                    textTransform: 'capitalize',
                                    color: upColor === UpColor.green ? theme.colorBase.success : theme.colorBase.error
                                }}>{{up: upColor === UpColor.green ? t('labelgreen') : t('labelred')}} up</span>
                                and <span style={{
                                textTransform: 'capitalize',
                                color: upColor === UpColor.green ? theme.colorBase.error : theme.colorBase.success
                            }}>{{down: upColor === UpColor.green ? t('labelred') : t('labelgreen')}} down</span>
                            </Trans>
                        </Typography>
                        <StyledSwitch checked={upColor === UpColor.green} color="default"
                                      onChange={handleColorChange}/>

                    </Grid>
                </Grid>
            </Box>
            {/*<Box component={'section'} display={'flex'} flexDirection={'column'}>*/}
            {/*    <Typography variant={'h5'} component={'h4'} paddingX={2}>{t('labelTitleNotification')}</Typography>*/}
            {/*    <StyledDivider/>*/}
            {/*    <Grid container display={'flex'} flexDirection={'row'} justifyContent={'stretch'}*/}
            {/*          alignItems={'flex-start'} paddingX={2} marginBottom={2}>*/}
            {/*        <Grid item xs={8} display={'flex'} flexDirection={'column'}>*/}
            {/*            <Typography variant={'body1'} component={'p'}>{t('labelLanguage')}</Typography>*/}
            {/*        </Grid>*/}
            {/*        <Grid item xs={4} display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}*/}
            {/*              alignItems={'flex-end'} alignSelf={'stretch'}>*/}
            {/*            <Grid item> <Button variant={'outlined'} size={'medium'}*/}
            {/*                                color={'primary'}>{t('labelBtnExportAccount')}</Button></Grid>*/}
            {/*        </Grid>*/}
            {/*    </Grid>*/}
            {/*</Box>*/}
        </StyledPaper>

        <Typography variant={'h4'} component={'h3'} marginY={1} display={'flex'} flexDirection={'row'}
                    alignItems={'center'} justifyContent={'space-between'}>
            <Typography component={'p'} flexDirection={'row'} display={'flex'} alignSelf={'flex-end'}>
                <Typography variant={'h4'} component={'span'} paddingRight={1}>
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
                    <Typography component={'span'} variant={'h3'}>0.075% </Typography>
                </Typography>
                <DividerBlock/>
                <Typography component={'div'} display={'flex'} flexDirection={'column'} width={120}
                            alignItems={'center'}>
                    <Typography component={'span'} variant={'body1'}> {t('labelTaker')}  </Typography>
                    <Typography component={'span'} variant={'h3'}> 0.075%</Typography>
                </Typography>

            </Typography>
        </Typography>
        <StyledPaper item xs={12} display={'flex'} flexDirection={'column'} marginBottom={2} paddingY={2}>
            <Table<Row, unknown> {...{...vipTableArgs, t, ...rest}}  />
            {/*<Typography variant={'body1'} component={'h3'} color={'textColorSecondary'}>*/}
            {/*    {t('typographyVipDescription1')}*/}
            {/*    {t('typographyVipDescription2')}*/}
            {/*</Typography>*/}
        </StyledPaper>


    </Grid>
})



