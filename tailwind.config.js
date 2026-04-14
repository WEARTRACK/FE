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

        bg: {
          light: "#F7F9FC",
          dark: "#070117",
        },

        text: {
          DEFAULT: "#2B2F3A",
          subdued: "#6B7280",
        },

        blue: {
          1: "#EDF2FF",
          2: "#CDDDFF",
          3: "#B1C9FF",
          4: "#7EA5FF",
        },

        cool: "#EFF0F3",
        disabled: "#BDBDBD",
      },
      fontFamily: {
        "pretendard-light": ["PretendardLight"],
        pretendard: ["PretendardRegular"],
        "pretendard-semibold": ["PretendardSemiBold"],
      },
      fontSize: {
        headline: [
          "20px",
          {
            lineHeight: "20px",
            letterSpacing: "-0.5px",
          },
        ],
        subhead: [
          "13px",
          {
            lineHeight: "20px",
            letterSpacing: "-0.5px",
          },
        ],
        body: [
          "12px",
          {
            lineHeight: "20px",
            letterSpacing: "0px",
          },
        ],
        caption: [
          "10px",
          {
            lineHeight: "20px",
            letterSpacing: "-0.5px",
          },
        ],
        "button-lg": [
          "18px",
          {
            lineHeight: "18px",
            letterSpacing: "0px",
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
