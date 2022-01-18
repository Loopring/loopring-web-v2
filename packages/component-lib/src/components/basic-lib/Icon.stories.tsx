import { Meta, Story } from "@storybook/react/types-6-0";
import { WithTranslation, withTranslation } from "react-i18next";
import styled from "@emotion/styled";
import { Grid, Typography } from "@mui/material";
import {
  AlertIcon,
  AssetsIcon,
  CalendarIcon,
  CheckBoxIcon,
  CheckedIcon,
  CheckIcon,
  CloseIcon,
  CompleteIcon,
  CopyIcon,
  DoneIcon,
  DownloadIcon,
  DropDownIcon,
  ErrorIcon,
  ExchangeIcon,
  FailedIcon,
  GoodIcon,
  HelpIcon,
  HideIcon,
  InfoIcon,
  L2HistoryIcon,
  L2MyLiquidityIcon,
  L2OrderIcon,
  LinkedIcon,
  LinkIcon,
  LoadingIcon,
  LockIcon,
  MenuIcon,
  MoreIcon,
  NotificationIcon,
  RedPockIcon,
  RefuseIcon,
  ReverseIcon,
  RewardIcon,
  SearchIcon,
  SecurityIcon,
  SettingIcon,
  StarHollowIcon,
  StarSolidIcon,
  SubmitIcon,
  // ThemeDarkIcon,
  EmptyIcon,
  UnConnectIcon,
  ViewIcon,
  VipIcon,
  WaitingIcon,
  WarningIcon,
  GrowIcon,
  LightIcon,
  DarkIcon,
  ExitIcon,
  RampIcon,
  FirstPlaceIcon,
  SecondPlaceIcon,
  ThirdPlaceIcon,
  SpeakerIcon,
  GoTopIcon,
  AmmRankIcon,
  TrophyIcon,
  BanxaIcon,
} from "@loopring-web/common-resources";

const Styled = styled.div`
  background: var(--color-global-bg);

  svg {
    height: 24px;
    width: 24px;
  }
`;

const listIcon = [
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
  // <ThemeDarkIcon/>,
  <CompleteIcon />,
  <WaitingIcon />,
  <WarningIcon />,
  <GrowIcon />,
  <LightIcon />,
  <DarkIcon />,
  <ExitIcon />,
  <RampIcon />,
  <BanxaIcon />,
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
