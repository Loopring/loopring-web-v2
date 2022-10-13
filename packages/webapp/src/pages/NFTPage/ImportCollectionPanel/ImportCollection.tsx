import { useCollectionImport } from "@loopring-web/core";
import { ImportCollectionWrap } from "@loopring-web/component-lib";

export const ImportCollection = () => {
  const props = useCollectionImport();
  return <ImportCollectionWrap {...{ ...props }} />;
};
