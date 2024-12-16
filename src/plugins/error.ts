
//@ts-ignore
import { getRecordConsolePlugin } from 'rrweb/es/rrweb/packages/rrweb/src/plugins/console/record'


export const errorplugin = getRecordConsolePlugin({
    level: ['info', 'log', 'warn', 'error'],
    lengthThreshold: 2000,
    stringifyOptions: {
        stringLengthLimit: 1000,
        numOfKeysLimit: 100,
        depthOfLimit: 4,
    },
    logger: window.console,
})