"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpsServer = void 0;
// @ts-ignore
const express_1 = __importDefault(require("express"));
const db_1 = require("./database/db");
const socket_1 = require("./router/socket");
const test_1 = require("./router/test");
const login_1 = require("./router/login");
const https_1 = require("https");
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
//express, socket.io 정의
const app = (0, express_1.default)();
//HTTPS PORT USE
const port = 9091;
const serverConfig = {
    key: fs_1.default.readFileSync('./src/database/private.key'),
    cert: fs_1.default.readFileSync('./src/database/mynetworkproject.crt')
};
const httpsServer = (0, https_1.createServer)(serverConfig, app);
exports.httpsServer = httpsServer;
//db 실행
(0, db_1.run)().catch(console.dir);
//CORS 설정
app.use((0, cors_1.default)());
//POST 요청 처리를 위한 JSON 파서
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
//socket event listener 정의
//라우터 연결
app.use('/login', login_1.router);
app.use('/', express_1.default.static("./public"));
//test 라우터
app.use('/test', test_1.router);
//예외처리
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(err.message);
});
(0, socket_1.run)();
//포트 시작
httpsServer.listen(port, () => {
    console.log("Server is running on port " + port);
});
