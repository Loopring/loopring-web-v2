import { AddIcon, DeleteIcon, MetaProperty, PROPERTY_LIMIT } from '@loopring-web/common-resources'
import { Trans, useTranslation } from 'react-i18next'
import { Button, TextField } from '../../../basic-lib'
import { Box, Grid, IconButton, Typography } from '@mui/material'
import React, { ForwardedRef } from 'react'

export const Properties = ({
  properties = [],
  handleChange,
  disabled = false,
}: {
  disabled?: boolean
  properties: MetaProperty[]
  handleChange: (properties: Array<Partial<MetaProperty>>) => void
}) => {
  const { t } = useTranslation()
  const _handleChange = React.useCallback(
    (_property: Partial<MetaProperty>, index: number) => {
      let _properties = [...properties]
      _properties[index] = { ...(_properties[index] ?? {}), ..._property }
      handleChange(_properties)
      // properties.filter((item,_index) => index!== )
      // properties[index]
    },
    [properties, handleChange],
  )
  const onDelete = React.useCallback(
    (index: number) => {
      let _properties = [...properties]
      if (_properties.length > 1) {
        handleChange(_properties.filter((_item, _index) => _index !== index))
      }
    },
    [handleChange, properties],
  )
  const addItem = React.useCallback(() => {
    if (properties.length < PROPERTY_LIMIT) {
      let _properties = [...properties, { key: '', value: '' }]
      handleChange(_properties)
    }
  }, [handleChange, properties])
  React.useEffect(() => {
    if (!properties.length) {
      addItem()
    }
  }, [])
  return (
    <Box>
      {properties.map((property, index) => (
        <Grid container key={index} spacing={2} marginBottom={1.5} alignItems={'center'}>
          <Property
            disabled={disabled}
            property={property}
            index={index}
            handleChange={_handleChange}
            onDelete={onDelete}
          />
        </Grid>
      ))}
      {properties.length < PROPERTY_LIMIT && (
        <Box paddingTop={1}>
          <Button
            startIcon={<AddIcon />}
            size={'small'}
            disabled={disabled}
            variant={'outlined'}
            // variant={"contained"}
            onClick={addItem}
            title={t('labelPropertyAdd')}
          >
            {t('labelPropertyAdd')}
          </Button>
        </Box>
      )}
    </Box>
  )
}
export const Property = React.memo(
  React.forwardRef(
    (
      {
        property,
        index,
        handleChange,
        onDelete,
        disabled = false,
      }: {
        disabled?: boolean
        property: MetaProperty
        index: number
        handleChange: (property: Partial<MetaProperty>, index: number) => void
        onDelete: (index: number) => void
      },
      ref: ForwardedRef<any>,
    ) => {
      // const [,] = React.useState<Partial<MetaProperty>>();
      const _handleChange = React.useCallback(
        (_property: Partial<MetaProperty>) => {
          handleChange({ ...property, ..._property }, index)
        },
        [handleChange, index, property],
      )

      return (
        <>
          <Grid item xs={5} ref={ref}>
            <TextField
              disabled={disabled}
              value={property.key}
              inputProps={{ maxLength: 10 }}
              fullWidth
              label={<Trans i18nKey={'labelMintPropertyKey'}>key</Trans>}
              type={'text'}
              onChange={(e) => _handleChange({ key: e.target.value })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              disabled={disabled}
              value={property.value}
              inputProps={{ maxLength: 20 }}
              fullWidth
              label={<Trans i18nKey={'labelMintPropertyValue'}>value</Trans>}
              type={'text'}
              onChange={(e) => _handleChange({ value: e.target.value })}
            />
          </Grid>
          <Grid item xs={1} display={'flex'} alignItems={'center'} justifyContent={'center'}>
            <Typography color={'var(--color-button-icon)'}>
              <IconButton
                sx={{ marginTop: 3 }}
                edge={'end'}
                size={'large'}
                disabled={disabled}
                // disabled={properties.length === 1 ? true : false}
                onClick={() => onDelete(index)}
              >
                <DeleteIcon />
              </IconButton>
            </Typography>
          </Grid>
        </>
      )
    },
  ),
)
// export const PropertyReview = React.memo(
//   React.forwardRef(
//     ({
//       property,
//       index,
//       handleChange,
//       onDelete,
//     }: {
//       property: MetaProperty;
//       index: number;
//       handleChange: (property: Partial<MetaProperty>, index: number) => void;
//       onDelete: (index: number) => void;
//     }) => {
//       // const [,] = React.useState<Partial<MetaProperty>>();
//       const _handleChange = React.useCallback(
//         (_property: Partial<MetaProperty>) => {
//           handleChange({ ...property, ..._property }, index);
//         },
//         [handleChange, index, property]
//       );
//
//       return (
//         <>
//           <Grid item xs={5}>
//             <TextField
//               value={property.key}
//               fullWidth
//               label={<Trans i18nKey={"labelMintPropertyKey"}>key</Trans>}
//               type={"text"}
//               onChange={(e) => _handleChange({ key: e.target.value })}
//             />
//           </Grid>
//           <Grid item xs={6}>
//             <TextField
//               value={property.value}
//               fullWidth
//               label={<Trans i18nKey={"labelMintPropertyValue"}>value</Trans>}
//               type={"text"}
//               onChange={(e) => _handleChange({ value: e.target.value })}
//             />
//           </Grid>
//           <Grid
//             item
//             xs={1}
//             display={"flex"}
//             alignItems={"center"}
//             justifyContent={"center"}
//           >
//             <IconButton
//               sx={{ marginTop: 3 }}
//               edge={"end"}
//               // disabled={properties.length === 1 ? true : false}
//               onClick={() => onDelete(index)}
//             >
//               <DeleteIcon color={"error"} />
//             </IconButton>
//           </Grid>
//         </>
//       );
//     }
//   )
// );
