import React from 'react'
import { FOOTER_LIST_MAP, MEDIA_LIST, TOAST_TIME } from '@loopring-web/common-resources'
import { useLocation } from 'react-router-dom'
import { Footer as FooterUI, Toast, ToastType } from '@loopring-web/component-lib'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'

const linkListMap = _.cloneDeep(FOOTER_LIST_MAP)
const mediaList = _.cloneDeep(MEDIA_LIST)
export const Footer = () => {
  const location = useLocation()
  const { t } = useTranslation()
  const isLandingPage = location.pathname === '/' || location.pathname === '/pro'
  const [showBeta, setShowBeta] = React.useState(
    process.env?.REACT_APP_TEST_ENV == 'true' ? true : false,
  )
  // const isWallet = location.pathname === '/wallet'
  React.useLayoutEffect(() => {
    function updateSize() {
      // setSize([1200, window.innerHeight - HeightConfig.headerHeight - HeightConfig.whiteHeight]);
    }

    window.addEventListener('resize', updateSize)
    updateSize()
    return () => window.removeEventListener('resize', updateSize)
  }, [])
  return (
    <>
      <Toast
        alertText={t('errorBetaEnv', { ns: 'error' })}
        open={showBeta}
        autoHideDuration={TOAST_TIME}
        onClose={() => {
          setShowBeta(false)
        }}
        severity={ToastType.warning}
      />
      <FooterUI
        isBeta={process.env?.REACT_APP_TEST_ENV == 'true'}
        isLandingPage={isLandingPage}
        linkListMap={linkListMap}
        mediaList={mediaList}
      />
    </>
  )
}
