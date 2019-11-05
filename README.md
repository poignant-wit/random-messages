# random-messages

What do we have:
- socket endpoint (:3031) -> random messages `IMessage { id: string, text: string, author: string }`
- http endpoint (:3030) <- (POST) `IBody { text: string, author: string }` returns `IMessage` or status 400
