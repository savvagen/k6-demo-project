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


// Set Callback for request to mark 404 responses - as passed.
// https://k6.io/docs/javascript-api/k6-http/setresponsecallback-callback/
var only200And404Callback = http.expectedStatuses({min: 200, max: 404}) 


export default function () {
    // http.setResponseCallback(http.expectedStatuses({min: 200, max: 404}));
    // from here on for this VU only the status code in between 200 - 404 will be successful so on the next iteration of


    let todo_payload = JSON.stringify({
        userId: Math.floor(Math.random()*1+50),
        title: `Task ${Math.floor(Math.random()*1+50)}`,
        completed: true
    })
    let res = http.post(`http://127.0.0.1:3001/todo${randomItem(["s", "SSS"])}`, todo_payload, {responseCallback: only200And404Callback});
    check(res, { 'status is 201-Created': ()=> res.status === 201})
    check(res, { 'status in 201-404': ()=> res.status >= 201 && res.status <= 404})

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
