import { withTranslation } from 'react-i18next';
import { MarketType } from '@loopring-web/common-resources';
import { MarketBlockProps } from '@loopring-web/component-lib';

export const Toolbar = withTranslation('common')(<C extends { [ key: string ]: any }>({market,marketTicker}:{
    market:MarketType,
    marketTicker:  MarketBlockProps<C>
})=>{
    return <>
    </>
})