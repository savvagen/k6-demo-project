import http from 'k6/http'
import {sleep, check} from 'k6'
import { randomIntBetween,  randomString, randomItem, uuidv4, findBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";
import { respStats } from "../utils/metrics.js"

const PAUSE = 0.5;

export function readScenario(data){
    const BASE_URL = data.base_url

    // Get todos
    let totdoResp = http.get(`${BASE_URL}/todos`, {tags: { name: "GET /todos" }})
    respStats(totdoResp)
    check(totdoResp, {
        'is status 200': (r) => r.status === 200,
        'list is not empty': (r) => r.json().length > 1,
    })
    sleep(PAUSE)
    
    // Get user from todo
    let userId = totdoResp.json()[randomIntBetween(10, 50)].user
    let userResp = http.get(`${BASE_URL}/users/${userId}`, {tags: { name: "GET /user/ID" }})
    respStats(userResp)
    check(userResp, {
        'is status 200': (r) => r.status === 200,
        'is api id present': (r) => r.json().hasOwnProperty('id'),
    })
    sleep(PAUSE)

    // Get comments
    let commentsResp = http.get(`${BASE_URL}/comments`, {tags: { name: "GET /comments" }})
    respStats(commentsResp)
    check(commentsResp, {
        'is status 200': (r) => r.status === 200,
        'list is not empty': (r) => r.json().length > 1,
    })
    sleep(PAUSE)

    // Get post from using 
    let postId = commentsResp.json()[randomIntBetween(10, 50)].post
    let postResp = http.get(`${BASE_URL}/posts/${postId}`, {tags: { name: "GET /post/ID" }})
    respStats(postResp)
    check(postResp, {
        'is status 200': (r) => r.status === 200,
        'is api id present': (r) => r.json().hasOwnProperty('id'),
    })
    sleep(PAUSE)

} 
