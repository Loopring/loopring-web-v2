import { Trans, WithTranslation } from 'react-i18next';
import React, { ChangeEvent } from 'react';
import { Grid, Typography, Box, IconProps } from '@mui/material';
import { bindHover } from 'material-ui-popup-state/es';
import { bindPopper, usePopupState } from 'material-ui-popup-state/hooks';
import {
    CloseIcon,
    DropDownIcon,
    globalSetup,
    IBData,
    HelpIcon,
    getValuePrecisionThousand,
   getFormattedHash
} from '@loopring-web/common-resources';
import { Button, IconClearStyled, TextField, TradeBtnStatus } from '../../index';
import { PopoverPure } from '../../'
import { TransferViewProps } from './Interface';
import { BasicACoinTrade } from './BasicACoinTrade';
import * as _ from 'lodash'
import { ToggleButtonGroup } from '../../basic-lib';
import { useSettings } from '../../../stores'
import styled from '@emotion/styled'
import { NFTTokenInfo } from '@loopring-web/webapp/src/api_wrapper';
import { BasicANFTTrade } from './BasicANFTTrade';
import { UserNFTBalanceInfo } from '@loopring-web/loopring-sdk/dist/defs/loopring_defs';

const FeeTokenItemWrapper = styled(Box)`
    background-color: var(--color-global-bg);
`

const DropdownIconStyled = styled(DropDownIcon)<IconProps>`
    transform: rotate(${({status}: any) => {
    return status === 'down' ? '0deg': '180deg'
}});
` as (props:IconProps& {status:string})=>JSX.Element

export const TransferWrap = <T extends IBData<I> & Partial<NFTWholeINFO>,
    I>({
           t, disabled, walletMap, tradeData, coinMap, transferI18nKey,
           chargeFeeToken = 'ETH', type,
           chargeFeeTokenList,
           onTransferClick,
           handleFeeChange,
           transferBtnStatus,
           addressDefault,
           handleOnAddressChange,
           handleAddressError,
           wait = globalSetup.wait,
           assetsData,
           realAddr,
           ...rest
       }: TransferViewProps<T, I> & WithTranslation & { assetsData: any[] }) => {
    
    const inputBtnRef = React.useRef();
    const getDisabled = () => {
        if (disabled || tradeData === undefined || walletMap === undefined || coinMap === undefined || isFeeNotEnough) {
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
    
    const [memo, setMemo] = React.useState('');
    const [feeToken, setFeeToken] = React.useState('')
    const [dropdownStatus, setDropdownStatus] = React.useState<'up' | 'down'>('down')
    const [isFeeNotEnough, setIsFeeNotEnough] = React.useState(false)
    const { feeChargeOrder } = useSettings()

    const popupState = usePopupState({variant: 'popover', popupId: `popupId-transfer`});
    
    const toggleData: any[] = chargeFeeTokenList.sort((a, b) => feeChargeOrder.indexOf(a.belong) - feeChargeOrder.indexOf(b.belong)).map(({belong, fee, __raw__, }) => ({
        key: belong,
        value: belong,
        fee,
        __raw__,
    }))

    const getTokenFee = React.useCallback((token: string) => {
        const raw = toggleData.find(o => o.key === token)?.fee
        // myLog('......raw:', raw, typeof raw, getValuePrecisionThousand(raw))
        return getValuePrecisionThousand(raw, undefined, undefined, undefined, false, { isTrade: true, floor: false })
    }, [toggleData])
    
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

    const _handleOnMemoChange = React.useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setMemo(e.target.value)
    }, [])

    const handleClear = React.useCallback(() => {
        setAddress('')
        if (handleAddressError) {
            const error = handleAddressError('')
            if (error?.error) {
                setAddressError(error)
            }
        }
    }, [setAddress, handleAddressError, setAddressError])

    React.useEffect(() => {
        if (!!chargeFeeTokenList.length && !feeToken && assetsData) {
            const defaultToken = chargeFeeTokenList.find(o => o.fee !==undefined && assetsData.find(item => item.name === o.belong)?.available > o.fee)?.belong || 'ETH'
            setFeeToken(defaultToken)
            const currFee = toggleData.find(o => o.key === defaultToken)?.fee || '--'
            const currFeeRaw = toggleData.find(o => o.key === defaultToken)?.__raw__ || '--'
            handleFeeChange({
                belong: defaultToken,
                fee: currFee,
                __raw__: currFeeRaw,
            })
        }
    }, [chargeFeeTokenList, feeToken, assetsData, handleFeeChange, toggleData])

    const checkFeeTokenEnough = React.useCallback((token: string, fee: number) => {
        const tokenAssets = assetsData.find(o => o.name === token)?.available
        return tokenAssets && Number(tokenAssets) > fee
    }, [assetsData])

    const handleToggleChange = React.useCallback((_e: React.MouseEvent<HTMLElement, MouseEvent>, value: string) => {
        if (value === null) return
        const currFeeRaw = toggleData.find(o => o.key === value)?.__raw__ || '--'
        setFeeToken(value)
        handleFeeChange({
            belong: value,
            fee: getTokenFee(value),
            __raw__: currFeeRaw,
        })
    }, [handleFeeChange, getTokenFee, toggleData])

    React.useEffect(() => {
        if (!!chargeFeeTokenList.length && assetsData && !checkFeeTokenEnough(feeToken, Number(getTokenFee(feeToken)))) {
            setIsFeeNotEnough(true)
            return
        }
        setIsFeeNotEnough(false)
    }, [chargeFeeTokenList, assetsData, checkFeeTokenEnough, getTokenFee, feeToken])

    return <Grid className={walletMap ? '' : 'loading'} paddingLeft={5 / 2} paddingRight={5 / 2} container
                 direction={"column"}
                 justifyContent={'space-between'}
                 alignItems={"stretch"} flex={1} height={'100%'} flexWrap={'nowrap'}
    >
        <Grid item>
            <Box display={'flex'} flexDirection={'row'} justifyContent={'center'} alignItems={'center'} marginBottom={2}>
                <Typography component={'h4'} variant={'h3'} marginRight={1}>{t('transferTitle')}</Typography>
                <HelpIcon {...bindHover(popupState)} fontSize={'large'} htmlColor={'var(--color-text-third)'} />
            </Box>
            <PopoverPure
                className={'arrow-center'}
                {...bindPopper(popupState)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Typography  padding={2} maxWidth={450} fontSize={14} variant={'body2'} whiteSpace={'pre-line'}>
                    <Trans i18nKey="transferDescription">
                        Transfer to any valid Ethereum addresses instantly. Please make
                        sure the recipient address accepts Loopring
                        layer-2 payments before you proceed.
                    </Trans>
                </Typography>
            </PopoverPure>
            {/* <Typography component={'p'} variant="body1">
                <Trans i18nKey="transferDescription">
                    Transfer to any valid Ethereum addresses instantly. Please <TypographyGood component={'span'}>make
                    sure</TypographyGood> the recipient address <TypographyGood component={'span'}>accepts Loopring
                    layer-2 </TypographyGood> payments before you proceed.
                </Trans>
            </Typography> */}
        </Grid>
        <Grid item /* marginTop={3} */ alignSelf={"stretch"}>
            {type === 'NFT' &&  tradeData.image ?<Box display={'inline-flex'} alignItems={'center'} justifyContent={'space-between'} height={48}>
                <Box display={'flex'} flexDirection={'row'} >
                    {/*<img alt={'NFT'} width={'100%'} height={'100%'} src={popItem.image}/>*/}
                    <Box height={48} width={48} flex={1}
                         borderRadius={1/2}
                         style={{background: "var(--field-opacity)"}} display={'flex'}
                         alignItems={'center'}
                         justifyContent={'center'}>
                        <img alt={'NFT'} width={'100%'} height={'100%'} src={tradeData?.image}/></Box>
                    <Box>
                      <Typography variant={'h5'} color={'text.secondary'} >{
                          ( tradeData?.name && tradeData.name.length > 8)?getFormattedHash(tradeData.name):tradeData.name}</Typography>
                      <Typography variant={'body1'} >{getFormattedHash(tradeData.tokenAddress)} / {getFormattedHash(tradeData.nftId)}</Typography>
                  </Box>
                </Box>
                <BasicANFTTrade {...{
                    ...rest,

                    type,
                    t,
                    disabled,
                    walletMap,
                    tradeData,
                    // coinMap,
                    inputNFTDefaultProps: {label:''},
                    // inputButtonDefaultProps,
                    inputNFTRef: inputBtnRef,
                }}  />
            </Box>:  <BasicACoinTrade {...{
                ...rest,
                type,
                t,
                disabled,
                walletMap,
                tradeData,
                coinMap,
                inputButtonDefaultProps,
                inputBtnRef: inputBtnRef,
                
            }} />  }
        </Grid>
        <Grid item /* marginTop={4} */ alignSelf={"stretch"} position={'relative'}>
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
        
        {realAddr && <Grid item alignSelf={"stretch"} position={'relative'}>
            {realAddr}
        </Grid>}

        <Grid item /* marginTop={4} */ alignSelf={"stretch"} position={'relative'}>
            <TextField
                value={memo}
                // error={addressError && addressError.error ? true : false}
                label={t('transferLabelMemo')}
                placeholder={t('transferLabelMemoPlaceholder')}
                onChange={_handleOnMemoChange}
                fullWidth={true}
            />
        </Grid>

        <Grid item /* marginTop={4} */ alignSelf={"stretch"} position={'relative'}>
            <Typography component={'span'} display={'flex'} alignItems={'center'} variant={'body1'} color={'var(--color-text-secondary)'} marginBottom={1}>
                {t('transferLabelFee')}：
                <Box component={'span'} display={'flex'} alignItems={'center'} style={{ cursor: 'pointer' }} onClick={() => setDropdownStatus(prev => prev === 'up' ? 'down' : 'up')}>
                    {getTokenFee(feeToken) || '--'} {feeToken}
                    <DropdownIconStyled  status={dropdownStatus} fontSize={'medium'} />
                    <Typography marginLeft={1} component={'span'} color={'var(--color-error)'}>
                        {isFeeNotEnough && t('transferLabelFeeNotEnough')}
                    </Typography>
                </Box>
            </Typography>
            {dropdownStatus === 'up' && (
                <FeeTokenItemWrapper padding={2}>
                    <Typography variant={'body2'} color={'var(--color-text-third)'} marginBottom={1}>{t('transferLabelFeeChoose')}</Typography>
                    <ToggleButtonGroup exclusive size={'small'} {...{data: toggleData, value: feeToken, t, ...rest}} onChange={handleToggleChange} />
                </FeeTokenItemWrapper>
            )}
        </Grid>
        <Grid item marginTop={2} alignSelf={'stretch'}>
            <Button fullWidth variant={'contained'} size={'medium'} color={'primary'} onClick={() => {
                const tradeDataWithMemo = {...tradeData, memo: memo}
                // onTransferClick(tradeData)
                onTransferClick(tradeDataWithMemo)
            }}
                    loading={!getDisabled() && transferBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
                    disabled={getDisabled() || transferBtnStatus === TradeBtnStatus.DISABLED || transferBtnStatus === TradeBtnStatus.LOADING ? true : false}
            >{t(transferI18nKey ?? `transferLabelBtn`)}
            </Button>
        </Grid>
    </Grid>;
}
