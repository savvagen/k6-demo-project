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
        name: 'POST /todos'
    }
}


export function createTodo(userId) {
    let resp
    group('create todo', ()=> {        
        let todo_payload = JSON.stringify({
            userId: userId,
            title: `ToDo - ${randomIntBetween(1000, 9999)}: ${randomString(20)}`,
            completed: randomItem([true, false])
        })

        resp = http.post(`${BASE_URL}/todos`, todo_payload, params)
        
        checkStatus({
            response: resp,
            expectedStatus: 201,
            printOnError: true,
            failOnError: true
        })
    })
    return resp
}