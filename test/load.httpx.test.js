import {sleep, check, group} from 'k6'
import { Httpx } from 'https://jslib.k6.io/httpx/0.0.3/index.js';
import { randomIntBetween,  randomString, randomItem, uuidv4, findBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";

export let options = {
    vus: 5,
    duration: '1m30s',
    thresholds: {
        http_req_failed: ['rate<=0'],
        http_req_duration: ['p(95)<500']
    },
    // env: { BASE_URL: "http://localhost:3001" },
    // httpDebug: "full" // output the requests and responses with json bodys
}


let session = new Httpx({
    baseURL: "http://localhost:3001", 
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 20000 // 20s timeout.
});

const PAUSE = 0.5


export function setup(){
    // 1. Set Up User
    console.log("Setup Test!")
    let user = {
        name: `Test${randomIntBetween(1000,9999)} User${randomIntBetween(1000,9999)}`,
        username: `test.user${randomIntBetween(1000,9999)}`,
        email: `test.user.${randomString(10)}@example.com`,
    }
    let user_resp = session.post('/users', JSON.stringify(user), {tags: { name: 'POST /users' }})
    check(user_resp, {
        'is status 201': (r) => r.status === 201,
        'is api id present': (r) => r.json().hasOwnProperty('id'),
    })
    sleep(PAUSE)
    // Return the data as JSON
    return { data: { 
        userId: user_resp.json()['id'],
        email: user.email,
    }}
}


export default function(data){

    group('posts writer scenario', (_)=> {

        // 2. Create ToDo for created user
        
        let todo_payload = {
            userId: data.data.userId,
            title: `ToDo - ${randomIntBetween(1000, 9999)}: ${randomString(20)}`,
            completed: randomItem([true, false])
        }
        let todo_resp = session.post('/todos', JSON.stringify(todo_payload), {tags: { name: 'POST /todos' }})
        check(todo_resp, {
            'is status 201': (r) => r.status === 201,
            'is api id present': (r) => r.json().hasOwnProperty('id'),
        })
        sleep(PAUSE);

        // 3. Create 5 posts

        for(let i = 0; i < 5; i++){
            let post_payload = {
                title: `New Post ${randomIntBetween(1,1000)}`,
                body: `Hello World ${randomString(10)}`,
                userId: data.data.userId
            }
            let posts_resp = session.post('/posts', JSON.stringify(post_payload), {tags: { name: 'POST /posts' }})
            check(posts_resp, {
                'is status 201': (r) => r.status === 201,
                'is api id present': (r) => r.json().hasOwnProperty('id'),
            })
            sleep(randomIntBetween(1,2));

            // Create 3 comments for each post

            for(let i = 0; i < 3; i++){
                
                let comment_payload = {
                    name: `Comment Test - ${randomIntBetween(1,1000)}`,
                    email: `${data.data.email}`,
                    body: `Comment-${posts_resp.json()['id']} Comment: ${randomString(20)}`,
                    postId: posts_resp.json()['id']
                }
                let comment_resp = session.post('/comments', JSON.stringify(comment_payload), {tags: { name: 'POST /comments' }})
                check(comment_resp, {
                    'is status 201': (r) => r.status === 201,
                    'is api id present': (r) => r.json().hasOwnProperty('id'),
                })
                sleep(randomItem([0.5, 1]));

            }
        } 
    })

} 


export function teardown(data){
    console.log("Teardown Test!")

    let emailIsOK = /test.user.*@example.com/.test(data.data.email)
    console.log(emailIsOK)
    if (!emailIsOK) {
        throw new Error('incorrect data -> email: ' + data.data.email);
    } else { 
        console.log(JSON.stringify(data))
    }
}