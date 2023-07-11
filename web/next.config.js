module.exports = {
    reactStrictMode: true,
    transpilePackages: [],

    async rewrites() {
        return [
            {
                source: "/",
                destination: "/scripts",
            },
        ]
    },
}
