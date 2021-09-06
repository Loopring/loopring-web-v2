import React from 'react'
import { EmptyValueTag, getShowStr, myLog, ReverseIcon } from '@loopring-web/common-resources'
import { IconButtonStyled } from '../Styled'

export function useAmmViewData({error, i18nKey, t, _isStoB, ammCalcData, _onSwitchStob, isAdd, }:
    {error: any, i18nKey: any, t: any, _isStoB: boolean, ammCalcData: any, _onSwitchStob: any, isAdd: boolean, }) {

    const label = React.useMemo(()=>{
        if(error.error){
            if(typeof  error.message === 'string'){
                return  t(error.message)
            }else if(error.message !== undefined){
                return error.message;
            }else {
                return t('labelError')
            }

        }
        if (i18nKey) {
            myLog('i18nKey:', i18nKey)
            const key = i18nKey.split(',');
            return t(key[ 0 ], key && key[ 1 ] ? {arg: key[ 1 ]} : undefined)
        } else {
            return isAdd ? t(`labelAddLiquidityBtn`) : t(`labelRemoveLiquidityBtn`)
        }
    },[error, i18nKey, t])

    const stob = React.useMemo(() => {
        if (ammCalcData && ammCalcData?.lpCoinA && ammCalcData?.lpCoinB && ammCalcData.AtoB) {
            let price: string;
            if (_isStoB) {
                price = `1 ${ammCalcData?.lpCoinA?.belong} \u2248 ${getShowStr(ammCalcData.AtoB)} ${ammCalcData?.lpCoinB?.belong}`;
            } else {
                price = `1 ${ammCalcData?.lpCoinB?.belong} \u2248 ${getShowStr(1 / ammCalcData.AtoB)} ${ammCalcData?.lpCoinA?.belong}`;
            }
            return <> {price} <IconButtonStyled size={'small'} aria-label={t('tokenExchange')} onClick={_onSwitchStob}
            ><ReverseIcon/></IconButtonStyled></>
        } else {
            return EmptyValueTag
        }

    }, [_isStoB, ammCalcData, _onSwitchStob])

    return {
        label,
        stob,
    }

}