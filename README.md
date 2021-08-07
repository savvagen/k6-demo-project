


### Run Load Test inf Docker container
``` 
### Setup Monitoring and Application
docker-compose up -d --build

### Run Load Test
docker run --net=host -e "K6_OUT=influxdb=http://127.0.0.1:8086/k6" -i loadimpact/k6 run - <test/load.js

```