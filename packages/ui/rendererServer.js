exports.createServer = async function () {
    const {createServer} = await import('vite')
    const config = require('./vite.config')
    const server = await createServer({
        configFile: false,
        ...config
    })
    const {resolvedUrls} = await server.listen()
    const {local: [url]} = resolvedUrls
    return url
}