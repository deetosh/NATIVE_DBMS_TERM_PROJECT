import { Region } from "react-native-maps"
import { blue } from "react-native-reanimated/lib/typescript/Colors"

export const COLOR = {
    bg_primary: "#000000",
    bg_secondary: "#302b2b",
    bg_tertiary: "#6e706e",
    text_primary: "#FFFFFF",
    text_secondary: "#dedad9",
    text_tertiary: "#c2bebe",   
    text_dark: "#000000",
    btn_primary: "#bae3be",
    btn_secondary: "#f0c2c2",
    golden: "#cfc8ab",
    my_color: "#8F9181",
    bus_icon: "#1a73e8",
}

export const initialRegionMap : Region = {
    latitude: 22.320336,
    longitude: 87.309468,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
}