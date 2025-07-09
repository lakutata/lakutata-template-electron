import {reactive} from '@canlooks/reactive'

@reactive
class Example {
    public timestamp: number = Date.now()

    public startUpdateTimestampInterval() {
        setInterval(() => {
            this.timestamp = Date.now()
        }, 100)
    }
}

const example: Example = new Example()
example.startUpdateTimestampInterval()
export default example