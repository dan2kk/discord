"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
// @ts-ignore
const express_1 = require("express");
const db_1 = require("../database/db");
const mongodb_1 = require("mongodb");
const router = (0, express_1.Router)();
exports.router = router;
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.query["id"];
    let pw = req.query["pw"];
    console.log(id, pw);
    //await client.connect()
    yield db_1.client.db('userinfo').collection('logininfo').findOne({ id: id, pw: pw }).then((result) => {
        console.log(result);
        if (result == null)
            res.send({ "state": false });
        else
            res.send({ "state": true, "userName": result.nickname });
    }, (result) => {
        console.error(result);
    });
}));
router.get('/find', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.query["id"];
    let result = yield db_1.client.db('userinfo').collection('logininfo').findOne({ id: id });
    if (result == null) {
        res.send({ "state": false });
    }
    else {
        console.log(result);
        res.send({ "state": true, "findPw": result.pw });
    }
}));
router.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.body.params["id"];
    let pw = req.body.params["pw"];
    let nickname = req.body.params["name"];
    //await client.connect();
    let result = yield db_1.client.db('userinfo').collection('logininfo').findOne({ id: id });
    if (result == null) {
        yield db_1.client.db('userinfo').collection('logininfo').insertOne({ _id: new mongodb_1.ObjectId(), id: id, pw: pw, nickname: nickname }).then((result) => {
            console.log(result);
            res.send({ "state": true });
        }, (result) => {
            console.log(result);
        });
    }
    else {
        res.send({ "state": false });
    }
}));
