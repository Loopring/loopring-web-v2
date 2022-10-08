import {
  AccountStatus,
  CollectionMeta,
  SagaStatus,
} from "@loopring-web/common-resources";
import { collectionService } from "@loopring-web/core";
import { BigNumber } from "bignumber.js";
import React from "react";
import { useAccount } from "@loopring-web/core";
import { useHistory, useRouteMatch } from "react-router-dom";

import { useEditCollection } from "./useEditCollection";

BigNumber.config({ EXPONENTIAL_AT: 100 });
export const useCollectionPanel = <T extends CollectionMeta>() => {
  let match: any = useRouteMatch("/NFT/:item?/:id");
  const isEdit = match?.params?.item === "editCollection";
  const history = useHistory();
  const {
    keys,
    collectionToastOpen,
    collectionToastClose,
    onFilesLoad,
    onDelete,
    btnStatus,
    btnInfo,
    disabled,
    handleOnDataChange,
    collectionValue,
    onSubmitClick,
  } = useEditCollection({ isEdit });
  const { account, status: accountStatus } = useAccount();

  React.useEffect(() => {
    if (
      accountStatus === SagaStatus.UNSET &&
      account.readyState === AccountStatus.ACTIVATED &&
      match?.params.item === "addCollection"
    ) {
      collectionService.emptyData();
    } else if (match?.params.item === "editCollection" && match?.params?.id) {
      const loopringId = match?.params?.id.split("-")[0];
      if (collectionValue?.id?.toString() === loopringId.toString()) {
      } else {
        history.push("/nft/myCollection");
      }
    }
  }, [accountStatus, account.readyState]);

  return {
    keys,
    collectionToastOpen,
    collectionToastClose,
    onFilesLoad,
    onDelete,
    btnStatus,
    btnInfo,
    disabled,
    handleOnDataChange,
    collectionValue,
    onSubmitClick,
  };
};
