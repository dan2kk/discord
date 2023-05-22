// @ts-ignore
import { Router, Request, Response, response } from 'express';
import {client} from '../database/db';
import {InsertOneResult, ObjectId, WithId} from "mongodb";
const router : Router = Router();

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


export { router };