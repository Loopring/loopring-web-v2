import {
  BtnPercentage,
  ButtonStyle,
  OutlineSelect,
  OutlineSelectItem,
  useSettings,
} from '@loopring-web/component-lib'
import { Box, Divider, FormControlLabel, Grid, Switch, Typography } from '@mui/material'
import { Mark } from '@mui/base'
import { Trans, useTranslation } from 'react-i18next'
import { DropDownIcon, Info2Icon } from '@loopring-web/common-resources'

export const ModifySetting = ({
  onClose,
  maxDuration = 10,
}: {
  maxDuration?: number
  onClose: () => void
}) => {
  const { t } = useTranslation()
  const { dualAuto, setDualDefault } = useSettings()
  return (
    <Box marginTop={-4}>
      <Typography
        component={'header'}
        height={'var(--toolbar-row-height)'}
        display={'flex'}
        paddingX={3}
        flexDirection={'row'}
        alignItems={'center'}
      >
        <Typography component={'span'} display={'inline-flex'} color={'textPrimary'}>
          {t('labelDualAutoReinvest')}
        </Typography>
      </Typography>
      <Divider />
      <Grid item xs={12}>
        <Box paddingX={3} display={'flex'} justifyContent={'space-between'}>
          <Typography
            component={'span'}
            variant={'body1'}
            color={'textPrimary'}
            display={'inline-flex'}
            alignItems={'center'}
          >
            <Trans i18nKey={'labelDualDefaultAutoTitle'}>Default Enable Auto Reinvest</Trans>
          </Typography>

          <Typography component={'span'} variant={'inherit'}>
            <FormControlLabel
              sx={{
                marginRight: 0,
              }}
              onChange={(_e, checked) => {
                setDualDefault({
                  ...dualAuto,
                  auto: checked,
                })
              }}
              control={<Switch color={'primary'} checked={dualAuto.auto} />}
              label={''}
            />
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box paddingX={3} display={'flex'} justifyContent={'space-between'}>
          <Typography
            component={'span'}
            variant={'body1'}
            color={'textPrimary'}
            display={'inline-flex'}
            alignItems={'center'}
            marginY={1}
          >
            <Trans i18nKey={'labelDualLongestSettlementDuration'}>
              Modify Longest Settlement Date
              <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
            </Trans>
          </Typography>
          <OutlineSelect
            aria-label={t('Dual Longest Settlement')}
            IconComponent={DropDownIcon}
            id='DualLongestSettlement'
            value={dualAuto.day !== 'auto' ? 7 : dualAuto.day}
            autoWidth
            onChange={(e) => {
              setDualDefault({
                ...dualAuto,
                day: e.target.value as unknown as any,
              })
            }}
          >
            <OutlineSelectItem value={7}>{t('labelDualLongestSettlementFixed')}</OutlineSelectItem>
            <OutlineSelectItem value={'auto'}>
              {t('labelDualLongestSettlementAutomatic')}
            </OutlineSelectItem>
          </OutlineSelect>
        </Box>
        <Box paddingX={5} marginTop={1}>
          {dualAuto?.day !== 'auto' && (
            <BtnPercentage
              selected={Number(dualAuto?.day ?? 7)}
              handleChanged={(value) => {
                setDualDefault({
                  ...dualAuto,
                  day: value,
                })
              }}
              anchors={
                Array.from({ length: maxDuration }, (_, index) => ({
                  value: index + 1,
                  label:
                    (index + 1) % 5 == 0 || index == 0 || index == maxDuration - 1
                      ? t('labelDayDisplay', { item: index + 1 })
                      : '',
                })) as Mark[]
              }
              min={1}
              max={maxDuration}
              valueLabelDisplay='on'
              valuetext={(item) => t('labelDayDisplay', { item })}
              step={1}
            />
          )}
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box paddingX={3} marginY={2}>
          <ButtonStyle
            fullWidth
            variant={'contained'}
            size={'medium'}
            color={'primary'}
            onClick={() => {
              onClose()
            }}
          >
            {t('labelDualSettingConfirm')}
          </ButtonStyle>
        </Box>
      </Grid>
    </Box>
  )
}
