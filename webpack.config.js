const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: "development",
    entry: "./src/index.js",
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "SeePoints",
            template: "./src/index.ejs",
        }),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin(),
    ],
    devServer: {
        contentBase: "./dist",
    },
    devtool: "inline-source-map",
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
};