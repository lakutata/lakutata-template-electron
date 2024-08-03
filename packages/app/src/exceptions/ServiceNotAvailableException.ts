import {Exception} from 'lakutata'

export class ServiceNotAvailableException extends Exception {
    public errno: number | string = 'E_SERVICE_NOT_AVAILABLE'
}
