


### Run Load Test inf Docker container
``` 
### Setup Monitoring and Application
docker-compose up -d --build

### Run Load Test
docker run --net=host -e "K6_OUT=influxdb=http://127.0.0.1:8086/k6" -i loadimpact/k6 run - <test/load.js

```


#### Exposing local influxdb port to internet

Or use this libs to expose your local services to internet using secure channel:
* ngrok: `ngrok http 8086`
* https://github.com/mmatczuk/go-http-tunnel
* Or use `localtunnel` lib: 
1) `npm install -g localtunnel`
2) `lt --port 8081 --subdomain "your desired domain name"`