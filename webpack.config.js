const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: './src/rtm/RTMClient.js',
    output: {
        filename: 'rtm.min.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'Rtm',
    },
    devtool: 'source-map',
    target: 'web',
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: [
                    path.resolve(__dirname, 'src')
                ],
                exclude: [
                    path.resolve(__dirname, 'lib')
                ],
                loader: 'babel-loader',
                options: {
                    presets: ["es2015"]
                }
            }
        ]
    }
};