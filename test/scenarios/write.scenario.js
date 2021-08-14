import http from 'k6/http'
import {sleep, check} from 'k6'
import { randomIntBetween,  randomString, randomItem, uuidv4, findBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";

const PAUSE = 0.5;
const BASE_URL = "http://localhost:3001"

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
    check(user_resp, {
        'is status 201': (r) => r.status === 201,
        'is api id present': (r) => r.json().hasOwnProperty('id'),
    })
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