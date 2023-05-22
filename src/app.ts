// @ts-ignore
import express, {Express, Request, Response, NextFunction} from "express";
import {run} from './database/db';
import {router as test} from './router/test'
import {router as login} from './router/login'
import {createServer} from "http"
import {Server} from "socket.io"
import cors from 'cors';
import * as http from "http";


//express, socket.io 정의
const app : Express = express();
const port : number = 9876;
const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors:{
        origin: "http://localhost:8083"
    }
})

//db 실행
run().catch(console.dir);

//CORS 설정
app.use(cors<Request>());

//POST 요청 처리를 위한 JSON 파서
app.use(express.json());
app.use(express.urlencoded({extended: true}));
//socket event listener 정의
io.on("connection", (socket)=>{
    console.log(socket.id)
})
//라우터 연결
app.use('/login', login);

//test 라우터
app.use('/test', test);

//예외처리
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).send(err.message);
});
//포트 시작
httpServer.listen(port, () => {
    console.log("Server is running on port " + port);    
})