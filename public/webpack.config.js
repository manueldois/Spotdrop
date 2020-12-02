const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    watchOptions: {
        ignored: /node_modules/
    },
    optimization: {
		// We no not want to minimize our code.
		minimize: false
    },
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: {
        signup_page: './js/signup_page',
        drop_page: './js/drop_page',
        home_page: './js/home_page',
        map_page: './js/map_page',
        signup_external_page: './js/signup_external_page',
        signup_page: './js/signup_page',
        user_other_page: './js/user_other_page',
        user_self_page: './js/user_self_page',
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