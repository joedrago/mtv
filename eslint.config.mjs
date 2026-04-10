import js from "@eslint/js"
import globals from "globals"
import react from "eslint-plugin-react"

export default [
    js.configs.recommended,
    {
        ignores: ["old/**", "backup/**", "data/**", "dist/**", "node_modules/**"]
    },
    {
        files: ["app/server/**/*.{js,mjs,cjs}", "scripts/**/*.{js,mjs,cjs}"],
        languageOptions: { globals: { ...globals.node } },
        rules: {
            "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }]
        }
    },
    {
        files: ["app/web/**/*.{js,mjs,cjs,jsx}"],
        plugins: { react },
        languageOptions: {
            globals: { ...globals.browser },
            parserOptions: { ecmaFeatures: { jsx: true }, ecmaVersion: "latest", sourceType: "module" }
        },
        settings: { react: { version: "detect" } },
        rules: {
            "react/jsx-uses-react": "error",
            "react/jsx-uses-vars": "error",
            "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }]
        }
    },
    {
        files: ["app/shared/**/*.{js,mjs,cjs}"],
        languageOptions: { globals: { ...globals.browser, ...globals.node } },
        rules: {
            "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }]
        }
    }
]
