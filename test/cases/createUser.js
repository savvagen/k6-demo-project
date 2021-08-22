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
        name: 'POST /users'
    }
}

export function createUser() {
    let resp;
    group('create user', function() {
        let user = {
            name: `Test${randomIntBetween(1000,9999)} User${randomIntBetween(1000,9999)}`,
            username: `test.user${randomIntBetween(1000,9999)}`,
            email: `test.user.${randomString(10)}@example.com`,
        }
        
        resp = http.post(`${BASE_URL}/users`, JSON.stringify(user), params)

        checkStatus({
            response: resp,
            expectedStatus: 201,
            printOnError: true,
            failOnError: true
        })
    });
    return resp
}