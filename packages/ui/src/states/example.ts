import {reactive} from '@canlooks/reactive'

@reactive
class Example {
    public timestamp: number = Date.now()

    public startUpdateTimestampInterval() {
        const setTimer = () => setTimeout(async () => {
            this.timestamp = await window.ipc.invoke({ctrl: 'example', act: 'test', timestamp: Date.now()})
            setTimer()
        }, 100)
        setTimer()
    }
}

const example: Example = new Example()
example.startUpdateTimestampInterval()
export default example