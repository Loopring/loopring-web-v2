import { Meta, Story } from '@storybook/react/types-6-0'
import styled from "@emotion/styled";
import { MemoryRouter } from 'react-router-dom'
import { HeaderMenu, HeaderMenuSub, HeadMenuItem, Layer2Item, MenuTab } from './HeadMenuItem'

import { withTranslation } from "react-i18next";
import {
    Box,
    Divider,
    GlobalStyles,
    Grid,
    IconButton,
    List as MuiList,
    ListItemAvatar,
    ListItemText,
    MenuItem,
    Tab,
    Tabs
} from '@material-ui/core';
import { coinMap, CoinType, layer2ItemData, walletMap } from "../../../static";
import { CoinMenu } from './CoinList';
import { AlertIcon, AssetsIcon, CheckIcon, CoinInfo, DownloadIcon, globalCss, PendingIcon } from '@loopring-web/common-resources';
import React from 'react';

import { Typography } from '@material-ui/core/';
import { SubMenuItem } from './SubMenuList';
import { TabItemPlus } from './HeadToolbar';
import { WalletNotificationListItem } from './Notification';
import { useTheme } from '@emotion/react';

const BtnDownload = ({t}: any) => <IconButton aria-label={t('downloadApp')}><DownloadIcon/></IconButton>

const Style = styled.div`
  background: var(--color-global-bg);
  
`
const SubMenu = withTranslation('layout')((rest: any) => {
    return <>
        <MuiList>
            <SubMenuItem button selected={true} {...rest}>
                <ListItemAvatar>
                    <AssetsIcon/>
                </ListItemAvatar>
                <ListItemText primary={<Typography
                    sx={{display: 'block'}}
                    component="span"
                    variant="body1"
                    color="text.button"
                >Assets</Typography>}/>
            </SubMenuItem>
            <SubMenuItem button  {...rest}>
                <ListItemAvatar>
                    <AssetsIcon/>
                </ListItemAvatar>
                <ListItemText primary={<Typography
                    sx={{display: 'block'}}
                    component="span"
                    variant="body1"
                    color="text.button"
                >Assets</Typography>}/>
            </SubMenuItem>
            <SubMenuItem button selected={true} alignItems={'flex-start'}  {...rest}>
                <ListItemAvatar>
                    <AssetsIcon/>
                </ListItemAvatar>
                <ListItemText primary={<Typography
                    sx={{display: 'block'}}
                    component="span"
                    variant="body1"
                    color="text.button"
                >AMM Records</Typography>} secondary={<Typography
                    sx={{display: 'inline'}}
                    component="span"
                    variant="body2"
                    color="text.button"
                >(Joins & Exits )</Typography>}/>
            </SubMenuItem>
            <Divider/>
            <SubMenuItem button alignItems={'flex-start'}  {...rest}>
                <ListItemAvatar>
                    <AssetsIcon/>
                </ListItemAvatar>
                <ListItemText primary={<Typography
                    sx={{display: 'block'}}
                    component="span"
                    variant="body1"
                    color="text.button"
                >AMM Records</Typography>} secondary={<Typography
                    sx={{display: 'inline'}}
                    component="span"
                    variant="body2"
                    color="text.button"
                >(Joins & Exits )</Typography>}/>
            </SubMenuItem>
        </MuiList>

    </>
})

const LoopringHeader = (wrap: any) => {
    const layer2ItemDemo = layer2ItemData.map(
        ({label, router, child}) => <Layer2Item {...{...wrap, label, router, child}} key={label.id}/>)
    return <><Grid item>
        <Box display="flex" alignContent="center" justifyContent={"flex-start"}>
            <HeaderMenu className={'wrap'} maxWidth='lg'>
                <HeadMenuItem value={'markets'} layer={0} key={'markets-0'}
                              label={{id: 'markets', icon: ""}} {...wrap} >
                    <MenuTab component='div' label={wrap.t('markets')} key={'markets'}/>
                </HeadMenuItem>
                <HeadMenuItem value={'layer2'} layer={0} key={'layer-0'} label={{id: 'layer 2', icon: ""}} {...wrap} >
                    <MenuTab component='div' className={'Mui-selected'} label={wrap.t('layer 2')}
    key={'layer 2'}/>
                </HeadMenuItem>
                <HeaderMenuSub className={'layer-0'} renderList={() => layer2ItemDemo} layer={0} key={'trade-0'}
                               label={{id: 'trade', icon: ""}} {...wrap} >
                </HeaderMenuSub>
                <Box component={'ul'} display="flex" alignItems="center" justifyContent={"flex-end"}
                     color={'textSecondary'}>
                    <TabItemPlus key={'1'}>
                        <BtnDownload {...wrap}/>
                    </TabItemPlus>
                </Box>

            </HeaderMenu>
        </Box>
    </Grid>
        <Grid item>
            <ul>
                {layer2ItemDemo}
            </ul>
        </Grid></>
}
const CoinMapMenu = (rest: any) => {
    return <CoinMenu<CoinType, CoinInfo<CoinType>> {...{
    coinMap, walletMap, handleListItemClick: (_event: any) => {
        // console.log('handleListItemClick', key)
    }, ...rest
}}/>
}
const TabPanelBtn = () => {
    const [value, setValue] = React.useState('one');

    const handleChange = (_event: any, newValue: any) => {
        setValue(newValue);
    };
    return <Tabs
        value={value}
        onChange={handleChange}
        aria-label="disabled tabs example"
    >
        <Tab label="Active" value="one"/>
        <Tab label="Active" value="three"/>
    </Tabs>
}
const Template: Story<any> = withTranslation()(({t, ...rest}: any) => {
    const theme = useTheme();
    return <Style> <MemoryRouter initialEntries={['/']}>
        <GlobalStyles styles={globalCss({theme})}/>
        <h4>Tabs List </h4>
        <Grid container spacing={2} alignContent={'center'} justifyContent={'flex-start'}>
            <LoopringHeader t={t}/>
            <Grid item sm={2}> <TabPanelBtn/></Grid>
        </Grid>
        <h4>MenuList list for select</h4>
        <Grid container spacing={2} alignContent={'center'} justifyContent={'flex-start'}>
            <Grid item xs={3}>
                <Grid item style={{backgroundColor: 'var(--color-pop-bg)'}}>
                    <MenuItem value={1}><ListItemText>{t('test key')}</ListItemText></MenuItem>
                    <MenuItem value={1} selected={true}><ListItemText>{t('test key')}</ListItemText></MenuItem>
                </Grid>
            </Grid>
            <Grid item xs={3}>
                <Box width={200} style={{backgroundColor: 'var(--color-pop-bg)'}}>
                    <WalletNotificationListItem key={1} {...{
                        ...rest, t,
                        label: {id: 'xxxxxxxxxxxx xxxxxxxxx xxxxxxxxxxxxx xxxxxxxxxxxxxxxxxx'},
                        startIcon: {className: 'alert-success success', iconItem: <CheckIcon/>}
                    }}/>
                    <WalletNotificationListItem key={2} {...{
                        ...rest, t,
                        label: {id: 'xxxxxxxxxxxx xxxxxxxxx xxxxxxxxxxxxx xxxxxxxxxxxxxxxxxx'},
                        startIcon: {className: 'alert-pending pending', iconItem: <PendingIcon/>}
                    }}/>
                    <WalletNotificationListItem key={3}   {...{
                        ...rest, t,
                        label: {id: 'xxxxxxxxxxxx xxxxxxxxx xxxxxxxxxxxxx xxxxxxxxxxxxxxxxxx'},
                        startIcon: {className: 'alert-error error', iconItem: <AlertIcon/>}
                    }}/>
                </Box>
            </Grid>
        </Grid>
        <Box>

            <Grid container spacing={2} alignContent={'center'} justifyContent={'space-around'}>
                <Grid item xs={6}>
                    <h4>Left tab</h4>
                    <Box width={200} style={{backgroundColor: 'var(--color-pop-bg)'}}>
                        <SubMenu/>
                    </Box>
                </Grid>
                <Grid item xs={6} alignContent={'center'} justifyContent={'space-around'}>
                    <h4>CoinMap Menu</h4>
                    <Box height={200} display={'flex'} style={{backgroundColor: 'var(--color-pop-bg)'}}>
                        <Box flex={1} minWidth={330} height={'100%'}>
                            {<CoinMapMenu t={t} height={200}/>}
                        </Box>
                    </Box>

                </Grid>
            </Grid>


        </Box>

    </MemoryRouter>
    </Style>
}) as Story<any>;

export const ListItem = Template.bind({});
ListItem.args = {}
export default {
    title: 'basic-lib/ListItem',
    component: ListItem,
    argTypes: {},
} as Meta
