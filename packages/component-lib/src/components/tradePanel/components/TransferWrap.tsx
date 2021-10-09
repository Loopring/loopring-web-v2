import { Trans, WithTranslation } from 'react-i18next';
import React, { ChangeEvent } from 'react';
import { Grid, ListItemText, Typography } from '@mui/material';
// import { Link as RouterLink } from 'react-router-dom';
import { CloseIcon, DropDownIcon, globalSetup, IBData } from '@loopring-web/common-resources';
import { Button, IconClearStyled, MenuItem, TextField, TradeBtnStatus, TypographyGood } from '../../index';
import { TransferViewProps } from './Interface';
import { BasicACoinTrade } from './BasicACoinTrade';
import * as _ from 'lodash'


export const TransferWrap = <T extends IBData<I>,
    I>({
           t, disabled, walletMap, tradeData, coinMap, transferI18nKey,
           chargeFeeToken = 'ETH',
           chargeFeeTokenList,
           onTransferClick,
           handleFeeChange,
           transferBtnStatus,
           addressDefault,
           handleOnAddressChange,
           handleAddressError,
           wait = globalSetup.wait,
           ...rest
       }: TransferViewProps<T, I> & WithTranslation) => {
    // const [_chargeFeeToken, setChargeFeeToken] = React.useState<any | undefined>(
    //     chargeFeeToken && chargeFeeTokenList.length ? chargeFeeTokenList[ chargeFeeToken as any ] : undefined);

    const inputBtnRef = React.useRef();
    const getDisabled = () => {
        if (disabled || tradeData === undefined || walletMap === undefined || coinMap === undefined) {
            return true
        } else {
            return false
        }
    };
    const inputButtonDefaultProps = {
        label: t('transferLabelEnterToken'),
    }

    const [address, setAddress] = React.useState<string | undefined>(addressDefault ? addressDefault : '');
    const [addressError, setAddressError] = React.useState<{ error: boolean, message?: string | React.ElementType<HTMLElement> } | undefined>();
    const [feeIndex, setFeeIndex] = React.useState<any | undefined>(0);

    const debounceAddress = React.useCallback(_.debounce(({address}: any) => {
        if (handleOnAddressChange) {
            handleOnAddressChange(address)
        }
    }, wait), [])
    const _handleOnAddressChange = (event:ChangeEvent<HTMLInputElement>) => {
        const address = event.target.value;
        if (handleAddressError) {
            const error = handleAddressError(address)
            if (error?.error) {
                setAddressError(error)
            }
        }
        setAddress(address);
        debounceAddress({address})
    }

    const _handleFeeChange = React.useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const index = e.target ? Number(e.target.value) : 0;
        setFeeIndex(index)
        if (handleFeeChange) {
            handleFeeChange(chargeFeeTokenList[ index ]);
        }
    }, [chargeFeeTokenList, handleFeeChange]);

    // const addressInput = React.useRef();
    const handleClear = React.useCallback(() => {
        // @ts-ignore
        // addressInput?.current?.value = "";
        setAddress('')
    }, [])

    return <Grid className={walletMap ? '' : 'loading'} paddingLeft={5 / 2} paddingRight={5 / 2} container
                 direction={"column"}
                 justifyContent={'space-between'}
                 alignItems={"stretch"} flex={1} height={'100%'} flexWrap={'nowrap'}
    >
        <Grid item>
            <Typography component={'h4'} textAlign={'center'} variant={'h3'} marginBottom={2}>
                {t('transferTitle')}
            </Typography>
            <Typography component={'p'} variant="body1">
                <Trans i18nKey="transferDescription">
                    Transfer to any valid Ethereum addresses instantly. Please <TypographyGood component={'span'}>make
                    sure</TypographyGood> the recipient address <TypographyGood component={'span'}>accepts Loopring
                    layer-2 </TypographyGood> payments before you proceed.
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
                label={t('transferLabelAddress')}
                placeholder={t('transferLabelAddressInput')}
                onChange={_handleOnAddressChange}
                disabled={chargeFeeTokenList.length ? false : true}
                SelectProps={{IconComponent: DropDownIcon}}
                // required={true}
                // inputRef={addressInput}
                helperText={<Typography
                    variant={'body2'}
                    component={'span'}>{addressError && addressError.error ? addressError.message : ''}</Typography>}
                fullWidth={true}
            />
            {address !== '' ?
                <IconClearStyled color={'inherit'} size={'small'} style={{top: '28px'}} aria-label="Clear" onClick={handleClear}>
                    <CloseIcon  />
                </IconClearStyled> : ''}
        </Grid>

        <Grid item marginTop={2} alignSelf={"stretch"}>
            <TextField
                id="transferFeeType"
                select
                label={t('transferLabelFee')}
                value={feeIndex}
                onChange={(event: React.ChangeEvent<any>) => {
                    _handleFeeChange(event)
                }}
                disabled={chargeFeeTokenList.length ? false : true}
                SelectProps={{IconComponent: DropDownIcon}}
                fullWidth={true}
            >{chargeFeeTokenList.map(({belong, fee}, index) => {
                // @ts-ignore
                return <MenuItem key={index} value={index} withnocheckicon={'true'}>
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
                onTransferClick(tradeData)
            }}
                    loading={!getDisabled() && transferBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
                    disabled={getDisabled() || transferBtnStatus === TradeBtnStatus.DISABLED || transferBtnStatus === TradeBtnStatus.LOADING ? true : false}
            >{t(transferI18nKey ?? `transferLabelBtn`)}
            </Button>
            {/* TODO: link to last deposit history */}
            {/*<Box marginTop={2} display={'flex'} justifyContent={'center'}>*/}
            {/*    <Link component={RouterLink} to={'/'}> <Typography*/}
            {/*        variant={'body2'}> {t('transferLabelLinkRecent')}</Typography></Link>*/}
            {/*</Box>*/}
        </Grid>
    </Grid>;
}
