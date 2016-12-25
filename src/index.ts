import { run } from '@motorcycle/core'
import { makeDomDriver } from '@motorcycle/dom'
import { App } from './app'

const main = App

const drivers = {
    DOM: makeDomDriver(document.querySelector('#app') as HTMLElement)
}

run(main, drivers)
