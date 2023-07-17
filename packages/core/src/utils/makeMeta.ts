import { CollectionMeta, MakeMeta } from '@loopring-web/common-resources'

export const makeMeta: MakeMeta = ({
  collection,
  domain,
}: {
  collection: CollectionMeta
  domain: string
}) => {
  const metaDemo = {
    name: '`${NFT_NAME}`',
    description: '`${NFT_DESCRIPTION}`',
    image: 'ipfs://`${CID}`',
    animation_url: 'ipfs://`${CID}`',
    collection_metadata: `${domain}/${collection.contractAddress}`,
    royalty_percentage: '`[0..10] (int 0-10)`',
    attributes: [
      {
        trait_type: '`${PROPERTIES_KEY}`',
        value: '`${VALUE}`',
      },
    ],
    properties: {
      '`${PROPERTIES_KEY}`': '`${VALUE}`',
    },
  }
  return { metaDemo }
}
