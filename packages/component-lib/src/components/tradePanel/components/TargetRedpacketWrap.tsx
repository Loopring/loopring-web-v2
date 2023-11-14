import { useTranslation } from 'react-i18next'
import { Box, Typography, Tooltip, DialogTitle, DialogContent } from '@mui/material'
import { CoinSource, SoursURL, TokenType } from '@loopring-web/common-resources'
import { Button, NftImageStyle } from '../../basic-lib'
import { useTheme } from '@emotion/react'
import { CoinIcons } from '../../tableList'
import * as sdk from '@loopring-web/loopring-sdk'

export const TargetRedpacketWrap = (props: {
  exclusiveRedPackets?: (sdk.LuckyTokenItemForReceive & {
    tokenIcon: CoinSource
    tokenName: string
  })[]
  onClickOpenExclusive: (redpacket: sdk.LuckyTokenItemForReceive) => void
}) => {
  const { exclusiveRedPackets, onClickOpenExclusive } = props
  const { t } = useTranslation(['common'])
  const theme = useTheme()
  return (
    <>
      <DialogTitle>
        <Typography variant={'h3'} marginTop={2} textAlign={'center'}>
          {t('labelExclusiveRedpacket')}
        </Typography>
      </DialogTitle>
      <DialogContent style={{ width: '480px', height: '480px' }}>
        <Box marginTop={5} paddingX={4}>
          {exclusiveRedPackets &&
            exclusiveRedPackets.map((redpacket) => (
              <Box
                display={'flex'}
                paddingX={2.5}
                paddingY={1.5}
                borderRadius={1}
                bgcolor={'var(--field-opacity)'}
                justifyContent={'space-between'}
                marginBottom={2}
                key={redpacket.hash}
              >
                <Box display={'flex'} alignItems={'center'}>
                  {redpacket.isNft ? (
                    <NftImageStyle
                      src={redpacket.nftTokenInfo?.metadata?.imageSize['240-240']}
                      style={{
                        width: `${theme.unit * 4}px`,
                        height: `${theme.unit * 4}px`,
                        borderRadius: `${theme.unit * 0.5}px`,
                      }}
                    />
                  ) : (
                    <Box width={theme.unit * 4} height={theme.unit * 4}>
                      <CoinIcons
                        size={theme.unit * 4}
                        type={TokenType.single}
                        tokenIcon={[redpacket.tokenIcon]}
                      />
                    </Box>
                  )}

                  <Typography
                    whiteSpace={'nowrap'}
                    maxWidth={'150px'}
                    overflow={'hidden'}
                    textOverflow={'ellipsis'}
                    marginLeft={1}
                    marginRight={1}
                  >
                    {redpacket.tokenName}
                  </Typography>

                  {redpacket.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX && (
                    <Tooltip title={<>{t('labelRedpacketFromBlindbox')}</>}>
                      <img
                        width={24}
                        height={24}
                        style={{ marginLeft: `${0.5 * theme.unit}px` }}
                        src={
                          theme.mode === 'dark'
                            ? SoursURL + '/images/from_blindbox_dark.png'
                            : SoursURL + '/images/from_blindbox_light.png'
                        }
                      />
                    </Tooltip>
                  )}
                </Box>
                <Button
                  variant={'contained'}
                  onClick={() => {
                    onClickOpenExclusive(redpacket)
                  }}
                >
                  {t('labelRedPacketOpen')}
                </Button>
              </Box>
            ))}
        </Box>
      </DialogContent>
    </>
  )
}
