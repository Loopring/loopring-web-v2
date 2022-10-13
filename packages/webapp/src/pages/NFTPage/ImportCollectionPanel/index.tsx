import { Box, Button } from "@mui/material";
import React from "react";
import {
  CollectionMeta,
  BackIcon,
  AccountStatus,
} from "@loopring-web/common-resources";
import { useAccount } from "@loopring-web/core";
import { useHistory, useRouteMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ImportCollectionWrap,
  LoadingBlock,
} from "@loopring-web/component-lib";
import { CollectionManage } from "./CollectionManage";
import { ImportCollection } from "./ImportCollection";

enum CollectionImportView {
  Guide = "Guide",
  Item = "Item",
}

export const ImportCollectionPanel = <Co extends CollectionMeta>({
  collection,
}: {
  collection?: undefined | Co;
}) => {
  const { t } = useTranslation();
  const match: any = useRouteMatch("/nft/importLegacyCollection/:id?");
  const history = useHistory();
  const { account, status: accountStatus } = useAccount();
  const [_collection, setCollection] =
    React.useState<undefined | Co>(undefined);
  const [view, setView] = React.useState<CollectionImportView>(
    match?.params?.id ? CollectionImportView.Item : CollectionImportView.Guide
  );

  React.useEffect(() => {
    if (match?.params?.id && account.readyState === AccountStatus.ACTIVATED) {
      if (
        collection?.owner?.toLowerCase() === account.accAddress.toLowerCase()
      ) {
        setView(CollectionImportView.Item);
        setCollection(collection);
      } else if (
        collection?.owner.toLowerCase() !== account.accAddress.toLowerCase()
      ) {
        setView(CollectionImportView.Guide);
        history.replace("/nft/importLegacyCollection");
      } else {
        // TODO await do....getCollectionByID check is Legacy else
        // setCollection()
        setView(CollectionImportView.Guide);
        history.replace("/nft/importLegacyCollection");
      }

      // const loopringId = match.params.id.split("--")[0];
      // if (loopringId && detail) {
      //   setView(MyCollectionView.Item);
      //   return;
      // }
    } else {
      setView(CollectionImportView.Guide);
      history.replace("/nft/importLegacyCollection");
    }
  }, [match?.params?.id, account.readyState]);
  return (
    <Box flex={1} display={"flex"} flexDirection={"column"}>
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
          onClick={history.goBack}
        >
          {t("labelImportCollectionTitel")}
        </Button>
      </Box>
      <Box flex={1} display={"flex"}>
        {view === CollectionImportView.Guide && <ImportCollection />}
        {view === CollectionImportView.Item &&
          (_collection?.owner ? (
            <CollectionManage collection={_collection} />
          ) : (
            <LoadingBlock />
          ))}
      </Box>
    </Box>
  );
};
