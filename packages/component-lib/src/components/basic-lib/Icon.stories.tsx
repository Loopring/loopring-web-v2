import { Meta, Story } from "@storybook/react/types-6-0";
import { WithTranslation, withTranslation } from "react-i18next";
import styled from "@emotion/styled";
import { Grid, Typography } from "@mui/material";
import {
  ActiveIcon,
  AlertIcon,
  AmmRankIcon,
  AssetsIcon,
  BanxaIcon,
  CalendarIcon,
  CheckBoxIcon,
  CheckedIcon,
  CheckIcon,
  CloseIcon,
  CompleteIcon,
  CopyIcon,
  DarkIcon,
  DepositIcon,
  DepthFIcon,
  DepthHIcon,
  DoneIcon,
  DownloadIcon,
  DragIcon,
  DropDownIcon,
  EmptyIcon,
  ErrorIcon,
  ExchangeIcon,
  ExitIcon,
  FailedIcon,
  FirstPlaceIcon,
  GoodIcon,
  GoTopIcon,
  GrowIcon,
  HelpIcon,
  HideIcon,
  InfoIcon,
  L2HistoryIcon,
  L2MyLiquidityIcon,
  L2OrderIcon,
  LightIcon,
  LinkedIcon,
  LinkIcon,
  LoadingIcon,
  LockIcon,
  LoopringLogoIcon,
  MenuIcon,
  MoreIcon,
  NFTIcon,
  NotificationIcon,
  PendingIcon,
  RampIcon,
  RedPockIcon,
  RefreshIcon,
  RefuseIcon,
  ReverseIcon,
  RewardIcon,
  SearchIcon,
  SecondPlaceIcon,
  SecurityIcon,
  SettingIcon,
  SpeakerIcon,
  StarHollowIcon,
  StarSolidIcon,
  SubmitIcon,
  ThirdPlaceIcon,
  TransferIcon,
  TrophyIcon,
  UnConnectIcon,
  UpIcon,
  ViewIcon,
  VipIcon,
  WaitingIcon,
  WarningIcon,
  WithdrawIcon,
  DeleteIcon,
  ImageIcon,
  Info2Icon,
  IncomingIcon,
  CardIcon,
  L1l2Icon,
  L2l2Icon,
  ExchangeAIcon,
  OutputIcon,
  ViewMoreIcon,
  RefreshIPFSIcon,
  OrderListIcon,
  PlayIcon,
  VideoIcon,
  AudioIcon,
} from "@loopring-web/common-resources";

const Styled = styled.div`
  background: var(--color-global-bg);

  svg {
    height: 24px;
    width: 24px;
  }
`;

// @ts-ignore
const listIcon = [
  <ActiveIcon />,
  <AlertIcon />,
  <AmmRankIcon />,
  <AssetsIcon />,
  <AudioIcon />,
  <BanxaIcon />,
  <CalendarIcon />,
  <CardIcon />,
  <CheckBoxIcon />,
  <CheckIcon />,
  <CheckedIcon />,
  <CloseIcon />,
  <CompleteIcon />,
  <CopyIcon />,
  <DarkIcon />,
  <DeleteIcon />,
  <DepositIcon />,
  <DepthFIcon />,
  <DepthHIcon />,
  <DoneIcon />,
  <DownloadIcon />,
  <DragIcon />,
  <DropDownIcon />,
  <EmptyIcon />,
  <ErrorIcon />,
  <ExchangeAIcon />,
  <ExchangeIcon />,
  <ExitIcon />,
  <FailedIcon />,
  <FirstPlaceIcon />,
  <GoTopIcon />,
  <GoodIcon />,
  <GrowIcon />,
  <HelpIcon />,
  <HideIcon />,
  <ImageIcon />,
  <IncomingIcon />,
  <Info2Icon />,
  <InfoIcon />,
  <L1l2Icon />,
  <L2HistoryIcon />,
  <L2MyLiquidityIcon />,
  <L2OrderIcon />,
  <L2l2Icon />,
  <LightIcon />,
  <LinkIcon />,
  <LinkedIcon />,
  <LoadingIcon />,
  <LockIcon />,
  <LoopringLogoIcon />,
  <MenuIcon />,
  <MoreIcon />,
  <NFTIcon />,
  <NotificationIcon />,
  <OrderListIcon />,
  <OutputIcon />,
  <PendingIcon />,
  <PlayIcon />,
  <RampIcon />,
  <RedPockIcon />,
  <RefreshIPFSIcon />,
  <RefreshIcon />,
  <RefuseIcon />,
  <ReverseIcon />,
  <RewardIcon />,
  <SearchIcon />,
  <SecondPlaceIcon />,
  <SecurityIcon />,
  <SettingIcon />,
  <SpeakerIcon />,
  <StarHollowIcon />,
  <StarSolidIcon />,
  <SubmitIcon />,
  <ThirdPlaceIcon />,
  <TransferIcon />,
  <TrophyIcon />,
  <UnConnectIcon />,
  <UpIcon />,
  <VideoIcon />,
  <ViewIcon />,
  <ViewMoreIcon />,
  <VipIcon />,
  <WaitingIcon />,
  <WarningIcon />,
  <WithdrawIcon />,
];

export const IconList: Story<any> = withTranslation()(
  ({}: WithTranslation & any) => {
    const view = listIcon.map((item, index) => {
      return (
        <Grid
          key={index}
          item
          padding={2}
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
        >
          {item}
          <Typography padding={1} variant={"body2"}>
            {item.type.name}
          </Typography>
        </Grid>
      );
    });

    return (
      <>
        <Styled>
          {/*<MemoryRouter initialEntries={['/']}>*/}
          <Grid container>{view}</Grid>
        </Styled>
        {/*</MemoryRouter>*/}
      </>
    );
  }
) as Story<any>;

//export const Button = Template.bind({});
// @ts-ignore
export default {
  title: "Resource/IconsList",
  component: IconList,
  argTypes: {},
} as Meta;
// LButton.args = {}
