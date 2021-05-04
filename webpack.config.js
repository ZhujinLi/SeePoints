const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: "development",
    entry: "./src/index.ts",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "SeePoints"
        }),
        new CleanWebpackPlugin(),
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