const http = require('http');
const request = require('request');
const WebSocket = require('ws');
const uuid = require('uuid');
const port = 3030;
const wsPort = 3031;

const wss = new WebSocket.Server({ port: wsPort });

function broadcast(data) {
    wss.clients.forEach(client => client.send(JSON.stringify(data)))
}

const authors = ['user1', 'user2', 'user3', 'user4'];

const genRandomBool = () => Math.random() >= 0.5;
const genMessageId = () => {
    return uuid.v4();
};
const genMessageText = () => {
    return new Promise((resolve, reject) => {
        // request('https://thesimpsonsquoteapi.glitch.me/quotes', { json: true }, (err, res, body) => {
        //     if (err) { return reject(err); }
        //     const text = body;
        //     console.log(text);
        //     resolve(text);
        // });
        resolve(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))
    });
};

const genMessageAuthor = () => {
    return authors[Math.floor(Math.random() * authors.length)];
};

const getMessage = () => {
    return genMessageText().then(text => {
        return { id: genMessageId(), text: text, author: genMessageAuthor() };
    })
};

const genRandomTimeInterval = () => {
    return Math.random() * 5000;
};

function sendMessages() {
    getMessage().then(broadcast);
    setTimeout(sendMessages, genRandomTimeInterval());
}

const requestHandler = (request, response) => {
    response.setHeader('Content-type', 'json');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Request-Method', '*');
    response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    response.setHeader('Access-Control-Allow-Headers', '*');
    if (response.method === 'OPTIONS' ) {
        response.writeHead(200);
        response.end();
        return;
    }
    if (request.url === '/messages' && request.method === 'POST') {

        if (genRandomBool()) {
            response.statusCode = 400;
            response.end();
            return;
        }

        let body = '';
        request.on('data', chunk => {
            body += chunk.toString(); // convert Buffer to string
        });
        request.on('end', () => {
            if (!body) {
                response.statusCode = 400;
                response.end();
                return;
            }

            body = JSON.parse(body);

            if (!body.text || !body.author) {
                response.statusCode = 400;
                response.end();
            }

        });
        return setTimeout(() => {
            response.statusCode = 200;
            const message = { id: genMessageId(), author: body.author, text: body.text };
            broadcast(message);
            response.end(JSON.stringify(message));
        }, genRandomTimeInterval());
    }

    response.statusCode = 400;
    response.end();
};

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`http server is listening on ${port}...`);
    console.log(`ws server is listening on ${wsPort}...`);
});

sendMessages();
