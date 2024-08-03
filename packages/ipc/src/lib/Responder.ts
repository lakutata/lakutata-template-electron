import {Exception, Time} from 'lakutata'
import {NonceStr} from 'lakutata/helper'
import {ActionNotFoundException} from '../exceptions/ActionNotFoundException'

export class Responder {
    protected statusCode: number = 200

    /**
     * Generate a common response object
     * @param responseData
     * @param code
     * @param message
     * @protected
     */
    protected generateCommonResponseObject(responseData: any | null, code: number | string = 0, message: string = ''): Record<string, any> {
        return {
            statusCode: this.statusCode,
            code: code,
            message: message,
            data: responseData,
            timestamp: new Time().unix(),
            nonce: NonceStr()
        }
    }

    /**
     * Error response handling
     * @param error
     * @protected
     */
    protected errorResponse<T extends Error | Exception>(error: T) {
        this.statusCode = 500
        if (error instanceof Exception) {
            if (error.errno === 'E_NO_MATCHED_CONTROLLER_ACTION_PATTERN') return this.errorResponse(new ActionNotFoundException('Not found'))
            return this.generateCommonResponseObject(null, error.errno, error.errMsg)
        } else {
            return this.generateCommonResponseObject(null, -1, error.message)
        }
    }

    /**
     * Process and render response data
     * @param inp
     */
    public renderer(inp: any): any {
        if (inp instanceof Error || inp instanceof Exception) return this.errorResponse(inp)
        return this.generateCommonResponseObject(inp)
    }
}
