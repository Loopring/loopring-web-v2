import { useCollectionImport, useMyCollection } from "@loopring-web/core";
import { ImportCollectionWrap } from "@loopring-web/component-lib";
import { CollectionMeta } from "@loopring-web/common-resources";

export const ImportCollection = <Co extends CollectionMeta>() => {
  const props = useCollectionImport();

  return <ImportCollectionWrap {...{ ...props }} />;
};
