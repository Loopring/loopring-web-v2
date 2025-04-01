import {
  Box,
  Container,
  Typography,
  Modal,
  Tooltip,
  Button,
  Divider,
  IconButton,
  Tab, 
  Tabs,
  styled,
} from '@mui/material'
import React from 'react'
import {
  MarginLevelIcon,
  PriceTag,
  CurrencyToTag,
  HiddenTag,
  getValuePrecisionThousand,
  EmptyValueTag,
  VaultAction,
  L1L2_NAME_DEFINED,
  UpColor,
  Info2Icon,
  SoursURL,
  RouterPath,
  VaultKey,
  TradeBtnStatus,
  WarningIcon2,
  hexToRGB,
  OrderListIcon,
  ViewIcon,
  HideIcon,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import {
  MarketDetail,
  ModalCloseButton,
  ModalCloseButtonPosition,
  SwitchPanelStyled,
  VaultAssetsTable,
  Button as MyButton,
  VaultJoinPanelModal,
  VaultPositionsTable,
  Toast,
  useSettings,
} from '@loopring-web/component-lib'
import { Trans } from 'react-i18next'
import {
  fiatNumberDisplay,
  useVaultJoin,
  VaultAccountInfoStatus,
  ViewAccountTemplate,
} from '@loopring-web/core'
import {
  AutoRepayConfirmModal,
  CloseAllConfirmModal,
  CloseConfirmModal,
  CollateralDetailsModal,
  DebtModal,
  DustCollectorModal,
  DustCollectorUnAvailableModal,
  LeverageModal,
  MaximumCreditModal,
  NoAccountHintModal,
  SmallOrderAlert,
  SupplyCollateralHintModal,
  VaultSwapModal
} from './modals'
import { marginLevelTypeToColor } from '@loopring-web/component-lib/src/components/tradePanel/components/VaultWrap/utils'
import { marginLevelType } from '@loopring-web/core/src/hooks/useractions/vault/utils'
import { useVaultDashboard } from '../hooks/useVaultDashBoard'
import { VaultDashBoardPanelUIProps } from '../interface'
import { useVaultSwap } from '../hooks/useVaultSwap'

const BgButton = styled(Button)<{ customBg: string }>`
  background-color: ${({ customBg }) => customBg};
  transition: all 0.2s ease-in-out;
  &:hover {
    background-color: ${({ customBg }) => customBg};
    opacity: 0.8;
  }
  &:disabled {
    background-color: var(--color-button-disabled);
  }
  
`
// const VaultDashBoardPanelUI: React.FC<VaultDashBoardPanelUIProps> = ({
//   t,
//   forexMap,
//   theme,
//   isMobile,
//   currency,
//   hideAssets,
//   upColor,
//   priceTag,
//   showMarginLevelAlert,
//   vaultAccountInfo,
//   positionOpend,
//   localState,
//   setLocalState,
//   colors,
//   assetPanelProps,
//   marketProps,
//   vaultTokenMap,
//   vaultTickerMap,
//   VaultDustCollector,
//   isShowVaultJoin,
//   // onActionBtnClick,
//   onBtnClose,
//   showNoVaultAccount,
//   btnProps,
//   dialogBtn,
//   detail,
//   setShowDetail,
//   hideLeverage,
//   activeInfo,
//   walletMap,
//   _vaultAccountInfo,
//   tokenPrices,
//   getValueInCurrency,
//   history,
//   etherscanBaseUrl
//   network,
// }) => {
//   return (
//     <Box flex={1} display={'flex'} flexDirection={'column'}>
//       <Container
//         maxWidth='lg'
//         style={{
//           display: 'flex',
//           flexDirection: 'column',
//           flex: 1,
//         }}
//       >
//         <ViewAccountTemplate
//           activeViewTemplate={
//             <>
//               {showMarginLevelAlert && (
//                 <Box
//                   paddingY={1}
//                   paddingX={2.5}
//                   borderRadius={'8px'}
//                   bgcolor={hexToRGB(theme.colorBase.error, 0.2)}
//                   display={'flex'}
//                   marginTop={3}
//                 >
//                   <WarningIcon2
//                     color={'error'}
//                     style={{
//                       width: '24px',
//                       height: '24px',
//                     }}
//                   />
//                   <Typography marginLeft={0.5}>{t('labelVaultMarginLevelAlert')}</Typography>
//                 </Box>
//               )}
//               <Box mt={3}>

                
//               </Box>

//               <Grid container spacing={3} marginTop={showMarginLevelAlert ? -1 : 3}>
//                 <Grid item sm={9} xs={12} flex={1} display={'flex'}>
//                   <Box
//                     border={'var(--color-border) 1px solid'}
//                     borderRadius={1.5}
//                     flex={1}
//                     display={'flex'}
//                     flexDirection={'column'}
//                     padding={2}
//                     paddingBottom={1.5}
//                     justifyContent={'space-between'}
//                   >
//                     <Box
//                       display={'flex'}
//                       flexDirection={'row'}
//                       justifyContent={'space-between'}
//                       alignItems={'start'}
//                     >
//                       <Box>
//                         <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
//                           {t('labelVaultTotalBalance')}
//                         </Typography>
//                         <Typography
//                           component={'span'}
//                           display={'flex'}
//                           alignItems={'center'}
//                           justifyContent={'flex-start'}
//                           marginTop={1}
//                         >
//                           <Typography component={'span'} variant={'h1'}>
//                             {!hideAssets &&
//                               !sdk.toBig(vaultAccountInfo?.totalBalanceOfUsdt ?? 0).eq('0') &&
//                               priceTag}
//                           </Typography>
//                           {!hideAssets ? (
//                             <Typography component={'span'} variant={'h1'}>
//                               {vaultAccountInfo?.totalBalanceOfUsdt &&
//                               !sdk.toBig(vaultAccountInfo?.totalBalanceOfUsdt ?? 0).eq('0')
//                                 ? getValuePrecisionThousand(
//                                     sdk
//                                       .toBig(vaultAccountInfo?.totalBalanceOfUsdt ?? 0)
//                                       .times(forexMap[currency] ?? 0),
//                                     2,
//                                     2,
//                                     2,
//                                     true,
//                                     { floor: true },
//                                   )
//                                 : EmptyValueTag}
//                             </Typography>
//                           ) : (
//                             <Typography component={'span'} variant={'h1'}>
//                               {HiddenTag}
//                             </Typography>
//                           )}
//                         </Typography>
//                       </Box>
//                       <Box display={'inline-flex'} flexDirection={'row'} alignItems={'center'}>
//                         <Typography
//                           component={'span'}
//                           variant={'body1'}
//                           paddingRight={1}
//                           display={'inline-flex'}
//                           color={'textSecondary'}
//                         >
//                           {t('labelVaultOpenDate')}
//                         </Typography>
//                         <Typography component={'span'} variant={'body1'} color={'textPrimary'}>
//                           {vaultAccountInfo?.accountStatus === sdk.VaultAccountStatus.IN_STAKING
//                             ? moment(new Date(vaultAccountInfo?.openDate)).format(
//                                 YEAR_DAY_MINUTE_FORMAT,
//                               )
//                             : EmptyValueTag}
//                         </Typography>
//                       </Box>
//                     </Box>
//                     {positionOpend ? (
//                       <Box
//                         display={'flex'}
//                         flexWrap={'nowrap'}
//                         flexDirection={'row'}
//                         justifyContent={'space-between'}
//                       >
//                         <Box>
//                           <Tooltip
//                             title={
//                               <Box>
//                                 <Typography marginBottom={1} variant={'body2'}>
//                                   {t('labelVaultMarginLevelTooltips')}
//                                 </Typography>
//                                 <Typography marginBottom={1} variant={'body2'}>
//                                   {t('labelVaultMarginLevelTooltips2')}
//                                 </Typography>
//                                 <Typography marginBottom={1} variant={'body2'}>
//                                   {t('labelVaultMarginLevelTooltips3')}
//                                 </Typography>
//                                 <Typography
//                                   color={'var(--color-success)'}
//                                   marginBottom={1}
//                                   variant={'body2'}
//                                 >
//                                   {t('labelVaultMarginLevelTooltips4')}
//                                 </Typography>
//                                 <Typography marginBottom={1} variant={'body2'}>
//                                   {t('labelVaultMarginLevelTooltips5')}
//                                 </Typography>
//                                 <Typography
//                                   color={'var(--color-warning)'}
//                                   marginBottom={1}
//                                   variant={'body2'}
//                                 >
//                                   {t('labelVaultMarginLevelTooltips6')}
//                                 </Typography>
//                                 <Typography marginBottom={1} variant={'body2'}>
//                                   {t('labelVaultMarginLevelTooltips7')}
//                                 </Typography>
//                                 <Typography
//                                   color={'var(--color-error)'}
//                                   marginBottom={1}
//                                   variant={'body2'}
//                                 >
//                                   {t('labelVaultMarginLevelTooltips8')}
//                                 </Typography>
//                                 <Typography marginBottom={1} variant={'body2'}>
//                                   {t('labelVaultMarginLevelTooltips9')}
//                                 </Typography>
//                                 <Typography
//                                   color={'var(--color-text-primary)'}
//                                   marginBottom={1}
//                                   variant={'body2'}
//                                 >
//                                   {t('labelVaultMarginLevelTooltips10')}
//                                 </Typography>
//                                 <Typography marginBottom={1} variant={'body2'}>
//                                   {t('labelVaultMarginLevelTooltips11')}
//                                 </Typography>
//                               </Box>
//                             }
//                             placement={'right'}
//                           >
//                             <Typography
//                               component={'h4'}
//                               variant={'body1'}
//                               color={'textSecondary'}
//                               display={'flex'}
//                               alignItems={'center'}
//                             >
//                               {t('labelVaultMarginLevel')}
//                               <Info2Icon color={'inherit'} sx={{ marginLeft: 1 / 2 }} />
//                             </Typography>
//                           </Tooltip>
//                           {(() => {
//                             const item = vaultAccountInfo?.marginLevel ?? '0'
//                             return (
//                               <>
//                                 {vaultAccountInfo?.marginLevel ? (
//                                   <Typography
//                                     component={'span'}
//                                     display={'inline-flex'}
//                                     alignItems={'center'}
//                                     marginTop={1}
//                                     variant={'body1'}
//                                     color={marginLevelTypeToColor(marginLevelType(item))}
//                                   >
//                                     <MarginLevelIcon sx={{ marginRight: 1 / 2 }} />
//                                     {item}
//                                   </Typography>
//                                 ) : (
//                                   <Typography
//                                     component={'span'}
//                                     display={'inline-flex'}
//                                     alignItems={'center'}
//                                     marginTop={1}
//                                     variant={'body1'}
//                                     color={'textSecondary'}
//                                   >
//                                     <MarginLevelIcon sx={{ marginRight: 1 / 2 }} />
//                                     {EmptyValueTag}
//                                   </Typography>
//                                 )}
//                               </>
//                             )
//                           })()}
//                         </Box>
//                         <Box>
//                           <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
//                             {t('labelVaultTotalCollateral')}
//                           </Typography>
//                           <Typography
//                             component={'span'}
//                             marginTop={1}
//                             display={'inline-flex'}
//                             variant={'body1'}
//                             color={'textPrimary'}
//                             alignItems={'center'}
//                           >
//                             {vaultAccountInfo?.accountStatus === sdk.VaultAccountStatus.IN_STAKING
//                               ? hideAssets
//                                 ? HiddenTag
//                                 : PriceTag[CurrencyToTag[currency]] +
//                                   getValuePrecisionThousand(
//                                     Number(vaultAccountInfo?.totalCollateralOfUsdt ?? 0) *
//                                       (forexMap[currency] ?? 0),
//                                     2,
//                                     2,
//                                     2,
//                                     false,
//                                     { isFait: true, floor: true },
//                                   )
//                               : EmptyValueTag}
//                             <Typography
//                               variant={'body2'}
//                               sx={{ cursor: 'pointer' }}
//                               color={'var(--color-primary)'}
//                               marginLeft={1}
//                               component={'span'}
//                               onClick={() => {
//                                 setLocalState({
//                                   ...localState,
//                                   modalStatus: 'collateralDetails',
//                                 })
//                               }}
//                             >
//                               {t('labelVaultDetails')}
//                             </Typography>
//                           </Typography>
//                         </Box>
//                         <Box>
//                           <Tooltip
//                             title={t('labelVaultTotalDebtTooltips').toString()}
//                             placement={'top'}
//                           >
//                             <Typography
//                               component={'h4'}
//                               variant={'body1'}
//                               color={'textSecondary'}
//                               display={'flex'}
//                               alignItems={'center'}
//                             >
//                               {t('labelVaultTotalDebt')}
//                               <Info2Icon color={'inherit'} sx={{ marginLeft: 1 / 2 }} />
//                             </Typography>
//                           </Tooltip>
//                           <Typography
//                             component={'span'}
//                             marginTop={1}
//                             display={'inline-flex'}
//                             variant={'body1'}
//                             color={'textPrimary'}
//                             alignItems={'center'}
//                           >
//                             {vaultAccountInfo?.accountStatus === sdk.VaultAccountStatus.IN_STAKING
//                               ? hideAssets
//                                 ? HiddenTag
//                                 : PriceTag[CurrencyToTag[currency]] +
//                                   getValuePrecisionThousand(
//                                     Number(vaultAccountInfo?.totalDebtOfUsdt ?? 0) *
//                                       (forexMap[currency] ?? 0),
//                                     2,
//                                     2,
//                                     2,
//                                     false,
//                                     { isFait: true, floor: true },
//                                   )
//                               : EmptyValueTag}
//                             <Typography
//                               variant={'body2'}
//                               sx={{ cursor: 'pointer' }}
//                               color={'var(--color-primary)'}
//                               marginLeft={1}
//                               component={'span'}
//                               onClick={() => {
//                                 setLocalState({
//                                   ...localState,
//                                   modalStatus: 'debt',
//                                 })
//                               }}
//                             >
//                               {t('labelVaultDetails')}
//                             </Typography>
//                           </Typography>
//                         </Box>
//                         {!hideLeverage && (
//                           <Box position={'relative'} width={'120px'}>
//                             <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
//                               {t('labelVaultLeverage')}
//                             </Typography>
//                             <Typography
//                               component={'span'}
//                               marginTop={1}
//                               display={'inline-flex'}
//                               variant={'body1'}
//                               color={'textPrimary'}
//                               alignItems={'center'}
//                             >
//                               {vaultAccountInfo?.leverage
//                                 ? `${vaultAccountInfo?.leverage}x`
//                                 : EmptyValueTag}
//                               <Typography
//                                 variant={'body2'}
//                                 sx={{ cursor: 'pointer' }}
//                                 color={'var(--color-primary)'}
//                                 marginLeft={1}
//                                 component={'span'}
//                                 onClick={() => {
//                                   setLocalState({
//                                     ...localState,
//                                     modalStatus: 'leverage',
//                                   })
//                                 }}
//                               >
//                                 {t('labelVaultDetails')}
//                               </Typography>
//                             </Typography>
//                             <Typography
//                               marginTop={0.5}
//                               width={'200px'}
//                               color={'var(--color-text-secondary)'}
//                               variant={'body2'}
//                             >
//                               {t('labelVaultMaximumCredit')}:{' '}
//                               {(vaultAccountInfo as any)?.maxCredit &&
//                               getValueInCurrency((vaultAccountInfo as any)?.maxCredit)
//                                 ? fiatNumberDisplay(
//                                     getValueInCurrency((vaultAccountInfo as any)?.maxCredit),
//                                     currency,
//                                   )
//                                 : EmptyValueTag}
//                             </Typography>
//                           </Box>
//                         )}
//                         <Box>
//                           <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
//                             {t('labelVaultProfit')}
//                           </Typography>
//                           <Typography
//                             component={'span'}
//                             display={'flex'}
//                             marginTop={1}
//                             variant={'body1'}
//                             color={'textPrimary'}
//                           >
//                             {(() => {
//                               const profit =
//                                 (vaultAccountInfo as any)?.accountType === 0
//                                   ? sdk
//                                       .toBig(vaultAccountInfo?.totalEquityOfUsdt ?? 0)
//                                       .minus(vaultAccountInfo?.totalCollateralOfUsdt ?? 0)
//                                   : sdk
//                                       .toBig(vaultAccountInfo?.totalBalanceOfUsdt ?? 0)
//                                       .minus(vaultAccountInfo?.totalDebtOfUsdt ?? 0)
//                               const colorsId = upColor === UpColor.green ? [0, 1] : [1, 0]
//                               const colorIs = profit.gte(0) ? colorsId[0] : colorsId[1]
//                               return (
//                                 <>
//                                   {vaultAccountInfo?.accountStatus ===
//                                   sdk.VaultAccountStatus.IN_STAKING ? (
//                                     <>
//                                       <Typography
//                                         component={'span'}
//                                         display={'flex'}
//                                         variant={'body1'}
//                                         color={'textPrimary'}
//                                       >
//                                         {hideAssets
//                                           ? HiddenTag
//                                           : PriceTag[CurrencyToTag[currency]] +
//                                             getValuePrecisionThousand(
//                                               profit.times(forexMap[currency] ?? 0).toString(),
//                                               2,
//                                               2,
//                                               2,
//                                               false,
//                                               {
//                                                 isFait: false,
//                                                 floor: true,
//                                               },
//                                             )}
//                                       </Typography>
//                                       <Typography
//                                         component={'span'}
//                                         display={'flex'}
//                                         variant={'body1'}
//                                         marginLeft={1 / 2}
//                                         color={colors[colorIs]}
//                                       >
//                                         {getValuePrecisionThousand(
//                                           profit
//                                             ?.div(
//                                               Number(vaultAccountInfo?.totalCollateralOfUsdt)
//                                                 ? vaultAccountInfo?.totalCollateralOfUsdt
//                                                 : 1,
//                                             )
//                                             .times(100) ?? 0,
//                                           2,
//                                           2,
//                                           2,
//                                           false,
//                                           {
//                                             isFait: false,
//                                             floor: true,
//                                           },
//                                         )}
//                                         %
//                                       </Typography>
//                                     </>
//                                   ) : (
//                                     EmptyValueTag
//                                   )}
//                                 </>
//                               )
//                             })()}
//                           </Typography>
//                         </Box>
//                       </Box>
//                     ) : (
//                       <Box>
//                         <Button
//                           sx={{ minWidth: 'var(--walletconnect-width)' }}
//                           onClick={_vaultAccountInfo.onJoinPop}
//                           variant={'contained'}
//                         >
//                           {t('labelVaultJoinBtn')}
//                         </Button>
//                       </Box>
//                     )}
//                   </Box>
//                 </Grid>
//                 <Grid item sm={3} xs={12}>
//                   <Box
//                     border={'var(--color-border) 1px solid'}
//                     borderRadius={1.5}
//                     display={'flex'}
//                     flexDirection={'column'}
//                     justifyContent={'stretch'}
//                     paddingY={3}
//                   >
//                     <MenuBtnStyled
//                       variant={'outlined'}
//                       size={'large'}
//                       className={`vaultBtn  ${isMobile ? 'isMobile' : ''}`}
//                       fullWidth
//                       endIcon={<ConvertToIcon fontSize={'medium'} color={'inherit'} />}
//                       onClick={(_e) => {
//                         // _vaultAccountInfo.onLoanPop()
//                         onActionBtnClick(VaultAction.VaultLoan)
//                       }}
//                     >
//                       <Typography
//                         component={'span'}
//                         variant={'inherit'}
//                         color={'inherit'}
//                         display={'inline-flex'}
//                         alignItems={'center'}
//                         lineHeight={'1.2em'}
//                         sx={{
//                           textIndent: 0,
//                           textAlign: 'left',
//                         }}
//                       >
//                         <Box
//                           marginRight={1}
//                           component={'img'}
//                           src={`${SoursURL}svg/vault_loan_${theme.mode}.svg`}
//                         />
//                         {t('labelVaultLoanBtn')}
//                       </Typography>
//                     </MenuBtnStyled>
//                     <MenuBtnStyled
//                       variant={'outlined'}
//                       size={'large'}
//                       className={`vaultBtn  ${isMobile ? 'isMobile' : ''}`}
//                       fullWidth
//                       endIcon={<ConvertToIcon fontSize={'medium'} color={'inherit'} />}
//                       onClick={(_e) => {
//                         onActionBtnClick(VaultAction.VaultJoin)
//                       }}
//                     >
//                       <Typography
//                         component={'span'}
//                         variant={'inherit'}
//                         color={'inherit'}
//                         display={'inline-flex'}
//                         alignItems={'center'}
//                         lineHeight={'1.2em'}
//                         sx={{
//                           textIndent: 0,
//                           textAlign: 'left',
//                         }}
//                       >
//                         <Box
//                           marginRight={1}
//                           component={'img'}
//                           src={`${SoursURL}svg/vault_margin_${theme.mode}.svg`}
//                         />
//                         {t('labelVaultCollateralManagement')}
//                       </Typography>
//                     </MenuBtnStyled>
//                     <MenuBtnStyled
//                       variant={'outlined'}
//                       size={'large'}
//                       className={`vaultBtn  ${isMobile ? 'isMobile' : ''}`}
//                       fullWidth
//                       endIcon={<ConvertToIcon fontSize={'medium'} color={'inherit'} />}
//                       onClick={(_e) => {
//                         onActionBtnClick(VaultAction.VaultSwap)
//                       }}
//                     >
//                       <Typography
//                         component={'span'}
//                         variant={'inherit'}
//                         color={'inherit'}
//                         display={'inline-flex'}
//                         alignItems={'center'}
//                         lineHeight={'1.2em'}
//                         sx={{
//                           textIndent: 0,
//                           textAlign: 'left',
//                         }}
//                       >
//                         <Box
//                           marginRight={1}
//                           component={'img'}
//                           src={`${SoursURL}svg/vault_trade_${theme.mode}.svg`}
//                         />
//                         {t('labelVaultTradeBtn')}
//                       </Typography>
//                     </MenuBtnStyled>
//                     <MenuBtnStyled
//                       variant={'outlined'}
//                       size={'large'}
//                       className={`vaultBtn  ${isMobile ? 'isMobile' : ''}`}
//                       fullWidth
//                       endIcon={<ConvertToIcon fontSize={'medium'} color={'inherit'} />}
//                       onClick={(_e) => {
//                         onActionBtnClick(VaultAction.VaultExit)
//                       }}
//                     >
//                       <Typography
//                         component={'span'}
//                         variant={'inherit'}
//                         color={'inherit'}
//                         display={'inline-flex'}
//                         alignItems={'center'}
//                         lineHeight={'1.2em'}
//                         sx={{
//                           textIndent: 0,
//                           textAlign: 'left',
//                         }}
//                       >
//                         <Box
//                           marginRight={1}
//                           component={'img'}
//                           src={`${SoursURL}svg/vault_close_${theme.mode}.svg`}
//                         ></Box>
//                         {t('labelVaultRedeemBtn')}
//                       </Typography>
//                     </MenuBtnStyled>
//                   </Box>
//                 </Grid>
//               </Grid>
//               <Box
//                 flex={1}
//                 display={'flex'}
//                 flexDirection={'column'}
//                 border={'var(--color-border) 1px solid'}
//                 borderRadius={1.5}
//                 marginY={3}
//                 paddingY={2}
//               >
//                 <VaultAssetsTable
//                   {...assetPanelProps}
//                   onRowClick={(index, row) => {
//                     // @ts-ignore
//                     marketProps.onRowClick(index, {
//                       // @ts-ignore
//                       ...vaultTokenMap[row.name],
//                       // @ts-ignore
//                       cmcTokenId: vaultTickerMap[row.erc20Symbol].tokenId,
//                       ...vaultTickerMap[row.erc20Symbol],
//                     })
//                   }}
//                   onClickDustCollector={() => {
//                     if (VaultDustCollector.enable) {
//                       setLocalState({
//                         ...localState,
//                         modalStatus: 'dustCollector',
//                       })
//                     } else {
//                       setLocalState({
//                         ...localState,
//                         modalStatus: 'dustCollectorUnavailable',
//                       })
//                     }
//                   }}
//                   showFilter
//                 />
//               </Box>
//               <Modal
//                 open={showNoVaultAccount && !isShowVaultJoin?.isShow}
//                 onClose={onBtnClose}
//                 sx={{ zIndex: 1000 }}
//               >
//                 <Box
//                   height={'100%'}
//                   display={'flex'}
//                   justifyContent={'center'}
//                   alignItems={'center'}
//                 >
//                   <Box
//                     padding={5}
//                     bgcolor={'var(--color-box)'}
//                     width={'var(--modal-width)'}
//                     borderRadius={1}
//                     display={'flex'}
//                     alignItems={'center'}
//                     flexDirection={'column'}
//                     position={'relative'}
//                   >
//                     <ModalCloseButtonPosition right={2} top={2} t={t} onClose={onBtnClose} />
//                     <ViewAccountTemplate
//                       className={'inModal'}
//                       activeViewTemplate={
//                         <>
//                           <Typography marginBottom={3} variant={'h4'}>
//                             {t(btnProps.title)}
//                           </Typography>
//                           <Typography
//                             whiteSpace={'pre-line'}
//                             component={'span'}
//                             variant={'body1'}
//                             color={'textSecondary'}
//                             marginBottom={3}
//                             textAlign={'left'}
//                             width={'100%'}
//                           >
//                             <Trans
//                               i18nKey={btnProps.des}
//                               tOptions={{
//                                 layer2: L1L2_NAME_DEFINED[network].layer2,
//                                 l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
//                                 loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
//                                 l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
//                                 l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
//                                 ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
//                               }}
//                             />
//                           </Typography>
//                           <>{dialogBtn}</>
//                         </>
//                       }
//                     />
//                   </Box>
//                 </Box>
//               </Modal>

//               <Modal
//                 open={detail?.isShow && !isShowVaultJoin?.isShow}
//                 onClose={() => setShowDetail({ isShow: false })}
//               >
//                 <SwitchPanelStyled width={'var(--modal-width)'}>
//                   <ModalCloseButton
//                     t={t}
//                     onClose={(_e: any) => setShowDetail({ isShow: false } as any)}
//                   />
//                   <Box
//                     display={'flex'}
//                     flexDirection={'column'}
//                     alignItems={'flex-start'}
//                     alignSelf={'stretch'}
//                     justifyContent={'stretch'}
//                     marginTop={-5}
//                   >
//                     <Typography
//                       display={'flex'}
//                       flexDirection={'row'}
//                       component={'header'}
//                       alignItems={'center'}
//                       height={'var(--toolbar-row-height)'}
//                       paddingX={3}
//                     >
//                       {detail?.detail?.tokenInfo.erc20Symbol ?? detail?.detail?.tokenInfo.symbol}
//                     </Typography>
//                     <Divider style={{ marginTop: '-1px', width: '100%' }} />
//                     <Box
//                       maxHeight={'60vh'}
//                       overflow={'scroll'}
//                       flex={1}
//                       display={'flex'}
//                       flexDirection={'column'}
//                     >
//                       {vaultAccountInfo &&
//                         walletMap &&
//                         ([sdk.VaultAccountStatus.IN_STAKING].includes(
//                           vaultAccountInfo?.accountStatus,
//                         ) ||
//                           activeInfo?.hash) && (
//                           <>
//                             <Box
//                               display='flex'
//                               flexDirection={'column'}
//                               alignItems={'center'}
//                               alignSelf={'center'}
//                               justifyContent={'center'}
//                               margin={4}
//                             >
//                               <Typography variant={'h2'} component={'h4'} color={'inherit'}>
//                                 {!hideAssets
//                                   ? walletMap[detail?.detail?.tokenInfo.symbol!]?.count
//                                     ? getValuePrecisionThousand(
//                                         walletMap[detail?.detail?.tokenInfo.symbol!]?.count ?? 0,
//                                         vaultTokenMap[detail?.detail?.tokenInfo.symbol!].precision,
//                                         vaultTokenMap[detail?.detail?.tokenInfo.symbol!].precision,
//                                         undefined,
//                                         false,
//                                         {
//                                           isFait: false,
//                                           floor: true,
//                                         },
//                                       )
//                                     : '0.00'
//                                   : HiddenTag}
//                               </Typography>
//                               <Typography
//                                 variant={'body1'}
//                                 color={'textSecondary'}
//                                 component={'span'}
//                               >
//                                 {!hideAssets
//                                   ? walletMap[detail?.detail?.tokenInfo.symbol!]?.count
//                                     ? PriceTag[CurrencyToTag[currency]] +
//                                       getValuePrecisionThousand(
//                                         sdk
//                                           .toBig(
//                                             walletMap[detail?.detail?.tokenInfo.symbol!]!.count,
//                                           )
//                                           .times(
//                                             tokenPrices?.[detail?.detail?.tokenInfo.symbol!] || 0,
//                                           )
//                                           .times(forexMap[currency] ?? 0),
//                                         2,
//                                         2,
//                                         2,
//                                         false,
//                                         {
//                                           isFait: false,
//                                           floor: true,
//                                         },
//                                       )
//                                     : PriceTag[CurrencyToTag[currency]] + '0.00'
//                                   : HiddenTag}
//                               </Typography>
//                               <Box marginTop={2} display={'flex'} flexDirection={'row'}>
//                                 <Box
//                                   display={'flex'}
//                                   flexDirection={'column'}
//                                   marginRight={5}
//                                   alignItems={'center'}
//                                 >
//                                   <IconButton
//                                     sx={{
//                                       height: 'var(--svg-size-huge) !important',
//                                       width: 'var(--svg-size-huge) !important',
//                                       border: 'solid 0.5px var(--color-border)',
//                                     }}
//                                     size={'large'}
//                                     onClick={() => {
//                                       history.push(
//                                         `${RouterPath.vault}/${VaultKey.VAULT_DASHBOARD}/${VaultAction.VaultLoan}?symbol=${detail?.detail?.tokenInfo.symbol}`,
//                                       )
//                                     }}
//                                   >
//                                     <Box
//                                       component={'img'}
//                                       src={`${SoursURL}svg/vault_loan_${theme.mode}.svg`}
//                                     />
//                                   </IconButton>
//                                   <Typography
//                                     marginTop={1 / 2}
//                                     component={'span'}
//                                     variant={'body2'}
//                                     color={'textSecondary'}
//                                     display={'inline-flex'}
//                                     alignItems={'center'}
//                                     textAlign={'center'}
//                                     sx={{
//                                       textIndent: 0,
//                                       textAlign: 'center',
//                                     }}
//                                   >
//                                     {t('labelVaultLoanBtn')}
//                                   </Typography>
//                                 </Box>
//                                 <Box
//                                   display={'flex'}
//                                   flexDirection={'column'}
//                                   alignItems={'center'}
//                                 >
//                                   <IconButton
//                                     sx={{
//                                       height: 'var(--svg-size-huge) !important',
//                                       width: 'var(--svg-size-huge) !important',
//                                       border: 'solid 0.5px var(--color-border)',
//                                     }}
//                                     size={'large'}
//                                     onClick={() => {
//                                       history.push(
//                                         `${RouterPath.vault}/${VaultKey.VAULT_DASHBOARD}/${VaultAction.VaultSwap}?symbol=${detail?.detail?.tokenInfo.symbol}`,
//                                       )
//                                     }}
//                                   >
//                                     <Box
//                                       component={'img'}
//                                       src={`${SoursURL}svg/vault_trade_${theme.mode}.svg`}
//                                     />
//                                   </IconButton>
//                                   <Typography
//                                     component={'span'}
//                                     variant={'body2'}
//                                     display={'inline-flex'}
//                                     textAlign={'center'}
//                                     alignItems={'center'}
//                                     color={'textSecondary'}
//                                     marginTop={1 / 2}
//                                     sx={{
//                                       textIndent: 0,
//                                       textAlign: 'center',
//                                     }}
//                                   >
//                                     {t('labelVaultTradeSimpleBtn')}
//                                   </Typography>
//                                 </Box>
//                               </Box>
//                             </Box>
//                             <Divider style={{ marginTop: '-1px', width: '100%' }} />
//                           </>
//                         )}
//                       <Box padding={3} flex={1} display={'flex'} flexDirection={'column'}>
//                         <MarketDetail
//                           etherscanBaseUrl={etherscanBaseUrl}
//                           isShow={detail.isShow}
//                           forexMap={forexMap}
//                           isLoading={detail.isLoading}
//                           {...{ ...detail?.detail }}
//                         />
//                       </Box>
//                     </Box>
//                     {!(
//                       (vaultAccountInfo &&
//                         [sdk.VaultAccountStatus.IN_STAKING].includes(
//                           vaultAccountInfo?.accountStatus,
//                         )) ||
//                       activeInfo?.hash
//                     ) && (
//                       <>
//                         <Divider style={{ marginTop: '-1px', width: '100%' }} />
//                         <Box
//                           padding={3}
//                           paddingY={1}
//                           display={'flex'}
//                           flexDirection={'column'}
//                           alignItems={'flex-end'}
//                           alignSelf={'stretch'}
//                           justifyContent={'stretch'}
//                         >
//                           <MyButton
//                             size={'medium'}
//                             onClick={() => {
//                               setShowDetail({ isShow: false })
//                               _vaultAccountInfo.onJoinPop({})
//                             }}
//                             loading={'false'}
//                             variant={'contained'}
//                             sx={{ minWidth: 'var(--walletconnect-width)' }}
//                             disabled={
//                               _vaultAccountInfo.joinBtnStatus === TradeBtnStatus.DISABLED ||
//                               _vaultAccountInfo.joinBtnStatus === TradeBtnStatus.LOADING
//                             }
//                           >
//                             {_vaultAccountInfo.joinBtnLabel}
//                           </MyButton>
//                         </Box>
//                       </>
//                     )}
//                   </Box>
//                 </SwitchPanelStyled>
//               </Modal>
//             </>
//           }
//         />
//       </Container>
//     </Box>
//   )
// }

const VaultDashBoardPanelUI: React.FC<VaultDashBoardPanelUIProps> = ({
  t,
  forexMap,
  theme,
  currency,
  hideAssets,
  upColor,
  showMarginLevelAlert,
  vaultAccountInfo,
  localState,
  setLocalState,
  colors,
  assetPanelProps,
  marketProps,
  vaultTokenMap,
  vaultTickerMap,
  VaultDustCollector,
  isShowVaultJoin,
  detail,
  setShowDetail,
  hideLeverage,
  activeInfo,
  walletMap,
  _vaultAccountInfo,
  tokenPrices,
  getValueInCurrency,
  history,
  etherscanBaseUrl,
  onClickCollateralManagement,
  onClickSettle,
  onClickPortalTrade,
  liquidationThreshold,
  liquidationPenalty,
  assetsTab,
  onChangeAssetsTab,
  onClickRecord,
  vaultPositionsTableProps,
  onClickHideShowAssets,
  accountActive,
  totalEquity,
  showSettleBtn,
  onClickBuy,
  onClickSell
}) => {
  const { isMobile } = useSettings()
  const boxSx = {
    my: isMobile ? 2 : 2,
    width: isMobile ? '50%' : '25%',
  }
  return (
    <Box flex={1} display={'flex'} flexDirection={'column'}>
      <Container
        maxWidth='lg'
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <ViewAccountTemplate
          activeViewTemplate={
            <>
              {showMarginLevelAlert && (
                <Box
                  paddingY={1}
                  paddingX={2.5}
                  borderRadius={'8px'}
                  bgcolor={hexToRGB(theme.colorBase.error, 0.2)}
                  display={'flex'}
                  marginTop={3}
                >
                  <WarningIcon2
                    color={'error'}
                    style={{
                      width: '24px',
                      height: '24px',
                    }}
                  />
                  <Typography marginLeft={0.5}>{t('labelVaultMarginLevelAlert')}</Typography>
                </Box>
              )}
              <Box
                display={'flex'}
                flexDirection={'column'}
                mt={3}
                px={4}
                pt={3}
                pb={5}
                border={'1px solid var(--color-border)'}
                borderRadius={1.5}
                position={'relative'}
              >
                <Box
                  bgcolor={'var(--color-box-third)'}
                  position={'absolute'}
                  height={'40px'}
                  px={2.5}
                  left={0}
                  top={0}
                  display={'flex'}
                  justifyContent={'center'}
                  alignItems={'center'}
                  borderRadius={'4px 0 4px 0'}
                >
                  <Typography>Cross Account</Typography>
                </Box>
                <Box display={'flex'} flexDirection={isMobile ? 'column' : 'row'} alignItems={isMobile ? 'end' : 'center'} alignSelf={'flex-end'}>
                  <Button
                    onClick={onClickCollateralManagement}
                    sx={{ width: 'auto' }}
                    variant='contained'
                  >
                    Collateral Management
                  </Button>
                  {showSettleBtn && (
                    <BgButton
                      customBg='var(--color-button-outlined)'
                      onClick={onClickSettle}
                      sx={{ width: 'auto', ml: 1.5, mt: isMobile ? 2 : 0 }}
                      variant='contained'
                    >
                      Settle
                    </BgButton>
                  )}
                </Box>

                <Box mt={1.5} display={'flex'} alignItems={'center'}>
                  <Box mr={0.5}>
                    <Typography
                      color={'var(--color-text-secondary)'}
                      variant='h3'
                      fontSize={'14px'}
                    >
                      Total Equity
                    </Typography>
                  </Box>

                  {hideAssets ? (
                    <HideIcon
                      className='custom-size'
                      sx={{
                        fontSize: '20px',
                        color: 'var(--color-text-secondary)',
                        cursor: 'pointer',
                      }}
                      onClick={onClickHideShowAssets}
                    />
                  ) : (
                    <ViewIcon
                      className='custom-size'
                      sx={{
                        fontSize: '20px',
                        color: 'var(--color-text-secondary)',
                        cursor: 'pointer',
                      }}
                      onClick={onClickHideShowAssets}
                    />
                  )}
                </Box>
                <Typography mt={1} variant='h2'>
                  {accountActive ? (hideAssets ? HiddenTag : totalEquity) : EmptyValueTag}
                </Typography>

                <Box mt={isMobile ? 2 : 4} display={'flex'} flexWrap={'wrap'} flexDirection={'row'}>
                  <Box sx={boxSx}>
                    <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                      {t('labelVaultTotalCollateral')}
                    </Typography>
                    <Typography
                      component={'span'}
                      marginTop={1}
                      display={'inline-flex'}
                      variant={'body1'}
                      color={'textPrimary'}
                      fontSize={'20px'}
                      alignItems={'center'}
                    >
                      {accountActive
                        ? hideAssets
                          ? HiddenTag
                          : PriceTag[CurrencyToTag[currency]] +
                            getValuePrecisionThousand(
                              Number(vaultAccountInfo?.totalCollateralOfUsdt ?? 0) *
                                (forexMap[currency] ?? 0),
                              2,
                              2,
                              2,
                              false,
                              { isFait: true, floor: true },
                            )
                        : EmptyValueTag}
                      {accountActive && (
                        <Typography
                          sx={{ cursor: 'pointer' }}
                          color={'var(--color-primary)'}
                          marginLeft={1.5}
                          component={'span'}
                          onClick={() => {
                            setLocalState({
                              ...localState,
                              modalStatus: 'collateralDetails',
                            })
                          }}
                        >
                          {t('labelVaultDetails')}
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                  <Box sx={boxSx}>
                    <Typography
                      component={'h4'}
                      variant={'body1'}
                      color={'textSecondary'}
                      
                      display={'flex'}
                      alignItems={'center'}
                    >
                      {t('labelVaultMarginLevel')}
                      <Tooltip
                        title={
                          <Box>
                            <Typography marginBottom={1} variant={'body2'}>
                              {t('labelVaultMarginLevelTooltips')}
                            </Typography>
                            <Typography marginBottom={1} variant={'body2'}>
                              {t('labelVaultMarginLevelTooltips2')}
                            </Typography>
                            <Typography marginBottom={1} variant={'body2'}>
                              {t('labelVaultMarginLevelTooltips3')}
                            </Typography>
                            <Typography
                              color={'var(--color-success)'}
                              marginBottom={1}
                              variant={'body2'}
                            >
                              {t('labelVaultMarginLevelTooltips4')}
                            </Typography>
                            <Typography marginBottom={1} variant={'body2'}>
                              {t('labelVaultMarginLevelTooltips5')}
                            </Typography>
                            <Typography
                              color={'var(--color-warning)'}
                              marginBottom={1}
                              variant={'body2'}
                            >
                              {t('labelVaultMarginLevelTooltips6')}
                            </Typography>
                            <Typography marginBottom={1} variant={'body2'}>
                              {t('labelVaultMarginLevelTooltips7')}
                            </Typography>
                            <Typography
                              color={'var(--color-error)'}
                              marginBottom={1}
                              variant={'body2'}
                            >
                              {t('labelVaultMarginLevelTooltips8')}
                            </Typography>
                            <Typography marginBottom={1} variant={'body2'}>
                              {t('labelVaultMarginLevelTooltips9')}
                            </Typography>
                            <Typography
                              color={'var(--color-text-primary)'}
                              marginBottom={1}
                              variant={'body2'}
                            >
                              {t('labelVaultMarginLevelTooltips10')}
                            </Typography>
                            <Typography marginBottom={1} variant={'body2'}>
                              {t('labelVaultMarginLevelTooltips11')}
                            </Typography>
                          </Box>
                        }
                        placement={isMobile ? 'bottom' : 'right'}
                      >
                        <Box display={'flex'} alignItems={'center'}>
                          <Info2Icon color={'inherit'} sx={{ marginLeft: 1 / 2 }} />
                        </Box>
                      </Tooltip>
                    </Typography>

                    {(() => {
                      if (!accountActive) {
                        return <Typography>{EmptyValueTag}</Typography>
                      }
                      const item = vaultAccountInfo?.marginLevel ?? '0'
                      return (
                        <>
                          {vaultAccountInfo?.marginLevel ? (
                            <Typography
                              component={'span'}
                              display={'inline-flex'}
                              alignItems={'center'}
                              marginTop={1}
                              variant={'body1'}
                              fontSize={'16px'}
                              color={marginLevelTypeToColor(marginLevelType(item))}
                            >
                              <MarginLevelIcon className='custom-size' sx={{ fontSize: '20px', marginRight: 1 / 2 }} />
                              {item}
                            </Typography>
                          ) : (
                            <Typography
                              component={'span'}
                              display={'inline-flex'}
                              alignItems={'center'}
                              marginTop={1}
                              variant={'body1'}
                              fontSize={'16px'}
                              color={'textSecondary'}
                            >
                              <MarginLevelIcon className='custom-size' sx={{ fontSize: '20px', marginRight: 1 / 2 }} />
                              {EmptyValueTag}
                            </Typography>
                          )}
                        </>
                      )
                    })()}
                  </Box>
                  <Box sx={boxSx}>
                    <Tooltip title={t('labelVaultTotalDebtTooltips').toString()} placement={'top'}>
                      <Typography
                        component={'h4'}
                        variant={'body1'}
                        color={'textSecondary'}
                        display={'flex'}
                        alignItems={'center'}
                      >
                        {t('labelVaultTotalDebt')}
                        <Info2Icon color={'inherit'} sx={{ marginLeft: 1 / 2 }} />
                      </Typography>
                    </Tooltip>
                    <Typography
                      component={'span'}
                      marginTop={1}
                      display={'inline-flex'}
                      variant={'body1'}
                      color={'textPrimary'}
                      fontSize={'20px'}
                      alignItems={'center'}
                    >
                      {accountActive
                        ? hideAssets
                          ? HiddenTag
                          : PriceTag[CurrencyToTag[currency]] +
                            getValuePrecisionThousand(
                              Number(vaultAccountInfo?.totalDebtOfUsdt ?? 0) *
                                (forexMap[currency] ?? 0),
                              2,
                              2,
                              2,
                              false,
                              { isFait: true, floor: true },
                            )
                        : EmptyValueTag}
                      {accountActive && (
                        <Typography

                          sx={{ cursor: 'pointer' }}
                          color={'var(--color-primary)'}
                          marginLeft={1.5}
                          component={'span'}
                          onClick={() => {
                            setLocalState({
                              ...localState,
                              modalStatus: 'debt',
                            })
                          }}
                        >
                          {t('labelVaultDetails')}
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                  <Box sx={boxSx}>
                    <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                      {t('labelVaultProfit')}
                    </Typography>
                    <Typography
                      component={'span'}
                      display={'flex'}
                      marginTop={1}
                      variant={'body1'}
                      color={'textPrimary'}
                      fontSize={'20px'}
                    >
                      {(() => {
                        const profit =
                          (vaultAccountInfo as any)?.accountType === 0
                            ? sdk
                                .toBig(vaultAccountInfo?.totalEquityOfUsdt ?? 0)
                                .minus(vaultAccountInfo?.totalCollateralOfUsdt ?? 0)
                            : sdk
                                .toBig(vaultAccountInfo?.totalBalanceOfUsdt ?? 0)
                                .minus(vaultAccountInfo?.totalDebtOfUsdt ?? 0)
                        const colorsId = upColor === UpColor.green ? [0, 1] : [1, 0]
                        const colorIs = profit.gte(0) ? colorsId[0] : colorsId[1]
                        return (
                          <>
                            {accountActive ? (
                              <Box display={'flex'} alignItems={'center'}>
                                <Typography
                                  component={'span'}
                                  display={'flex'}
                                  variant={'body1'}
                                  color={'textPrimary'}
                                  fontSize={'20px'}
                                >
                                  {hideAssets
                                    ? HiddenTag
                                    : PriceTag[CurrencyToTag[currency]] +
                                      getValuePrecisionThousand(
                                        profit.times(forexMap[currency] ?? 0).toString(),
                                        2,
                                        2,
                                        2,
                                        false,
                                        {
                                          isFait: false,
                                          floor: true,
                                        },
                                      )}
                                </Typography>
                                <Typography
                                  component={'span'}
                                  display={'flex'}
                                  variant={'body1'}
                                  marginLeft={1.5}
                                  color={colors[colorIs]}
                                  fontSize={'20px'}
                                >
                                  {getValuePrecisionThousand(
                                    profit
                                      ?.div(
                                        Number(vaultAccountInfo?.totalCollateralOfUsdt)
                                          ? vaultAccountInfo?.totalCollateralOfUsdt
                                          : 1,
                                      )
                                      .times(100) ?? 0,
                                    2,
                                    2,
                                    2,
                                    false,
                                    {
                                      isFait: false,
                                      floor: true,
                                    },
                                  )}
                                  %
                                </Typography>
                              </Box>
                            ) : (
                              EmptyValueTag
                            )}
                          </>
                        )
                      })()}
                    </Typography>
                  </Box>
                  {!hideLeverage && (
                    <Box sx={boxSx} position={'relative'}>
                      <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                        {t('labelVaultLeverage')}
                      </Typography>
                      <Typography
                        component={'span'}
                        marginTop={1}
                        display={'inline-flex'}
                        variant={'body1'}
                        color={'textPrimary'}
                        fontSize={'20px'}
                        alignItems={'center'}
                      >
                        {vaultAccountInfo?.leverage && accountActive
                          ? `${vaultAccountInfo?.leverage}x`
                          : EmptyValueTag}
                        {accountActive && (
                          <Typography
                            sx={{ cursor: 'pointer' }}
                            color={'var(--color-primary)'}
                            marginLeft={1.5}
                            component={'span'}
                            onClick={() => {
                              setLocalState({
                                ...localState,
                                modalStatus: 'leverage',
                              })
                            }}
                          >
                            {t('labelVaultDetails')}
                          </Typography>
                        )}
                      </Typography>
                      <Typography
                        marginTop={0.5}
                        width={'200px'}
                        color={'var(--color-text-secondary)'}
                        variant={'body2'}
                      >
                        {t('labelVaultMaximumCredit')}:{' '}
                        {(vaultAccountInfo as any)?.maxCredit &&
                        getValueInCurrency((vaultAccountInfo as any)?.maxCredit) &&
                        accountActive
                          ? fiatNumberDisplay(
                              getValueInCurrency((vaultAccountInfo as any)?.maxCredit),
                              currency,
                            )
                          : EmptyValueTag}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={boxSx} position={'relative'}>
                    <Tooltip
                      title={
                        'The minimum health factor (margin level) at which a position becomes subject to forced liquidation.'
                      }
                      placement={'top'}
                    >
                      <Typography
                        component={'h4'}
                        variant={'body1'}
                        color={'textSecondary'}
                        display={'flex'}
                        alignItems={'center'}
                      >
                        Liquidation Threshold
                        <Info2Icon color={'inherit'} sx={{ marginLeft: 1 / 2 }} />
                      </Typography>
                    </Tooltip>

                    <Typography
                      component={'span'}
                      marginTop={1}
                      display={'inline-flex'}
                      variant={'body1'}
                      color={'textPrimary'}
                      fontSize={'20px'}
                      alignItems={'center'}
                    >
                      {accountActive ? liquidationThreshold : EmptyValueTag}
                    </Typography>
                  </Box>
                  <Box sx={boxSx} position={'relative'}>
                    <Tooltip
                      title={
                        'The percentage of the position size deducted during liquidation to prevent bad debt.'
                      }
                      placement={'top'}
                    >
                      <Typography
                        component={'h4'}
                        variant={'body1'}
                        color={'textSecondary'}
                        display={'flex'}
                        alignItems={'center'}
                      >
                        Liquidation Penalty
                        <Info2Icon color={'inherit'} sx={{ marginLeft: 1 / 2 }} />
                      </Typography>
                    </Tooltip>
                    <Typography
                      component={'span'}
                      marginTop={1}
                      display={'inline-flex'}
                      variant={'body1'}
                      color={'textPrimary'}
                      fontSize={'20px'}
                      alignItems={'center'}
                    >
                      {accountActive ? liquidationPenalty : EmptyValueTag}
                    </Typography>
                  </Box>
                </Box>
                {/* <Box mt={4} display={'flex'} flexWrap={isMobile ? 'wrap' : 'nowrap'} flexDirection={'row'}>
                  {!hideLeverage && (
                    <Box position={'relative'} width={isMobile ? '50%' : '25%'}>
                      <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                        {t('labelVaultLeverage')}
                      </Typography>
                      <Typography
                        component={'span'}
                        marginTop={1}
                        display={'inline-flex'}
                        variant={'body1'}
                        color={'textPrimary'}
                        fontSize={'20px'}
                        alignItems={'center'}
                      >
                        {vaultAccountInfo?.leverage && accountActive
                          ? `${vaultAccountInfo?.leverage}x`
                          : EmptyValueTag}
                        {accountActive && (
                          <Typography
                            sx={{ cursor: 'pointer' }}
                            color={'var(--color-primary)'}
                            marginLeft={1}
                            component={'span'}
                            onClick={() => {
                              setLocalState({
                                ...localState,
                                modalStatus: 'leverage',
                              })
                            }}
                          >
                            {t('labelVaultDetails')}
                          </Typography>
                        )}
                      </Typography>
                      <Typography
                        marginTop={0.5}
                        width={'200px'}
                        color={'var(--color-text-secondary)'}
                        variant={'body2'}
                      >
                        {t('labelVaultMaximumCredit')}:{' '}
                        {(vaultAccountInfo as any)?.maxCredit &&
                        getValueInCurrency((vaultAccountInfo as any)?.maxCredit) &&
                        accountActive
                          ? fiatNumberDisplay(
                              getValueInCurrency((vaultAccountInfo as any)?.maxCredit),
                              currency,
                            )
                          : EmptyValueTag}
                      </Typography>
                    </Box>
                  )}
                  <Box position={'relative'} width={isMobile ? '50%' : '25%'}>
                    <Tooltip
                      title={
                        'The minimum health factor (margin level) at which a position becomes subject to forced liquidation.'
                      }
                      placement={'top'}
                    >
                      <Typography
                        component={'h4'}
                        variant={'body1'}
                        color={'textSecondary'}
                        display={'flex'}
                        alignItems={'center'}
                      >
                        Liquidation Threshold
                        <Info2Icon color={'inherit'} sx={{ marginLeft: 1 / 2 }} />
                      </Typography>
                    </Tooltip>

                    <Typography
                      component={'span'}
                      marginTop={1}
                      display={'inline-flex'}
                      variant={'body1'}
                      color={'textPrimary'}
                      fontSize={'20px'}
                      alignItems={'center'}
                    >
                      {accountActive ? liquidationThreshold : EmptyValueTag}
                    </Typography>
                  </Box>
                  <Box position={'relative'} width={isMobile ? '50%' : '25%'}>
                    <Tooltip
                      title={
                        'The percentage of the position size deducted during liquidation to prevent bad debt.'
                      }
                      placement={'top'}
                    >
                      <Typography
                        component={'h4'}
                        variant={'body1'}
                        color={'textSecondary'}
                        display={'flex'}
                        alignItems={'center'}
                      >
                        Liquidation Penalty
                        <Info2Icon color={'inherit'} sx={{ marginLeft: 1 / 2 }} />
                      </Typography>
                    </Tooltip>
                    <Typography
                      component={'span'}
                      marginTop={1}
                      display={'inline-flex'}
                      variant={'body1'}
                      color={'textPrimary'}
                      fontSize={'20px'}
                      alignItems={'center'}
                    >
                      {accountActive ? liquidationPenalty : EmptyValueTag}
                    </Typography>
                  </Box>
                </Box> */}
              </Box>
              <Box
                flex={1}
                display={'flex'}
                flexDirection={'column'}
                border={'var(--color-border) 1px solid'}
                borderRadius={1.5}
                marginY={3}
                paddingY={2}
                px={2}
              >
                <Box
                  mb={3}
                  display={'flex'}
                  justifyContent={'space-between'}
                  alignItems={'flex-start'}
                >
                  <Tabs
                    variant={'scrollable'}
                    value={assetsTab}
                    onChange={(_, value) => onChangeAssetsTab(value)}
                  >
                    <Tab value={'assetsView'} label={'Assets'} />
                    <Tab value={'positionsView'} label={'Positions'} />
                  </Tabs>

                  <Button
                    variant={'text'}
                    startIcon={<OrderListIcon fontSize={'inherit'} color={'inherit'} />}
                    sx={{ mr: 2, mt: 1.5, color: 'var(--color-text-primary)' }}
                    onClick={onClickRecord}
                  >
                    {t('labelVaultRecord')}
                  </Button>
                </Box>

                {assetsTab === 'assetsView' ? (
                  <VaultAssetsTable
                    {...assetPanelProps}
                    onRowClick={(index, row) => {
                      // @ts-ignore
                      marketProps.onRowClick(index, {
                        // @ts-ignore
                        ...vaultTokenMap[row.name],
                        // @ts-ignore
                        cmcTokenId: vaultTickerMap[row.erc20Symbol].tokenId,
                        ...vaultTickerMap[row.erc20Symbol],
                      })
                    }}
                    onClickDustCollector={() => {
                      if (VaultDustCollector.enable) {
                        setLocalState({
                          ...localState,
                          modalStatus: 'dustCollector',
                        })
                      } else {
                        setLocalState({
                          ...localState,
                          modalStatus: 'dustCollectorUnavailable',
                        })
                      }
                    }}
                    showFilter
                  />
                ) : (
                  <VaultPositionsTable 
                    {...vaultPositionsTableProps} 
                  />
                )}

                <Button
                  onClick={onClickPortalTrade}
                  size={isMobile ? 'medium' : 'large'}
                  variant='contained'
                  sx={{ mt: isMobile ? 3 : 5, mb: 3, alignSelf: 'center', width: '200px' }}
                >
                  Portal Trade
                </Button>
              </Box>

              <Modal
                open={detail?.isShow && !isShowVaultJoin?.isShow}
                onClose={() => setShowDetail({ isShow: false })}
              >
                <SwitchPanelStyled width={'var(--modal-width)'}>
                  <ModalCloseButton
                    t={t}
                    onClose={(_e: any) => setShowDetail({ isShow: false } as any)}
                  />
                  <Box
                    display={'flex'}
                    flexDirection={'column'}
                    alignItems={'flex-start'}
                    alignSelf={'stretch'}
                    justifyContent={'stretch'}
                    marginTop={-5}
                  >
                    <Typography
                      display={'flex'}
                      flexDirection={'row'}
                      component={'header'}
                      alignItems={'center'}
                      height={'var(--toolbar-row-height)'}
                      paddingX={3}
                    >
                      {detail?.detail?.tokenInfo.erc20Symbol ?? detail?.detail?.tokenInfo.symbol}
                    </Typography>
                    <Divider style={{ marginTop: '-1px', width: '100%' }} />
                    <Box
                      maxHeight={'60vh'}
                      overflow={'scroll'}
                      flex={1}
                      display={'flex'}
                      flexDirection={'column'}
                    >
                      {vaultAccountInfo &&
                        walletMap &&
                        ([sdk.VaultAccountStatus.IN_STAKING].includes(
                          vaultAccountInfo?.accountStatus,
                        ) ||
                          activeInfo?.hash) && (
                          <>
                            <Box
                              display='flex'
                              flexDirection={'column'}
                              alignItems={'center'}
                              alignSelf={'center'}
                              justifyContent={'center'}
                              margin={4}
                            >
                              <Typography variant={'h2'} component={'h4'} color={'inherit'}>
                                {!hideAssets
                                  ? walletMap[detail?.detail?.tokenInfo.symbol!]?.count
                                    ? getValuePrecisionThousand(
                                        walletMap[detail?.detail?.tokenInfo.symbol!]?.count ?? 0,
                                        vaultTokenMap[detail?.detail?.tokenInfo.symbol!].precision,
                                        vaultTokenMap[detail?.detail?.tokenInfo.symbol!].precision,
                                        undefined,
                                        false,
                                        {
                                          isFait: false,
                                          floor: true,
                                        },
                                      )
                                    : '0.00'
                                  : HiddenTag}
                              </Typography>
                              <Typography
                                variant={'body1'}
                                color={'textSecondary'}
                                component={'span'}
                              >
                                {!hideAssets
                                  ? walletMap[detail?.detail?.tokenInfo.symbol!]?.count
                                    ? PriceTag[CurrencyToTag[currency]] +
                                      getValuePrecisionThousand(
                                        sdk
                                          .toBig(
                                            walletMap[detail?.detail?.tokenInfo.symbol!]!.count,
                                          )
                                          .times(
                                            tokenPrices?.[detail?.detail?.tokenInfo.symbol!] || 0,
                                          )
                                          .times(forexMap[currency] ?? 0),
                                        2,
                                        2,
                                        2,
                                        false,
                                        {
                                          isFait: false,
                                          floor: true,
                                        },
                                      )
                                    : PriceTag[CurrencyToTag[currency]] + '0.00'
                                  : HiddenTag}
                              </Typography>
                            </Box>
                            <Divider style={{ marginTop: '-1px', width: '100%' }} />
                          </>
                        )}
                      <Box padding={3} flex={1} display={'flex'} flexDirection={'column'}>
                        <MarketDetail
                          etherscanBaseUrl={etherscanBaseUrl}
                          isShow={detail.isShow}
                          forexMap={forexMap}
                          isLoading={detail.isLoading}
                          showBtns={
                            vaultAccountInfo &&
                            [sdk.VaultAccountStatus.IN_STAKING].includes(
                              vaultAccountInfo?.accountStatus,
                            )
                          }
                          onClickBuy={() => onClickBuy(detail?.detail)}
                          onClickSell={() => onClickSell(detail?.detail)}
                          {...{ ...detail?.detail }}
                        />
                      </Box>
                    </Box>
                    {!(
                      (vaultAccountInfo &&
                        [sdk.VaultAccountStatus.IN_STAKING].includes(
                          vaultAccountInfo?.accountStatus,
                        )) ||
                      activeInfo?.hash
                    ) && (
                      <>
                        <Divider style={{ marginTop: '-1px', width: '100%' }} />
                        <Box
                          padding={3}
                          paddingY={1}
                          display={'flex'}
                          flexDirection={'column'}
                          alignItems={'flex-end'}
                          alignSelf={'stretch'}
                          justifyContent={'stretch'}
                        >
                          <MyButton
                            size={'medium'}
                            onClick={() => {
                              setShowDetail({ isShow: false })
                              _vaultAccountInfo.onJoinPop({})
                            }}
                            loading={'false'}
                            variant={'contained'}
                            sx={{ minWidth: 'var(--walletconnect-width)' }}
                            disabled={
                              _vaultAccountInfo.joinBtnStatus === TradeBtnStatus.DISABLED ||
                              _vaultAccountInfo.joinBtnStatus === TradeBtnStatus.LOADING
                            }
                          >
                            {_vaultAccountInfo.joinBtnLabel}
                          </MyButton>
                        </Box>
                      </>
                    )}
                  </Box>
                </SwitchPanelStyled>
              </Modal>
            </>
          }
        />
      </Container>
    </Box>
  )
}

export const VaultDashBoardPanel = ({
  vaultAccountInfo: _vaultAccountInfo,
  closeShowLeverage,
  showLeverage,
}: {
  vaultAccountInfo: VaultAccountInfoStatus
  closeShowLeverage: () => void
  showLeverage: { show: boolean; closeAfterChange: boolean }
}) => {
  const {
    collateralDetailsModalProps,
    maximumCreditModalProps,
    leverageModalProps,
    debtModalProps,
    dustCollectorModalProps,
    dustCollectorUnAvailableModalProps,
    vaultDashBoardPanelUIProps,
    noAccountHintModalProps,
    supplyCollateralHintModalProps,
    closeConfirmModalProps,
    autoRepayModalProps
    // vaultSwapModalProps,
    // smallOrderAlertProps,
  } = useVaultDashboard({ showLeverage, closeShowLeverage })
  const {vaultSwapModalProps, smallOrderAlertProps, toastProps, closeAllConfirmModalProps} = useVaultSwap()
  const joinVaultProps = useVaultJoin()
  return (
    <>
      <VaultDashBoardPanelUI
        {...vaultDashBoardPanelUIProps}
        vaultAccountInfo={_vaultAccountInfo.vaultAccountInfo}
      />
      <VaultJoinPanelModal {...joinVaultProps} />
      <CollateralDetailsModal {...collateralDetailsModalProps} />
      <MaximumCreditModal {...maximumCreditModalProps} />
      <LeverageModal {...leverageModalProps} />
      <DebtModal {...debtModalProps} />
      <DustCollectorModal {...dustCollectorModalProps} />
      <DustCollectorUnAvailableModal {...dustCollectorUnAvailableModalProps} />
      <NoAccountHintModal {...noAccountHintModalProps} />
      <VaultSwapModal {...vaultSwapModalProps} />
      <SmallOrderAlert {...smallOrderAlertProps} />
      <SupplyCollateralHintModal {...supplyCollateralHintModalProps} />
      <Toast {...toastProps} />
      <CloseConfirmModal {...closeConfirmModalProps}/>
      <CloseAllConfirmModal {...closeAllConfirmModalProps}/>
      <AutoRepayConfirmModal {...autoRepayModalProps}/>
    </>
  ) 
}
