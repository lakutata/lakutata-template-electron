import {InterClient} from './lib/InterClient'

export {InterServer} from './lib/InterServer'
export {InterClient} from './lib/InterClient'

if (!require('electron').ipcMain) {
    global.ipc = new InterClient()
}
