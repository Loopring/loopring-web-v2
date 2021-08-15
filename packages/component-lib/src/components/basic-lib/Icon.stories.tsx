import { Meta, Story } from '@storybook/react/types-6-0'
import { WithTranslation, withTranslation } from "react-i18next";
import styled from "@emotion/styled";
import { Grid, Typography } from '@material-ui/core/';
import {
    AssetsIcon,
    L2MyLiquidityIcon,
    L2HistoryIcon,
    RewardIcon,
    RedPockIcon,
    SecurityIcon,
    VipIcon,
    NoteIcon,
    CheckBoxIcon,
    CheckedIcon,
    ViewIcon,
    HideIcon,
    DropDownIcon,
    MoreIcon,
    StarHollowIcon,
    StarSolidIcon,
    DownloadIcon,
    NotificationIcon,
    SettingIcon,
    LinkIcon,
    CopyIcon,
    ReverseIcon,
    HelpIcon,
    CalendarIcon,
    LinkedIcon,
    ExchangeIcon,
    CloseIcon,
    SearchIcon,
    MenuIcon,
    DoneIcon,
    RefuseIcon,
    SubmitIcon,
    FailedIcon,
    GoodIcon,
    AlertIcon,
    ErrorIcon,
    InfoIcon,
    UnConnectIcon,
    LockIcon,
    CheckIcon,
    EmbarIcon,
    LoadingIcon,
    L2OrderIcon,
    UnLockIcon,

    WrongNetworkIcon,
    ThemeDarkIcon,
    ThemeLightIcon,
    PendingIcon,
    ActiveIcon,
    ProToLiteIcon,
    RefreshIcon,
    EmptyIcon,
    QRIcon,
    PoolsIcon,
    MiningIcon,
    MyLiquidityIcon,
    OrderMinIcon,
    MakerRebatesIcon,
    TransactionsIcon,
    TradeIcon,
    AmmIcon,
    OrderIcon,
    PowerIcon,

} from '@loopring-web/common-resources';

const Styled = styled.div`
  background: var(--color-global-bg);
  color: #fff;

  svg {
    height: 24px;
    width: 24px;
  }
`

const listIcon = [
    <AssetsIcon/>,
    <L2MyLiquidityIcon/>,
    <L2HistoryIcon/>,
    <RewardIcon/>,
    <RedPockIcon/>,
    <SecurityIcon/>,
    <VipIcon/>,
    <NoteIcon/>,
    <CheckBoxIcon/>,
    <CheckedIcon/>,
    <ViewIcon/>,
    <HideIcon/>,
    <DropDownIcon/>,
    <MoreIcon/>,
    <StarHollowIcon/>,
    <StarSolidIcon/>,
    <DownloadIcon/>,
    <NotificationIcon/>,
    <SettingIcon/>,
    <LinkIcon/>,
    <CopyIcon/>,
    <ReverseIcon/>,
    <HelpIcon/>,
    <CalendarIcon/>,
    <LinkedIcon/>,
    <ExchangeIcon/>,
    <CloseIcon/>,
    <SearchIcon/>,
    <MenuIcon/>,
    <DoneIcon/>,
    <RefuseIcon/>,
    <SubmitIcon/>,
    <FailedIcon/>,
    <GoodIcon/>,
    <AlertIcon/>,
    <ErrorIcon/>,
    <InfoIcon/>,
    <UnConnectIcon/>,
    <LockIcon/>,
    <CheckIcon/>,
    <EmbarIcon/>,
    <LoadingIcon/>,
    <L2OrderIcon/>,
    <UnLockIcon/>,
    <WrongNetworkIcon/>,
    <ThemeDarkIcon/>,
    <ThemeLightIcon/>,
    <PendingIcon/>,
    <ActiveIcon/>,
    <ProToLiteIcon/>,
    <RefreshIcon/>,
    <EmptyIcon/>,
    <QRIcon/>,
    <PoolsIcon/>,
    <MiningIcon/>,
    <MyLiquidityIcon/>,
    <OrderMinIcon/>,
    <MakerRebatesIcon/>,
    <TransactionsIcon/>,
    <TradeIcon/>,
    <AmmIcon/>,
    <OrderIcon/>,
    <PowerIcon/>,
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
