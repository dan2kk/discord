import {MongoClient, ServerApiVersion} from 'mongodb';
import {readFileSync} from 'fs';

const uri: string = readFileSync('./src/database/db_uri.txt', 'utf8');

const client: MongoClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
});

async function run(){
    try{
        await client.connect();
        await client.db('test').command({ping: 1});
        console.log("Connected successfully to server");
    }
    catch(e){
        console.error(e);
    }
}

export {run, client}
