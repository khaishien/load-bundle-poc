const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const hasher = require('./hasher');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  serializer: {
    createModuleIdFactory: function () {
      return function (path) {
        const moduleId = hasher(path);

        return moduleId;
      };
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
