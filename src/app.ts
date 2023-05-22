// @ts-ignore
import express, {Express, Request, Response, NextFunction} from "express";
import {run} from './database/db';
import {router as test} from './router/test'
import {router as login} from './router/login'
import cors from 'cors';

const app : Express = express();
const port : number = 9876;
//db 실행
run().catch(console.dir);
//CORS 설정
app.use(cors<Request>());
//POST 요청 처리를 위한 JSON 파서
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//라우터 연결
app.use('/login', login);

//test 라우터
app.use('/test', test);

//예외처리
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).send(err.message);
});

app.listen(port, () => {
    console.log("Server is running on port " + port);    
})