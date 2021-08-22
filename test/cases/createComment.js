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
        name: 'POST /comments'
    }
}

export function createComment(postId, email){
    let resp
    group('create comment', ()=>{
        let comment_payload = JSON.stringify({
            name: `Comment Test - ${randomIntBetween(1,1000)}`,
            email: `${email}`,
            body: `Comment-${postId} Comment: ${randomString(20)}`,
            postId: postId
        })
        resp = http.post(`${BASE_URL}/comments`, comment_payload, params)
        checkStatus({
            response: resp,
            expectedStatus: 201,
            printOnError: true,
            failOnError: true
        })

    })
    return resp
}