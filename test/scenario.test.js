import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
import { readScenario } from './scenarios/read.scenario.js';
import { writeScenario } from './scenarios/write.scenario.js';


export let options = {
    noConnectionReuse: false,
    discardResponseBodies: false,
    scenarios: {
        write_scenario: {
            // some arbitrary scenario name
            exec: 'writeScn', // the function this scenario will execute
            //executor: 'constant-vus',
            //vus: 5,
            //duration: '180s'
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '20s', target: 5 },
                { duration: '60s', target: 5 },
                { duration: '20s', target: 10 },
                { duration: '60s', target: 10 },
                { duration: '10s', target: 0 },
            ],
        },
        read_scenario: {
            exec: 'readScn',
            // executor: 'constant-vus',
            // vus: 5,
            // duration: '180s'
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '20s', target: 5 },
                { duration: '60s', target: 5 },
                { duration: '20s', target: 10 },
                { duration: '60s', target: 10 },
                { duration: '10s', target: 0 },
            ],
        }
    }
}

const PAUSE = 0.5;
const BASE_URL = __ENV.BASE_URL !== undefined ? __ENV.BASE_URL: "http://localhost:3000"

export function setup(){
    console.log("Setup Block!")
    return { base_url: BASE_URL}
}


export function readScn(data) { readScenario(data) }

export function writeScn(data) { writeScenario(data) }


export function teardown(data){
    console.log("Teardown Block!")
}

export function handleSummary(data) {
    return {
        "reports/index.html": htmlReport(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    };
}
