import http from 'k6/http'
import {sleep, check, group} from 'k6'
import { randomIntBetween,  randomString, randomItem, findBetween} from "https://jslib.k6.io/k6-utils/1.1.0/index.js";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

import { createUser } from './cases/createUser';
import { createPost } from './cases/createPost';
import { createTodo } from './cases/createToDo';
import { createComment } from './cases/createComment';


export let options = {
    vus: 2,
    duration: '30s',
    thresholds: {
        http_req_failed: ['rate<=0'],
        http_req_duration: ['p(95)<500']
    },
    //httpDebug: "full" 
    // env: { HTTP_PROXY: "127.0.0.1:8888", HTTPS_PROXY: "127.0.0.1:8888" },
}

const PAUSE = 0.5;

export function setup(){
    const resp = createUser()
    console.log("user: " + JSON.stringify(resp.json()))
    console.log("=======")
    console.log(findBetween(resp.body, '"email": "', '"'))
    console.log("=======")
    sleep(PAUSE)
    return {data: {
        userId: resp.json()['id'],
        email: resp.json()['email'],
    }}
}


export default function(data){
    console.log(JSON.stringify(data))

    let todo_resp = createTodo(data.data.userId)
    console.log("todo: " + todo_resp.json()['id'])
    sleep(PAUSE);

    let post_resp = createPost(data.data.userId)
    sleep(randomIntBetween(1,2));

    createComment(post_resp.json()['id'], data.data.email)
    sleep(randomItem([0.5, 1]))
}


export function handleSummary(data) {
    return {
      "result.html": htmlReport(data),
      stdout: textSummary(data, { indent: " ", enableColors: true }),
    };
}

