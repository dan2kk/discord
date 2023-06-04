import {Server, Socket} from "socket.io"
// @ts-ignore
import {Server as p2pServer} from "socket.io-p2p-server"
import {httpsServer} from "../app";
let channelNumber = 1;
class User{
    name: string;
    socket: Socket;
    constructor(name:string, socket:Socket) {
        this.name =name;
        this.socket = socket;
    }
}
class Channel{
    name: string;
    host: User;
    locked: boolean;
    password: string;
    users: User[];
    channelNumber: number;
    constructor(name:string, host: User, locked:boolean, pass:string) {
        this.name = name;
        this.host = host;
        this.locked = locked;
        this.password = pass;
        this.users = [];
        this.users.push(host);
        this.channelNumber = channelNumber++;
    }
}
let users: User[] = [];
let allUsers: string[] = [];
let channels: {[channelName:string] :Channel }= {};
let nowUser: User;
function run(){
    const io = new Server(httpsServer, {
        cors: {origin:"http://localhost:8080"}
    })
    io.use(p2pServer)
    io.on("connect", (socket: Socket)=>{
        socket.on("login", function(msg){
            let data = null;
            try{
                data = JSON.parse(msg)
                nowUser = new User(data.name, socket)
            }
            catch(e){
                console.error(e)
            }
            console.log("logined attempted", data.name)
            if(allUsers.indexOf(data.name)!= -1){
                sendTo(socket, {
                    type:"login",
                    success: false
                })
                console.log("login failed")
                return
            }
            console.log("login success")
            users.push(new User(data.name, socket))
            allUsers.push(data.name)

            sendTo(socket, {
                type: "login",
                success: true,
                channels: Object.values(channels).map(channel => ({
                    name: channel.name,
                    locked: channel.locked,
                    users: channel.users.length,
                    number: channel.channelNumber
                    // 필요한 다른 속성들
                }))
            })
        })
        socket.on("channelCreate", function(msg){
            let data = null;
            try{
                data = JSON.parse(msg)
                nowUser = new User(data.name, socket)
            }
            catch(e){
                console.error(e)
            }
            console.log("channel createing")
            if(channels[data.channelName]){
                console.log("channel name already exist.")
                sendTo(socket, {
                    type: "channelCreate",
                    success: false,
                })
            }
            channels[data.channelName] = new Channel(
                data.channelName,
                nowUser,
                data.isLocked,
                data.password,
            )
            console.log(data.channelName, "is created")
            socket.join(data.channelName)
            sendTo(socket, {
                type: "channelCreate",
                success: true,
                channelName : data.channelName
            })
        })
        socket.on("channelJoin", function(msg){
            let data = null;
            try{
                data = JSON.parse(msg)
                nowUser = new User(data.name, socket)
            }
            catch(e){
                console.error(e)
            }
            console.log("channel joining to", data.channelName)
            if(!channels[data.channelName]){
                console.log("channel name is not exists")
                sendTo(socket, {
                    type: "channelJoin",
                    success: false,
                    msg: "no channel"
                })
            }
            else if(channels[data.channelName].users.length >=6){
                console.log("max users is in channel")
                sendTo(socket, {
                    type: "channelJoin",
                    success: false,
                    msg: "max user"
                })
            }
            else if(channels[data.channelName].locked &&
                channels[data.channelName].password != data.password){
                console.log("channel is locked and password is wrong")
                sendTo(socket, {
                    type: "channelJoin",
                    success: false,
                    msg: "wrong password"
                })
            }
            else{
                console.log("joining to channel")
                let candidateList: [] = [];

                channels[data.channelName].users.push(nowUser)
                let tempList = []
                for(let i=0; i<channels[data.channelName].users.length; i++){
                    tempList.push(channels[data.channelName].users[i].name)
                }
                socket.join(data.channelName)
                sendTo(socket, {
                    type: "channelJoin",
                    success: true,
                    channelName: data.channelName,
                    candidate: tempList
                })
            }
        })
        socket.on("channelList", ()=>{
            sendTo(socket, {
                type: "channelList",
                channels: Object.values(channels).map(channel => ({
                    name: channel.name,
                    locked: channel.locked,
                    users: channel.users.length,
                    number: channel.channelNumber
                    // 필요한 다른 속성들
                }))
            })
        })
        socket.on("chatMessage", (msg) =>{

            let data = null;
            try{
                data = JSON.parse(msg)
                nowUser = new User(data.name, socket)
            }
            catch(e){
                console.error(e)
            }
            io.to(data.channel).emit("message", JSON.stringify({
                type: "chatMessage",
                user: data.name,
                msg: data.msg
            }))
            console.log(data.name + " send "+ data.msg + " to "+ data.channel)
        })
        socket.on('start-stream', function (msg){
            let data = null;
            try{
                data = JSON.parse(msg)
                nowUser = new User(data.name, socket)
            }
            catch(e){
                console.error(e)
            }
            console.log(data)
            console.log('Stream started at '+data.channel+" from" + data.name)
            if (data.stream && typeof data.stream.getAudioTracks === 'function' && typeof data.stream.getVideoTracks === 'function') {
                io.to(data.channel).emit('stream', data.stream)
            } else {
                console.error("Invalid stream type");
                console.log(data.stream)
            }
        })
        socket.on("disconnecting", (reason) => {
            for(let i:number=0; i< users.length; i++){
                let tempUser:User = users[i]
                if (tempUser.socket == socket){
                    allUsers.splice(allUsers.indexOf(tempUser.name), 0)
                    break
                }
                console.log(tempUser.name + " disconnected from server")
            }
        });
    })

    console.log("Socket server is running on https://localhost:9091")
}

function sendTo(conn: Socket, message: {} ) {
    conn.send(JSON.stringify(message))
}
export {run}
