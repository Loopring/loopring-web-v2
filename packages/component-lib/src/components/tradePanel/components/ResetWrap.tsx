import { IBData } from '@loopring-web/common-resources';
import { TradeBtnStatus } from '../Interface';
import { Trans, WithTranslation } from 'react-i18next';
import React from 'react';
import styled from '@emotion/styled'
import { Grid, Typography, Box, IconProps } from '@mui/material';
import { DropDownIcon, getValuePrecisionThousand } from '@loopring-web/common-resources'
import { Button, ToggleButtonGroup } from '../../basic-lib';
import { ResetViewProps } from './Interface';
import { TypographyStrong } from '../../../index';

const FeeTokenItemWrapper = styled(Box)`
    background-color: var(--color-global-bg);
`

const DropdownIconStyled = styled(DropDownIcon)<IconProps>`
    transform: rotate(${({status}: any) => {
    return status === 'down' ? '0deg': '180deg'
}});
` as (props: IconProps& {status:string})=>JSX.Element

export const ResetWrap = <T extends object>({
           t,
           resetBtnStatus,
           onResetClick,
           chargeFeeToken,
           chargeFeeTokenList,
           handleFeeChange,
           assetsData = [],
           ...rest
       }: ResetViewProps<T> & WithTranslation) => {
    const [dropdownStatus, setDropdownStatus] = React.useState<'up' | 'down'>('down')
    const [isFeeNotEnough, setIsFeeNotEnough] = React.useState(false)
    const [feeToken, setFeeToken] = React.useState('')
    const inputBtnRef = React.useRef();

    const toggleData: any[] = chargeFeeTokenList.map(({belong, fee, __raw__, }) => ({
        key: belong,
        value: belong,
        fee,
        __raw__,
    }))

    const inputButtonDefaultProps = {
        label: t('restLabelEnterToken'),
    }

    React.useEffect(() => {
        if (!!chargeFeeTokenList.length && !feeToken && assetsData) {
            const defaultToken = chargeFeeTokenList.find(o => assetsData.find(item => item.name === o.belong)?.available > o.fee)?.belong || 'ETH'
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

    const getTokenFee = React.useCallback((token: string) => {
        const raw = toggleData.find(o => o.key === token)?.fee
        // myLog('......raw:', raw, typeof raw, getValuePrecisionThousand(raw))
        return getValuePrecisionThousand(raw)
    }, [toggleData])

    const checkFeeTokenEnough = React.useCallback((token: string, fee: number) => {
        const tokenAssets = assetsData.find(o => o.name === token)?.available
        return tokenAssets && Number(tokenAssets) > fee
    }, [assetsData])

    React.useEffect(() => {
        if (!!chargeFeeTokenList.length && assetsData && !checkFeeTokenEnough(feeToken, Number(getTokenFee(feeToken)))) {
            setIsFeeNotEnough(true)
            return
        }
        setIsFeeNotEnough(false)
    }, [chargeFeeTokenList, assetsData, checkFeeTokenEnough, getTokenFee, feeToken])

    const getDisabled = React.useCallback(() => {
        return false
    }, [])

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

    return <Grid className={''} paddingLeft={5 / 2} paddingRight={5 / 2} container
                 direction={"column"}
                 justifyContent={'space-between'} alignItems={"center"} flex={1} height={'100%'}>
        <Grid item>
            <Typography component={'h4'} textAlign={'center'} variant={'h3'} marginBottom={2}>
                {t('resetTitle')}
            </Typography>
            <Typography component={'p'} variant="body1" color={'var(--color-text-secondary)'}>
                <Trans i18nKey="resetDescription">
                    Create a new signing key for layer-2 authentication (no backup needed). This will
                    <TypographyStrong component={'span'}>cancel all your pending orders</TypographyStrong>.
                </Trans>
            </Typography>
        </Grid>

        <Grid item alignSelf={"stretch"} position={'relative'}>
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
                if (onResetClick) {
                    onResetClick()
                }
            }}
                    loading={!getDisabled() && resetBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
                    disabled={getDisabled() || resetBtnStatus === TradeBtnStatus.DISABLED || resetBtnStatus === TradeBtnStatus.LOADING ? true : false}
            >{t(`resetLabelBtn`)}
            </Button>
        </Grid>
    </Grid>
}
