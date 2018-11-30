var webpack = require('webpack');

module.exports = {
    entry: [
           'webpack-dev-server/client?http://0.0.0.0:4000',
           'webpack/hot/only-dev-server',
           './react/style.css'
    ],
    output: {
        path: '/',
        filename: 'bundle.js'
    },
    devServer: {
       hot: true,
       filename: 'bundle.js',
       publicPath: '/',
       historyApiFallback: true,
       contentBase: './public',
       /* 모든 요청을 프록시로 돌려서 express의 응답을 받아오며,
       bundle 파일의 경우엔 우선권을 가져서 devserver 의 스크립트를 사용하게 됩니다 */
       proxy: {
           "**": "http://localhost:3000" // express 서버주소
       },
       stats: {
         // 콘솔 로그를 최소화 합니다
         assets: false,
         colors: true,
         version: false,
         hash: false,
         timings: false,
         chunks: false,
         chunkModules: false
       }
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: ['react-hot', 'babel?' + JSON.stringify({
                    cacheDirectory: true,
                    presets: ['es2015', 'react']
                })],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                loader: 'style!css-loader'
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ]
};
