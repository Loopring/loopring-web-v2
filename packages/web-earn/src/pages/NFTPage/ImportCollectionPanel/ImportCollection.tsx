import { ImportCollectionWrap } from '@loopring-web/component-lib'
import { CollectionMeta } from '@loopring-web/common-resources'
import { useCollectionImport } from '@loopring-web/core'

export const ImportCollection = <Co extends CollectionMeta>() => {
  const props = useCollectionImport()

  return <ImportCollectionWrap {...{ ...props }} />
}
