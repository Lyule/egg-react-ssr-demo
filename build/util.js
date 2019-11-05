const paths = require('./paths')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const publicPath = paths.servedPath
const shouldUseRelativeAssetPaths = publicPath === './'
const isDev = process.env.NODE_ENV === 'development'

const postcssNormalize = require('postcss-normalize')
const postcssAspectRatioMini = require('postcss-aspect-ratio-mini')
const postcssPxToViewport = require('postcss-px-to-viewport')
const postcssWriteSvg = require('postcss-write-svg')
// const postcssCssnext = require('postcss-cssnext');
const postcssViewportUnits = require('postcss-viewport-units')
const cssnano = require('cssnano');

const getStyleLoaders = (cssOptions, preProcessor) => {
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
      options: Object.assign(
        {},
        shouldUseRelativeAssetPaths ? { publicPath: '../../' } : undefined
      )
    },
    {
      loader: require.resolve('css-loader'),
      options: cssOptions
    },
    {
      loader: require.resolve('postcss-loader'),
      options: {
        ident: 'postcss',
        plugins: () => [
          require('postcss-flexbugs-fixes'),
          require('postcss-preset-env')({
            autoprefixer: {
              flexbox: 'no-2009'
            },
            stage: 3
          }),
          postcssNormalize(),
          postcssAspectRatioMini({}),
          postcssWriteSvg({
            utf8:false,
          }),
          // postcssCssnext({}),
          postcssPxToViewport({
            viewportWidth: 750, // 视窗的宽度，对应我们设计稿的宽度，一般是750
            unitPrecision: 3, // 指定'px'转换为视窗单位值得小数位数（很多时候无法整除）
            viewportUnit: 'vw', // 指定需要转换成的视窗单位,建议使用vw
            selectorBlackList: [
                '.ignore',
                '.hairliness', 
            ], // 指定不转换为视窗单位的类，可以自定义，可以无限添加,建议定义一至两个通用的类名
            minPixelValue: 1, // 小于或等于`1px`不转换为视窗单位，你也可以设置为你想要的值。
            mediaQuery: false, // 允许在媒体查询中转换`px`
          }),
          postcssViewportUnits({}),
          cssnano({
            autoprefixer:false,
            'postcss-zindex':false,
          }),
        ]
      }
    }
  ]
  if (isDev) {
    loaders.unshift(require.resolve('css-hot-loader'))
  }
  if (preProcessor) {
    // 添加额外的loader
    loaders.push(require.resolve(preProcessor))
  }
  return loaders
}
module.exports = {
  getStyleLoaders
}
