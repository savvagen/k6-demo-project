# Minikube setup

```
minikube delete
minikube start # --extra-config=controller-manager.horizontal-pod-autoscaler-use-rest-clients=false
minikube dashboard --url ### Show dashboard url
minikube tunnel ### Expose LoadBalancer or Ingress
```

setup application
``` 
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
minikube tunnel ## expose service
```

setup metrics server
``` 
kubectl apply -f metrics-server.yaml
```
or
``` 
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```


