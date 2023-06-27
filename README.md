# Backend

## 실행 커맨드

1. npm i ⇒ repo 설치
2. npm run dev ⇒ 서버 실행

## 기술 스택

1. TypeScript
2. Express.js
3. [Socket.io](http://Socket.io/docs/v4/)
4. MongoDB

## 기본 설계

1. HTTPS 연결을 기반으로 하여 웹 페이지를 전송 
2. 로그인 및 회원가입, 비밀번호 찾기등을 HTTPS 메소드를 통해서 처리
3. HTTPS 메소드를 통해 얻은 정보는 MongoDB atlas를 사용하여 보관
4. 채팅방 리스트와 채팅은 Socket.io으로 처리

## Express.js를 이용한 HTTPS methods

### 1. /

- express.static을 통해 웹페이지 전송
- public에 담겨있는 html, js, css파일을 https를 통해 전송
- 정적인 페이지임으로 express.static을

### 2. /login

**GET ⇒ /login**

> param: {
    id: string
    pw: string
}
> 
- GET Method이므로 Request의 query에서 ID, PW를 Read
- MongoDB의 userinfo의 logininfo에서 검색
- id와 pw가 모두 일치하는 결과에 대해서 검색
- 로그인에 실패하면 Response로  `{state: false}`를 전송
- 로그인에 성공하면 Response로 `{state:true, userName: result.nickname}`를 전송

### 3. /login/find

**GET ⇒ /login/find**

> param:{
    id: string
}
> 
- GET Method이므로 Request의 query에서 ID를 Read
- MongoDB의 userinfo의 logininfo에서 검색
- id가 일치하는 결과에 대해서 검색
- id가 존재하지 않는다면 Response로 `{state: false}`를 전송
- id가 존재한다면 Response로 `{state: true, findPw: result.pw}` 를 전송

### 4. /login/create

**POST ⇒/login/create**

> param:{
    id: string
    pw: string
    name: string
}
> 
- POST Method이므로 Request의 body에서 ID, PW, NAME을 Read
- MongoDB의 userinfo의 logininfo에서 동일한 id가 존재하는지 검색
- 만약 존재한다면 Response로 `{state: false}`를 전송
- 만약 존재하지 않는다면 userinfo의 logininfo에 id, pw, name을 insert
- Response로 `{state: true}`를 전송

## Socket.io를 이용한 채널및 메세지 전송

<aside>
💡 Socket의 기본 구조:
- emit으로 연결되어 있는 socket에 이벤트를 전송
- on으로 이벤트를 전송받으면 해당 이벤트에 대해 처리

</aside>

<aside>
💡 개발 도중 프론트엔드 테스트를 위해 CORS origin:”*” 을 통해 localhost:8080에서 오는 요청도 처리가능 하도록 함.

</aside>

<aside>
💡 `function sendTo(conn:Socket, message: {}) {`

    `conn.send(***JSON***.stringify(message))}
}`

</aside>

### 1. Event: login

> param:{
    name: string
}
> 
- 사용자의 닉네임 `name`을 전송받아 이를 `User` 객체의 instance화
- 이를 전체 접속자 array인 allUsers에서 name을 검색하여 있으면 중복 접속된 상태이므로  `sendTo(socket, {type:”login”, suceess: false})`를 통해 사용자 접속 제한
- 만약 검색해서 없었다면 `sendTo(socket, {type:”login”, suceess: true, channels: channels})`  를 통해 성공 여부와 채널 리스트 전송
- `channels`를 통해 서버에 열려있는 채팅방 리스트를 전송받아 이를 `MainPage.vue` 에 적용

### 2. **Event: channelCreate**

> param:{
    name: string,
    channelName: string,
    isLocked: boolean,
    password: string
}
> 
- 채팅방 채널의 Object인 `channels` 에서 해당 `channelName`을 검색
- 같은 이름의 채널이 이미 존재한다면 `sendTo(socket, {type: “channelCreate”, success: false}` 를 통해 채팅방 생성에 실패함을 알림
- 같은 이름의 채널이 존재하지 않는다면 새로운 `Channel` 객체의 Instance를 생성하여 이를 `data.channelName` 을 키로 갖는 `channels`  에 삽입
- 해당 소켓을 `socket.join(data.channelName)`을 통해 Socket.io의 room에 join한다.
    - 추후 사용자 입장과 채팅, 그리고 화상 회의와 음성 회의 시작에 사용된다.
- `sendTo(socket, {type: “channelCreate”, success: true, channelName: data.channelName})` 을 통해 성공 여부와 해당 채널의 이름을 전송한다.

### 3. Event: channelJoin

> param:{
    name: string,
    channelName: string,
    password: string
}
> 
- 만약 채팅방 채널 Object인 `channels` 에 해당 채널 이름이 존재하지 않는다면 `sendTo(socket, {type: “channelJoin”, success: false, msg: "no channel"})` 를 통해 채널이 존재하지 않음을 알림
- 만약 해당 채널의 사용자가 6명 이상이라면 `sendTo(socket, {type: “channelJoin”, success: false, msg: "max user"})` 를 통해 채널에 사용자가 가득 찼다는 것을 알림
- 만약 해당 채널이 잠겨있으며, `data.password`가 채널의 비밀번호와 일치하지 않는다면, `sendTo(socket, {type: “channelJoin”, success: false, msg: "max user"})` 를 통해 채널의 비밀번호가 일치하지 않음을 알림
- 모든 조건을 만족시킨다면 기존 참가자의 리스트를 `tempList`로 생성하여 이를 참가자에게 `sendTo(socket, {type: “channelJoin”, success: true, channelName: data.channelName, candidata: tempList})` 를 통해 성공 여부와 해당 채팅방의 참가자들의 정보를 전송.
- 기존 참가자들에게 `socket.to(data.channelName).emit("message", ***JSON***.stringify({ type: "userJoin", user: nowUser}))` 를 통해 새로운 참여자의 정보를 전달.

### 4. Event: channelList

- Param없이 작동하며 `sendTo(socket, {type: "channelList",  channels: channels})` 를 통해 채팅방 리스트를 전송.

### 5. Event: chatMessage

> param:{
    name: string,
    channel: string,
    msg: string
}
> 
- 해당 채팅방 전체 유저에게 `io.to(data.channel).emit("message", ***JSON***.stringify({type: "chatMessage",    user: data.name, msg: data.msg}))` 를 통해 어떤 사용자가 어떤 메세지를 전송했는지 전달.

### 6. Event: start-stream

> param:{
    peerId: string,
    name: string,
    channel: string
}
> 
- 해당 채팅방 채널의 instance의 `users` 에서 접속한 사용자를 찾아서 `peerId`를 `data.peerId` 로 `isLive` 를 true로 설정
- 해당 유저를 제외한 나머지 채팅방 유저들에게 `socket.to(data.channel).emit('message', ***JSON***.stringify({type: "stream",name: data.name,peerId: data.peerId}))` 로 해당 유저가 해당 `peerId` 로 영상 혹은 음성을 송출중임을 알림