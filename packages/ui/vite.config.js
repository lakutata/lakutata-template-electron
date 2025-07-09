const path = require('path')

module.exports = {
    root: __dirname,
    base: './',
    resolve: {
        alias: {
            '@': path.join(__dirname, 'src'),
        }
    },
    build: {
        outDir: path.join(__dirname, 'dist/renderer'),
        emptyOutDir: true
    },
    server: {
        port: 5188
    }
}