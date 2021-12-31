import { Meta, Story } from "@storybook/react/types-6-0";
import { WithTranslation, withTranslation } from "react-i18next";
import styled from "@emotion/styled";
import { Grid, Typography } from "@mui/material";
import {
  ActiveIcon,
  AlertIcon,
  AmmRankIcon,
  AssetsIcon,
  CalendarIcon,
  CheckBoxIcon,
  CheckedIcon,
  CheckIcon,
  CloseIcon,
  CompleteIcon,
  CopyIcon,
  DarkIcon,
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
  MenuIcon,
  MoreIcon,
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
  TrophyIcon,
  UnConnectIcon,
  UpIcon,
  ViewIcon,
  VipIcon,
  WaitingIcon,
  WarningIcon,
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
  <DepthHIcon />,
  <DepthFIcon />,
  <DragIcon />,
  <UpIcon />,
  <AssetsIcon />,
  <L2MyLiquidityIcon />,
  <L2HistoryIcon />,
  <RewardIcon />,
  <RedPockIcon />,
  <SecurityIcon />,
  <VipIcon />,
  <CheckBoxIcon />,
  <CheckedIcon />,
  <ViewIcon />,
  <L2OrderIcon />,
  <HideIcon />,
  <DropDownIcon />,
  <MoreIcon />,
  <StarHollowIcon />,
  <StarSolidIcon />,
  <DownloadIcon />,
  <NotificationIcon />,
  <SettingIcon />,
  <LinkIcon />,
  <CopyIcon />,
  <ReverseIcon />,
  <HelpIcon />,
  <CalendarIcon />,
  <LinkedIcon />,
  <ExchangeIcon />,
  <CloseIcon />,
  <SearchIcon />,
  <MenuIcon />,
  <DoneIcon />,
  <RefuseIcon />,
  <SubmitIcon />,
  <FailedIcon />,
  <GoodIcon />,
  <AlertIcon />,
  <ErrorIcon />,
  <InfoIcon />,
  <UnConnectIcon />,
  <LockIcon />,
  <CheckIcon />,
  <LoadingIcon />,
  <EmptyIcon />,
  <RefreshIcon />,
  <ActiveIcon />,
  <PendingIcon />,
  <CompleteIcon />,
  <WaitingIcon />,
  <WarningIcon />,
  <GrowIcon />,
  <LightIcon />,
  <DarkIcon />,
  <ExitIcon />,
  <RampIcon />,
  <FirstPlaceIcon />,
  <SecondPlaceIcon />,
  <ThirdPlaceIcon />,
  <SpeakerIcon />,
  <GoTopIcon />,
  <AmmRankIcon />,
  <TrophyIcon />,
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

export default {
  title: "Resource/IconsList",
  component: IconList,
  argTypes: {},
} as Meta;
// LButton.args = {}
