import {Application, Component, DTO} from 'lakutata'
import {Configurable, Inject} from 'lakutata/decorator/di'
import {Logger} from 'lakutata/com/logger'
import {
    app as electron,
    BrowserWindow,
    Menu,
    globalShortcut
} from 'electron'
import path from 'node:path'

export class MainWindow extends Component {
    @Inject(Application)
    protected readonly app: Application

    @Inject('log')
    protected readonly log: Logger

    @Configurable(DTO.Number().optional().default(1200))
    protected width: number

    @Configurable(DTO.Number().optional().default(750))
    protected height: number

    @Configurable(DTO.Boolean().optional().default(false))
    protected readonly fullscreen: boolean

    @Configurable(DTO.Boolean().optional().default(true))
    protected readonly emulateTouchScreen: boolean

    @Configurable(DTO.Boolean().optional().default(true))
    protected readonly openDevTools: boolean

    #instance: BrowserWindow

    /**
     * Initializer
     * @protected
     */
    protected async init(): Promise<void> {
        await electron.whenReady()
        electron.once('window-all-closed', () => this.app.exit(0))
        if (this.fullscreen) Menu.setApplicationMenu(null)
        this.#instance = new BrowserWindow({
            show: false,
            title: this.app.appName,
            hasShadow: false,
            width: this.width,
            height: this.height,
            fullscreenable: false,
            icon: path.resolve('@resources', './logo.png'),
            webPreferences: {
                sandbox: false,
                nodeIntegrationInWorker: false,
                nodeIntegration: false,
                contextIsolation: false,
                defaultEncoding: 'UTF-8',
                devTools: true,
                webSecurity: false,
                allowRunningInsecureContent: true,
                preload: require.resolve('ipc')
            }
        })
        this.#instance
            .once('closed', (): void => this.app.exit(0))
            .once('ready-to-show', (): void => {
                // this.#instance.setVisibleOnAllWorkspaces(true)
                this.#instance.show()
            })
            .on('page-title-updated', (event: {
                preventDefault: () => void,
                readonly defaultPrevented: boolean
            }): void => event.preventDefault())
            .on('resize', (): void => {
                const [width, height] = this.#instance.getSize()
                this.width = width
                this.height = height
            })
        if (this.emulateTouchScreen) this.enableEmulateTouchScreen()
        if (this.openDevTools) {
            globalShortcut.register('f12', () => {
                if (this.#instance.isFocused()) {
                    this.#instance.webContents.openDevTools({mode: 'undocked'})
                }
            })
        }
        if (this.app.mode() === 'development') {
            const {createServer} = require('ui/rendererServer')
            const devServerURL: string = await createServer()
            await this.#instance.loadURL(devServerURL)
        } else {
            await this.#instance.loadFile(path.join(path.dirname(require.resolve('ui/rendererServer')), './dist/renderer/index.html'))
        }
    }

    /**
     * Enter touch screen emulate mode
     * @protected
     */
    protected enableEmulateTouchScreen(): void {
        this.#instance.webContents.debugger.attach('1.3')
        this.#instance.webContents.debugger.sendCommand('Emulation.setTouchEmulationEnabled', {
            enabled: true,
            configuration: 'mobile'
        }).catch(setTouchEmulationEnabledError => this.log.error('SetTouchEmulationEnabled error: %s', setTouchEmulationEnabledError.message))
        this.#instance.webContents.debugger
            .sendCommand('Emulation.setEmitTouchEventsForMouse', {enabled: true})
            .catch(setEmitTouchEventsForMouseError => this.log.error('SetEmitTouchEventsForMouse error: %s', setEmitTouchEventsForMouseError.message))
    }
}
