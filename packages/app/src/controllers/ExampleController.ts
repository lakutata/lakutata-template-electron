import {Controller} from 'lakutata/com/entrypoint'
import {ServiceAction} from 'lakutata/decorator/ctrl'
import type {ActionPattern} from 'lakutata'
import {TestOptions} from '../options/TestOptions'

export class ExampleController extends Controller {

    /**
     * Example test action
     */
    // @ServiceAction({ctrl: 'example', act: 'test'}, TestOptions)
    @ServiceAction({ctrl: 'example', act: 'test'})
    public async test(inp: ActionPattern<TestOptions>): Promise<number> {
        console.log(inp)
        return inp.timestamp
    }
}
