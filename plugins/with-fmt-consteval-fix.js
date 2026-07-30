const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const FMT_CONSTEVAL_DEFINITION = "FMT_USE_CONSTEVAL=0";

const fmtTargetPatch = `    installer.pods_project.targets.each do |target|
      if target.name == 'fmt'
        target.build_configurations.each do |config|
          config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << '${FMT_CONSTEVAL_DEFINITION}'
        end
      end
    end
`;

const fmtTargetPatchWithSpacing = `
${fmtTargetPatch}
`;

const reactNativePostInstallCall = `    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
      :ccache_enabled => ccache_enabled?(podfile_properties),
    )
`;

function patchPodfile(contents) {
  if (contents.includes(FMT_CONSTEVAL_DEFINITION)) {
    return contents;
  }

  const targetLoop = "    installer.pods_project.targets.each do |target|\n";

  if (contents.includes(targetLoop)) {
    return contents.replace(targetLoop, fmtTargetPatch);
  }

  if (contents.includes(reactNativePostInstallCall)) {
    return contents.replace(
      reactNativePostInstallCall,
      `${reactNativePostInstallCall}${fmtTargetPatchWithSpacing}`,
    );
  }

  const postInstallBlock = "  post_install do |installer|\n";

  if (contents.includes(postInstallBlock)) {
    return contents.replace(postInstallBlock, `${postInstallBlock}${fmtTargetPatchWithSpacing}`);
  }

  return contents;
}

module.exports = function withFmtConstevalFix(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, "Podfile");
      const contents = await fs.promises.readFile(podfilePath, "utf8");
      await fs.promises.writeFile(podfilePath, patchPodfile(contents));
      return config;
    },
  ]);
};
