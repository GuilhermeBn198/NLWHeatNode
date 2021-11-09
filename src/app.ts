import express from "express";
import "dotenv/config";
import {router} from "./routes";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const serverHttp = http.createServer(app);

const io = new Server(serverHttp, { //cors enabled for all types of connections
	cors: {
		origin: "*"
	}
}); 

io.on("connection", socket => { 
	console.log(`user connect on socket ${socket.id}`);
});

app.use(express.json());

app.use(router);



app.get("/github", (request, response) => { //authenticate with github api
	response.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}` 
	); 
});
app.get("/signin/callback", (request, response) => { //callback to get the code from github and validate user
	const {code} = request.query;

	return response.json(code);
});

export { serverHttp, io};