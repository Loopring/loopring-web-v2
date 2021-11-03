import { Box, } from '@mui/material';
import { useRouteMatch } from 'react-router-dom';
import React from 'react';
import { EmptyDefault } from '@loopring-web/component-lib';
import { myLog, ThemeType } from '@loopring-web/common-resources';
import ReactMarkdown  from 'react-markdown';
import styled from '@emotion/styled';
import { css, useTheme } from '@emotion/react';
//@ts-ignore
import cssStyle from  'github-markdown-css/github-markdown.css';
// //@ts-ignore
// import cssDarkStyle from  'github-markdown-css/github-markdown-dark.css'
// //@ts-ignore
// import cssLightStyle from  'github-markdown-css/github-markdown-light.css'
// ${theme.mode === 'dark'?cssDarkStyle:cssLightStyle}
const url_path = 'https://static.loopring.io/documents'
const style = css`${cssStyle}`
const BoxStyle= styled(Box)`
  ${({theme})=>`
      .markdown-body{
        border-radius: ${theme.unit/2}px;
      }
      
  `};
  ${style}
`as typeof Box
export const MarkDonwPage = ()=> {
    let match: any = useRouteMatch("/document/:path");
    const [path, setPath] = React.useState<null | string>(match?.params.path);
    const [input, setInput] = React.useState<string>('');

    React.useEffect(() => {
        if (path) {
            try {
                const _path = (path.split('/').length > 1) ? path : `markdown/${path}`
                myLog(_path)
                fetch(url_path + "/" + _path)
                    .then(response => response.text()).then((input) => {
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

    return <BoxStyle flex={1}
                     marginTop={0} marginBottom={2}
                    >
        {input ?<Box padding={3}  boxSizing={'border-box'}
                     className={`day night ${theme.mode}-scheme markdown-body MuiPaper-elevation2`}>
            <ReactMarkdown children={input}/></Box> : <EmptyDefault message={() =>
            <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'center'}>No Content</Box>}/>
        }
    </BoxStyle>
}
//className={''}
