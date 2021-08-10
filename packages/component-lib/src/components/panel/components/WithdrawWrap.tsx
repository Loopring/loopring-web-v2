import { Trans, WithTranslation } from 'react-i18next';
import React, { ChangeEvent } from 'react';
import { FormControlLabel, Grid, ListItemText, Radio, RadioGroup, Typography } from '@material-ui/core';
import { CloseIcon, DropDownIcon, globalSetup, IBData, WithdrawTypes } from '@loopring-web/common-resources';
import { TradeBtnStatus } from '../Interface';
import { Button, IconClearStyled, MenuItem, TextField,TypographyGood, TypographyStrong } from '../../../index';
import { WithdrawViewProps } from './Interface';
import { BasicACoinTrade } from './BasicACoinTrade';
import { debounce } from 'lodash';

export const WithdrawWrap = <T extends IBData<I>,
    I>({
           t, disabled, walletMap, tradeData, coinMap,
           addressDefault,
           withdrawTypes = WithdrawTypes,
           withdrawType,
           chargeFeeToken = 'ETH',
           chargeFeeTokenList,
           onWithdrawClick,
           withdrawBtnStatus,
           handleFeeChange,
           handleWithdrawTypeChange,
           handleOnAddressChange, handleAddressError,
           wait = globalSetup.wait,
           ...rest
       }: WithdrawViewProps<T, I> & WithTranslation) => {
    const [_withdrawType, setWithdrawType] = React.useState<string | undefined>(withdrawType);
    const [feeIndex, setFeeIndex] = React.useState<any | undefined>(0);
    const [address, setAddress] = React.useState<string | undefined>(addressDefault ? addressDefault : '');
    const [addressError, setAddressError] = React.useState<{ error: boolean, message?: string | React.ElementType<HTMLElement> } | undefined>();

    const inputBtnRef = React.useRef();
    const getDisabled = () => {
        if (disabled || tradeData === undefined || walletMap === undefined || coinMap === undefined) {
            return true
        } else {
            return false
        }
    };
    const inputButtonDefaultProps = {
        label: t('withdrawLabelEnterToken'),
    }


    const _handleWithdrawTypeChange = React.useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setWithdrawType(e.target?.value);
        if (handleWithdrawTypeChange) {
            handleWithdrawTypeChange(e.target?.value as any);
        }
    }, [handleWithdrawTypeChange])

    const _handleFeeChange = React.useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const index = e.target ? Number(e.target.value) : 0;
        setFeeIndex(index)
        if (handleFeeChange) {
            handleFeeChange(chargeFeeTokenList[ index ]);
        }
    }, [chargeFeeTokenList, handleFeeChange])

    const debounceAddress = React.useCallback(debounce(({address}: any) => {
        if (handleOnAddressChange) {
            handleOnAddressChange(address)
        }
    }, wait), [handleOnAddressChange, debounce])
    const _handleOnAddressChange = React.useCallback((event) => {
        const address = event.target.value;
        if (handleAddressError) {
            const error = handleAddressError(address)
            if (error?.error) {
                setAddressError(error)
            }
        }
        setAddress(address);
        debounceAddress({address})

    }, [debounce, wait, handleAddressError])

    const handleClear = React.useCallback(() => {
        // @ts-ignore
        // addressInput?.current?.value = "";
        setAddress('')
    }, [])

    return <Grid className={walletMap ? '' : 'loading'} paddingLeft={5 / 2} paddingRight={5 / 2} container
                 direction={"column"} minHeight={540}
                 justifyContent={'space-between'} alignItems={"center"} flex={1} height={'100%'}
                  flexWrap={'nowrap'}>
        <Grid item>
            <Typography component={'h4'} height={36} textAlign={'center'} variant={'h4'}>
                {t('withdrawTitle')}
            </Typography>
            <Typography component={'p'} variant="body1">
                <Trans i18nKey="withdrawDescription">
                    Your withdrawal will be processed in the next batch, which usually takes <TypographyGood
                    component={'span'}>30 minutes to 2 hours</TypographyGood>. (There will be <TypographyStrong
                    component={'span'}> a large delay</TypographyStrong> if the Ethereum gas price <TypographyStrong
                    component={'span'}>exceeds 500 GWei</TypographyStrong>.）
                </Trans>
            </Typography>

        </Grid>
        <Grid item marginTop={2} alignSelf={"stretch"}>
            <BasicACoinTrade {...{
                ...rest,
                t,
                disabled,
                walletMap,
                tradeData,
                coinMap,
                inputButtonDefaultProps,
                inputBtnRef: inputBtnRef,
            }} />
        </Grid>
        <Grid item marginTop={2} alignSelf={"stretch"} position={'relative'}>
            <TextField
                value={address}
                error={addressError && addressError.error ? true : false}
                label={t('withdrawLabelAddress')}
                placeholder={t('LabelPleaseInputWalletAddress')}
                onChange={_handleOnAddressChange}
                disabled={chargeFeeTokenList.length ? false : true}
                required={true}
                SelectProps={{IconComponent: DropDownIcon}}
                helperText={<Typography component={'span'}
                                        variant={'body2'}>{addressError && addressError.error ? addressError.message : ''}</Typography>}
                fullWidth={true}
            />
            {address !== '' ? <IconClearStyled size={'small'}   style={{top:'30px'}} aria-label="Clear" onClick={handleClear}>
                <CloseIcon/>
            </IconClearStyled> : ''}
        </Grid>
        <Grid item marginTop={2} alignSelf={'stretch'}>
            <RadioGroup row aria-label="withdraw" name="withdraw" value={_withdrawType}
                        onChange={(e) => {
                            _handleWithdrawTypeChange(e);
                        }
                        }>
                {Object.keys(withdrawTypes).map((key) => {
                    return <FormControlLabel key={key} value={key} control={<Radio/>}
                                             label={`${t('withdrawTypeLabel' + key)}: ${withdrawTypes[ key ]}Gas`}/>
                })}
            </RadioGroup>
        </Grid>
        {/* TODO: check whether there's a need to show deposit fee */}
        <Grid item marginTop={2} alignSelf={"stretch"}>
            <TextField
                id="withdrawFeeType"
                select
                label={t('withdrawLabelFee')}
                value={feeIndex}
                onChange={(event: React.ChangeEvent<any>) => {
                    _handleFeeChange(event)
                }}
                disabled={chargeFeeTokenList.length ? false : true}
                SelectProps={{IconComponent: DropDownIcon}}
                fullWidth={true}
            >{chargeFeeTokenList.map(({belong, fee}, index) => {
                // @ts-ignore
                return <MenuItem key={index} value={index} withNoCheckIcon={'true'}>
                    <ListItemText primary={<Typography
                        sx={{display: 'inline'}}
                        component="span"
                        variant="body1"
                        color="text.primary"
                    >{belong}</Typography>} secondary={<Typography
                        sx={{display: 'inline'}}
                        component="span"
                        variant="body1"
                        color="text.primaryLight"
                    >{fee}</Typography>}/>
                </MenuItem>
            })
            }</TextField>
        </Grid>
        <Grid item marginTop={2} alignSelf={'stretch'}>
            <Button fullWidth variant={'contained'} size={'medium'} color={'primary'} onClick={() => {
                onWithdrawClick(tradeData)
            }}
                    loading={!getDisabled() && withdrawBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
                    disabled={getDisabled() || withdrawBtnStatus === TradeBtnStatus.DISABLED || withdrawBtnStatus === TradeBtnStatus.LOADING ? true : false}
            >{t(`withdrawLabelBtn`)}
            </Button>
            {/* TODO: link to last deposit history */}
            {/*<Box marginTop={2} display={'flex'} justifyContent={'center'}>*/}
            {/*    <Link component={RouterLink} to={'/'}> <Typography variant={'body2'}>*/}
            {/*        {t('withdrawLabelLinkRecent')}*/}

            {/*    </Typography></Link>*/}
            {/*</Box>*/}
        </Grid>
    </Grid>
}
