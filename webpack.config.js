const path = require('path');

module.exports = {
    entry: './src/rtm.js',
    output: {
        filename: 'rtm.min.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'rtm',
        libraryTarget: 'umd'
    },
    // devtool: 'source-map',
    target: 'web',
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: [
                    path.resolve(__dirname, 'src')
                ],
                exclude: [
                    path.resolve(__dirname, 'libs')
                ],
                loader: 'babel-loader',
                options: {
                    presets: ["es2015"]
                }
            }
        ]
    }
};