import http from 'k6/http'
import {sleep, check, group} from 'k6'
import { randomIntBetween,  randomString, randomItem, uuidv4, findBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";
import { fail } from 'k6';


export let options = {
    discardResponseBodies: false,
    scenarios: {
        read_scenario: {
            executor: 'constant-vus',
            exec: 'readScenario',
            vus: 5,
            duration: '1m',
            tags: { my_custom_tag: 'scenario_1' },
            env: { MYVAR: 'read' },
        },
        write_scenario: {
            executor: 'per-vu-iterations',
            exec: 'writeScenario', // the function this scenario will execute
            vus: 3,
            iterations: 100,
            startTime: '15s',
            maxDuration: '45s',
            tags: { my_custom_tag: 'scenario_2' },
            env: { MYVAR: 'write' },
        },
    }
}

const PAUSE = 0.5;
const BASE_URL = "http://localhost:3001"



export function readScenario(){
    if (__ENV.MYVAR != 'read') fail();

    // Get todos
    let totdoResp = http.get(`${BASE_URL}/todos`, {tags: {name: "get_todos"}})
    check(totdoResp, {
        'is status 200': (r) => r.status === 200,
        'list is not empty': (r) => r.json().length > 1,
    })
    sleep(PAUSE)
    
    // Get user from todo
    let userId = totdoResp.json()[randomIntBetween(10, 50)].userId
    let userResp = http.get(`${BASE_URL}/users/${userId}`, {tags: {name: "get_user"}})
    check(userResp, {
        'is status 200': (r) => r.status === 200,
        'is api id present': (r) => r.json().hasOwnProperty('id'),
    })
    sleep(PAUSE)
    
    // Get comments
    let commentsResp = http.get(`${BASE_URL}/comments`, {tags: {name: "get_comments"}})
    check(commentsResp, {
        'is status 200': (r) => r.status === 200,
        'list is not empty': (r) => r.json().length > 1,
    })
    sleep(PAUSE)
    
    // Get post from using 
    let postId = commentsResp.json()[randomIntBetween(10, 50)].postId
    let postResp = http.get(`${BASE_URL}/posts/${postId}`, {tags: {name: "get_post"}})
    check(postResp, {
        'is status 200': (r) => r.status === 200,
        'is api id present': (r) => r.json().hasOwnProperty('id'),
    })
    sleep(PAUSE)

} 

export function writeScenario(){

    let params = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        tags: {
            name: 'write_user', // first request
        }
    }
    
    // Create user
    let user_payload = JSON.stringify({
        name: `Test${randomIntBetween(1000,9999)} User${randomIntBetween(1000,9999)}`,
        username: `test.user${randomIntBetween(1000,9999)}`,
        email: `test.user.${randomString(10)}@example.com`
    })
    let user_resp = http.post(`${BASE_URL}/users`, user_payload, params)
    
    // If the check() returs "false", stop the user as failed.
    if(!check(user_resp, { 'is status 201': (r) => r.status === randomItem([200, 201])}) ) {
        fail("The status code should be 200")
    }
    sleep(PAUSE)
    
    
    // Create todo
    params.tags.name = 'write_todo'
    let todo_payload = JSON.stringify({
        userId: user_resp.json()['id'],
        title: `ToDo - ${randomIntBetween(1000, 9999)}: ${randomString(20)}`,
        completed: randomItem([true, false])
    })
    let todo_resp = http.post(`${BASE_URL}/todos`, todo_payload, params)
    check(todo_resp, {
        'is status 201': (r) => r.status === 201,
        'is api id present': (r) => r.json().hasOwnProperty('id'),
    })
    sleep(PAUSE);
    // Create Post
    params.tags.name = 'write_post'
    let post_payload = JSON.stringify({
        title: `New Post ${randomIntBetween(1,1000)}`,
        body: `Hello World ${randomString(10)}`,
        userId: user_resp.json()['id']
    })
    let posts_resp = http.post(`${BASE_URL}/posts`, post_payload, params)
    check(posts_resp, {
        'is status 201': (r) => r.status === 201,
        'is api id present': (r) => r.json().hasOwnProperty('id'),
    })
    sleep(randomIntBetween(1,2)); // Sleep in between 1 - 3 sec.
    // Create comment
    params.tags.name = 'write_comment'
    let comment_payload = JSON.stringify({
        name: `Comment Test - ${randomIntBetween(1,1000)}`,
        email: `${user_resp.json()['email']}`,
        body: `Comment-${posts_resp.json()['id']} Comment: ${randomString(20)}`,
        postId: posts_resp.json()['id']
    })
    let comment_resp = http.post(`${BASE_URL}/comments`, comment_payload, params)
    check(comment_resp, {
        'is status 201': (r) => r.status === 201,
        'is api id present': (r) => r.json().hasOwnProperty('id'),
    })
    sleep(randomItem([0.5, 1])); // Sleep in between 0.5 - 1 sec.

} 