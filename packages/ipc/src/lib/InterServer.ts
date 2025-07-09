import {Server as SocketServer, Socket} from 'socket.io'
import express, {Express, Request as ExpressRequest, Response as ExpressResponse} from 'express'
import bodyParser from 'body-parser'
import {Server as HttpServer, createServer} from 'http'
import {ServiceContext, ServiceEntrypointHandler} from 'lakutata/com/entrypoint'
import {ipcMain, IpcMainEvent, IpcMainInvokeEvent} from 'electron'
import {DevNull, NonceStr} from 'lakutata/helper'
import {Responder} from './Responder'
import {IPC_REG, IPC_REQ} from './Constant'
import {IncomingMessage} from 'node:http'

export class InterServer {

    protected readonly ipcClientMap: Map<string, (channel: string, ...args: any[]) => void> = new Map()

    protected readonly ipcFrameClientMap: Map<number, string> = new Map()

    protected readonly socketClientMap: Map<string, Set<Socket>> = new Map()

    protected readonly destroyHandlerSet: Set<any> = new Set()

    constructor(handler: ServiceEntrypointHandler, devPort?: number) {
        this.registerIpcMainHandler(handler)
        if (devPort) {
            const httpServer: HttpServer = createServer()
            this.registerHttpHandler(handler, httpServer)
            this.registerSocketIOHandler(handler, httpServer)
            httpServer.listen(devPort, '0.0.0.0')
            this.destroyHandlerSet.add(async (): Promise<void> => new Promise<void>(resolve => httpServer.close(() => resolve())))
        }
    }

    /**
     * Register ipc main process handler
     * @param handler
     * @protected
     */
    protected registerIpcMainHandler(handler: ServiceEntrypointHandler): void {
        ipcMain.on(IPC_REG, (event: IpcMainEvent, clientId: string): void => {
            for (const frameId of this.ipcFrameClientMap.keys()) {
                if (event.frameId === frameId) {
                    this.ipcClientMap.delete(this.ipcFrameClientMap.get(frameId)!)
                    this.ipcFrameClientMap.delete(frameId)
                    break
                }
            }
            this.ipcClientMap.set(clientId, event.reply)
            this.ipcFrameClientMap.set(event.frameId, clientId)
        })
        ipcMain.handle(IPC_REQ, async (event: IpcMainInvokeEvent, inp: Record<string, any>): Promise<any> => {
            return new Promise((resolve): void => {
                let replied: boolean = false
                const doReply: (response: any) => void = (response: any): void => {
                    if (replied) return
                    replied = true
                    return resolve(new Responder().renderer(response))
                }
                handler(new ServiceContext({
                    data: inp,
                    clientId: inp.__$clientId,
                    requestId: NonceStr(),
                    reply: doReply
                }))
                    .then(doReply)
                    .catch(doReply)
            })
        })
        this.destroyHandlerSet.add(async (): Promise<void> => {
            ipcMain.removeAllListeners()
        })
    }

    /**
     * Register SocketIO handler
     * @param handler
     * @param httpServer
     * @protected
     */
    protected registerSocketIOHandler(handler: ServiceEntrypointHandler, httpServer: HttpServer): void {
        const socketServer: SocketServer = new SocketServer(httpServer, {
            transports: ['polling', 'websocket'],
            pingInterval: 3000,
            allowRequest: (req: IncomingMessage, fn: (err: string | null | undefined, success: boolean) => void): void => {
                return req.headers.id ? fn(null, true) : fn('Client ID is required', false)
            }
        })
        socketServer.on('connect', (socket: Socket): void => {
            const clientId: string = socket.handshake.headers.id!.toString()
            if (!this.socketClientMap.has(clientId)) this.socketClientMap.set(clientId, new Set())
            this.socketClientMap.get(clientId)?.add(socket)
            socket.on('disconnect', () => this.socketClientMap.get(clientId)?.delete(socket))
            socket.on('request', (requestData: Record<string, any>, reply: (response: any) => void): void => {
                let replied: boolean = false
                const doReply: (response: any) => void = (response: any): void => {
                    if (replied) return
                    replied = true
                    return reply(new Responder().renderer(response))
                }
                handler(new ServiceContext({
                    data: requestData,
                    clientId: clientId,
                    requestId: NonceStr(),
                    reply: doReply
                }))
                    .then(doReply)
                    .catch(doReply)
            })
        })
    }

    /**
     * Register HTTP handler
     * @param handler
     * @param httpServer
     * @protected
     */
    protected registerHttpHandler(handler: ServiceEntrypointHandler, httpServer: HttpServer): void {
        const expressApp: Express = express()
        expressApp
            .use(bodyParser.json({limit: Infinity}))
            .use(bodyParser.urlencoded({extended: false, limit: Infinity}))
            .post('/', (req: ExpressRequest, res: ExpressResponse) => {
                let replied: boolean = false
                const doReply: (response: any) => void = (response: any): void => {
                    if (replied) return
                    replied = true
                    res.send(new Responder().renderer(response))
                }
                const clientId: string | undefined = req.header('id')
                if (!clientId) return doReply(new Error('Client ID is required'))
                handler(new ServiceContext({
                    data: req.body,
                    clientId: clientId,
                    requestId: NonceStr(),
                    reply: doReply
                }))
                    .then(doReply)
                    .catch(doReply)
            })
        httpServer.on('request', expressApp)
    }

    /**
     * Push notification to client
     * @param clientId
     * @param event
     * @param args
     */
    public notify(clientId: string, event: string, ...args: any[]): void {
        const ipcReply: ((channel: string, ...args: any[]) => void) | undefined = this.ipcClientMap.get(clientId)
        const socketSet: Set<Socket> | undefined = this.socketClientMap.get(clientId)
        if (ipcReply) ipcReply(event, ...args)
        if (socketSet) socketSet.forEach((socket: Socket) => socket.emit(event, ...args))
    }

    /**
     * Broadcast message to clients
     * @param event
     * @param args
     */
    public broadcast(event: string, ...args: any[]): void {
        this.ipcClientMap.forEach(ipcReply => ipcReply(event, ...args))
        this.socketClientMap.forEach((socketSet: Set<Socket>) => socketSet.forEach((socket: Socket) => socket.emit(event, ...args)))
    }

    /**
     * Destroyer
     */
    public async destroy(): Promise<void> {
        for (const destroyHandler of this.destroyHandlerSet) {
            await destroyHandler()
        }
    }
}
