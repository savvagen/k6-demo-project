import http from 'k6/http'
import {sleep, check} from 'k6'
import { randomIntBetween,  randomString, randomItem, uuidv4, findBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";
import encoding from 'k6/encoding';
import { respStats } from "../utils/metrics.js"

const PAUSE = 0.5;

let params = {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    tags: {
        name: 'GET /get_token', // first request
    }
}

export function writeScenario(data){

    //console.log(JSON.stringify(data))

    const BASE_URL = data.base_url

    // Get token
    params.headers.Authorization = "Basic " + encoding.b64encode("test:test")
    let tokenResp = http.get(`${BASE_URL}/get_token`, params)
    respStats(tokenResp)
    check(tokenResp, {
        'is status 200': (r) => r.status === 200,
        'is token present': (r) => r.json().hasOwnProperty('token'),
    })
    const token = tokenResp.json()['token']

    // Create user
    params.tags.name = "POST /users"
    params.headers.Authorization = "Bearer " + token
    let user_payload = JSON.stringify({
        name: `Test${randomIntBetween(1000,9999)} User${randomIntBetween(1000,9999)}`,
        username: `test.user${randomIntBetween(1000,9999)}`,
        email: `test.user.${randomString(10)}@example.com`
    })
    let userResp = http.post(`${BASE_URL}/users`, user_payload, params)
    respStats(userResp)
    check(userResp, {
        'is status 201': (r) => r.status === 201,
        'is api id present': (r) => r.json().hasOwnProperty('id'),
    })
    sleep(PAUSE)
    
    // Create todo
    params.tags.name = "POST /todos"
    let todo_payload = JSON.stringify({
        userId: userResp.json()['id'],
        title: `ToDo - ${randomIntBetween(1000, 9999)}: ${randomString(20)}`,
        completed: randomItem([true, false])
    })
    let todo_resp = http.post(`${BASE_URL}/todos`, todo_payload, params)
    respStats(todo_resp)
    check(todo_resp, {
        'is status 201': (r) => r.status === 201,
        'is api id present': (r) => r.json().hasOwnProperty('id'),
    })
    sleep(PAUSE);

    // Create Post
    params.tags.name = "POST /posts"
    let post_payload = JSON.stringify({
        title: `New Post ${randomIntBetween(1,1000)}`,
        body: `Hello World ${randomString(10)}`,
        userId: userResp.json()['id']
    })
    let posts_resp = http.post(`${BASE_URL}/posts`, post_payload, params)
    respStats(posts_resp)
    check(posts_resp, {
        'is status 201': (r) => r.status === 201,
        'is api id present': (r) => r.json().hasOwnProperty('id'),
    })
    sleep(randomIntBetween(1,2)); // Sleep in between 1 - 3 sec.

    // Create comment
    params.tags.name = "POST /comments"
    let comment_payload = JSON.stringify({
        name: `Comment Test - ${randomIntBetween(1,1000)}`,
        email: `${userResp.json()['email']}`,
        body: `Comment-${posts_resp.json()['id']} Comment: ${randomString(20)}`,
        postId: posts_resp.json()['id']
    })
    let comment_resp = http.post(`${BASE_URL}/comments`, comment_payload, params)
    respStats(comment_resp)
    check(comment_resp, {
        'is status 201': (r) => r.status === 201,
        'is api id present': (r) => r.json().hasOwnProperty('id'),
    })
    sleep(randomItem([0.5, 1])); // Sleep in between 0.5 - 1 sec.

} 