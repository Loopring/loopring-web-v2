import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { Box, styled, Typography } from "@mui/material";
import { useSettings } from "@loopring-web/component-lib";
// import { useSpring } from "react-spring";
// import { animated, to } from "@react-spring/web";
import { useTheme } from "@emotion/react";
import { ThemeType } from "@loopring-web/common-resources";

export type CardProps = {
  title: string;
  icon: string;
  animationJSON: string;
  describe: string;
};
// const BoxStyle = styled(animated.div)`
//   //width: 400px !important;
//   svg {
//     fill: ${({ theme }: any) => theme.colorBase.textPrimary};
//     .svg-high {
//       fill: ${({ theme }: any) => theme.colorBase.primary};
//     }
//   }
//   :hover {
//     svg {
//       fill: ${({ theme }: any) => theme.colorBase.textButton};
//       .svg-high {
//         fill: ${({ theme }: any) => theme.colorBase.star};
//       }
//     }
//     p,
//     h3 {
//       color: ${({ theme }: any) => theme.colorBase.textButton};
//     }
//   }
// ` as unknown as typeof animated.div;
export const Card = withTranslation(["landPage", "common"], { withRef: true })(
  ({
    t,
    title,
    icon,
    // animationJSON,
    describe,
  }: WithTranslation & {
    title: string;
    icon: React.ReactNode;
    // animationJSON,
    describe: string;
  }) => {
    const theme = useTheme();
    // const [styles, api] = useSpring(() => ({
    //   scale: 1,
    //   zoom: 1,
    //   zIndex: 10,
    //   border: `1px solid ${theme.colorBase.border}`, //"var(--border-card)",
    //   boxShadow: "var(--shadow3)", //theme.colorBase.boxShadow, //"var(--box-card-shadow)",
    //   background: theme.mode === ThemeType.dark ? "#283485" : "#fff", //"var(--box-card-background)",
    //   default: {
    //     immediate: (key) => {
    //       return [
    //         "scale",
    //         "zoom",
    //         "zIndex",
    //         "border",
    //         "boxShadow",
    //         "background",
    //       ].includes(key);
    //     },
    //   },
    //   config: {
    //     mass: 5,
    //     tension: 350,
    //     friction: 40,
    //   },
    // }));
    const { isMobile } = useSettings();
    return (
      <Box
        // onMouseEnter={() =>
        //   api({
        //     scale: 1.1,
        //     zoom: 1,
        //     zIndex: 99,
        //     border: "0px solid #fff",
        //     boxShadow:
        //       "inset 0px -16px 0px var(--border-card-hover), inset 0px 16px 0px var(--border-card-hover)",
        //     background: "var(--box-card-background-hover)",
        //   })
        // }
        className={"card"}
        // onMouseLeave={() => {
        //   api({
        //     scale: 1,
        //     zoom: 1,
        //     zIndex: 10,
        //     border: "var(--border-card)",
        //     boxShadow: "var(--box-card-shadow)",
        //     background: "var(--box-card-background)",
        //   });
        // }}
        style={{
          scale: 1,
          zoom: 1,
          zIndex: 10,
          border: `1px solid ${theme.colorBase.border}`, //"var(--border-card)",
          boxShadow: "var(--shadow3)", //theme.colorBase.boxShadow, //"var(--box-card-shadow)",
          background: theme.mode === ThemeType.dark ? "#283485" : "#fff", //"var(--box-card-background)",
          // transform: "perspective(600px)",
          // height: 480,
          // width: isMobile ? "var(--mobile-full-panel-width)" : 400,
          // zIndex: to([styles.zIndex], (zIndex) => zIndex),
          // background: to([styles.background], (background) => background),
          // boxShadow: to([styles.boxShadow], (boxShadow) => boxShadow),
          // border: to([styles.border], (border) => border),
          // scale: to([styles.scale, styles.zoom], (s, z) => s * z),
        }}
      >
        <Box marginTop={4}>{icon}</Box>
        <Box
          position={"absolute"}
          top={"40%"}
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
        >
          <Typography component={"div"} marginTop={4}>
            <Typography
              whiteSpace={"pre-line"}
              fontWeight={500}
              component={"h5"}
              variant={"h3"}
            >
              {t(title)}
            </Typography>
          </Typography>
          <Typography
            component={"p"}
            textAlign={"center"}
            marginTop={3}
            variant={"h5"}
            whiteSpace={"pre-line"}
            color={"var(--text-secondary)"}
            fontWeight={400}
            width={306}
          >
            {t(describe)}
          </Typography>
        </Box>
        {/*<animated.div*/}
        {/*    style={{ transform: y.interpolate(v => `translateY(${v}%`) }}*/}
        {/*    className="glance"*/}
        {/*/>*/}
      </Box>
    );
  }
);
