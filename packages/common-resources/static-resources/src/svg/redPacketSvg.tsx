import { SoursURL } from "../constant";
import { sanitize } from "dompurify";
import React from "react";

export const RedPacketColorConfig: {
  default: ColorConfig;
  official: ColorConfig;
} = {
  default: {
    colorTop: "#FD7659",
    startColor: "#FC7A5A",
    endColor: "#FF6151",
    bgColor: "#ffffff",
    fontColor: "#FFF7B1",
    btnColor: "#FD7659",
    qrColor: "#FD7659",
  },
  official: {
    colorTop: "#FFD595",
    startColor: "#FFD596",
    endColor: "#FDBD6A",
    bgColor: "#ffffff",
    fontColor: "#A25402",
    btnColor: "#FD7659",
    qrColor: "#A25402",
  },
};
export const RedPacketCssColorConfig: {
  default: ColorCssConfig;
  official: ColorCssConfig;
  blindbox: ColorCssConfig;
} = {
  default: {
    colorTop: "#FD7659",
    startColor: "#FC7A5A",
    endColor: "#FF6151",
    startBgColor: "#FC7A5A",
    endBgColor: "#930D00",
    startCard: "#FEF4DE",
    endCard: "#FED897",
    line: "#D4B164",
    highLightColor: "#A25402",
    highLightDisableColor: "#A25402",
    primaryColor: "#FFF7B1",
    secondaryColor: "#D09145",
    disableColor: "#7C3400",
  },
  official: {
    colorTop: "#FFD595",
    startColor: "#FFD596",
    endColor: "#FDBD6A",
    startBgColor: "#FFD595",
    endBgColor: "#934F00",
    startCard: "#FEF4DE",
    endCard: "#FED897",
    line: "#D4B164",
    highLightColor: "#A25402",
    highLightDisableColor: "#A25402",
    primaryColor: "#A25402",
    secondaryColor: "#D09145",
    disableColor: "#7C3400",
  },
  blindbox: {
    // background: linear-gradient(95.9deg, #A35388 0.7%, #FF6151 99.3%);

    colorTop: "url('#gradient1')",
    startColor: "#A35388",
    endColor: "#FF6151",
    startBgColor: "#FC7A5A",
    endBgColor: "#930D00",
    startCard: "#FEF4DE",
    endCard: "#FED897",
    line: "#D4B164",
    highLightColor: "#A25402",
    highLightDisableColor: "#A25402",
    primaryColor: "#FFF7B1",
    secondaryColor: "#D09145",
    disableColor: "#7C3400",
  },
};
export const RedPacketWrapSVG = ({
  colorTop,
  startColor,
  endColor,
  type,
}: {
  type: "default" | "official" | "blindbox";
  colorTop: "#FD7659" | "#FFD595";
  startColor: "#FC7A5A" | "#FFD596";
  endColor: "#FF6151" | "#FDBD6A";
}) => { 
  return (
    <svg width={274} height={414} viewBox="0 0 274 414" aria-hidden="true">
      
      <path
        d="M7 13C7 7.47714 11.4772 3 17 3H257C262.523 3 267 7.47715 267 13V393C267 398.523 262.523 403 257 403H17C11.4772 403 7 398.523 7 393V13Z"
        fill={`url(#paint_linear_${type})`}
      />
      <g filter={`url(#filterWrap${type}1)`}>
        <path
          d="M17 3C11.4771 3 7 7.47716 7 13V108.095C7 112.092 9.3688 115.728 13.1024 117.154C43.3399 128.709 87.6387 136 137 136C186.361 136 230.66 128.709 260.898 117.154C264.631 115.728 267 112.092 267 108.095V13C267 7.47716 262.523 3 257 3H17Z"
          fill={colorTop}
        />  
      </g>
      {type === "blindbox" && <image style={{transform: "translate(37px, 150px)"}} opacity={"0.2"} href={SoursURL + "images/redpackBlind3.webp"} height="200" width="200" />  }
      <defs>
        <filter
          id={`filterWrap${type}1`}
          x="0"
          y="0"
          width="274"
          height="147"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="3.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.745276 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_8955_1158"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_8955_1158"
            result="shape"
          />
        </filter>
        <linearGradient gradientTransform="rotate(95.9deg)" id={`paint_linear_${type}`}>
          <stop offset="0.7%" stop-color={startColor} />
          <stop offset="99.3%" stop-color={endColor} />
        </linearGradient>
        <linearGradient gradientTransform="rotate(95.9deg)" id="gradient1">
          <stop offset="0.7%" stop-color="#A35388" />
          <stop offset="99.3%" stop-color="#FF6151" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const RedPacketOpenWrapSVG = ({
  // colorTop,
  startColor,
  endColor,
  startBgColor,
  endBgColor,
  startCard,
  endCard,
  line,
  type,
}: {
  type: "default" | "official" | "blindbox";
  colorTop: "#FD7659" | "#FFD595";
  startColor: "#FC7A5A" | "#FFD596";
  endColor: "#FF6151" | "#FDBD6A";
  startBgColor: "#FC7A5A" | "#FFD595";
  endBgColor: "#930D00" | "#934F00";
  startCard: "#FEF4DE";
  endCard: "#FED897";
  line: "#D4B164";
} & Partial<React.SVGProps<SVGSVGElement>>) => {
  return (
    <svg width={274} height={414} viewBox="0 0 274 414" aria-hidden="true">
      <g transform={"translate(7 7)"}>
        <path
          d="M0 39C0 33.4772 4.47715 29 10 29H250C255.523 29 260 33.4772 260 39V393C260 398.523 255.523 403 250 403H10C4.47716 403 0 398.523 0 393V39Z"
          fill={`url(#paint${type}0)`}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M130 14C137.732 14 144 7.73199 144 0H236C240.418 0 244 3.58172 244 8V180C244 184.418 240.418 188 236 188H24C19.5817 188 16 184.418 16 180V8C16 3.58172 19.5817 0 24 0H116C116 7.73199 122.268 14 130 14Z"
          fill={`url(#paint${type}1)`}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M111.976 13.6182C111.609 13.0951 111.264 12.5552 110.943 12H108.945V13H110.375C110.624 13.406 110.885 13.8036 111.157 14.1924L111.976 13.6182ZM34.5551 13.3475L35.1114 14.1784C34.3476 14.6898 33.6898 15.3476 33.1784 16.1114L32.3475 15.5551C32.9315 14.6827 33.6827 13.9315 34.5551 13.3475ZM31 166.053H32V168C32 168.469 32.0459 168.926 32.1333 169.367L31.1523 169.561C31.0524 169.056 31 168.534 31 168V166.053ZM32.3475 172.445L33.1784 171.889C33.6898 172.652 34.3476 173.31 35.1114 173.822L34.5551 174.653C33.6827 174.068 32.9315 173.317 32.3475 172.445ZM219.906 176V175H221.894C222.362 175 222.819 174.954 223.261 174.867L223.455 175.848C222.95 175.948 222.428 176 221.894 176H219.906ZM226.339 174.653L225.782 173.822C226.546 173.31 227.204 172.652 227.715 171.889L228.546 172.445C227.962 173.317 227.211 174.068 226.339 174.653ZM229.894 21.9474H228.894V20C228.894 19.5312 228.848 19.0742 228.76 18.6328L229.741 18.4387C229.841 18.9437 229.894 19.4657 229.894 20V21.9474ZM228.546 15.5551L227.715 16.1114C227.204 15.3476 226.546 14.6898 225.782 14.1784L226.339 13.3475C227.211 13.9315 227.962 14.6827 228.546 15.5551ZM151.08 12V13H149.625C149.376 13.406 149.115 13.8036 148.843 14.1924L148.024 13.6182C148.391 13.0951 148.736 12.5552 149.057 12H151.08ZM145.557 16.5555L146.264 17.2625C145.319 18.2078 144.292 19.0712 143.195 19.8411L142.62 19.0225C143.67 18.2859 144.653 17.4599 145.557 16.5555ZM139.3 20.9433L139.723 21.8494C138.52 22.4114 137.26 22.8724 135.955 23.2215L135.696 22.2554C136.945 21.9217 138.15 21.4808 139.3 20.9433ZM131.919 22.9175L132.005 23.9138C131.344 23.9709 130.675 24 130 24C129.325 24 128.656 23.9709 127.995 23.9138L128.081 22.9175C128.714 22.9721 129.354 23 130 23C130.646 23 131.286 22.9721 131.919 22.9175ZM124.304 22.2554L124.045 23.2215C122.74 22.8724 121.48 22.4114 120.277 21.8494L120.7 20.9433C121.85 21.4808 123.055 21.9217 124.304 22.2554ZM117.38 19.0225L116.805 19.8411C115.708 19.0712 114.681 18.2078 113.736 17.2625L114.443 16.5555C115.347 17.4599 116.33 18.2859 117.38 19.0225ZM155.127 12V13H159.173V12H155.127ZM163.22 12V13H167.266V12H163.22ZM171.312 12V13H175.359V12H171.312ZM179.405 12V13H183.452V12H179.405ZM187.498 12V13H191.545V12H187.498ZM195.591 12V13H199.638V12H195.591ZM203.684 12V13H207.731V12H203.684ZM211.777 12V13H215.824V12H211.777ZM219.87 12V13H221.894C222.362 13 222.819 13.0459 223.261 13.1333L223.455 12.1523C222.95 12.0524 222.428 12 221.894 12H219.87ZM229.894 25.8421H228.894V29.7368H229.894V25.8421ZM229.894 33.6316H228.894V37.5263H229.894V33.6316ZM229.894 41.421H228.894V45.3158H229.894V41.421ZM229.894 49.2105H228.894V53.1053H229.894V49.2105ZM229.894 57H228.894V60.8947H229.894V57ZM229.894 64.7895H228.894V68.6842H229.894V64.7895ZM229.894 72.5789H228.894V76.4737H229.894V72.5789ZM229.894 80.3684H228.894V84.2632H229.894V80.3684ZM229.894 88.1579H228.894V92.0526H229.894V88.1579ZM229.894 95.9474H228.894V99.8421H229.894V95.9474ZM229.894 103.737H228.894V107.632H229.894V103.737ZM229.894 111.526H228.894V115.421H229.894V111.526ZM229.894 119.316H228.894V123.211H229.894V119.316ZM229.894 127.105H228.894V131H229.894V127.105ZM229.894 134.895H228.894V138.789H229.894V134.895ZM229.894 142.684H228.894V146.579H229.894V142.684ZM229.894 150.474H228.894V154.368H229.894V150.474ZM229.894 158.263H228.894V162.158H229.894V158.263ZM229.894 166.053H228.894V168C228.894 168.469 228.848 168.926 228.76 169.367L229.741 169.561C229.841 169.056 229.894 168.534 229.894 168V166.053ZM215.93 176V175H211.954V176H215.93ZM207.978 176V175H204.002V176H207.978ZM200.026 176V175H196.05V176H200.026ZM192.074 176V175H188.098V176H192.074ZM184.122 176V175H180.146V176H184.122ZM176.17 176V175H172.194V176H176.17ZM168.218 176V175H164.242V176H168.218ZM160.266 176V175H156.29V176H160.266ZM152.314 176V175H148.339V176H152.314ZM144.363 176V175H140.387V176H144.363ZM136.411 176V175H132.435V176H136.411ZM128.459 176V175H124.483V176H128.459ZM120.507 176V175H116.531V176H120.507ZM112.555 176V175H108.579V176H112.555ZM104.603 176V175H100.627V176H104.603ZM96.6513 176V175H92.6753V176H96.6513ZM88.6994 176V175H84.7234V176H88.6994ZM80.7475 176V175H76.7715V176H80.7475ZM72.7956 176V175H68.8196V176H72.7956ZM64.8437 176V175H60.8677V176H64.8437ZM56.8918 176V175H52.9158V176H56.8918ZM48.9399 176V175H44.9639V176H48.9399ZM40.988 176V175H39C38.5312 175 38.0742 174.954 37.6328 174.867L37.4387 175.848C37.9437 175.948 38.4657 176 39 176H40.988ZM31 162.158H32V158.263H31V162.158ZM31 154.368H32V150.474H31V154.368ZM31 146.579H32V142.684H31V146.579ZM31 138.789H32V134.895H31V138.789ZM31 131H32V127.105H31V131ZM31 123.211H32V119.316H31V123.211ZM31 115.421H32V111.526H31V115.421ZM31 107.632H32V103.737H31V107.632ZM31 99.8421H32V95.9474H31V99.8421ZM31 92.0526H32V88.1579H31V92.0526ZM31 84.2632H32V80.3684H31V84.2632ZM31 76.4737H32V72.579H31V76.4737ZM31 68.6842H32V64.7895H31V68.6842ZM31 60.8947H32V57H31V60.8947ZM31 53.1053H32V49.2105H31V53.1053ZM31 45.3158H32V41.4211H31V45.3158ZM31 37.5263H32V33.6316H31V37.5263ZM31 29.7368H32V25.8421H31V29.7368ZM31 21.9474H32V20C32 19.5312 32.0459 19.0742 32.1333 18.6328L31.1523 18.4387C31.0524 18.9437 31 19.4657 31 20V21.9474ZM37.4387 12.1523L37.6328 13.1333C38.0742 13.0459 38.5312 13 39 13H40.9984V12H39C38.4657 12 37.9437 12.0524 37.4387 12.1523ZM44.9953 12V13H48.9921V12H44.9953ZM52.989 12V13H56.9858V12H52.989ZM60.9826 12V13H64.9795V12H60.9826ZM68.9763 12V13H72.9732V12H68.9763ZM76.97 12V13H80.9669V12H76.97ZM84.9637 12V13H88.9606V12H84.9637ZM92.9574 12V13H96.9543V12H92.9574ZM100.951 12V13H104.948V12H100.951Z"
          fill={line}
        />
        <g filter={`url(#filterOpenWrap${type}0)`}>
          <path
            d="M0 108.095V393C0 398.523 4.47716 403 10 403H250C255.523 403 260 398.523 260 393V108.095C260 112.092 257.631 115.728 253.898 117.154C223.66 128.709 179.361 136 130 136C80.6387 136 36.3399 128.709 6.10237 117.154C2.3688 115.728 0 112.092 0 108.095Z"
            fill={`url(#paint${type}2)`}
          />
        </g>
        {type === "blindbox" && <image style={{transform: "translate(30px, 150px)"}} opacity={"0.2"} href={SoursURL + "images/redpackBlind3.webp"} height="200" width="200" />  }
      </g>

      <defs>
        <filter
          id={`filterOpenWrap${type}0`}
          x="0"
          y="108.095"
          width="260"
          height="294.905"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="3" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_8955_1198"
          />
        </filter>
        <linearGradient gradientTransform="rotate(95.9deg)" id={`paint${type}0`}>
          <stop offset="0.7%" stop-color={startBgColor} />
          <stop offset="99.3%" stop-color={endBgColor} />
        </linearGradient>
        <linearGradient gradientTransform="rotate(95.9deg)" id={`paint${type}1`}>
          <stop offset="0.7%" stop-color={startCard} />
          <stop offset="99.3%" stop-color={endCard} />
        </linearGradient>
        <linearGradient gradientTransform="rotate(95.9deg)" id={`paint${type}2`}>
          <stop offset="0.7%" stop-color={startColor} />
          <stop offset="99.3%" stop-color={endColor} />
        </linearGradient>
        {/* <linearGradient gradientTransform="rotate(95.9deg)" id="gradient1">
          <stop offset="0.7%" stop-color="#A35388" />
          <stop offset="99.3%" stop-color="#FF6151" />
        </linearGradient> */}

        {/* <linearGradient
          id={`paint${type}0`}
          x1="130"
          y1="29"
          x2="130"
          y2="164.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={startBgColor} />
          <stop offset="1" stopColor={endBgColor} />
        </linearGradient>
        <linearGradient
          id={`paint${type}1`}
          x1="130"
          y1="0"
          x2="130"
          y2="318"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={startCard} />
          <stop offset="1" stopColor={endCard} />
        </linearGradient>
        <linearGradient
          id={`paint${type}2`}
          x1="130"
          y1="2.99983"
          x2="328.271"
          y2="176.757"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={startColor} />
          <stop offset="1" stopColor={endColor} />
        </linearGradient> */}
      </defs>
    </svg>
  );
};
export type RedPacketQRPropsExtends = {
  textAddress: string;
  textContent: string;
  amountStr: string;
  textSendBy: string; //text send by
  textType: string;
  textShared: string;
  textNo: string;
  textDes: string;
  imageEleUrl?: string;
  onClickShareButton?: (e: React.MouseEvent<SVGGElement, MouseEvent>) => void;
};
export type ColorConfig = {
  colorTop: string;
  startColor: string;
  endColor: string;
  bgColor: string;
  fontColor: string;
  btnColor: string;
  qrColor: string;
};
export type ColorCssConfig = {
  colorTop: string;
  startColor: string;
  endColor: "#FF6151" | "#FDBD6A";
  startBgColor: "#FC7A5A" | "#FFD595";
  endBgColor: "#930D00" | "#934F00";
  startCard: "#FEF4DE";
  endCard: "#FED897";
  line: "#D4B164";
  highLightColor: "#A25402";
  highLightDisableColor: "#A25402";
  primaryColor: "#FFF7B1" | "#A25402";
  secondaryColor: "#D09145";
  disableColor: "#7C3400";
};
export const RedPacketQRCodeSvg = React.memo(
  React.forwardRef(
    (
      {
        startColor,
        endColor,
        colorTop,
        bgColor,
        fontColor,
        btnColor,
        type,
        qrcodeRef,
        textAddress,
        textContent,
        amountStr,
        qrCodeG,
        textSendBy,
        textType,
        textShared,
        textNo,
        textDes,
        imageEleUrl,
        onClickShareButton,
      }: ColorConfig & {
        type: "default" | "official";
        qrcodeRef: React.Ref<SVGGElement>;
        // qrCodeG;
      } & RedPacketQRPropsExtends & {
          qrcodeRef: React.Ref<SVGGElement>;
          qrCodeG: string;
        },
      ref: React.ForwardedRef<any>
    ) => {
      const [[textContent1, textContent2], setTextContent] = React.useState([
        textContent,
        // "textContentdaskdjhkas jhdkjashdkjhaskjdhsakjhdkashd",
        "",
      ]);
      // const imageRef = React.useRef<any>();

      const [imageBase64, setImageBase64] = React.useState<string>(
        imageEleUrl ?? ""
      );
      React.useEffect(() => {
        if (imageEleUrl) {
          fetch(imageEleUrl)
            .then((result) => result.blob())
            .then((result) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                // @ts-ignore
                setImageBase64((state) => reader?.result ?? state);
              };

              reader.onerror = () => {
                console.log("reader error");
              };
              reader.readAsDataURL(result);

              // myLog("blob", result.stream());
              // if (result) {
              //   setImageBase64(result.toString());
              // }
            });
        }
      }, [imageEleUrl]);

      React.useEffect(() => {
        const [str1, str2] = textContent?.split("\n");
        if (textContent && str2) {
          setTextContent([str1, str2]);
        } else if (textContent && textContent.length > 12) {
          const value = textContent.substring(0, 12);
          let _textContent2 = textContent.substring(12, textContent.length);
          const textArray = value.split(" ");
          _textContent2 =
            (textArray.length > 2 ? textArray.pop() : "") + _textContent2;
          const _textContent1 = textArray.join(" ");
          setTextContent([_textContent1, _textContent2]);
        }
      }, [textContent]);

      const station = imageEleUrl ? [36, 68, 86, 188] : [56, 88, 106, 186];
      return (
        <>
          <svg
            ref={ref}
            width="334"
            height="603"
            viewBox="0 0 334 603"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 13C7 7.47714 11.4772 3 17 3H317C322.523 3 327 7.47715 327 13V593C327 598.523 322.523 603 317 603H17C11.4772 603 7 598.523 7 593V13Z"
              fill={`url(#paintQRCode${type}0)`}
            />
            <path
              onClick={onClickShareButton}
              d="M108 537C108 527.059 116.059 519 126 519H208C217.941 519 226 527.059 226 537V537C226 546.941 217.941 555 208 555H126C116.059 555 108 546.941 108 537V537Z"
              fill={bgColor}
            />
            {!!textSendBy && (
              <path
                opacity="0.16"
                d="M31 428C31 423.582 34.5817 420 39 420H295C299.418 420 303 423.582 303 428V477C303 481.418 299.418 485 295 485H39C34.5817 485 31 481.418 31 477V428Z"
                fill="white"
              />
            )}
            <g filter={`url(#filterQRCode${type}0)`}>
              <path
                d="M19.3077 3C12.5103 3 7 8.52071 7 15.3308V134.131C7 138.126 9.36023 141.753 13.0801 143.208C50.3215 157.777 105.464 167 167 167C228.536 167 283.679 157.777 320.92 143.208C324.64 141.753 327 138.126 327 134.131V15.3308C327 8.52071 321.49 3 314.692 3H19.3077Z"
                fill={colorTop}
              />
            </g>
            <path
              opacity="0.16"
              d="M225 3H319C323.418 3 327 6.58172 327 11V30H233C228.582 30 225 26.4183 225 22V3Z"
              fill="white"
            />
            <defs>
              <filter
                id={`filterQRCode${type}0`}
                x="0"
                y="0"
                width="334"
                height="178"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dy="4" />
                <feGaussianBlur stdDeviation="3.5" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                  type="matrix"
                  values={
                    type == "official"
                      ? "0 0 0 0 0.745276 0 0 0 0 0.402449 0 0 0 0 0 0 0 0 0.25 0"
                      : "0 0 0 0 0.745276 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                  }
                  // values="0 0 0 0 0.745276 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                />
                <feBlend
                  mode="normal"
                  in2="BackgroundImageFix"
                  result="effect1_dropShadow_8960_1241"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect1_dropShadow_8960_1241"
                  result="shape"
                />
              </filter>
              <linearGradient
                id={`paintQRCode${type}0`}
                x1="167"
                y1="2.99995"
                x2="451.393"
                y2="207.498"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor={startColor} />
                <stop offset="1" stopColor={endColor} />
              </linearGradient>
            </defs>
            <g
              ref={qrcodeRef}
              transform={"translate(67 210)"}
              width="160"
              height="160"
              dangerouslySetInnerHTML={{ __html: qrCodeG ?? "" }}
            >
              {/*<rect className={"qrcode"} width="160" height="160" fill="#D9D9D9" />*/}
              {/*{qrCodeG}*/}
            </g>
            {imageEleUrl && (
              <image
                transform={"translate(128 90)"}
                href={imageBase64}
                height="80"
                width="80"
              />
            )}

            <g transform={`translate(167 ${station[0]})`}>
              {/*<rect x="15.5" y="45.5" width="280" height="21" />*/}
              <text
                className={"textAddress"}
                strokeWidth="0"
                fill={fontColor}
                x="1"
                y="1"
                style={{
                  dominantBaseline: "central",
                  textAnchor: "middle",
                  fontSize: "14px",
                }}
              >
                {textAddress}
              </text>
            </g>
            <g transform={`translate(167 ${station[1]})`}>
              <text
                className={"textContent1"}
                strokeWidth="0"
                fill={fontColor}
                x="1"
                y="1"
                style={{
                  dominantBaseline: "central",
                  textAnchor: "middle",
                  fontSize: "14px",
                }}
                dangerouslySetInnerHTML={{ __html: sanitize(textContent1) }}
              />
            </g>
            <g transform={`translate(167 ${station[2]})`}>
              <text
                className={"textContent2"}
                strokeWidth="0"
                fill={fontColor}
                x="1"
                y="1"
                style={{
                  dominantBaseline: "central",
                  textAnchor: "middle",
                  fontSize: "14px",
                }}
                dangerouslySetInnerHTML={{
                  __html:
                    textContent2 &&
                    sanitize(
                      textContent2.length > 12
                        ? textContent2.slice(0, 12) + "..."
                        : textContent2
                    ),
                }}
              />
            </g>
            <g transform={`translate(167 ${station[3]})`}>
              <text
                id={"amountStr"}
                strokeWidth="0"
                fill={fontColor}
                x="1"
                y="1"
                style={{
                  dominantBaseline: "central",
                  textAnchor: "middle",
                  fontSize: "28px",
                }}
              >
                {amountStr}
              </text>
            </g>
            <g transform={"translate(276 14)"}>
              <text
                className={"textType"}
                strokeWidth="0"
                fill={fontColor}
                x="1"
                y="1"
                style={{
                  dominantBaseline: "central",
                  textAnchor: "middle",
                  fontSize: "10px",
                }}
              >
                {textType}
              </text>
            </g>
            <g transform={"translate(167 434)"}>
              <text
                id={"textSendBy"}
                strokeWidth="0"
                fill={fontColor}
                x="1"
                y="1"
                style={{
                  dominantBaseline: "central",
                  textAnchor: "middle",
                  fontSize: "12px",
                }}
              >
                {textDes
                  .split(" ")
                  .slice(0, Math.ceil(textDes.split(" ").length / 2))
                  .join(" ")}
              </text>
            </g>
            <g transform={"translate(167 452)"}>
              <text
                id={"textSendBy"}
                strokeWidth="0"
                fill={fontColor}
                x="1"
                y="1"
                style={{
                  dominantBaseline: "central",
                  textAnchor: "middle",
                  fontSize: "12px",
                }}
              >
                {textDes
                  .split(" ")
                  .slice(Math.ceil(textDes.split(" ").length / 2))
                  .join(" ")}
              </text>
            </g>
            <g transform={"translate(167 470)"}>
              <text
                id={"textSendBy"}
                strokeWidth="0"
                fill={fontColor}
                x="1"
                y="1"
                style={{
                  dominantBaseline: "central",
                  textAnchor: "middle",
                  fontSize: "12px",
                }}
                dangerouslySetInnerHTML={{ __html: textSendBy }}
              />
            </g>
            <g onClick={onClickShareButton} transform={"translate(167 535)"}>
              <text
                className={"textShared"}
                strokeWidth="0"
                fill={btnColor}
                x="1"
                y="1"
                style={{
                  dominantBaseline: "central",
                  textAnchor: "middle",
                  fontSize: "16px",
                }}
              >
                {textShared}
              </text>
            </g>
            <g transform={"translate(167 568)"}>
              <text
                className={"textNo"}
                strokeWidth="0"
                fill={fontColor}
                x="1"
                y="1"
                style={{
                  dominantBaseline: "central",
                  textAnchor: "middle",
                  fontSize: "12px",
                }}
              >
                {textNo}
              </text>
            </g>
          </svg>
        </>
      );
    }
  )
);
