module.exports = {
    env: {
        test: {
            presets: [
                [
                    '@babel/preset-env',
                    {
                        targets: {
                            node: 'current',
                        },
                    },
                ],
                [
                    'babel-preset-vite',
                    {
                        env: true,
                        global: false,
                    },
                ],
            ],
        },
    },
    plugins: [
        [
            'module-resolver',
            {
                alias: {
                    '@': './src',
                    '@tests': './tests',
                    '@components': './src/components',
                },
            },
        ],
    ],
};
