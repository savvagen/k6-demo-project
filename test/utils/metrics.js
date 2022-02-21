import {Rate, Counter, Gauge, Trend} from 'k6/metrics'

const SuccessCodes = new Counter("status_codes_2xx")
const ClientErrorCodes = new Counter("status_codes_4xx")
const ServerErrorCodes = new Counter("status_codes_5xx")

export function respStats(res) {
    SuccessCodes.add(res.status >= 200 && res.status < 300)
    ClientErrorCodes.add(res.status >= 400 && res.status < 500)
    ServerErrorCodes.add(res.status >= 500)
}
