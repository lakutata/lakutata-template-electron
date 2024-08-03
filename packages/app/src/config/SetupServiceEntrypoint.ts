import {
    BuildServiceEntrypoint,
    EntrypointDestroyerRegistrar,
    ServiceEntrypoint,
    ServiceEntrypointHandler
} from 'lakutata/com/entrypoint'
import {Module} from 'lakutata'
import {DevNull} from 'lakutata/helper'
import {InterServer} from 'ipc'

/**
 * Setup entrypoints
 * @constructor
 */
export function SetupServiceEntrypoint(devPort?: number): ServiceEntrypoint {
    return BuildServiceEntrypoint(async (module: Module, handler: ServiceEntrypointHandler, registerDestroy: EntrypointDestroyerRegistrar): Promise<void> => {
        const ipcServer: InterServer = new InterServer(handler, devPort)
        registerDestroy(async (): Promise<void> => {
            try {
                await ipcServer.destroy()
            } catch (e: any) {
                DevNull('Destroy service entrypoint error: %s', e.message)
            }
        })
    })
}
