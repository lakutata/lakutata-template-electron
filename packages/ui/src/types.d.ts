/// <reference types="vite/client"/>

export declare global {
    interface ImportMetaEnv {
        readonly VITE_API_URL: string
    }

    interface ImportMeta {
        readonly env: ImportMetaEnv
    }

    import {InterClient} from 'ipc'

    interface Window {
        ipc: InterClient
    }
}

export type RCElement = (prop?: any) => React.JSX.Element