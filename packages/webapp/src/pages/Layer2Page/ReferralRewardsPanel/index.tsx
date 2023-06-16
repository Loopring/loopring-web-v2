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
  LinkSharedIcon,
  SoursURL,
  TOAST_TIME,
  TradeBtnStatus,
  url_path,
  WalletSite,
} from "@loopring-web/common-resources";
import {
  Button,
  ReferralImage,
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
  const { isMobile } = useSettings();
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
  const [images, setImages] = React.useState<JSX.Element[]>([]);
  React.useEffect(() => {
    fetch(`${url_path}/referral/information.json`)
      .then((response) => response.json())
      .then((result) => {
        if (result.referralBanners) {
          setImageList(result);
        }
      });
  }, []);
  const renderImage = React.useCallback(() => {
    const images = imageList?.referralBanners?.en.map((item, index) => {
      const ref = React.createRef<SVGSVGElement>();
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
      return (
        <ReferralImage
          ref={ref}
          src={item}
          code={account?.accountId?.toString()}
          height={height}
          width={width}
          bottom={bottom}
          left={left}
          fontColor={color ?? "#000000"}
        />
      );
    });
    setImages(images);
  }, [imageList, account]);
  React.useEffect(() => {
    if (imageList?.referralBanners?.en) {
      renderImage();
    }
  }, [imageList?.referralBanners?.en]);

  const { btnStatus, onBtnClick, btnLabel } = useSubmitBtn({
    availableTradeCheck: () => {
      return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: "" };
    },
    isLoading: false,
    submitCallback: () => {
      images?.map((item) => {
        // @ts-ignore
        if (item && item.ref?.current) {
          const a = document.createElement("a");
          const my_evt = new MouseEvent("click");
          // @ts-ignore
          const svg = item.ref?.current;
          const w = Number(
            svg.getAttribute("width") ?? imageList?.position?.code[5]
          );
          const h = Number(
            svg.getAttribute("height") ?? imageList?.position?.code[5]
          );
          const canvas = document.createElement("canvas");

          const img_to_download = document.createElement("img");

          img_to_download.onload = function () {
            canvas.setAttribute("width", w.toString());
            canvas.setAttribute("height", h.toString());
            // @ts-ignore
            const context: CanvasRenderingContext2D = canvas.getContext("2d");
            context.drawImage(img_to_download, 0, 0, w, h);
            const dataURL = canvas.toDataURL("image/png");
            const name = svg.getAttribute("name");
            // @ts-ignore
            if (window.navigator.msSaveBlob) {
              // @ts-ignore
              window.navigator.msSaveBlob(
                // @ts-ignore
                canvas.msToBlob(),
                name
              );
              // e.preventDefault();
            } else {
              const a = document.createElement("a");
              const my_evt = new MouseEvent("click");
              a.download = name;
              a.href = dataURL;
              a.dispatchEvent(my_evt);
            }
          };
          img_to_download.src = svg.getAttribute("base64doc");

          // @ts-ignore
          img_to_download?.onload();
        }
      });
    },
  });

  const label = React.useMemo(() => {
    if (btnLabel) {
      const key = btnLabel.split("|");
      if (key) {
        return t(key[0], key && key[1] ? { arg: key[1] } : undefined);
      } else {
        return t(btnLabel);
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
              <Box
                sx={{ display: "block" }}
                // height={0}
                // width={0}
                overflow={"hidden"}
              >
                {images.map((item, index) => (
                  <React.Fragment key={index}>{item}</React.Fragment>
                ))}
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
                <li>{t("labelReferralMethod1Step3")}</li>
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

                <Box></Box>
              </BoxStyled>
              <BoxStyled marginTop={2} paddingY={2} paddingX={0} flex={1}>
                <Typography component={"h3"} variant={"h4"} marginY={1}>
                  {t("labelReferralReferralsRefunds")}
                </Typography>
                <Box></Box>
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
