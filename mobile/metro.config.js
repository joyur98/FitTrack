const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.transpilePackages = [
  "nativewind",
  "react-native-css-interop"
];

module.exports = config;
