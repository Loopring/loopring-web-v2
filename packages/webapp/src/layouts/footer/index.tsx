import React from "react";
import {
  FEED_BACK_LINK,
  FOOTER_LIST_MAP,
  MEDIA_LIST,
} from "@loopring-web/common-resources";
import { useLocation } from "react-router-dom";
import { Footer as FooterUI } from "@loopring-web/component-lib";
import _ from "lodash";

const linkListMap = _.cloneDeep(FOOTER_LIST_MAP);
const mediaList = _.cloneDeep(MEDIA_LIST);
export const Footer = () => {
  // const [size, setSize] = React.useState<[number, number]>([1200, 0]);
  const location = useLocation();
  const isLandingPage =
    location.pathname === "/" || location.pathname === "/wallet";
  // const isWallet = location.pathname === '/wallet'
  React.useLayoutEffect(() => {
    function updateSize() {
      // setSize([1200, window.innerHeight - HeightConfig.headerHeight - HeightConfig.whiteHeight]);
    }

    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <FooterUI
      isLandingPage={isLandingPage}
      linkListMap={linkListMap}
      mediaList={mediaList}
    />
  );
};
