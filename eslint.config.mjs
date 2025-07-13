import pluginJs from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import pluginPrettier from "eslint-plugin-prettier";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
    // Base JS config
    {
        files: ["**/*.{js,mjs,cjs}"],
        ...pluginJs.configs.recommended,
    },

    // Vue SFC support
    {
        files: ["**/*.vue"],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: "module",
                parser: "@babel/eslint-parser", // Enables parsing <script> blocks correctly
                requireConfigFile: false,
                babelOptions: {
                    presets: ["@babel/preset-env"],
                },
            },
            globals: {
                window: "readonly",
                document: "readonly",
            },
        },
        plugins: {
            vue: pluginVue,
            prettier: pluginPrettier,
        },
        rules: {
            ...pluginVue.configs["flat/essential"].rules,
            "prettier/prettier": "error",
        },
    },

    // Global formatting with Prettier (works across files)
    {
        files: ["**/*.{js,vue,json,md}"],
        plugins: {
            prettier: pluginPrettier,
        },
        rules: {
            "prettier/prettier": "error",
        },
    },

    // Optional: project-level rule tweaks
    {
        rules: {
            "no-console": "off",
            "no-debugger": "error",
        },
    },
];
