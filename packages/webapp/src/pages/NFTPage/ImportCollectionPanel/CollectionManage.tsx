import { CollectionMeta } from '@loopring-web/common-resources'
import { CollectionManageWrap } from '@loopring-web/component-lib'
import { useCollectionManage } from '@loopring-web/core'

export const CollectionManage = ({ collection }: { collection: CollectionMeta }) => {
  const props = useCollectionManage({ collection })
  return <CollectionManageWrap {...props} />
}
