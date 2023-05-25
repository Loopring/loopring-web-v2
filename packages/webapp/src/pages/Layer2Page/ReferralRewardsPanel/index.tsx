import styled from "@emotion/styled";
import {
  Box,
  BoxProps,
  Button,
  Container,
  Grid,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import {
  useTranslation,
  WithTranslation,
  withTranslation,
} from "react-i18next";
import { useAccount, ViewAccountTemplate } from "@loopring-web/core";
import {
  Layer2RouterID,
  LinkedIcon,
  LinkIcon,
  LinkSharedIcon,
  SearchIcon,
  TOAST_TIME,
} from "@loopring-web/common-resources";
import { ForcewithdrawPanel } from "../ForcewithdrawPanel";
import { SecurityPanel } from "../SecurityPanel";
import { VipPanel } from "../VipPanel";
import { MenuItemProps, Toast } from "@loopring-web/component-lib";

export const BoxBannerStyle = styled(Box)<
  BoxProps & { backGroundUrl?: string | number; direction?: "left" | "right" }
>`
  background-color: var(--color-box);
`;

const ReferHeader = ({
  isActive = true,
  handleCopy,
}: {
  isActive?: boolean;
  handleCopy: (selected: "id" | "link") => void;
}) => {
  const { account } = useAccount();
  const { t } = useTranslation();
  return (
    <BoxBannerStyle>
      <Container>
        <Typography component={"h1"} variant={"h2"}>
          {t(
            "labelReferTitle //Invite friends to join in Loopring and receive rewards"
          )}
        </Typography>
        <Typography component={"h2"} variant={"body1"} color={"textSecondary"}>
          {t(
            "labelReferTitleDes // As referrer: will receive a one-year commission on fees the new referred user trades. \n As referee:  will enjoy a one-year discount on transfer fees."
          )}
        </Typography>
        <Box>
          <OutlinedInput
            className={"search"}
            aria-label={"search"}
            placeholder={"Search"}
            value={account.accountId}
            disabled={true}
            // onChange={(event: any) => {}}
            startAdornment={
              <InputAdornment position="start">
                <LinkSharedIcon color={"inherit"} />
              </InputAdornment>
            }
            endAdornment={
              <Button variant={"text"} onClick={() => handleCopy("link")}>
                {t("labelCopy")}
              </Button>
            }
          />
        </Box>
        <Box>
          <OutlinedInput
            className={"search"}
            aria-label={"search"}
            placeholder={"Search"}
            value={account.accountId}
            disabled={true}
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
              <Button variant={"text"} onClick={() => handleCopy("id")}>
                {t("labelCopy")}
              </Button>
            }
          />
        </Box>
      </Container>
    </BoxBannerStyle>
  );
};

const ReferView = () => {
  const { t } = useTranslation();

  const [copyToastOpen, setCopyToastOpen] = useState(false);
  const handleCopy = (selected: "id" | "link") => {
    switch (selected) {
      case "id":
      //todo:
      case "link":
      //todo:
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
        severity={"success"}
      />
      <ReferHeader handleCopy={handleCopy} />
    </>
  );
};
export const ReferralRewardsPanel = () => {
  return <ViewAccountTemplate activeViewTemplate={<ReferView />} />;
};
