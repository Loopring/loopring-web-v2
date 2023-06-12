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
  align-items: center;
  width: 100%;
  margin-top: ${({ theme }) => theme.unit * 2}px;
  margin-bottom: ${({ theme }) => theme.unit * 2}px;
  padding: 0 ${({ theme }) => theme.unit * 3}px;
`;

export const LockDetailPanel = ({
  tokenLockDetail,
}: {
  tokenLockDetail?:
    | undefined
    | {
        list: any[];
        row: any;
      };
}) => {
  const { t } = useTranslation();
  const { isMobile } = useSettings();
  return (
    <ContentWrapperStyled width={"var(--mobile-full-panel-width)"}>
      <HeaderStyled
        flexDirection={isMobile ? "column" : "row"}
        alignItems={"flex-start"}
        justifyContent={"center"}
      >
        <Typography variant={"h4"} display={"flex"} justifyContent={"center"}>
          {t("labelLocketInfo", { symbol: tokenLockDetail?.row?.token?.value })}
        </Typography>
      </HeaderStyled>
      <Box borderRadius={"inherit"} minWidth={110} paddingBottom={2}>
        {tokenLockDetail && tokenLockDetail.list?.length ? (
          tokenLockDetail.list.map((item) => {
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
