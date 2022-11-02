module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'transform-inline-environment-variables',
        {
          include: ['API_URI', 'REALTIME_API_URI', 'API_KEY'],
        },
      ],
    ],
  }
}
