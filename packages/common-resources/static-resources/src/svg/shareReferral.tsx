import { WithTranslation, withTranslation } from "react-i18next";
import React from "react";

export type ShareReferralSvgProps = {
  src: string;
  code: string;
  label?: string;
  height?: number;
  width?: number;
  bottom?: number;
  left?: number;
  fontColor?: string;
  name?: string;
};
export const ShareReferralSvg = withTranslation("common", { withRef: true })(
  React.memo(
    React.forwardRef(
      (
        {
          t,
          code,
          label = t("labelReferralImageDes"),
          height = 880,
          width = 630,
          src,
          bottom = 30,
          left = 48,
          name,
          fontColor = "#000000",
        }: ShareReferralSvgProps & WithTranslation,
        ref: React.ForwardedRef<any>
      ) => {
        const lebelY = height - bottom - 100 + 10;
        const lebelX = left;
        const lebelCodeY = lebelY + 60;
        const lebelCodeX = left;
        const labelCode = t("labelReferralImageCode", { code });

        return (
          <>
            <svg
              ref={ref}
              name={name}
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              aria-hidden="true"
            >
              <image width={width} height={height} href={src} />
              <g transform={`translate(${lebelX} ${lebelY})`}>
                <text
                  strokeWidth="0"
                  fill={fontColor}
                  x="1"
                  y="1"
                  style={{
                    dominantBaseline: "central",
                    textAnchor: "start",
                    fontSize: "28px",
                  }}
                >
                  {label}
                </text>
              </g>
              <g transform={`translate(${lebelCodeX} ${lebelCodeY})`}>
                <text
                  strokeWidth="0"
                  fill={fontColor}
                  x="1"
                  y="1"
                  style={{
                    dominantBaseline: "central",
                    textAnchor: "start",
                    fontSize: "44px",
                  }}
                >
                  {labelCode}
                </text>
              </g>
            </svg>
          </>
        );
      }
    )
  )
);
// export const ShareReferralSvg = _ShareReferralSvg)
// ) as (
//   props: ShareReferralSvgProps & WithTranslation & RefAttributes<any>
// ) => JSX.Element;
