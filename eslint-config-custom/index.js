module.exports = {
    env: {
        es6: true,
        node: true
    },
    extends: [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: {
            jsx: true
        }
    },
    rules: {
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
    },
    settings: {
        react: {
            version: "detect"
        }
    }
}
