import http from 'k6/http'
import {sleep, check, group} from 'k6'
import {Rate, Counter, Gauge, Trend} from 'k6/metrics'
import { randomIntBetween,  randomString, randomItem, uuidv4, findBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";


const notFoundErros  = new Rate('404_errors')
const serverErros  = new Rate('500_errors')

const responseTimeTrend = new Trend('ReqRespTime');
const respBodyOK = new Rate('Content OK');
const ContentSizeGauge = new Gauge('ContentSize');
const CounterErrors = new Counter('Errors');


export let options = {
    vus: 3,
    duration: '120s',
    // stages: [
    //     {duration: '1m', target: 5},
    //     {duration: '2m', target: 10}
    // ],

    thresholds: {
        
        // 1. Buit In Metrics
        http_req_failed: ['rate<0.01'], // During the whole test execution, the error rate must be lower than 1%.
        //http_req_failed: [{threshold: 'rate<=0', abortOnFail: true}], // Abort if there is more than 0% failed tests
        //http_reqs: [{threshold: "count<10", abortOnFail: true}] // Abort Scenario if passed requests number is > 10
        
        // 2. Adding Custom Metrics
        http_req_duration: ['p(95)<400'],
        ReqRespTime: ['p(99)<300', 'p(70)<250', 'avg<200', 'med<150', 'min<100'],
        'Content OK': ['rate>0.95'],
        ContentSize: ['value<4000'],
        Errors: [{threshold: "count<20", abortOnFail: true}],
    }
}

const myThresholdMetric = new Counter("my_threshold_metric");


export default function () {
    let todo_payload = {
        userId: Math.floor(Math.random()*1+50),
        title: `Task ${Math.floor(Math.random()*1+50)}`,
        completed: true
    }
    let res = http.post(`http://127.0.0.1:3001/todo${randomItem(["s", "SSS"])}`, JSON.stringify(todo_payload));
    check(res, { 'status is 201-Created': ()=> res.status === 201})

    let contentOK = res.json().hasOwnProperty('id') // should return: true

    notFoundErros.add(res.status === 404)
    serverErros.add(res.status === 500)

    responseTimeTrend.add(res.timings.duration);
    respBodyOK.add(contentOK);
    ContentSizeGauge.add(res.body.length);

    CounterErrors.add(res.status !== 201);
    //CounterErrors.add(!contentOK);

    sleep(1);

}
