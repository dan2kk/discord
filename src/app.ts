// @ts-ignore
import express, {Express, Request, Response, NextFunction} from "express";
import {run as rundb} from './database/db';
import {run as runsocket} from './router/socket';
import {router as test} from './router/test'
import {router as login} from './router/login'
import {createServer}  from 'https'
import cors from 'cors'
import fs from 'fs'


//express, socket.io 정의
const app : Express = express();
//HTTPS PORT USE
const port : number = 9091;
const serverConfig = {
    key: fs.readFileSync('./src/database/private.key'),
    cert: fs.readFileSync('./src/database/mynetworkproject.crt')
}

const httpsServer = createServer(serverConfig, app)

//db 실행
rundb().catch(console.dir);

//CORS 설정
app.use(cors<Request>());

//POST 요청 처리를 위한 JSON 파서
app.use(express.json());
app.use(express.urlencoded({extended: true}));
//socket event listener 정의

//라우터 연결
app.use('/login', login);
app.use('/', express.static("./public"))
//test 라우터
app.use('/test', test);
//예외처리
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).send(err.message);
});
runsocket()
//포트 시작
httpsServer.listen(port, () => {
    console.log("Server is running on port " + port);    
})
export {httpsServer}