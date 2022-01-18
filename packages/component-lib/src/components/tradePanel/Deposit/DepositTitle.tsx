import { Tab, Tabs, Typography } from "@mui/material";
import { HelpIcon } from "@loopring-web/common-resources";
import React from "react";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import { bindHover } from "material-ui-popup-state";
import { Trans, useTranslation } from "react-i18next";
import { PopoverPure } from "../../basic-lib";
import { DepositPanelType } from "./Interface";

const DepositTitle = ({ title, description }: any) => {
  const { t } = useTranslation();
  const popupState = usePopupState({
    variant: "popover",
    popupId: `popupId-deposit`,
  });
  return (
    <>
      <Typography component={"span"} variant={"h5"} marginRight={1}>
        {title ? title : t("depositTitle")}
      </Typography>
      <HelpIcon
        {...bindHover(popupState)}
        fontSize={"medium"}
        htmlColor={"var(--color-text-third)"}
      />
      <PopoverPure
        className={"arrow-center"}
        {...bindPopper(popupState)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Typography
          padding={2}
          component={"p"}
          variant={"body2"}
          whiteSpace={"pre-line"}
        >
          <Trans i18nKey={description ? description : "depositDescription"}>
            Once your deposit is confirmed on Ethereum, it will be added to your
            balance within 2 minutes.
          </Trans>
        </Typography>
      </PopoverPure>
    </>
  );
};
const ThirdPartTitle = React.memo(() => {
  const { t } = useTranslation();
  const popupState = usePopupState({
    variant: "popover",
    popupId: `popupId-ThirdPart`,
  });
  return (
    <>
      <Typography component={"span"} variant={"h5"} marginRight={1}>
        {t("labelVendor")}
      </Typography>
      <HelpIcon
        {...bindHover(popupState)}
        fontSize={"medium"}
        htmlColor={"var(--color-text-third)"}
      />
      <PopoverPure
        className={"arrow-center"}
        {...bindPopper(popupState)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Typography
          padding={2}
          component={"p"}
          variant={"body2"}
          whiteSpace={"pre-line"}
        >
          <Trans i18nKey={"labelDepositVendor"}>
            Make an order form third Loopring-parter, Once your order confirmed
            by Loopring, it will be added to your balance within 2 minutes.
          </Trans>
        </Typography>
      </PopoverPure>
    </>
  );
});

export const DepositTitleGroup = ({
  tabIndex,
  onTabChange,
  title,
  description,
}: {
  title?: string;
  description?: string;
  tabIndex: DepositPanelType;
  onTabChange: (index: DepositPanelType) => void;
  // (event: React.SyntheticEvent, value: DepositTabIndex) => void;
}) => {
  return (
    <>
      <Tabs value={tabIndex} onChange={(_e, value) => onTabChange(value)}>
        <Tab
          value={DepositPanelType.Deposit}
          label={<DepositTitle title={title} description={description} />}
        />
        <Tab value={DepositPanelType.ThirdPart} label={<ThirdPartTitle />} />
      </Tabs>
    </>
  );
};
