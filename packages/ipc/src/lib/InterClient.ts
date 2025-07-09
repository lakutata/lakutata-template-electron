import {ipcRenderer, IpcRendererEvent} from 'electron'
import {randomUUID} from 'node:crypto'
import {IPC_REG, IPC_REQ} from './Constant'

export class InterClient {

    protected readonly id: string = `${randomUUID()}`

    protected readonly ipcEventListenerMap: Map<(...args: any[]) => void, (event: IpcRendererEvent, ...args: any[]) => void> = new Map()

    constructor() {
        ipcRenderer.send(IPC_REG, this.id)
    }

    /**
     * Invoke action
     * @param inp
     */
    public async invoke<T = any>(inp: Record<string, any>): Promise<T> {
        inp.__$clientId = this.id
        const response: any = await ipcRenderer.invoke(IPC_REQ, inp)
        if (response.code) throw new Error(response.message)
        return response.data
    }

    /**
     * Register event listener
     * @param eventName
     * @param listener
     */
    public on(eventName: string, listener: (...args: any[]) => void): this {
        this.ipcEventListenerMap.set(listener, (event: IpcRendererEvent, ...args: any[]) => listener(...args))
        ipcRenderer.on(eventName, this.ipcEventListenerMap.get(listener)!)
        return this
    }

    /**
     * Register once event listener
     * @param eventName
     * @param listener
     */
    public once(eventName: string, listener: (...args: any[]) => void): this {
        this.ipcEventListenerMap.set(listener, (event: IpcRendererEvent, ...args: any[]): void => {
            listener(...args)
            this.ipcEventListenerMap.delete(listener)
        })
        ipcRenderer.once(eventName, this.ipcEventListenerMap.get(listener)!)
        return this
    }

    /**
     * Off event listener
     * @param eventName
     * @param listener
     */
    public off(eventName: string, listener: (...args: any[]) => void): this {
        ipcRenderer.off(eventName, this.ipcEventListenerMap.get(listener)!)
        return this
    }

    /**
     * Remove event listener
     * @param eventName
     * @param listener
     */
    public removeListener(eventName: string, listener: (...args: any[]) => void): this {
        ipcRenderer.removeListener(eventName, this.ipcEventListenerMap.get(listener)!)
        return this
    }

    /**
     * Set max listeners
     * @param n
     */
    public setMaxListeners(n: number): this {
        ipcRenderer.setMaxListeners(n)
        return this
    }

    /**
     * Remove all listener for an event
     * @param eventName
     */
    public removeAllListeners(eventName: string): this {
        ipcRenderer.removeAllListeners(eventName)
        return this
    }
}
