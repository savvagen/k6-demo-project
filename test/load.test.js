import http from 'k6/http'
import {sleep, check, group} from 'k6'
import { randomIntBetween,  randomString, randomItem, uuidv4, findBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
import {Rate, Counter, Gauge, Trend} from 'k6/metrics'
import encoding from 'k6/encoding';

const SuccessCodes = new Counter("status_codes_2xx")
const ClientErrorCodes = new Counter("status_codes_4xx")
const ServerErrorCodes = new Counter("status_codes_5xx")

function respStats(res) {
    SuccessCodes.add(res.status >= 200 && res.status < 300)
    ClientErrorCodes.add(res.status >= 400 && res.status < 500)
    ServerErrorCodes.add(res.status >= 500)
}


export let options = {
    vus: 3,
    duration: '50s',
    //duration: '1m30s',
    thresholds: {
        //http_req_failed: ['rate<0.01'], // During the whole test execution, the error rate must be lower than 1%.
        http_req_failed: [{threshold: 'rate<=0', abortOnFail: true}], // Abort if there is more than 0% failed tests
        http_req_duration: ['p(95)<500'],
        // the rate of successful checks should be higher than 90%
        checks: ['rate>0.9'],
        'checks{statusCheck:200}': ['rate>0.9'],
    },
    //maxDuration: '30s',
    // env: { BASE_URL: "http://localhost:3001" },
    // httpDebug: "full" // output the requests and responses with json bodys
}

const PAUSE = 0.5;
const BASE_URL = __ENV.BASE_URL !== undefined ? __ENV.BASE_URL: "http://localhost:3000"

let params = {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    tags: {
        name: 'GET /get_token', // first request
    }
}


export function setup(){
    console.log("Setup Test!")

    // get token
    params.headers.Authorization = "Basic " + encoding.b64encode("test:test")
    let tokenResp = http.get(`${BASE_URL}/get_token`, params)
    check(tokenResp, {
        'is status 200': (r) => r.status === 200,
        'is token present': (r) => r.json().hasOwnProperty('token'),
    })
    const token = tokenResp.json()['token']
    console.log("Got Token: " + token)

    // register user
    params.headers.Authorization = `Bearer ${token}`
    let user = {
        name: `Test${randomIntBetween(1000,9999)} User${randomIntBetween(1000,9999)}`,
        username: `test.user${randomIntBetween(1000,9999)}`,
        email: `test.user.${randomString(10)}@example.com`,
    }
    let user_resp = http.post(`${BASE_URL}/users`, JSON.stringify(user), params)
    respStats(user_resp)
    check(user_resp, {
        'is status 201': (r) => r.status === 201,
        'is api id present': (r) => r.json().hasOwnProperty('id'),
    })
    sleep(PAUSE)
    // Return the data as JSON
    return { data: { 
        userId: user_resp.json()['id'],
        email: user.email,
    }}
}

export default function(data){

    group('posts writer scenario', (_)=> {
        //console.log(JSON.stringify(data))
        //console.log(data.data.userId);

        // 2. Create ToDo for created user
        
        params.tags.name = 'POST /todos'
        let todo_payload = JSON.stringify({
            userId: data.data.userId,
            title: `ToDo - ${randomIntBetween(1000, 9999)}: ${randomString(20)}`,
            completed: randomItem([true, false])
        })
        let todo_resp = http.post(`${BASE_URL}/todos`, todo_payload, params)
        respStats(todo_resp)
        check(todo_resp, {
            'is status 201': (r) => r.status === 201,
            'is api id present': (r) => r.json().hasOwnProperty('id'),
        })
        //console.log(`${todo_resp.status}: ${todo_resp.status_text} ${JSON.stringify(todo_resp.json())}`)
        sleep(PAUSE);

        // 3. Create 5 posts

        for(let i = 0; i < 5; i++){
            params.tags.name = 'POST /posts'
            let post_payload = JSON.stringify({
                title: `New Post ${randomIntBetween(1,1000)}`,
                body: `Hello World ${randomString(10)}`,
                userId: data.data.userId
            })
            let posts_resp = http.post(`${BASE_URL}/posts`, post_payload, params)
            respStats(posts_resp)
            check(posts_resp, {
                'is status 201': (r) => r.status === 201,
                'is api id present': (r) => r.json().hasOwnProperty('id'),
            })
            //console.log(`${posts_resp.status}: ${posts_resp.status_text} ${JSON.stringify(posts_resp.json())}`)
            sleep(randomIntBetween(1,2)); // Sleep in between 1 - 3 sec.

            // Create 3 comments for each post

            for(let i = 0; i < 3; i++){
                params.tags.name = 'POST /comments'
                let comment_payload = JSON.stringify({
                    name: `Comment Test - ${randomIntBetween(1,1000)}`,
                    email: `${data.data.email}`,
                    body: `Comment-${posts_resp.json()['id']} Comment: ${randomString(20)}`,
                    postId: posts_resp.json()['id']
                })
                let comment_resp = http.post(`${BASE_URL}/comments`, comment_payload, params)
                respStats(comment_resp)
                check(comment_resp, {
                    'is status 201': (r) => r.status === 201,
                    'is api id present': (r) => r.json().hasOwnProperty('id'),
                })
                //console.log(`${comment_resp.status}: ${comment_resp.status_text} ${JSON.stringify(comment_resp.json())}`)
                sleep(randomItem([0.5, 1])); // Sleep in between 0.5 - 1 sec.
            }
        } 
    })

} 


export function teardown(data){
    console.log("Teardown Test!")

    let emailIsOK = /test.user.*@example.com/.test(data.data.email)
    console.log(emailIsOK)
    if (!emailIsOK) {
        throw new Error('incorrect data -> email: ' + data.data.email);
    } else { 
        console.log(JSON.stringify(data))
    }
}


export function handleSummary(data) {
    return {
        "reports/result.html": htmlReport(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    };
}
