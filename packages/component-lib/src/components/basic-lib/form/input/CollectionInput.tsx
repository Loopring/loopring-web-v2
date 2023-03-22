import {
  Avatar,
  Box,
  BoxProps,
  Divider,
  Link,
  Modal,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CollectionMeta,
  CopyIcon,
  copyToClipBoard,
  getShortAddr,
  ImageIcon,
  Info2Icon,
  LoadingIcon,
  MakeMeta,
  myLog,
  TOAST_TIME,
} from "@loopring-web/common-resources";
import {
  Button,
  CollectionCardList,
  CollectionListProps,
  DropdownIconStyled,
  MenuItem,
  SwitchPanelStyled,
  // TextField,
  Toast,
  ToastType,
} from "../../../index";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import styled from "@emotion/styled";
import { useHistory } from "react-router";
import { TextField } from "../../../basic-lib";

const SizeCss = {
  small: `
	  height: 2.4rem;
	  lineHeight: 2.4rem;
	`,
  large: `
	  height: 4.8rem;
	  lineHeight: 4.8rem;
	`,
  medium: `
	 height: 3.2rem;
	 lineHeight: 3.2rem;
	`,
};
const BoxStyle = styled(Box)<BoxProps & { size: "small" | "large" | "medium" }>`
  padding: 0.3rem 0.3rem 0.3rem 0.8rem;
  ${({ theme }) =>
    theme.border.defaultFrame({ c_key: "var(--color-border)", d_R: 0.5 })};

  &:hover,
  &:active {
    color: var(--color-text-primary);
    ${({ theme }) =>
      theme.border.defaultFrame({
        c_key: "var(--color-border-hover)",
        d_R: 0.5,
      })};
  }

  .selected {
    color: var(--color-text-button-select);
    background: var(--color-box);
    ${({ theme }) =>
      theme.border.defaultFrame({
        c_key: "var(--color-border-select)",
        d_R: 0.5,
      })};
  }

  ${({ size }) => SizeCss[size]}
` as (props: BoxProps & { size: "small" | "large" | "medium" }) => JSX.Element;

export type CollectionInputProps<Co> = {
  collection?: Co;
  collectionListProps: CollectionListProps<Co>;
  onSelected: (item: Co) => void;
  domain: string;
  makeMeta: MakeMeta;
};

export const CollectionInput = <Co extends CollectionMeta>({
  collection,
  collectionListProps,
  fullWidth = false,
  width = "content-fit",
  showCopy = false,
  onSelected,
  domain,
  size = "large",
  // makeMeta,
  isRequired = false,
}: CollectionInputProps<Co> & {
  showCopy?: boolean;
  fullWidth?: boolean;
  width?: any;
  size?: "small" | "large" | "medium";
  domain: string;
  makeMeta: MakeMeta;
  isRequired?: boolean;
}) => {
  const [_modalState, setModalState] = React.useState(false);
  // const [selectCollectionMeta, setSelectCollectionMeta] = React.useState(collection);
  const { t } = useTranslation("common");
  const [dropdownStatus, setDropdownStatus] =
    React.useState<"up" | "down">("down");
  const {
    onPageChange,
    collectionList,
    isLoading: isLoadingCollectionList,
  } = collectionListProps;
  const history = useHistory();
  const noCollectionAndSelected =
    collectionList.length === 0 && collection === undefined;
  myLog("collectionList", collectionListProps.collectionList);
  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      width={fullWidth ? "100%" : width}
    >
      <Box width={"100%"}>
        <Tooltip
          title={
            <Trans i18nKey="labelChooseCollectionTooltips">
              This is the collection where your NFT will appear.NFT minted under
              collection will be bound with different contract address than
              previous created one. If you have incomplete work to finish and
              would like them created under previous contract address, you can
              still use the legacy created method under
              <Link
                style={{
                  cursor: "pointer",
                  color: "var(--color-primary)",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
                target="_blank"
                rel="noopener noreferrer"
                href={"https://legacy-nft.loopring.io"}
              >
                legacy-nft.loopring.io
              </Link>
            </Trans>
          }
          placement={"top-start"}
        >
          <Typography
            variant={"body1"}
            color={"textSecondary"}
            className={"main-label"}
            paddingBottom={1 / 2}
            display={"inline-flex"}
            height={24}
            lineHeight={24}
            alignItems={"center"}
          >
            <Trans
              i18nKey={"labelMintCollection"}
              tOptions={{ required: isRequired ? "\uFE61" : "" }}
            >
              Choose Collection
              <Typography
                component={"span"}
                variant={"inherit"}
                color={"error"}
              >
                {"\uFE61"}
              </Typography>
              <Info2Icon
                fontSize={"small"}
                color={"inherit"}
                sx={{ marginX: 1 / 2 }}
              />
            </Trans>
          </Typography>
        </Tooltip>
      </Box>
      {dropdownStatus === "up" && noCollectionAndSelected ? (
        <TextField
          select
          size={size}
          SelectProps={{
            open: true,
            IconComponent: () => (
              <DropdownIconStyled
                sx={{ color: "white!important" }}
                status={dropdownStatus}
                fontSize={size}
              />
            ),
          }}
          sx={{ width: "100%", maxWidth: "none!important" }}
          onClick={(_e: any) => {
            _e.stopPropagation();
            setDropdownStatus((prev) => (prev === "up" ? "down" : "up"));
          }}
        >
          <MenuItem
            onClick={() => {
              history.push("/nft/addCollection");
            }}
          >
            {t("labelNFTCreateCollection")}
          </MenuItem>
        </TextField>
      ) : (
        <BoxStyle
          width={"100%"}
          display={"flex"}
          alignItems={"center"}
          fontSize={"1.6rem"}
          size={size}
          className={collection ? "selected" : ""}
          justifyContent={"space-between"}
          onClick={(_e: any) => {
            if (isLoadingCollectionList) return;
            if (noCollectionAndSelected) {
              _e.stopPropagation();
              setDropdownStatus((prev) => (prev === "up" ? "down" : "up"));
            } else {
              setModalState(true);
              onPageChange(1, { isMintable: true });
            }
          }}
          style={{ cursor: "pointer", whiteSpace: "nowrap" }}
          position={"relative"}
        >
          <Box flex={1} display={"flex"} flexDirection={"row"}>
            {collection ? (
              <>
                {(
                  collection?.cached?.tileUri ??
                  collectionListProps.getIPFSString(
                    collection?.tileUri ?? "",
                    collectionListProps.baseURL
                  )
                ).startsWith("http") ? (
                  <Avatar
                    sx={{
                      bgcolor: "var(--color-border-disable2)",
                      marginRight: 1,
                      width:
                        size === "large"
                          ? "var(--svg-size-huge2)"
                          : "var(--svg-size-large)",
                      height:
                        size === "large"
                          ? "var(--svg-size-huge2)"
                          : "var(--svg-size-large)",
                    }}
                    variant={"rounded"}
                    src={
                      collection?.cached?.tileUri ??
                      collectionListProps.getIPFSString(
                        collection?.tileUri ?? "",
                        collectionListProps.baseURL
                      )
                    }
                  />
                ) : (
                  <Avatar
                    sx={{
                      bgcolor: "var(--color-border-disable2)",
                      marginRight: 1,
                      width:
                        size === "large"
                          ? "var(--svg-size-huge2)"
                          : "var(--svg-size-medium)",
                      height:
                        size === "large"
                          ? "var(--svg-size-huge2)"
                          : "var(--svg-size-medium)",
                    }}
                    variant={"rounded"}
                  >
                    <ImageIcon />
                  </Avatar>
                )}

                <Box
                  flex={1}
                  display={"flex"}
                  flexDirection={size === "large" ? "column" : "row"}
                  alignItems={size === "large" ? "stretch" : "center"}
                >
                  <Typography
                    component={"span"}
                    variant={"body1"}
                    color={"textPrimary"}
                    textOverflow={"ellipsis"}
                    overflow={"hidden"}
                    display={"inline-flex"}
                    whiteSpace={"pre"}
                    sx={
                      size !== "large"
                        ? {
                            maxWidth: "160px",
                            wordBreak: "break-all",
                          }
                        : {}
                    }
                  >
                    {collection.name}
                  </Typography>
                  <Typography
                    component={"span"}
                    marginLeft={size === "large" ? 0 : 1}
                    variant={"body2"}
                    color={"var(--color-text-third)"}
                  >
                    {size === "large"
                      ? collection.contractAddress
                      : " " +
                        getShortAddr(collection.contractAddress ?? "", true)}
                  </Typography>
                </Box>
              </>
            ) : (
              <></>
            )}
          </Box>
          {isLoadingCollectionList ? (
            <LoadingIcon />
          ) : (
            <DropdownIconStyled status={dropdownStatus} fontSize={size} />
          )}
        </BoxStyle>
      )}

      {collection && showCopy && (
        <Typography display={"inline-flex"} alignItems={"center"} marginY={1}>
          collection_metadata:
          <Link
            color={"primary"}
            display={"inline-flex"}
            alignItems={"center"}
            sx={{
              marginLeft: 0,
              paddingLeft: 1,
              justifyContent: "flex-start",
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (collection) {
                // @ts-ignore
                copyToClipBoard(
                  `${domain}/${(collection as any).collectionAddress}`
                );
                collectionListProps.setCopyToastOpen({
                  isShow: true,
                  type: "url",
                });
              }
            }}
          >
            {domain}/{getShortAddr((collection as any).collectionAddress)}
            <CopyIcon color={"inherit"} />
          </Link>
        </Typography>
      )}
      <Modal
        open={_modalState}
        onClose={() => {
          // setDropdownStatus((prev) => (prev === "up" ? "down" : "up"));
          setModalState(false);
        }}
      >
        <SwitchPanelStyled
          display={"flex"}
          overflow={"scroll"}
          alignItems={"stretch"}
          height={"80%"}
          width={"90%"}
          paddingX={4}
          className={"collectionSelect"}
        >
          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"space-between"}
            marginBottom={2}
          >
            <Typography variant={"h5"}>{t("labelChooseCollection")}</Typography>
            <Button
              variant={"contained"}
              onClick={() => {
                history.push("/nft/addCollection");
              }}
            >
              {t("labelNFTCreateCollection")}
            </Button>
          </Box>
          <Divider style={{ marginTop: "-1px" }} />
          <CollectionCardList
            {...{ ...(collectionListProps as any) }}
            isSelectOnly={true}
            size={collectionListProps?.size ?? size}
            filter={{ isMintable: true }}
            selectCollection={collection}
            onSelectItem={(item) => {
              onSelected(item as Co);
              // setSelectCollectionMeta(item as any);
              setDropdownStatus((prev) => (prev === "up" ? "down" : "up"));
              setModalState(false);
            }}
          />
          <Toast
            alertText={
              collectionListProps.copyToastOpen?.type === "json"
                ? t("labelCopyMetaClip")
                : t("labelCopyAddClip")
            }
            open={collectionListProps.copyToastOpen?.isShow}
            autoHideDuration={TOAST_TIME}
            onClose={() => {
              collectionListProps.setCopyToastOpen({ isShow: false, type: "" });
            }}
            severity={ToastType.success}
          />
        </SwitchPanelStyled>
      </Modal>
    </Box>
  );
};
