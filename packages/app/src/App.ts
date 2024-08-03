import {Config} from './config/Config'
import {Application} from 'lakutata'
import {Logger} from 'lakutata/com/logger'
import {DevNull} from 'lakutata/helper'
import {app as electron} from 'electron'

const gotSingleInstanceLock: boolean = electron.requestSingleInstanceLock()
if (!gotSingleInstanceLock) {
    electron.exit()
} else {
    Application
        .env({
            MODE: 'production',
            FULLSCREEN: 'true'
        })
        .alias({
            '@resources': require('resources').default
        })
        .run(Config)
        .onLaunched((app: Application, logger: Logger): void => logger.info('The application %s has successfully started in %s mode.', app.appName, app.mode()))
        .onFatalException((error: Error, logger: Logger): void => logger.error('A fatal error occurred in the program: %s', error.message))
        .onUncaughtException((error: Error & any, logger: Logger): void => error.code === 'EPIPE' ? DevNull(error) : logger.error('UncaughtError occurred: %s', error.message))
}