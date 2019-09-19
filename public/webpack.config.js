const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    watchOptions: {
        ignored: /node_modules/
    },
    mode: 'development',
    entry: {
        signup_page: './src/js/signup_page',
        drop_page: './src/js/drop_page',
        home_page: './src/js/home_page',
        map_page: './src/js/map_page',
        signup_external_page: './src/js/signup_external_page',
        signup_page: './src/js/signup_page',
        user_other_page: './src/js/user_other_page',
        user_self_page: './src/js/user_self_page',
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, {
                    loader: 'css-loader',
                    options: {
                        url: false,
                    }
                }
                    , 'sass-loader']
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, {
                    loader: 'css-loader',
                    options: {
                        url: false,
                    }
                }]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader'
                ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '../css/[name].css',
        }),
    ],
    resolve: {
        extensions: ['.js']
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist/js')
    }
};