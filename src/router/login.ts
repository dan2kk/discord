// @ts-ignore
import { Router, Request, Response, response } from 'express';
import {client} from '../database/db';
import {InsertOneResult, ObjectId, WithId} from "mongodb";
const router : Router = Router();
router.get('/', async(req : Request, res : Response) => {
    let id: any = req.query["id"]
    let pw: any = req.query["pw"]
    console.log(id, pw)
    //await client.connect()
    await client.db('userinfo').collection('logininfo').findOne({id: id, pw: pw}).then(
        (result)=>{
            console.log(result)
            if(result == null)
                res.send({"state": false})
            else
                res.send({"state": true, "userName": result.nickname})
        },
        (result : any)=>{
            console.error(result)
        }
    )
});
router.get('/find', async(req : Request, res : Response) => {
    let id: any = req.query["id"]
    let result = await client.db('userinfo').collection('logininfo').findOne({id:id})
    if(result == null){
        res.send({"state": false})
    }
    else{
        console.log(result)
        res.send({"state": true, "findPw": result.pw})
    }
});

router.post('/create', async(req : Request, res : Response) => {
    let id: any = req.body.params["id"]
    let pw: any = req.body.params["pw"]
    let nickname: any = req.body.params["name"]
    //await client.connect();
    let result = await client.db('userinfo').collection('logininfo').findOne({id: id})
    if(result == null){
        await client.db('userinfo').collection('logininfo').insertOne({_id: new ObjectId(), id: id, pw: pw, nickname: nickname}).then(
            (result: InsertOneResult)=> {
                console.log(result)
                res.send({"state": true})
            },
            (result: InsertOneResult) => {
                console.log(result)
            }
        )
    }
    else{
        res.send({"state": false})
    }

});

export { router };