# random-messages

What do we have:
- socket endpoint -> random messages `IMessage { id: string, text: string, author: string }`
- http endpoint <- (POST) `IBody { text: string, author: string }` returns `IMessage` or status 400
