import { group, sleep } from 'k6';
import http from 'k6/http';

// Version: 1.2
// Creator: WebInspector

export let options = {
    maxRedirects: 0,
	vus: 2,
	duration: '10s'
};

export default function() {

	group("articles_page - http://localhost:8001/articles/", function() {
		let req, res;
		req = [{
			"method": "get",
			"url": "http://localhost:8001/articles/",
		},{
			"method": "get",
			"url": "https://unpkg.com/tachyons@4.10.0/css/tachyons.min.css",
		}];
		res = http.batch(req);
		// Random sleep between 5s and 10s
		sleep(Math.floor(Math.random()*5+5));
	});

}
