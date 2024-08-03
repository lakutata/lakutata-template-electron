import {ApplicationOptions} from 'lakutata'
import * as process from 'node:process'
import {MainWindow} from '../components/MainWindow'
import {BuildEntrypoints} from 'lakutata/com/entrypoint'
import {SetupServiceEntrypoint} from './SetupServiceEntrypoint'
import packageJson from '../../package.json'
import {ExampleController} from '../controllers/ExampleController'

export async function Config(): Promise<ApplicationOptions> {
    return {
        id: packageJson.appId,
        name: packageJson.appName,
        timezone: 'auto',
        mode: <'development' | 'production'>process.env.MODE,
        components: {
            main: {
                class: MainWindow,
                width: 1200,
                height: 750,
                fullscreen: !!process.env.FULLSCREEN,
                emulateTouchScreen: !!process.env.EMULATE_TOUCH_SCREEN,
                openDevTools: !!process.env.OPEN_DEV_TOOLS
            },
            entrypoint: BuildEntrypoints({
                controllers: [ExampleController],
                service: SetupServiceEntrypoint(process.env.MODE === 'development' ? 8081 : undefined)
            })
        },
        objects: {
            anonymous: []
        },
        bootstrap: [
            'entrypoint',
            'main'
        ]
    }
}
