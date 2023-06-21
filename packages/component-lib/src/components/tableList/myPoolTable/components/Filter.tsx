import { Box, Checkbox, FormControlLabel } from '@mui/material'
import { InputSearch } from '../../../basic-lib'
import { CheckBoxIcon, CheckedIcon } from '@loopring-web/common-resources'
import { WithTranslation, withTranslation } from 'react-i18next'
import { useSettings } from '../../../../stores'
import { useTheme } from '@emotion/react'

export interface FilterProps {
  hideSmallBalances: boolean
  setHideSmallBalances?: (value: boolean) => void
  filter: {
    searchValue: string
  }
  handleFilterChange: (props: { searchValue: string }) => void
}

export const Filter = withTranslation('tables', { withRef: true })(
  ({
    t,
    handleFilterChange,
    filter,
    hideSmallBalances,
    setHideSmallBalances,
  }: FilterProps & WithTranslation) => {
    const { isMobile } = useSettings()
    const theme = useTheme()
    return (
      <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
        <Box>
          {setHideSmallBalances && (
            <FormControlLabel
              style={{
                marginRight: 0,
                paddingRight: 0,
                fontSize: isMobile ? theme.fontDefault.body2 : theme.fontDefault.body1,
              }}
              control={
                <Checkbox
                  checked={hideSmallBalances}
                  checkedIcon={<CheckedIcon />}
                  icon={<CheckBoxIcon />}
                  color='default'
                  onChange={(event) => {
                    setHideSmallBalances(event.target.checked)
                  }}
                />
              }
              label={t('labelHideSmallBalances')}
            />
          )}
        </Box>

        <Box marginLeft={2} width={isMobile ? '60%' : 'initial'}>
          <InputSearch
            value={filter.searchValue}
            onChange={(value: any) => {
              handleFilterChange({ searchValue: value })
            }}
          />
        </Box>
      </Box>
    )
  },
)
