import { useTranslation } from "react-i18next";
import styled from "@emotion/styled";
import { Box, Typography } from "@mui/material";
import { useSettings } from "../../../../stores";
import { LoadingBlock } from "../../../block";

const ContentWrapperStyled = styled(Box)`
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  // min-width: ${({ theme }) => theme.unit * 87.5}px;
  // height: 60%;
  background-color: var(--color-pop-bg);
  box-shadow: 0px ${({ theme }) => theme.unit / 2}px
    ${({ theme }) => theme.unit / 2}px rgba(0, 0, 0, 0.25);
  padding: 0 ${({ theme }) => theme.unit * 1}px;
  border-radius: ${({ theme }) => theme.unit / 2}px;
`;

const HeaderStyled = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: ${({ theme }) => theme.unit * 2}px;
  margin-bottom: ${({ theme }) => theme.unit * 2}px;
  padding: 0 ${({ theme }) => theme.unit * 3}px;
  // height: ${({ theme }) => theme.unit * 7.5}px;
  // box-shadow: 0px ${({ theme }) => theme.unit / 4}px ${({ theme }) =>
    theme.unit}px rgba(0, 0, 0, 0.25);
  // border-radius: ${({ theme }) => theme.unit}px ${({ theme }) =>
    theme.unit}px 0px 0px;
`;

export const LockDetailPanel = ({
  tokenLockDetail,
}: {
  tokenLockDetail?: any[] | undefined;
}) => {
  const { t } = useTranslation();
  const { isMobile } = useSettings();
  return (
    <ContentWrapperStyled width={"var(--mobile-full-panel-width)"}>
      <HeaderStyled
        flexDirection={isMobile ? "column" : "row"}
        alignItems={"flex-start"}
      >
        <Typography variant={"h4"} display={"flex"} justifyContent={"center"}>
          {t("labelLocketInfo")}
        </Typography>
      </HeaderStyled>
      <Box borderRadius={"inherit"} minWidth={110} paddingBottom={2}>
        {tokenLockDetail && tokenLockDetail.length ? (
          tokenLockDetail.map((item) => {
            return (
              <Box
                display={"flex"}
                key={item.key}
                flexDirection={"row"}
                justifyContent={"space-between"}
                padding={1}
              >
                <Typography
                  display={"inline-flex"}
                  alignItems={"center"}
                  component={"span"}
                  color={"textSecondary"}
                >
                  {t(item.key)}
                </Typography>
                <Typography
                  display={"inline-flex"}
                  alignItems={"center"}
                  component={"span"}
                  color={"textPrimary"}
                >
                  {item.value}
                </Typography>
              </Box>
            );
          })
        ) : (
          <LoadingBlock />
        )}
      </Box>
    </ContentWrapperStyled>
  );
};
