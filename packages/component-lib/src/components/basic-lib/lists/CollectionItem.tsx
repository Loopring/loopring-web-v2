import {
  Button,
  CardStyleItem,
  CollectionListProps,
  CollectionMedia,
  EmptyDefault,
  Popover,
  PopoverType,
  PopoverWrapProps,
} from "../../../index";
import {
  Avatar,
  Box,
  Grid,
  Link,
  MenuItem,
  Pagination,
  Radio,
  Typography,
} from "@mui/material";
import {
  Account,
  CollectionMeta,
  CopyIcon,
  copyToClipBoard,
  GET_IPFS_STRING,
  getShortAddr,
  LinkIcon,
  MakeMeta,
  MoreIcon,
  NFT_TYPE_STRING,
  SoursURL,
} from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";
import React from "react";
import { useTranslation } from "react-i18next";
import { CollectionLimit, NFTLimit } from "@loopring-web/common-resources";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Image } from "echarts/types/src/util/graphic";

const BoxStyle = styled(Box)`
  .MuiRadio-root {
    position: absolute;
    right: ${({ theme }) => theme.unit}px;
    top: ${({ theme }) => theme.unit}px;
    transform: scale(1.5);
  }

  .collection:hover {
    .btn-group {
      display: flex;
      width: initial;
    }
  }
` as typeof Box;
const BoxLable = styled(Box)`
  background: var(--color-box-nft-label);
  color: var(--color-text-button);
  border-radius: ${({ theme }) => theme.unit}px;
` as typeof Box;
const BoxBtnGroup = styled(Box)`
  position: absolute;
  right: ${({ theme }) => 2 * theme.unit}px;
  top: ${({ theme }) => 2 * theme.unit}px;
  width: 100%;
  //flex-direction: row-reverse;
  &.mobile {
  }
` as typeof Box;

export type CollectionItemProps<Co> = {
  item: Co;
  index: number;
  setCopyToastOpen: (prosp: { isShow: boolean; type: string }) => void;
  setShowDeploy?: (item: Co) => void;
  setShowEdit?: (item: Co) => void;
  setShowMintNFT?: (item: Co) => void;
  onItemClick?: (item: Co) => void;
  account?: Account;
  toggle: any;
  isSelectOnly?: boolean;
  noEdit?: boolean;
  selectCollection?: Co;
  domain: string;
  makeMeta: MakeMeta;
  baseURL: string;
  getIPFSString: GET_IPFS_STRING;
  etherscanBaseUrl: string;
};
const ActionMemo = React.memo(
  <Co extends CollectionMeta>({
    // setShowDeploy,
    // setShowEdit,
    item,
    account,
    etherscanBaseUrl,
    setShowMintNFT,
  }: CollectionItemProps<Co>) => {
    const { t } = useTranslation("common");
    const theme = useTheme();
    const popoverProps: PopoverWrapProps = {
      type: PopoverType.click,
      popupId: "testPopup",
      className: "arrow-none",
      children: <MoreIcon cursor={"pointer"} />,
      popoverContent: (
        <Box borderRadius={"inherit"} minWidth={110}>
          {!!(
            item.isCounterFactualNFT &&
            item.deployStatus === sdk.DEPLOYMENT_STATUS.NOT_DEPLOYED &&
            item.owner?.toLowerCase() === account?.accAddress?.toLowerCase()
          ) ? (
            <></>
          ) : (
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                window.open(`${etherscanBaseUrl}tx/${item?.contractAddress}`);
                window.opener = null;
              }}
            >
              {t("labelViewEtherscan")}
              <LinkIcon
                color={"inherit"}
                fontSize={"small"}
                style={{
                  verticalAlign: "middle",
                  marginLeft: theme.unit,
                }}
              />
            </MenuItem>
          )}
          {!!(
            item.isCounterFactualNFT && item?.nftType !== NFT_TYPE_STRING.ERC721
          ) && (
            <MenuItem
              onClick={() => {
                if (setShowMintNFT) {
                  setShowMintNFT(item);
                }
              }}
            >
              {t("labelNFTMintSimpleBtn")}
            </MenuItem>
          )}
        </Box>
      ),
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "right",
      },
      transformOrigin: {
        vertical: "top",
        horizontal: "right",
      },
    } as PopoverWrapProps;

    return (
      <Grid item marginTop={1}>
        <Popover {...{ ...popoverProps }} />
      </Grid>
    );
  }
);

export const CollectionItem = React.memo(
  React.forwardRef(
    <Co extends CollectionMeta>(
      props: CollectionItemProps<Co>,
      _ref: React.Ref<any>
    ) => {
      const {
        item,
        index,
        setCopyToastOpen,
        noEdit,
        isSelectOnly = false,
        selectCollection,
        onItemClick,
        getIPFSString,
        baseURL,
      } = props;
      const { t } = useTranslation("common");

      // const { metaDemo } = makeMeta({ collection: item, domain });
      return (
        <CardStyleItem
          ref={_ref}
          className={"collection"}
          onClick={() => {
            if (onItemClick) {
              onItemClick(item);
            }
          }}
        >
          <Box
            position={"absolute"}
            width={"100%"}
            height={"100%"}
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"space-between"}
          >
            <CollectionMedia
              item={item}
              index={index}
              getIPFSString={getIPFSString}
              baseURL={baseURL}
              // onNFTReload={onNFTReload}
              onRenderError={() => undefined}
            />
            {!!isSelectOnly && (
              <Radio
                size={"medium"}
                checked={
                  selectCollection?.contractAddress?.toLowerCase() ===
                  item?.contractAddress?.toLowerCase()
                }
                value={item.contractAddress}
                name="radio-collection"
                inputProps={{ "aria-label": "selectCollection" }}
              />
            )}
            {!isSelectOnly && !noEdit && (
              <BoxBtnGroup className={"btn-group"}>
                <ActionMemo {...{ ...(props as any) }} />
              </BoxBtnGroup>
            )}
            <BoxLable
              padding={2}
              margin={2}
              display={"flex"}
              height={80}
              flexDirection={"row"}
              justifyContent={"space-between"}
              position={"absolute"}
              bottom={0}
              left={0}
              right={0}
            >
              <Box display={"flex"} flexDirection={"row"} alignItems={"center"}>
                <Avatar variant={"circular"} src={item.avatar} />
                <Typography
                  marginLeft={1}
                  color={"var(--color-text-button)"}
                  whiteSpace={"pre"}
                  overflow={"hidden"}
                  display={"flex"}
                  flexDirection={"column"}
                  textOverflow={"ellipsis"}
                  variant={"h5"}
                  alignItems={"flex-start"}
                  justifyContent={"space-evenly"}
                  alignSelf={"stretch"}
                >
                  <Typography
                    color={"textPrimary"}
                    width={"60%"}
                    overflow={"hidden"}
                    textOverflow={"ellipsis"}
                    variant={"body1"}
                    component={"span"}
                  >
                    {item?.name
                      ? item?.name
                      : t("labelUnknown") +
                        "-" +
                        getShortAddr(item?.contractAddress ?? "", true)}
                  </Typography>
                  <Link
                    variant={"body2"}
                    display={"inline-flex"}
                    style={{ color: "var(--color-text-third)" }}
                    alignItems={"center"}
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipBoard(item?.contractAddress ?? "");
                      setCopyToastOpen({ isShow: true, type: "address" });
                    }}
                  >
                    {getShortAddr(item?.contractAddress ?? "")}
                    <CopyIcon color={"inherit"} />
                  </Link>
                </Typography>
              </Box>
              <Typography
                whiteSpace={"pre"}
                overflow={"hidden"}
                display={"flex"}
                flexDirection={"column"}
                alignItems={"center"}
                textOverflow={"ellipsis"}
                justifyContent={"space-evenly"}
              >
                {item?.extends.count && (
                  <Typography
                    color={"textPrimary"}
                    component={"span"}
                    whiteSpace={"pre"}
                    overflow={"hidden"}
                    textOverflow={"ellipsis"}
                  >
                    {t("labelCollectionItemValue", {
                      value: item?.extends.count,
                    })}
                  </Typography>
                )}
                <Typography
                  color={"var(--color-text-third)"}
                  title={item?.nftType}
                >
                  {item?.nftType}
                </Typography>
              </Typography>
            </BoxLable>
          </Box>
        </CardStyleItem>
      );
    }
  )
);

export const CollectionCardList = <Co extends CollectionMeta>({
  collectionList,
  page,
  total,
  onPageChange,
  setCopyToastOpen,
  setShowDeploy,
  setShowEdit,
  setShowMintNFT,
  toggle,
  account,
  onSelectItem,
  onItemClick,
  isSelectOnly = false,
  selectCollection,
  etherscanBaseUrl,
  isLoading,
  noEdit = false,
  ...rest
}: CollectionListProps<Co> &
  Partial<CollectionItemProps<Co>> & { onSelectItem?: (item: Co) => void }) => {
  const { t } = useTranslation("common");
  return (
    <BoxStyle
      flex={1}
      display={"flex"}
      flexDirection={"column"}
      justifyContent={"stretch"}
      marginTop={2}
      width={"100%"}
    >
      {isLoading ? (
        <Box
          flex={1}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          height={"90%"}
        >
          <img
            className="loading-gif"
            alt={"loading"}
            width="36"
            src={`${SoursURL}images/loading-line.gif`}
          />
        </Box>
      ) : !collectionList?.length ? (
        <Box
          flex={1}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <EmptyDefault
            style={{ flex: 1 }}
            height={"100%"}
            message={() => (
              <Box
                flex={1}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
              >
                {t("labelNoContent")}
              </Box>
            )}
          />
        </Box>
      ) : (
        <>
          <Grid container spacing={2} paddingBottom={3}>
            {collectionList.map((item, index) => {
              return (
                <Grid
                  // @ts-ignore
                  key={index.toString() + (item?.name ?? "")}
                  item
                  xs={12}
                  md={6}
                  lg={4}
                  flex={"1 1 120%"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectItem) {
                      onSelectItem(item);
                    }
                  }}
                >
                  <CollectionItem
                    {...{ ...rest }}
                    onItemClick={onItemClick as any}
                    etherscanBaseUrl={etherscanBaseUrl}
                    selectCollection={selectCollection}
                    isSelectOnly={isSelectOnly}
                    noEdit={noEdit}
                    account={account}
                    toggle={toggle}
                    setShowDeploy={setShowDeploy as any}
                    setShowEdit={setShowEdit as any}
                    setShowMintNFT={setShowMintNFT as any}
                    setCopyToastOpen={setCopyToastOpen as any}
                    item={item as any}
                    index={index}
                  />
                </Grid>
              );
            })}
          </Grid>
          {total > CollectionLimit && (
            <Box
              display={"flex"}
              alignItems={"center"}
              justifyContent={"right"}
              marginRight={3}
              marginBottom={2}
            >
              <Pagination
                color={"primary"}
                count={
                  parseInt(String(total / NFTLimit)) +
                  (total % NFTLimit > 0 ? 1 : 0)
                }
                page={page}
                onChange={(_event, value) => {
                  onPageChange(Number(value));
                }}
              />
            </Box>
          )}
        </>
      )}
    </BoxStyle>
  );
};
