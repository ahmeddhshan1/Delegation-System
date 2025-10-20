import { Font } from "@react-pdf/renderer";

let fontsRegistered = false;

export const registerPDFFonts = () => {
    if (!fontsRegistered) {
        Font.register({
        family: "Cairo",
        src: "/fonts/Cairo-Regular.ttf",
        });
        fontsRegistered = true;

    }
};
