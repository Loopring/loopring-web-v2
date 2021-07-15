import { Meta, Story } from '@storybook/react/types-6-0'
import { WithTranslation, withTranslation } from "react-i18next";
import styled from "@emotion/styled";
import { Grid, Typography } from '@material-ui/core/';
import {
    ActiveIcon,
    AlertIcon,
    AmmIcon,
    ArrowDownIcon,
    AssetsIcon,
    CalendarIcon,
    CheckBoxIcon,
    CheckedIcon,
    CheckIcon,
    CloseIcon,
    CopyIcon,
    DownloadIcon,
    DropDownIcon,
    EmptyIcon,
    ExchangeIcon,
    HideIcon,
    LinkedIcon,
    LinkIcon,
    LockIcon,
    MakerRebatesIcon,
    MiningIcon,
    MyLiquidityIcon,
    NoNetWorkIcon,
    NotificationIcon,
    OrderIcon,
    OrderMinIcon,
    PendingIcon,
    PoolsIcon,
    PowerIcon,
    ProToLiteIcon,
    QRIcon,
    RedPockIcon,
    RefreshIcon,
    ReverseIcon,
    RewardIcon,
    SearchIcon,
    SettingIcon,
    StarIcon,
    ThemeDarkIcon,
    ThemeLightIcon,
    TradeIcon,
    TransactionsIcon,
    ViewIcon,
} from 'static-resource';

const Styled = styled.div`
  background: ${({theme}) => theme.colorBase.background().bg};
  color: #fff;

  svg {
    height: 24px;
    width: 24px;
  }
`

const listIcon = [
    <DropDownIcon/>,
    <CalendarIcon/>,
    <SearchIcon/>,
    <StarIcon/>,
    <DownloadIcon/>,
    <NotificationIcon/>,
    <ThemeDarkIcon/>,
    <ThemeLightIcon/>,
    <CheckIcon/>,
    <CheckBoxIcon/>,
    <CheckedIcon/>,
    <PendingIcon/>,
    <AlertIcon/>,
    // <LoadingIcon/>,
    <CloseIcon/>,
    <LockIcon/>,
    // <TickIcon/>,
    <ActiveIcon/>,
    // <TaskIcon/>,
    // <BuildIcon/>,
    // <WarningAlertIcon/>,
    <ReverseIcon/>,
    <ProToLiteIcon/>,
    <RefreshIcon/>,
    <ExchangeIcon/>,
    // <WarningIcon/>,
    <EmptyIcon/>,
    <ArrowDownIcon/>,
    <ViewIcon/>,
    <HideIcon/>,
    <CopyIcon/>,
    <LinkIcon/>,
    <QRIcon/>,
    <LinkedIcon/>,
    <PoolsIcon/>,
    <MiningIcon/>,
    <MyLiquidityIcon/>,
    <OrderMinIcon/>,
    <MakerRebatesIcon/>,
    <AssetsIcon/>,
    <TransactionsIcon/>,
    <TradeIcon/>,
    <AmmIcon/>,
    <OrderIcon/>,
    <RewardIcon/>,
    <RedPockIcon/>,
    <NoNetWorkIcon/>,
    <PowerIcon/>,
    <SettingIcon/>
]

export const IconList: Story<any> = withTranslation()(({}: WithTranslation & any) => {
    const view = listIcon.map((item, index) => {
        return <Grid key={index} item padding={2} display={'flex'} flexDirection={'column'} alignItems={'center'}>
            {item}
            <Typography padding={1} variant={'body2'}>{item.type.name}</Typography>
        </Grid>
    })

    return <>
        <Styled>
            {/*<MemoryRouter initialEntries={['/']}>*/}
            <Grid container>
                {view}
            </Grid>

        </Styled>
        {/*</MemoryRouter>*/}
    </>
}) as Story<any>;

//export const Button = Template.bind({});

export default {
    title: 'Resource/IconsList',
    component: IconList,
    argTypes: {},
} as Meta
// LButton.args = {}
