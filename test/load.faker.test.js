import http from 'k6/http'
import {sleep, check, group} from 'k6'
import { generateUser, generateToDo } from './utils/genarator';
import { faker } from '@faker-js/faker/locale/en_US';

export let options = {
    vus: 2,
    duration: '30s',
    thresholds: {
        failed_requests: ['rate<=0'],
        http_req_duration: ['p(95)<500']
    }
}

const PAUSE = 0.5;
const BASE_URL = "http://localhost:3001"

let params = {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    tags: {
        name: 'user', // first request
    }
}

export default function(){

    group('posts writer scenario', (_)=> {
        // 1. Create User

        let user_payload = JSON.stringify(generateUser())
        console.log(user_payload)
        let user_resp = http.post(`${BASE_URL}/users`, user_payload, params)
        check(user_resp, {
            'is status 201': (r) => r.status === 201,
            'is api id present': (r) => r.json().hasOwnProperty('id'),
        })
        sleep(PAUSE)

        // 2. Create ToDo for created user

        params.tags.name = 'todo'
        let todo_payload = JSON.stringify(generateToDo(user_resp.json()['id']))
        console.log(todo_payload)
        let todo_resp = http.post(`${BASE_URL}/todos`, todo_payload, params)
        check(todo_resp, {
            'is status 201': (r) => r.status === 201,
            'is api id present': (r) => r.json().hasOwnProperty('id'),
        })
        sleep(PAUSE);

        // 3. Create 5 posts

        for(let i = 0; i < 5; i++){
            params.tags.name = 'post'
            let post_payload = JSON.stringify({
                title: `New Post ${Math.round(Math.random()*1+1000)}`,
                body: `Hello World ${faker.lorem.words()}`,
                userId: user_resp.json()['id']
            })
            console.log(post_payload)
            let posts_resp = http.post(`${BASE_URL}/posts`, post_payload, params)
            check(posts_resp, {
                'is status 201': (r) => r.status === 201,
                'is api id present': (r) => r.json().hasOwnProperty('id'),
            })
            sleep(PAUSE);

            // Create 3 comments for each post

            for(let i = 0; i < 3; i++){
                params.tags.name = 'comment'
                let comment_payload = JSON.stringify({
                    postId: posts_resp.json()['id'],
                    name: `Test Comment - ${Math.round(Math.random() + 1000)}`,
                    email: `${user_resp.json()['email']}`,
                    body: `Post-${posts_resp.json()['id']} Comment: ${faker.lorem.words()}`,
                })
                let comment_resp = http.post(`${BASE_URL}/comments`, comment_payload, params)
                check(comment_resp, {
                    'is status 201': (r) => r.status === 201,
                    'is api id present': (r) => r.json().hasOwnProperty('id'),
                })
                sleep(PAUSE);
            }
        }
    })

}
