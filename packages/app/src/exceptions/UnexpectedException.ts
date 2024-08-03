import {Exception} from 'lakutata'

export class UnexpectedException extends Exception {
    public errno: number | string = 'E_UNEXPECTED'
}
