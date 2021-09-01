import React from 'react'
import { TradeTable } from '@loopring-web/component-lib'
import { WithTranslation, withTranslation } from 'react-i18next'
// import styled from '@emotion/styled'
// import { Box, Paper } from '@material-ui/core'
import { StylePaper } from '../../styled'
import { useGetTrades } from './hooks'

// const StylePaper = styled(Box)`
//   display: flex;
//   flex-direction: column;
//   width: 100%;
//   height: 100%;
//   flex: 1;
//   background: var(--color-box);
//   border-radius: ${({ theme }) => theme.unit}px;
//   padding: 20px;
//   margin-bottom: ${({ theme }) => 2* theme.unit}px;
//   .title {
//     font-family: Gilroy-Medium;
//     font-size: ${({ theme }) => theme.unit * 3}px;
//     line-height: 19px;
//   }
//
//   .tableWrapper {
//     display: flex;
//     flex: 1;
//     margin-top: 20px;
//     border: 1px solid ${({ theme }) => theme.colorBase.borderColor};
//     border-radius: ${({ theme }) => theme.unit}px;
//     padding: 26px 0;
//
//     .rdg {
//       flex: 1;
//     }
//   }
// ` as typeof Paper;
//
// // side: keyof typeof TradeTypes;
// //     amount: {
// //         from: {
// //             key: string;
// //             value: number|undefined;
// //         },
// //         to: {
// //             key: string;
// //             value: number|undefined;
// //         }
// //     };
// //     price:{
// //         key:string
// //         value:number|undefined,
// //     }
// //     // priceDollar: number;
// //     // priceYuan: number;
// //     fee: {
// //         key: string;
// //         value: number|undefined;
// //     };
// //     time: number;

const TradePanel = withTranslation('common')((rest: WithTranslation<'common'>) => {
    const [pageSize, setPageSize] = React.useState(10);
    const {userTrades, showLoading} = useGetTrades()
    const container = React.useRef(null);
    const {t} = rest

    React.useEffect(() => {
        // @ts-ignore
        let height = container?.current?.offsetHeight;
        if (height) {
            setPageSize(Math.floor((height - 120) / 44) - 2);
        }
    }, [container, pageSize]);

    return (
        <StylePaper ref={container}>
            <div className="title">{t('labelTradePageTitle')}</div>
            <div className="tableWrapper extraTradeClass">
                <TradeTable {...{
                    rawData: userTrades,
                    // pagination: {
                    //     pageSize: pageSize
                    // },
                    showFilter: true,
                    showLoading: showLoading,
                    ...rest
                }}/>
            </div>
        </StylePaper>
    )
})

export default TradePanel
