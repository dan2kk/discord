// @ts-ignore
import { Router, Request, Response, response } from 'express';
const router : Router = Router();

router.get('/', async(req : Request, res : Response) => {
    res.render('../')
});

export { router };