import { WithTranslation, withTranslation } from "react-i18next";
import React, { ForwardedRef } from "react";

export type ShareReferralSvgProps = {
  src: string;
  code: string;
  label?: string;
  height?: number;
  width?: number;
  bottom?: number;
  left?: number;
  fontColor?: string;
};
export const ShareReferralSvg = withTranslation("common")(
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
          fontColor = "#000000",
        }: ShareReferralSvgProps & WithTranslation,
        ref: ForwardedRef<any>
      ) => {
        const refImage = React.createRef<SVGImageElement>();
        const lebelY = height - bottom - 100;
        const lebelX = left;
        const lebelCodeY = lebelY + 56;
        const lebelCodeX = left;
        const labelCode = t("labelReferralImageCode", code);
        return (
          <svg
            ref={ref}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            aria-hidden="true"
          >
            <image ref={refImage} width={width} height={height} href={src} />
            <g transform={`translate(${lebelX} ${lebelY})`}>
              <text
                id={"amountStr"}
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
                id={"amountStr"}
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
        );
      }
    )
  )
);
