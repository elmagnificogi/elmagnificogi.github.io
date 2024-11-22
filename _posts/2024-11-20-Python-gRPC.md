---
layout:     post
title:      "Python gRPC"
subtitle:   "RPC"
date:       2024-11-30
update:     2024-11-30
author:     "elmagnifico"
header-img: "img/bg3.jpg"
catalog:    true
tobecontinued: false
tags:
    - gRPC
---

## Foreword



## gRPC

### example测试

安装grpc库

```
pip install grpcio
```

安装grpc工具

```
pip install grpcio-tools
```



下载官方例程

```
git clone -b v1.66.0 --depth 1 --shallow-submodules https://github.com/grpc/grpc
```



演示用例在这里

```
grpc/examples/python/helloworld
```

先启动服务端

```
python greeter_server.py
```

![image-20241120171002516](https://img.elmagnifico.tech/static/upload/elmagnifico/202411201710588.png)

可以看到已经在监听了

再启动客户端

```
python greeter_client.py
```

正常连接到了服务端

![image-20241120171021552](https://img.elmagnifico.tech/static/upload/elmagnifico/202411201710582.png)

### 源码分析

服务端

```python
from concurrent import futures
import logging

import grpc
import helloworld_pb2
import helloworld_pb2_grpc

# 继承自helloworld_pb2_grpc.GreeterServicer,重写了sayhello的函数
class Greeter(helloworld_pb2_grpc.GreeterServicer):
    def SayHello(self, request, context):
        # 对应返回 hello 和访问者的名字
        return helloworld_pb2.HelloReply(message="Hello, %s!" % request.name)


def serve():
    # 启动还是比较简单的，设置好端口
    port = "50051"
    # 调用helloworld_pb2_grpc就完成了
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    helloworld_pb2_grpc.add_GreeterServicer_to_server(Greeter(), server)
    server.add_insecure_port("[::]:" + port)
    server.start()
    print("Server started, listening on " + port)
    server.wait_for_termination()


if __name__ == "__main__":
    logging.basicConfig()
    serve()

```



客户端

```python
from __future__ import print_function

import logging

import grpc
import helloworld_pb2
import helloworld_pb2_grpc


def run():
    # NOTE(gRPC Python Team): .close() is possible on a channel and should be
    # used in circumstances in which the with statement does not fit the needs
    # of the code.
    print("Will try to greet world ...")
    # 设置本地 端口
    with grpc.insecure_channel("localhost:50051") as channel:
        stub = helloworld_pb2_grpc.GreeterStub(channel)
        # 发送信息 并等待结果
        response = stub.SayHello(helloworld_pb2.HelloRequest(name="you"))
    print("Greeter client received: " + response.message)


if __name__ == "__main__":
    logging.basicConfig()
    run()

```



helloworld_pb2_grpc.py

```python
# 主要是这个函数，把函数的返回绑定到一起
def add_GreeterServicer_to_server(servicer, server):
    rpc_method_handlers = {
            'SayHello': grpc.unary_unary_rpc_method_handler(
                    servicer.SayHello,
                    request_deserializer=helloworld__pb2.HelloRequest.FromString,
                    response_serializer=helloworld__pb2.HelloReply.SerializeToString,
            ),
            'SayHelloStreamReply': grpc.unary_stream_rpc_method_handler(
                    servicer.SayHelloStreamReply,
                    request_deserializer=helloworld__pb2.HelloRequest.FromString,
                    response_serializer=helloworld__pb2.HelloReply.SerializeToString,
            ),
            'SayHelloBidiStream': grpc.stream_stream_rpc_method_handler(
                    servicer.SayHelloBidiStream,
                    request_deserializer=helloworld__pb2.HelloRequest.FromString,
                    response_serializer=helloworld__pb2.HelloReply.SerializeToString,
            ),
    }
    # 创建服务名称和通用句柄
    generic_handler = grpc.method_handlers_generic_handler(
            'helloworld.Greeter', rpc_method_handlers)
    # server添加通用的句柄
    server.add_generic_rpc_handlers((generic_handler,))
    # 将处理方法注册给server
    server.add_registered_method_handlers('helloworld.Greeter', rpc_method_handlers)
```



helloworld_pb2.py

```python

```



## Summary



## Quote

> 

