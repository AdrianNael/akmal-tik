module.exports = {
    apps: [
        {
            name: "akmal-web",
            script: "npm",
            args: "start",
            env: {
                PORT: 3000,
                NODE_ENV: "production",
            },
        },
        {
            name: "akmal-server",
            script: "server/index.js",
            env: {
                PORT: 5000,
                NODE_ENV: "production",
            },
        },
    ],
};
