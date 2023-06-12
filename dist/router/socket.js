"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const socket_io_1 = require("socket.io");
// @ts-ignore
const app_1 = require("../app");
let channelNumber = 1;
class User {
    constructor(name) {
        this.name = name;
        this.isLive = false;
        this.peerId = "";
    }
}
class Channel {
    constructor(name, host, locked, pass) {
        this.name = name;
        this.host = host;
        this.locked = locked;
        this.password = pass;
        this.users = [];
        this.users.push(host);
        this.channelNumber = channelNumber++;
    }
}
let users = [];
let allUsers = [];
let channels = {};
let nowUser;
function run() {
    const io = new socket_io_1.Server(app_1.httpsServer, {
        cors: { origin: "*" }
    });
    io.on("connect", (socket) => {
        socket.on("login", function (msg) {
            let data = null;
            try {
                data = JSON.parse(msg);
                nowUser = new User(data.name);
            }
            catch (e) {
                console.error(e);
            }
            console.log("logined attempted", data.name);
            if (allUsers.indexOf(data.name) != -1) {
                sendTo(socket, {
                    type: "login",
                    success: false
                });
                console.log("login failed");
                return;
            }
            console.log("login success");
            users.push(new User(data.name));
            allUsers.push(data.name);
            sendTo(socket, {
                type: "login",
                success: true,
                channels: channels
            });
        });
        socket.on("channelCreate", function (msg) {
            let data = null;
            try {
                data = JSON.parse(msg);
                nowUser = new User(data.name);
            }
            catch (e) {
                console.error(e);
            }
            console.log("channel createing");
            if (channels[data.channelName]) {
                console.log("channel name already exist.");
                sendTo(socket, {
                    type: "channelCreate",
                    success: false,
                });
            }
            channels[data.channelName] = new Channel(data.channelName, nowUser, data.isLocked, data.password);
            console.log(data.channelName, "is created");
            socket.join(data.channelName);
            sendTo(socket, {
                type: "channelCreate",
                success: true,
                channelName: data.channelName
            });
        });
        socket.on("channelJoin", function (msg) {
            let data = null;
            try {
                data = JSON.parse(msg);
                nowUser = new User(data.name);
            }
            catch (e) {
                console.error(e);
            }
            console.log("channel joining to", data.channelName);
            if (!channels[data.channelName]) {
                console.log("channel name is not exists");
                sendTo(socket, {
                    type: "channelJoin",
                    success: false,
                    msg: "no channel"
                });
            }
            else if (channels[data.channelName].users.length >= 6) {
                console.log("max users is in channel");
                sendTo(socket, {
                    type: "channelJoin",
                    success: false,
                    msg: "max user"
                });
            }
            else if (channels[data.channelName].locked &&
                channels[data.channelName].password != data.password) {
                console.log("channel is locked and password is wrong");
                sendTo(socket, {
                    type: "channelJoin",
                    success: false,
                    msg: "wrong password"
                });
            }
            else {
                console.log(data.name + " joining to channel " + data.channelName);
                let tempList = {};
                for (let i = 0; i < channels[data.channelName].users.length; i++) {
                    tempList[channels[data.channelName].users[i].name] = channels[data.channelName].users[i];
                }
                channels[data.channelName].users.push(nowUser);
                socket.join(data.channelName);
                sendTo(socket, {
                    type: "channelJoin",
                    success: true,
                    channelName: data.channelName,
                    candidate: tempList
                });
                socket.to(data.channelName).emit("message", JSON.stringify({
                    type: "userJoin",
                    user: nowUser
                }));
            }
        });
        socket.on("channelList", () => {
            sendTo(socket, {
                type: "channelList",
                channels: channels
            });
        });
        socket.on("chatMessage", (msg) => {
            let data = null;
            try {
                data = JSON.parse(msg);
                nowUser = new User(data.name);
            }
            catch (e) {
                console.error(e);
            }
            io.to(data.channel).emit("message", JSON.stringify({
                type: "chatMessage",
                user: data.name,
                msg: data.msg
            }));
            console.log(data.name + " send " + data.msg + " to " + data.channel);
        });
        socket.on('start-stream', function (data) {
            try {
                data = JSON.parse(data);
            }
            catch (e) {
                console.error(e);
            }
            console.log("start-stream param:", data);
            console.log('Stream started at ' + data["channel"] + " from " + data["name"]);
            for (let i = 0; i < channels[data.channel].users.length; i++) {
                if (channels[data.channel].users[i].name == data.name) {
                    channels[data.channel].users[i].peerId = data.peerId;
                    channels[data.channel].users[i].isLive = true;
                }
            }
            socket.to(data.channel).emit('message', JSON.stringify({
                type: "stream",
                name: data.name,
                peerId: data.peerId
            }));
        });
    });
    console.log("Socket server is running on https://localhost:9091");
}
exports.run = run;
function sendTo(conn, message) {
    conn.send(JSON.stringify(message));
}
