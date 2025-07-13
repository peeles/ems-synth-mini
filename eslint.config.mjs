import pluginJs from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
    {
        files: ["**/*.{js,mjs,cjs}"],
        ...pluginJs.configs.recommended,
    },
    {
        files: ["**/*.vue"],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: "module",
            },
        },
        plugins: {
            vue: pluginVue,
        },
        rules: {
            ...pluginVue.configs["flat/essential"].rules,
        },
    },
    {
        rules: {
            // Add custom rules here
        },
    },
];
