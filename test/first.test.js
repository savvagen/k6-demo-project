import http from 'k6/http'
import {sleep, check, group} from 'k6'
import {Rate} from 'k6/metrics'
const failures  = new Rate('no 400 errors')

export let options = {
    vus: 1,
    duration: '120s',
    // stages: [
    //     {duration: '1m', target: 5},
    //     {duration: '2m', target: 10}
    // ],

    thresholds: {
        http_req_failed: ['rate<0.01'],   // http errors should be less than 1%
        http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    }
}


export default function () {
    let todo_payload = JSON.stringify({
        userId: Math.floor(Math.random()+50),
        title: `Task ${Math.floor(Math.random()+50)}`,
        completed: true
    })

    let res = http.get('http://127.0.0.1:3001/todos');
    check(res, { 'status is 200-OK': ()=> res.status === 200})
    sleep(1);
    failures.add(res.status !== 400)
}
