const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const resolveFrom = require("resolve-from");

const config = getDefaultConfig(__dirname);

// event-target-shim 충돌 해결
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName.startsWith("event-target-shim") &&
    context.originModulePath.includes("@videosdk.live/react-native-webrtc")
  ) {
    const updatedModuleName = moduleName.endsWith("/index") ? moduleName.replace("/index", "") : moduleName;

    const eventTargetShimPath = resolveFrom(context.originModulePath, updatedModuleName);

    return {
      filePath: eventTargetShimPath,
      type: "sourceFile",
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};

// NativeWind 설정 유지
module.exports = withNativeWind(config, { input: "./global.css" });
