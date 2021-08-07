import http from 'k6/http'
import {sleep, check} from 'k6'
import {Rate} from 'k6/metrics'

const failures  = new Rate('no 400 errors')


export let options = {
    vus: 2,
    duration: '10s',
    // stages: [
    //     {duration: '10s', target: 5},
    //     {duration: '20s', target: 10}
    // ],

    thresholds: {
        failed_requests: ['rate<=0'],
        http_req_duration: ['p(95)<500']
    }
}


export default function () {
    let res = http.get('http://127.0.0.1:3000/todos');
    check(res, { 'status is 200-OK': ()=> res.status === 200})
    sleep(1);
    failures.add(res.status !== 400)
}
