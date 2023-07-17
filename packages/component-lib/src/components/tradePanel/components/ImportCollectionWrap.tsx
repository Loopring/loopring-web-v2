import { ImportCollectionStep, ImportCollectionViewProps } from './Interface'
import { Trans, useTranslation } from 'react-i18next'
import React from 'react'
import { Box, Link, ListItemText, Typography } from '@mui/material'
import {
  AddIcon,
  BackIcon,
  CollectionMeta,
  DropDownIcon,
  getShortAddr,
  NFTWholeINFO,
  SoursURL,
  ViewMoreIcon,
} from '@loopring-web/common-resources'
import { Button, CollectionInput, EmptyDefault, MenuItem, TextField } from '../../basic-lib'
import styled from '@emotion/styled'
import { useSettings } from '../../../stores'
import { CollectionManageWrap } from './CollectionManageWrap'
import { NFTMedia } from '../../block'
import { useHistory } from 'react-router-dom'
import { BtnMain, HorizontalLabelPositionBelowStepper } from './tool'

const MintAdStyle = styled(Box)`
  .MuiFormGroup-root {
    align-items: flex-start;
  }

  .coinInput-wrap {
    border: 1px solid var(--color-border);
  }

  .MuiInputLabel-root {
    font-size: ${({ theme }) => theme.fontDefault.body2};
  }

  .MuiButtonBase-root.step {
    padding-left: ${({ theme }) => theme.unit * 4}px;
    padding-right: ${({ theme }) => theme.unit * 4}px;
  }
`

const steps = [
  'labelImportCollection1', //Prepare NFT metadata
  'labelImportCollection2', //labelADMint2
  'labelImportCollection3', //Preview & Mint NFT
]

export const ImportCollectionWrap = <Co extends CollectionMeta, NFT extends Partial<NFTWholeINFO>>({
  onContractChange,
  onContractNext,
  setStep,
  onCollectionChange,
  onCollectionNext,
  onNFTSelected,
  onNFTSelectedMethod,
  step,
  data,
  baseURL,
  getIPFSString,
  disabled,
  onLoading,
}: ImportCollectionViewProps<Co, NFT>) => {
  const { t } = useTranslation(['common'])
  const { isMobile } = useSettings()
  const history = useHistory()
  const {
    contractList,
    selectContract,
    collectionInputProps,
    selectCollection,
    nftProps,
    selectNFTList,
  } = data
  // myLog("ImportCollectionWrap", contractList);

  const panelList: Array<{
    view: JSX.Element
    onBack?: undefined | (() => void)
    height?: any
    width?: any
  }> = React.useMemo(() => {
    return [
      {
        view: (
          <Box
            marginTop={3}
            display={'flex'}
            justifyContent={'space-around'}
            flexDirection={'column'}
            alignItems={'stretch'}
            width={'100%'}
            maxWidth={'760px'}
            flex={1}
          >
            <Box
              display={'flex'}
              alignItems={'flex-start'}
              flexDirection={'column'}
              justifyContent={'stretch'}
            >
              <TextField
                id='ContractAddress'
                select
                label={t('labelSelectContractAddress')}
                value={selectContract?.value ?? ''}
                onChange={(event: React.ChangeEvent<any>) => {
                  onContractChange(event.target?.value)
                }}
                inputProps={{ IconComponent: DropDownIcon }}
                fullWidth={true}
              >
                {contractList.map((item, index) => {
                  return (
                    <MenuItem
                      key={item.toString() + index}
                      value={item}
                      selected={item === selectContract?.value ?? "'"}
                      withnocheckicon={'true'}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            sx={{ display: 'inline' }}
                            component='span'
                            variant='body1'
                            color='text.primary'
                          >
                            {getShortAddr(item)}
                          </Typography>
                        }
                      />
                    </MenuItem>
                  )
                })}
              </TextField>
              {selectContract && (
                <Box
                  display={'flex'}
                  flexDirection={'row'}
                  marginTop={2}
                  width={'100%'}
                  justifyContent={'center'}
                >
                  {!onLoading ? (
                    selectContract.total ? (
                      <>
                        {selectContract?.list?.map((item, index) => {
                          return (
                            <Box
                              key={item?.tokenId + index.toString()}
                              marginRight={2}
                              width={60}
                              height={60}
                              borderRadius={1}
                              display={'flex'}
                              overflow={'hidden'}
                            >
                              <NFTMedia
                                item={item as NFT}
                                index={index}
                                shouldPlay={false}
                                onNFTError={() => undefined}
                                isOrigin={false}
                                getIPFSString={getIPFSString}
                                baseURL={baseURL}
                              />
                            </Box>
                          )
                        })}
                        {selectContract.total > 3 && (
                          <Box
                            marginRight={2}
                            width={60}
                            height={60}
                            borderRadius={1}
                            display={'flex'}
                            overflow={'hidden'}
                            alignItems={'center'}
                            justifyContent={'center'}
                            border={'1px var(--color-border-disable) solid'}
                          >
                            <ViewMoreIcon
                              fontSize={'large'}
                              htmlColor={'var(--color-text-secondary)'}
                            />
                          </Box>
                        )}
                      </>
                    ) : (
                      <Box flex={1} alignItems={'center'}>
                        <EmptyDefault
                          message={() => (
                            <Box
                              flex={1}
                              display={'flex'}
                              alignItems={'center'}
                              justifyContent={'center'}
                            >
                              No NFT
                            </Box>
                          )}
                        />
                      </Box>
                    )
                  ) : (
                    <Box
                      flex={1}
                      display={'flex'}
                      alignItems={'center'}
                      height={'90%'}
                      width={'100%'}
                      justifyContent={'center'}
                    >
                      <img
                        className='loading-gif'
                        alt={'loading'}
                        width='36'
                        src={`${SoursURL}images/loading-line.gif`}
                      />
                    </Box>
                  )}
                </Box>
              )}
            </Box>
            <Box
              width={'100%'}
              paddingX={isMobile ? 2 : 0}
              marginTop={2}
              flexDirection={'row'}
              display={'flex'}
              justifyContent={'space-between'}
            >
              <BtnMain
                {...{
                  defaultLabel: 'labelContinue',
                  fullWidth: true,
                  disabled: () => {
                    return disabled || !selectContract || !selectContract?.total
                  },
                  onClick: () => {
                    setStep(ImportCollectionStep.SELECTCOLLECTION)
                    onContractNext(selectContract?.value ?? '')
                  },
                }}
              />
            </Box>
          </Box>
        ),
        // onBack: () => setStep(CreateCollectionStep.ChooseMethod)
      },
      {
        view: (
          <Box
            marginTop={3}
            display={'flex'}
            justifyContent={'flex-start'}
            flexDirection={'column'}
            alignItems={'flex-start'}
            width={'100%'}
            maxWidth={'760px'}
          >
            <Typography
              variant={'body1'}
              color={'textSecondary'}
              marginBottom={2}
              textAlign={'center'}
              whiteSpace={'pre-line'}
            >
              {t('labelImportChooseCollection')}
            </Typography>

            {onLoading ? (
              <Box
                flex={1}
                display={'flex'}
                alignItems={'center'}
                height={'90%'}
                width={'100%'}
                justifyContent={'center'}
              >
                <img
                  className='loading-gif'
                  alt={'loading'}
                  width='36'
                  src={`${SoursURL}images/loading-line.gif`}
                />
              </Box>
            ) : collectionInputProps?.collectionListProps?.total > 0 ? (
              <>
                <Box
                  width={'100%'}
                  paddingTop={2}
                  paddingX={isMobile ? 2 : 0}
                  alignItems={'center'}
                >
                  <CollectionInput
                    {...{
                      ...(collectionInputProps as any),
                      collection: selectCollection,

                      onSelected: (item: Co) => {
                        collectionInputProps?.onSelected && collectionInputProps.onSelected(item)
                        onCollectionChange(item)
                      },
                    }}
                    fullWidth={true}
                    collectionListProps={{
                      ...collectionInputProps.collectionListProps,
                      size: 'small',
                    }}
                    size={isMobile ? 'small' : 'large'}
                    showCopy={true}
                  />
                  <Typography component={'p'} variant={'body1'} marginTop={1}>
                    <Trans i18nKey={'labelORCreateCollection'}>
                      or
                      <Link
                        href={`./#/NFT/addLegacyCollection/${selectContract?.value}`}
                        variant={'body1'}
                        target={'_self'}
                      >
                        Create Collection
                      </Link>
                    </Trans>
                  </Typography>
                </Box>
                <Box
                  width={'100%'}
                  paddingX={isMobile ? 2 : 0}
                  marginTop={2}
                  flexDirection={'row'}
                  display={'flex'}
                  justifyContent={'space-between'}
                >
                  <Button
                    variant={'outlined'}
                    size={'medium'}
                    color={'primary'}
                    className={'step'}
                    sx={{ height: 'var(--btn-medium-height)' }}
                    startIcon={<BackIcon fontSize={'small'} />}
                    onClick={() => {
                      onCollectionChange(undefined)
                      setStep(ImportCollectionStep.SELECTCONTRACT)
                    }}
                  >
                    {t(`labelMintBack`)}
                  </Button>

                  <BtnMain
                    {...{
                      defaultLabel: 'labelMintNext',
                      btnInfo: undefined, //btnInfo,
                      disabled: () => {
                        return disabled || !selectCollection
                      },
                      onClick: () => {
                        setStep(ImportCollectionStep.SELECTNFT)
                        selectCollection && onCollectionNext(selectCollection)
                      },
                    }}
                  />
                </Box>
              </>
            ) : (
              <>
                <Box
                  width={'100%'}
                  paddingX={isMobile ? 2 : 0}
                  marginTop={2}
                  flexDirection={'row'}
                  display={'flex'}
                  justifyContent={'space-between'}
                >
                  <Button
                    variant={'outlined'}
                    size={'medium'}
                    color={'primary'}
                    className={'step'}
                    sx={{ height: 'var(--btn-medium-height)' }}
                    startIcon={<BackIcon fontSize={'small'} />}
                    onClick={() => {
                      onCollectionChange(undefined)
                      setStep(ImportCollectionStep.SELECTCONTRACT)
                    }}
                  >
                    {t(`labelMintBack`)}
                  </Button>
                  <Button
                    variant={'contained'}
                    size={'medium'}
                    sx={{ height: 'var(--btn-medium-height)', marginLeft: 2 }}
                    color={'primary'}
                    className={'step'}
                    fullWidth={true}
                    startIcon={<AddIcon fontSize={'large'} />}
                    href={`./#/NFT/addLegacyCollection/${selectContract?.value}`}
                  >
                    {t(`labelCreateLegacyCollection`)}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        ),
      },
      {
        view: (
          <Box
            marginTop={3}
            display={'flex'}
            justifyContent={'flex-start'}
            flexDirection={'column'}
            alignItems={'stretch'}
            width={'100%'}
            // maxWidth={"760px"}
          >
            {selectCollection && (
              <CollectionManageWrap
                baseURL={baseURL}
                getIPFSString={getIPFSString}
                collection={selectCollection}
                selectedNFTS={selectNFTList}
                onNFTSelected={onNFTSelected as any}
                onNFTSelectedMethod={onNFTSelectedMethod}
                {...nftProps}
              />
            )}
            <Box
              width={'100%'}
              paddingX={isMobile ? 2 : 0}
              marginTop={2}
              flexDirection={'row'}
              display={'flex'}
              justifyContent={'space-between'}
            >
              <Button
                className={'step'}
                startIcon={<BackIcon fontSize={'small'} />}
                sx={{ height: 'var(--btn-medium-height)' }}
                variant={'outlined'}
                size={'medium'}
                color={'primary'}
                onClick={() => {
                  setStep(ImportCollectionStep.SELECTCOLLECTION)
                  selectCollection && onCollectionChange(undefined)
                }}
              >
                {t(`labelMintBack`)}
              </Button>
              <BtnMain
                {...{
                  defaultLabel: t('labelDoneBtn'),
                  btnInfo: undefined,
                  disabled: () => {
                    return disabled || !selectCollection
                  },
                  onClick: () => {
                    history.push('/nft/myCollection')
                  },
                }}
              />
            </Box>
          </Box>
        ),
      },
    ]
  }, [
    t,
    selectContract,
    contractList,
    onLoading,
    isMobile,
    collectionInputProps,
    selectCollection,
    baseURL,
    selectNFTList,
    onNFTSelected,
    onNFTSelectedMethod,
    nftProps,
    onContractChange,
    disabled,
    setStep,
    onContractNext,
    onCollectionChange,
    onCollectionNext,
  ])

  // @ts-ignore
  return (
    <Box
      // className={walletMap ? "" : "loading"}
      display={'flex'}
      flex={1}
      flexDirection={'column'}
      padding={5 / 2}
      alignItems={'center'}
    >
      <HorizontalLabelPositionBelowStepper activeStep={step} steps={steps} />
      <MintAdStyle
        flex={1}
        marginTop={2}
        paddingX={isMobile ? 2 : 5}
        display={'flex'}
        justifyContent={'center'}
        alignItems={'stretch'}
        width={'100%'}
      >
        {panelList.map((panel, index) => {
          return <React.Fragment key={index}>{step === index ? panel.view : <></>}</React.Fragment>
        })}
      </MintAdStyle>
      {/*{copyToastOpen && (*/}
      {/*  <Toast*/}
      {/*    alertText={*/}
      {/*      copyToastOpen?.type === "json"*/}
      {/*        ? t("labelCopyMetaClip")*/}
      {/*        : copyToastOpen.type === "url"*/}
      {/*        ? t("labelCopyUrlClip")*/}
      {/*        : t("labelCopyAddClip")*/}
      {/*    }*/}
      {/*    open={copyToastOpen?.isShow}*/}
      {/*    autoHideDuration={TOAST_TIME}*/}
      {/*    onClose={() => {*/}
      {/*      collectionInputProps?.collectionListProps?.setCopyToastOpen({*/}
      {/*        isShow: false,*/}
      {/*        type: "",*/}
      {/*      });*/}
      {/*    }}*/}
      {/*    severity={"success"}*/}
      {/*  />*/}
      {/*)}*/}
    </Box>
  )
}
