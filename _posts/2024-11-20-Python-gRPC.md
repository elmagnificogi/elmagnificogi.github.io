---
layout:     post
title:      "Python gRPC"
subtitle:   "RPC、stream、流式传输、protobuf"
date:       2024-11-22
update:     2024-11-22
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

安装gRPC库

```
pip install grpcio
```

安装gRPC工具

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
# 继承的原型函数在这里
class GreeterServicer(object):
    """The greeting service definition.
    """

    def SayHello(self, request, context):
        """Sends a greeting
        """
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')

    def SayHelloStreamReply(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')

    def SayHelloBidiStream(self, request_iterator, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')
        
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
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import runtime_version as _runtime_version
from google.protobuf import symbol_database as _symbol_database
from google.protobuf.internal import builder as _builder
_runtime_version.ValidateProtobufRuntimeVersion(
    _runtime_version.Domain.PUBLIC,
    5,
    27,
    2,
    '',
    'helloworld.proto'
)
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()



# 这里直接用代码的形式写了一个helloworld的描述符
DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\x10helloworld.proto\x12\nhelloworld\"\x1c\n\x0cHelloRequest\x12\x0c\n\x04name\x18\x01 \x01(\t\"\x1d\n\nHelloReply\x12\x0f\n\x07message\x18\x01 \x01(\t2\xe4\x01\n\x07Greeter\x12>\n\x08SayHello\x12\x18.helloworld.HelloRequest\x1a\x16.helloworld.HelloReply\"\x00\x12K\n\x13SayHelloStreamReply\x12\x18.helloworld.HelloRequest\x1a\x16.helloworld.HelloReply\"\x00\x30\x01\x12L\n\x12SayHelloBidiStream\x12\x18.helloworld.HelloRequest\x1a\x16.helloworld.HelloReply\"\x00(\x01\x30\x01\x42\x36\n\x1bio.grpc.examples.helloworldB\x0fHelloWorldProtoP\x01\xa2\x02\x03HLWb\x06proto3')

_globals = globals()
_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, _globals)
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'helloworld_pb2', _globals)
if not _descriptor._USE_C_DESCRIPTORS:
  _globals['DESCRIPTOR']._loaded_options = None
  _globals['DESCRIPTOR']._serialized_options = b'\n\033io.grpc.examples.helloworldB\017HelloWorldProtoP\001\242\002\003HLW'
  _globals['_HELLOREQUEST']._serialized_start=32
  _globals['_HELLOREQUEST']._serialized_end=60
  _globals['_HELLOREPLY']._serialized_start=62
  _globals['_HELLOREPLY']._serialized_end=91
  _globals['_GREETER']._serialized_start=94
  _globals['_GREETER']._serialized_end=322
# @@protoc_insertion_point(module_scope)

```



实际这里使用的proto文件，是如下定义的

```protobuf
// The greeting service definition.
service Greeter {
  // Sends a greeting
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}

// The request message containing the user's name.
message HelloRequest {
  string name = 1;
}

// The response message containing the greetings
message HelloReply {
  string message = 1;
}
```



### 自定义函数

实际使用的proto文件是在`examples/protos/helloworld.proto`中的，这里添加一个新的函数

```protobuf
syntax = "proto3";

option java_multiple_files = true;
option java_package = "io.grpc.examples.helloworld";
option java_outer_classname = "HelloWorldProto";
option objc_class_prefix = "HLW";

package helloworld;

// The greeting service definition.
service Greeter {
  // Sends a greeting
  rpc SayHello (HelloRequest) returns (HelloReply) {}

  rpc SayHello2 (HelloRequest) returns (HelloReply) {}

  rpc SayHelloStreamReply (HelloRequest) returns (stream HelloReply) {}

  rpc SayHelloBidiStream (stream HelloRequest) returns (stream HelloReply) {}
}

// The request message containing the user's name.
message HelloRequest {
  string name = 1;
}

// The response message containing the greetings
message HelloReply {
  string message = 1;
}

```

需要重新生成对应的代码

```bash
python -m grpc_tools.protoc -I../../protos --python_out=. --pyi_out=. --grpc_python_out=. ../../protos/helloworld.proto
```



这里就会重新生成了

```python
def add_GreeterServicer_to_server(servicer, server):
    rpc_method_handlers = {
            'SayHello': grpc.unary_unary_rpc_method_handler(
                    servicer.SayHello,
                    request_deserializer=helloworld__pb2.HelloRequest.FromString,
                    response_serializer=helloworld__pb2.HelloReply.SerializeToString,
            ),
            'SayHello2': grpc.unary_unary_rpc_method_handler(
                    servicer.SayHello2,
                    request_deserializer=helloworld__pb2.HelloRequest.FromString,
                    response_serializer=helloworld__pb2.HelloReply.SerializeToString,
            ),
```



server和client都增加hello2以后，再次运行就能看到已经给过来正确的反应了

![image-20241122144701070](https://img.elmagnifico.tech/static/upload/elmagnifico/202411221447146.png)

到这里最简单的gRPC就完成了



### 小总结

核心就三步：

1. 定义proto，其实就是定义函数和参数，
2. 生成，生成会自动根据定义，生成中间需要的类或者成员函数
3. 修改server和client的调用



## gRPC的流式传输

上面演示的例子都是C/S架构的，也是gRPC常用的模式，一方请求，一方应答，这是普通的RPC。服务方是不能主动发起请求的，只有客户方主动。还有其他3种方式。

- 响应流式传输
- 请求流式传输
- 双向流式传输



还是之前的例子中，有对应的流式实现

```python
NUMBER_OF_REPLY = 10
class Greeter(MultiGreeterServicer):
    async def sayHello(
        self, request: HelloRequest, context: grpc.aio.ServicerContext
    ) -> HelloReply:
        logging.info("Serving sayHello request %s", request)
        for i in range(NUMBER_OF_REPLY):
            yield HelloReply(message=f"Hello number {i}, {request.name}!")

```

对于服务端的响应，这里可以看到返回了10此请求，并且这个函数是异步的



```python
async def run() -> None:
    async with grpc.aio.insecure_channel("localhost:50051") as channel:
        stub = hellostreamingworld_pb2_grpc.MultiGreeterStub(channel)

        # Read from an async generator
        async for response in stub.sayHello(
            hellostreamingworld_pb2.HelloRequest(name="you")
        ):
            print(
                "Greeter client received from async generator: "
                + response.message
            )

        # Direct read from the stub
        hello_stream = stub.sayHello(
            hellostreamingworld_pb2.HelloRequest(name="you")
        )
        while True:
            response = await hello_stream.read()
            if response == grpc.aio.EOF:
                break
            print(
                "Greeter client received from direct read: " + response.message
            )
```

客户端这边，前面是异步流式获取，后面是正常流式获取获取



可能看例子，这里流式传输的意义不是很明显，除了能多次发送请求或者多次响应，还有啥用。

- 大文件流式传输就需要多次请求和多次响应，比如音频、视频
- 主动推送或者回报就需要流式来实现，比如广告、广播推送
- 高并发，可以同时响应多个请求，不再是顺序执行，串联影响效率
- 任务完成的进度回显就必须多次响应

grpc的双向流式可以类比成WebSocket，客户端和服务器都可以互相发送信息



```protobuf
// The greeting service definition.
service Greeter {
  // Sends a greeting
  rpc SayHello (HelloRequest) returns (HelloReply) {}

  rpc SayHello2 (HelloRequest) returns (HelloReply) {}

  rpc SayHelloStreamReply (HelloRequest) returns (stream HelloReply) {}

  rpc SayHelloBidiStream (stream HelloRequest) returns (stream HelloReply) {}
}
```

在流式传输的例子中proto文件的定义使用了一个特殊关键词，`stream`凡是被stream修饰的参数，那么传输时就会采用流式。

如果修饰到返回值，那就是服务器流式，如果修饰参数，那就是客户端流式，如果同时有那就是双向流式传输



## Summary

总体来说gRPC就是这样，流式上感觉似乎没有WebSocket简单，特别是如果是用来做双向交互的时候WebSocket似乎更简单，更好做一些



## Quote

> https://grpc.io/docs/languages/python/quickstart/
>
> https://blog.yuanpei.me/posts/grpc-streaming-transmission-minimalist-guide/
>
> https://hamhire.tech/posts/coding/grpc-03.stream-demo.html

