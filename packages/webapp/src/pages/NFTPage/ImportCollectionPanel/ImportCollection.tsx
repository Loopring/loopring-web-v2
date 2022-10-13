import { CollectionMeta } from "@loopring-web/common-resources";
import { useCollectionManage } from "@loopring-web/core";
import {
  CollectionManageWrap,
  ImportCollectionWrap,
} from "@loopring-web/component-lib";

export const ImportCollection = ({
  collection,
}: {
  collection: CollectionMeta;
}) => {
  const props = useCollectionManage({ collection });
  return <ImportCollectionWrap {...props} />;
};
