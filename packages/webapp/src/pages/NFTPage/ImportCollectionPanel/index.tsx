import { Box } from "@mui/material";
import React from "react";
import {
  CollectionMeta,
  BackIcon,
  AccountStatus,
} from "@loopring-web/common-resources";
import { useAccount, useModalData } from "@loopring-web/core";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LoadingBlock,
  StyledPaperBg,
  Button,
} from "@loopring-web/component-lib";
import { CollectionManage } from "./CollectionManage";
import { ImportCollection } from "./ImportCollection";

enum CollectionImportView {
  Guide = "Guide",
  Item = "Item",
}

export const ImportCollectionPanel = <Co extends CollectionMeta>() => {
  const { t } = useTranslation();
  const match: any = useRouteMatch("/nft/importLegacyCollection/:id?");
  const { collectionValue } = useModalData();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const history = useHistory();
  const { account, status: accountStatus } = useAccount();
  const [_collection, setCollection] =
    React.useState<undefined | Co>(undefined);
  const [view, setView] = React.useState<CollectionImportView>(
    searchParams.get("isEdit")
      ? CollectionImportView.Item
      : CollectionImportView.Guide
    // match?.params?.id ? CollectionImportView.Item : CollectionImportView.Guide
  );

  React.useEffect(() => {
    if (
      searchParams.get("isEdit") &&
      match?.params?.id &&
      collectionValue.id === match?.params?.id &&
      account.readyState === AccountStatus.ACTIVATED &&
      collectionValue?.owner?.toLowerCase() === account.accAddress.toLowerCase()
    ) {
      setView(CollectionImportView.Item);
      setCollection(collectionValue as Co);
    } else {
      setView(CollectionImportView.Guide);
      // history.replace("/nft/importLegacyCollection");
    }
  }, [searchParams.get("isEdit"), account.readyState]);
  return (
    <Box flex={1} display={"flex"} flexDirection={"column"} marginBottom={2}>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        marginBottom={2}
      >
        <Button
          startIcon={<BackIcon fontSize={"small"} />}
          variant={"text"}
          size={"medium"}
          sx={{ color: "var(--color-text-secondary)" }}
          color={"inherit"}
          onClick={() => history.push("/nft/myCollection")}
        >
          {t("labelImportCollectionTitle")}
        </Button>
      </Box>
      <StyledPaperBg flex={1} display={"flex"}>
        {view === CollectionImportView.Guide && <ImportCollection />}
        {view === CollectionImportView.Item &&
          (_collection?.owner ? (
            <CollectionManage collection={_collection} />
          ) : (
            <LoadingBlock />
          ))}
      </StyledPaperBg>
    </Box>
  );
};
