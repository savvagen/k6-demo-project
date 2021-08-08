import http from 'k6/http'
import {sleep, check, group} from 'k6'
import { generateAuthor } from './modules/genarator';
import * as faker from 'faker/locale/en_US'

export let options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        failed_requests: ['rate<=0'],
        http_req_duration: ['p(95)<500']
    }
}

const PAUSE = 1.0;
const BASE_URL = "http://localhost:8001"

let params = {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    tags: {
        name: 'author', // first request
    }
}

export default function(){

    group('articles writer scenario', (_)=> {
        // 1. Create Author

        let author_payload = JSON.stringify(generateAuthor())
        // let author_payload = JSON.stringify({
        //     first_name: `Test-${Math.floor(Math.random()*5+100)}`,
        //     last_name: `User-${Math.floor(Math.random()*5+100)}`,
        //     name: `test.user${Math.floor(Math.random()*5+100)}`,
        //     email: `test.user${Math.floor(Math.random()*2+1000)}@example.com`
        // })   
        let author_resp = http.post(`${BASE_URL}/api/authors/`, author_payload, params)
        check(author_resp, {
            'is status 200': (r) => r.status === 201,
            'is api id present': (r) => r.json().hasOwnProperty('id'),
        })
        sleep(PAUSE)

        // 2. Create 5 Articles using created author
        params.tags.name = 'article'
        for(let i = 0; i < 5; i++){
            let article_payload = JSON.stringify({
                title: `Hello World Article - ${Math.floor(Math.random()*5+100)}`,
                subject: 'performance',
                body: `<h2>Body</h2>${faker.lorem.words()}<div><div>`,
                author: author_resp.json()['id']
            })
            let article_resp = http.post(`${BASE_URL}/api/articles/`, article_payload, params)
            
            check(article_resp, {
                'is status 200': (r) => r.status === 201,
                'is api id present': (r) => r.json().hasOwnProperty('id'),
            })
            sleep(PAUSE);
        }

    })

} 