import {checkStatus} from '../utils/checks'
import http from "k6/http";
import { group } from "k6";
import { randomIntBetween,  randomString, randomItem} from "https://jslib.k6.io/k6-utils/1.1.0/index.js";

const BASE_URL = __ENV.BASE_URL !== undefined ? __ENV.BASE_URL: "http://localhost:3001"


let params = {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    tags: {
        name: 'POST /posts'
    }
}

export function createPost(userId, data) {
    let resp;
    group('create post', ()=> {
        let post_payload = JSON.stringify({
            title: `New Post ${randomIntBetween(1,1000)}`,
            body: `Hello World ${randomString(10)}`,
            userId: userId
        })
        resp = http.post(`${BASE_URL}/posts`, post_payload, params)
        checkStatus({
            response: resp,
            expectedStatus: 201,
            printOnError: true,
            failOnError: true
        })
    })
    return resp;
}