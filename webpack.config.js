const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './public/js/app.js',
    output: {
        filename: 'blunde.js',
        path: path.join(__dirname, './public/dist')
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }                                                   
            }
        ]
    }
}