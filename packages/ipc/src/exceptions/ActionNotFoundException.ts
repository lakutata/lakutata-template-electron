import {Exception} from 'lakutata'

export class ActionNotFoundException extends Exception {
    public errno: string | number = 'E_ACTION_NOT_FOUND'
}
