const path = require('path')


module.exports = {
    entry: './src/index.ts',
    mode: "development",
    devtool: 'inline-source-map',
    output: {
        library: 'Roa2',
        libraryTarget: "umd",
        umdNamedDefine: true,
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            },
            {
                test: /\.ts(x?)$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    plugins: []
};
