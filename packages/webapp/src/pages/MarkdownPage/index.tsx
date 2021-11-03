import { Box, Grid} from '@mui/material';
import { useRouteMatch } from 'react-router-dom';
import React from 'react';
import { EmptyDefault } from '@loopring-web/component-lib';
import Template from 'easy-template-string';
import gfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import styled from '@emotion/styled';
import { css, useTheme } from '@emotion/react';
//@ts-ignore
import cssStyle from 'github-markdown-css/github-markdown.css';
// //@ts-ignore
// import cssDarkStyle from  'github-markdown-css/github-markdown-dark.css'
// //@ts-ignore
// import cssLightStyle from  'github-markdown-css/github-markdown-light.css'
// ${theme.mode === 'dark'?cssDarkStyle:cssLightStyle}
//const url_path = 'https://raw.githubusercontent.com/Loopring/website/update_app_download_url/loopring.io/public/'
const url_path = 'https://static.loopring.io/documents'
const style = css`${cssStyle}`
const BoxStyle = styled(Grid)`
  ${({theme}) => `
      .markdown-body{
      
        border-radius: ${theme.unit / 2}px;
        max-width:1200px;
      }
      
  `};
  ${style}
` as typeof Grid;
const formatInput = async (textContent: string): Promise<string> => {
    // let [data, content] = args;
    const data = await fetch('https://api3.loopring.io/api/v2/exchange/feeInfo')
        .then((res) => res.json())
        .then((data) => data.data);
    let {
        ORDERBOOK_TRADING_FEES_STABLECOIN,
        ORDERBOOK_TRADING_FEES,
        AMM_TRADING_FEES,
    } = data;
    ORDERBOOK_TRADING_FEES_STABLECOIN = Object.keys(
        ORDERBOOK_TRADING_FEES_STABLECOIN
    ).reduce((pre, key) => {
        pre[ 'ORDERBOOK_TRADING_FEES_STABLECOIN.' + key ] = (
            ORDERBOOK_TRADING_FEES_STABLECOIN[ key ].takerRate / 100
        ).toFixed(2);
        return pre;
    }, {});
    ORDERBOOK_TRADING_FEES = Object.keys(ORDERBOOK_TRADING_FEES).reduce(
        (pre, key) => {
            pre[ 'ORDERBOOK_TRADING_FEES.' + key ] = (
                ORDERBOOK_TRADING_FEES[ key ].takerRate / 100
            ).toFixed(2);
            return pre;
        },
        {}
    );
    AMM_TRADING_FEES = Object.keys(AMM_TRADING_FEES).reduce((pre, key) => {
        pre[ 'AMM_TRADING_FEES.' + key ] = (
            AMM_TRADING_FEES[ key ].takerRate / 100
        ).toFixed(2);
        return pre;
    }, {});
    const template1 = new Template(textContent);
    return template1.interpolate({
        ...ORDERBOOK_TRADING_FEES_STABLECOIN,
        ...ORDERBOOK_TRADING_FEES,
        ...AMM_TRADING_FEES,
    });
    // updateMarkdown(content);
};
const list = [
    'wallet_fees_zh.md',
    'wallet_fees_en.md',
    'dex_fees_en.md',
    'dex_fees_zh.md',
];
export const MarkDonwPage = () => {
    let match: any = useRouteMatch("/document/:path");
    const [path, setPath] = React.useState<null | string>(match?.params.path);
    const [input, setInput] = React.useState<string>('');

    React.useEffect(() => {
        if (path) {
            try {
                const _path = (path.split('/').length > 1) ? path : `markdown/${path}`

                fetch(url_path + "/" + _path)
                    .then(response => response.text()).then((input) => {
                    if (list.findIndex((f) => f === path) !== -1) {
                        return formatInput(input)
                    }else{
                         return input
                    }
                }).then((input) => {
                    setInput(input)
                })
                    .catch(() => {
                        setPath(null)
                    })

            } catch (e: any) {
                setPath(null)
            }

        }
    }, [path]);
    const theme = useTheme()

    return <BoxStyle container  flex={1}
                     marginTop={0} marginBottom={2}>
        <Grid item xs={12}>
            {input ? <Box padding={3} boxSizing={'border-box'}
                          className={`day night ${theme.mode}-scheme markdown-body MuiPaper-elevation2`}>
                <ReactMarkdown plugins={[gfm]} children={input}/></Box> : <EmptyDefault message={() =>
                <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'center'}>No Content</Box>}/>
            }
        </Grid>
    </BoxStyle>
}
//className={''}
