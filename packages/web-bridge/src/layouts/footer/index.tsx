import React from 'react'
import { FOOTER_LIST_MAP, MEDIA_LIST } from '@loopring-web/common-resources'
import { Footer as FooterUI } from '@loopring-web/component-lib'
import _ from 'lodash'

const linkListMap = _.cloneDeep(FOOTER_LIST_MAP)
const mediaList = _.cloneDeep(MEDIA_LIST)
export const Footer = () => {
  return (
    <FooterUI
      isBeta={false}
      isLandingPage={false}
      linkListMap={linkListMap}
      mediaList={mediaList}
    />
  )
}
