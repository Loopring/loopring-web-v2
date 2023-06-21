import styled from "@emotion/styled";
import {
  Box,
  BoxProps,
  Container,
  InputAdornment,
  OutlinedInput,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAccount, useSubmitBtn } from "@loopring-web/core";
import {
  AccountStatus,
  copyToClipBoard,
  L1L2_NAME_DEFINED,
  LinkSharedIcon,
  MapChainId,
  SoursURL,
  TOAST_TIME,
  TradeBtnStatus,
  url_path,
  WalletSite,
} from "@loopring-web/common-resources";
import {
  Button,
  ReferralImage,
  ReferralsTable,
  Toast,
  ToastType,
  useSettings,
} from "@loopring-web/component-lib";

const BoxStyled = styled(Box)`
  ol {
    list-style: decimal inside;

    li {
      //list-item;
      color: var(--color-text-third);
      display: list-item;
      font-size: ${({ theme }) => theme.fontDefault.body1};
      // padding: ${({ theme }) => `0 ${theme.unit}`}px;
      line-height: 2em;
    }
  }
`;
export const BoxBannerStyle = styled(Box)<
  BoxProps & { backGroundUrl?: string | number; direction?: "left" | "right" }
>`
  background-color: var(--color-box);

  .bg:after {
    display: block;
    content: "";
    float: ${({ direction }) => direction};
    width: 35%;
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    background-image: url("${({ backGroundUrl }) => backGroundUrl}");
  }
` as (
  props: BoxProps & {
    backGroundUrl?: string | number;
    direction?: "left" | "right";
  }
) => JSX.Element;

enum ReferStep {
  method1 = 0,
  method2 = 1,
}

const ReferHeader = ({
  isActive = true,
  handleCopy,
  link,
}: {
  link: string;
  isActive?: boolean;
  handleCopy: (selected: "id" | "link") => void;
}) => {
  const { account } = useAccount();
  const { t } = useTranslation(["common", "layout"]);
  const { defaultNetwork } = useSettings();
  const network = MapChainId[defaultNetwork] ?? MapChainId[1];
  // const [image, setImage] = React.useState<any[]>([]);
  const [imageList, setImageList] = React.useState<{
    referralBanners: { en: string[] };
    lng: string[];
    position: {
      code: { default: any[]; [key: number]: any[] };
      [key: string]: any;
    };
  }>({
    referralBanners: {
      en: [],
    },
    lng: ["en"],
    position: {
      code: { default: [48, 30, 230, 64, "#000000", 630, 880] },
    },
  });
  // const [images, setImages] = React.useState<JSX.Element[]>([]);
  React.useEffect(() => {
    fetch(`${url_path}/referral/information.json`)
      .then((response) => response.json())
      .then((result) => {
        if (result.referralBanners) {
          setImageList(result);
        }
      });
  }, []);
  // const renderImage = React.useCallback(() => {
  //   const images = imageList?.referralBanners?.en.map((item, index) => {
  //     const ref = React.createRef<SVGSVGElement>();
  //     let _default = undefined;
  //     if (imageList?.position?.code[index]) {
  //       _default = imageList?.position?.code[index];
  //     } else {
  //       _default = imageList?.position?.code?.default;
  //     }
  //     let [left, bottom, , , color, width, height] = _default ?? [
  //       48,
  //       30,
  //       230,
  //       64,
  //       "#000000",
  //       630,
  //       880,
  //     ];
  //     return (
  //       <ReferralImage
  //         ref={ref}
  //         src={item}
  //         code={account?.accountId?.toString()}
  //         height={height}
  //         width={width}
  //         bottom={bottom}
  //         left={left}
  //         fontColor={color ?? "#000000"}
  //       />
  //     );
  //   });
  //   setImages(images);
  // }, [imageList, account]);

  const { btnStatus, onBtnClick, btnLabel } = useSubmitBtn({
    availableTradeCheck: () => {
      return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: "" };
    },
    isLoading: false,
    submitCallback: async () => {
      const images = imageList?.referralBanners?.en.map((item, index) => {
        const canvas: HTMLCanvasElement = document.createElement("canvas");
        let _default = undefined;
        if (imageList?.position?.code[index]) {
          _default = imageList?.position?.code[index];
        } else {
          _default = imageList?.position?.code?.default;
        }
        let [left, bottom, , , color, width, height] = _default ?? [
          48,
          30,
          230,
          64,
          "#000000",
          630,
          880,
        ];
        const lebelY = height - bottom - 100 + 20;
        const lebelX = left;
        const lebelCodeY = lebelY + 64;
        const lebelCodeX = left;
        const labelCode = t("labelReferralImageCode", {
          code: account.accountId,
        });
        const label = t("labelReferralImageDes");

        canvas.width = width;
        canvas.height = height;
        // @ts-ignore
        const context: CanvasRenderingContext2D = canvas.getContext("2d");
        const image = new Image();
        image.crossOrigin = "true";
        image.src = item;
        // const download = () => {
        //
        // };
        image.onload = function () {
          context.clearRect(0, 0, width, width);
          context.drawImage(image, 0, 0, width, height);
          context.font = "28px Roboto";
          context.fillStyle = color;
          context.textAlign = "left";
          context.fillText(label, lebelX, lebelY);
          context.font = "44px Roboto";
          context.fillText(labelCode, lebelCodeX, lebelCodeY);

          canvas.toBlob((blob) => {
            const a = document.createElement("a");
            // @ts-ignore
            a.download = (item ?? "/").split("/")?.pop();
            a.style.display = "none";
            // @ts-ignore
            a.href = URL.createObjectURL(blob);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }, "image/jpeg");
        };
      });
    },
  });

  const label = React.useMemo(() => {
    if (btnLabel) {
      const key = btnLabel.split("|");
      if (key) {
        return t(
          key[0],
          key && key[1]
            ? {
                arg: key[1],
                l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
              }
            : {
                l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
              }
        );
      } else {
        return t(btnLabel, {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        });
      }
    } else {
      return t(`labelInvite`);
    }
  }, [t, btnLabel]);

  return (
    <BoxBannerStyle
      backGroundUrl={SoursURL + "/images/giftReward.webp"}
      direction={"right"}
    >
      <Container>
        <Box className={"bg"} marginY={3} display={"flex"}>
          <Box width={"65%"}>
            <Typography
              component={"h1"}
              variant={"h2"}
              sx={{ whiteSpace: "pre-line", wordBreak: "break-all" }}
            >
              {t("labelReferTitle")}
            </Typography>
            <Typography
              paddingY={1}
              component={"h2"}
              variant={"body1"}
              color={"textSecondary"}
              sx={{ whiteSpace: "pre-line", wordBreak: "break-all" }}
            >
              {t("labelReferTitleDes")}
            </Typography>
            {account.readyState == AccountStatus.ACTIVATED && (
              <>
                <Box paddingTop={1} width={"70%"}>
                  <OutlinedInput
                    size={"medium"}
                    className={"copy"}
                    placeholder={"copy"}
                    value={link}
                    disabled={true}
                    fullWidth={true}
                    // onChange={(event: any) => {}}
                    startAdornment={
                      <InputAdornment position="start">
                        <LinkSharedIcon color={"inherit"} />
                      </InputAdornment>
                    }
                    endAdornment={
                      <Button
                        size={"small"}
                        variant={"text"}
                        onClick={() => handleCopy("link")}
                      >
                        {t("labelCopy")}
                      </Button>
                    }
                  />
                </Box>
                <Box paddingTop={1} width={"70%"}>
                  <OutlinedInput
                    size={"medium"}
                    className={"copy"}
                    placeholder={"copy"}
                    value={account.accountId}
                    disabled={true}
                    fullWidth={true}
                    // onChange={(event: any) => {}}
                    startAdornment={
                      <InputAdornment position="start">
                        <Typography
                          color={"var(--color-text-third)"}
                          variant={"body1"}
                          component={"span"}
                          paddingX={1 / 2}
                        >
                          #
                        </Typography>
                        {/*<LinkIcon color={"inherit"} />*/}
                      </InputAdornment>
                    }
                    endAdornment={
                      <Button
                        size={"small"}
                        variant={"text"}
                        onClick={() => handleCopy("id")}
                      >
                        {t("labelCopy")}
                      </Button>
                    }
                  />
                </Box>
              </>
            )}
            <Box marginY={2}>
              <Button
                size={"medium"}
                onClick={onBtnClick}
                loading={"false"}
                variant={"contained"}
                sx={{ minWidth: "var(--walletconnect-width)" }}
                disabled={
                  btnStatus === TradeBtnStatus.DISABLED ||
                  btnStatus === TradeBtnStatus.LOADING
                }
              >
                {label}
              </Button>
              {/*{image.map((item, index) => (*/}
              {/*  <React.Fragment key={index}>{item}</React.Fragment>*/}
              {/*))}*/}
              <Box
                sx={{ display: "block" }}
                height={0}
                width={0}
                overflow={"hidden"}
              >
                <canvas className={"canvas"} />
                {/*{images.map((item, index) => (*/}
                {/*  <React.Fragment key={index}>{item}</React.Fragment>*/}
                {/*))}*/}
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </BoxBannerStyle>
  );
};

const ReferView = () => {
  const { account } = useAccount();
  const { t } = useTranslation();
  const { defaultNetwork } = useSettings();
  const network = MapChainId[defaultNetwork] ?? MapChainId[1];
  const [currentTab, setCurrentTab] = React.useState(ReferStep.method1);
  const [copyToastOpen, setCopyToastOpen] = React.useState(false);
  const link = `${WalletSite}?referralcode=${account.accountId}`;
  const handleCopy = (selected: "id" | "link") => {
    switch (selected) {
      case "id":
        copyToClipBoard(account?.accountId?.toString());
        break;
      case "link":
        copyToClipBoard(link);
        break;
    }
    setCopyToastOpen(true);
  };

  const total = 11;
  return (
    <>
      <Toast
        alertText={t("labelCopyAddClip")}
        open={copyToastOpen}
        autoHideDuration={TOAST_TIME}
        onClose={() => {
          setCopyToastOpen(false);
        }}
        severity={ToastType.success}
      />
      <ReferHeader handleCopy={handleCopy} link={link} />
      <Container>
        <BoxStyled marginTop={2} paddingY={2} paddingX={0} flex={1}>
          <Typography component={"h3"} variant={"h4"} marginY={1}>
            {t("labelReferralRules")}
          </Typography>
          <Tabs
            sx={{ marginLeft: -1 }}
            value={currentTab}
            className={"MuiTabs-small"}
            onChange={(_event, value) => {
              setCurrentTab(value);
            }}
            aria-label="reward-rule-tabs"
            variant="scrollable"
          >
            <Tab label={t("labelReferralMethod1")} value={ReferStep.method1} />
            <Tab label={t("labelReferralMethod2")} value={ReferStep.method2} />
          </Tabs>
          <Box>
            {currentTab === ReferStep.method1 && (
              <ol>
                <li>{t("labelReferralMethod1Step1")}</li>
                <li>{t("labelReferralMethod1Step2")}</li>
                <li>
                  {t("labelReferralMethod1Step3", {
                    loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                    l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                    l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                    ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                    loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
                  })}
                </li>
                <li>{t("labelReferralMethod1Step4")}</li>
              </ol>
            )}
            {currentTab === ReferStep.method2 && <></>}
          </Box>

          {account.readyState === AccountStatus.ACTIVATED && (
            <>
              <BoxStyled marginTop={2} paddingY={2} paddingX={0} flex={1}>
                <Typography component={"h3"} variant={"h4"} marginY={1}>
                  {t("labelReferralMyReferrals")}
                </Typography>

                <Box display={"flex"} flexDirection={"column"}>
                  <Box display={"flex"} flexDirection={"row"}>
                    <Typography
                      component={"span"}
                      color={"textThird"}
                      variant={"body1"}
                      paddingRight={2}
                    >
                      {t("labelReferralsTotalEarning")}
                      <Typography
                        variant={"inherit"}
                        component={"span"}
                        color={"textPrimary"}
                      ></Typography>
                    </Typography>
                    <Typography
                      component={"span"}
                      color={"textThird"}
                      variant={"body1"}
                      paddingRight={2}
                    >
                      {t("labelReferralsClaimEarning")}
                      <Typography
                        variant={"inherit"}
                        component={"span"}
                        color={"textPrimary"}
                      ></Typography>
                    </Typography>
                    <Typography
                      component={"span"}
                      color={"textThird"}
                      variant={"body1"}
                      paddingRight={2}
                    >
                      {t("labelReferralsTotalReferrals")}
                      <Typography
                        variant={"inherit"}
                        component={"span"}
                        color={"textPrimary"}
                      ></Typography>
                    </Typography>
                  </Box>

                  <ReferralsTable
                    {...{
                      rawData: [],
                      pagination: {
                        pageSize: 8,
                        total,
                      },
                      getList: (props: { limit: number; offset: number }) => {},
                      showloading: false,
                    }}
                  />
                </Box>
              </BoxStyled>
              <BoxStyled marginTop={2} paddingY={2} paddingX={0} flex={1}>
                <Typography component={"h3"} variant={"h4"} marginY={1}>
                  {t("labelReferralReferralsRefunds")}
                </Typography>
                <Box display={"flex"} flexDirection={"column"}>
                  <Box display={"flex"} flexDirection={"row"}>
                    <Typography
                      component={"span"}
                      color={"textThird"}
                      variant={"body1"}
                      paddingRight={2}
                    >
                      {t("labelReferralsTotalRefund")}
                      <Typography
                        variant={"inherit"}
                        component={"span"}
                        color={"textPrimary"}
                      ></Typography>
                    </Typography>
                    <Typography
                      component={"span"}
                      color={"textThird"}
                      variant={"body1"}
                      paddingRight={2}
                    >
                      {t("labelReferralsClaimRefund")}
                      <Typography
                        variant={"inherit"}
                        component={"span"}
                        color={"textPrimary"}
                      ></Typography>
                    </Typography>
                    <Typography
                      component={"span"}
                      color={"textThird"}
                      variant={"body1"}
                      paddingRight={2}
                    >
                      {t("labelReferralsTotalVolume")}
                      <Typography
                        variant={"inherit"}
                        component={"span"}
                        color={"textPrimary"}
                      ></Typography>
                    </Typography>
                  </Box>
                  <ReferralsTable
                    {...{
                      rawData: [],
                      pagination: {
                        pageSize: 8,
                        total,
                      },
                      getList: (props: { limit: number; offset: number }) => {},
                      showloading: false,
                    }}
                  />
                </Box>
              </BoxStyled>
            </>
          )}
        </BoxStyled>
      </Container>
    </>
  );
};
export const ReferralRewardsPanel = () => {
  return <ReferView />;
  // <ViewAccountTemplate activeViewTemplate={<ReferView />} />;
};
