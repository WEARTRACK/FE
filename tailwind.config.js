/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#CDDDFF",
        accent: "#417AFF",
        error: "#EF4444",
        white: "#FFFFFF",
        gray: "#F8F8F8",

        bg: {
          light: "#F7F9FC",
          dark: "#030027",
        },

        text: {
          DEFAULT: "#2B2F3A",
          subdued: "#6B7280",
        },

        blue: {
          0: "#FBFCFF",
          1: "#EDF2FF",
          2: "#CDDDFF",
          3: "#B1C9FF",
          4: "#7EA5FF",
        },

        cool: "#EFF0F3",
        disabled: "#BDBDBD",

        red: {
          1: "#FFF9F9",
          2: "#FFE0E0",
          3: "#FF9E9E",
          4: "#FF5050",
        },

        yellow: {
          1: "#FFFCF8",
          2: "#FFF3DD",
          3: "#FFD78B",
          4: "#FFB041",
        },

        green: {
          1: "#FBFFFB",
          2: "#E6FFEA",
          3: "#8CDDB6",
          4: "#32BA81",
        },
      },
      fontFamily: {
        "pretendard-light": ["PretendardLight"],
        pretendard: ["PretendardRegular"],
        "pretendard-semibold": ["PretendardSemiBold"],
        "pretendard-bold": ["PretendardBold"],
      },
      fontSize: {
        headline: [
          "20px",
          {
            lineHeight: "20px",
            letterSpacing: "-0.5px",
          },
        ],
        heading: [
          "15px",
          {
            lineHeight: "20px",
            letterSpacing: "-0.5px",
          },
        ],
        subhead: [
          "14px",
          {
            lineHeight: "20px",
            letterSpacing: "-0.5px",
          },
        ],
        body: [
          "14px",
          {
            lineHeight: "20px",
            letterSpacing: "0px",
          },
        ],
        caption: [
          "12px",
          {
            lineHeight: "20px",
            letterSpacing: "-0.5px",
          },
        ],
        "button-lg": [
          "18px",
          {
            lineHeight: "20px",
            letterSpacing: "-0.5px",
          },
        ],
        "button-md": [
          "16px",
          {
            lineHeight: "16px",
            letterSpacing: "0px",
          },
        ],
      },
    },
  },
  plugins: [],
};
