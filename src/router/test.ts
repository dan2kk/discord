// @ts-ignore
import { Router, Request, Response, response } from 'express';
const router : Router = Router();

router.get('/', async(req : Request, res : Response) => {
    res.send("AAA")
});

router.post('/', async(req : Request, res : Response) => {
    console.log("ASDSAD");
    console.log(req.body);
    res.send(req.body);
});

export { router };