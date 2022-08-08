import { CardStyleItem, CollectionMedia } from '@loopring-web/component-lib';
import { Box, Grid, Typography } from '@mui/material';
import { EmptyValueTag } from '@loopring-web/common-resources';
import React from 'react';
import { NFTCollection } from '@loopring-web/loopring-sdk';

export const CollectionItem = React.memo(React.forwardRef(({
                                                             item,
                                                             index
                                                           }: { item: NFTCollection, index: number }, _ref: React.Ref<any>) => {
  return <CardStyleItem ref={_ref}>
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
        // onNFTReload={onNFTReload}
        onRenderError={() => undefined}
      />
      <Box
        padding={2}
        height={80}
        display={"flex"}
        flexDirection={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
        // flexWrap={"wrap"}
      >
        <Box
          display={"flex"}
          flexDirection={"column"}
          width={"60%"}
        >
          <Typography
            color={"text.secondary"}
            component={"h6"}
            whiteSpace={"pre"}
            overflow={"hidden"}
            textOverflow={"ellipsis"}
          >
            {item?.name ?? EmptyValueTag}
          </Typography>

        </Box>
      </Box>
    </Box>
  </CardStyleItem>


}))