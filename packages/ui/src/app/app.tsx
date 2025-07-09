import {RC} from '@canlooks/reactive/react'
import {RCElement} from '@/types'
import Element = React.JSX.Element
import example from '@/states/example'

export const App: RCElement = RC((): Element => {
    return (<div>
        <h1>Hello world</h1>
        <h2>Now time is: {new Date(example.timestamp).toString()}</h2>
    </div>)
})