const redis = (process.env.REDIS_URL) ? require('redis').createClient(process.env.REDIS_URL) : require('redis').createClient();


const createRoom = (name) => {
  // step 1 create a hash with the name.
  // step 2 create a list
  return new Promise((resolve, reject) => {
    redis.hsetnx(`room-${name}`, 'name', name, (err, success) => {
        if(err) reject(err);
        if (success) {
        redis.hsetnx('rooms', name, 0, (err, success) => {
          resolve(success);
        });
        }
    });
  })
}

const createMessage = (room, author, body) => {
  const messageID = `message-${Date.now()}`;
  let createMessageObj = new Promise((resolve, reject) => {
    redis.hmset(messageID, 'body', body, 'author', author, (err, success) =>{
      if(err) reject(err);
      resolve();
    })
  })
  let addToQueue = new Promise((resolve) => {
    redis.rpush(`room-${room}-messages`, messageID, (err, success) =>{
      if(err) reject(err);
      resolve();
    })
  })
  return Promise.all([createMessageObj,addToQueue]);
}

const getMessages = (room) => {
  var messages = [];

  return new Promise((resolve, reject) =>{
    redis.llen(`room-${room}-messages`, (err, messageCount) => {
      if(err) reject(err);
      resolve(messageCount);
    })
  }).then( (messageCount) => {
    return new Promise((resolve, reject) => {
      if(messageCount === 0) resolve(messages);
      redis.lrange(`room-${room}-messages`, 0, -1, (err, roomMessages) =>{
        if(err) reject(err);
        roomMessages.forEach( (message) =>{
          redis.hgetall(message, (err1, mes) => {
            if(err1) reject(err1);
            messages.push(mes);
            if (messages.length == messageCount) resolve(messages);
          })
        })
      })
    })
  })
}

const enterRoom = (room) => {
  return new Promise((resolve, reject) =>{
    redis.hincrby('rooms', room, 1, (err, number) => {
      resolve(number);
    })
  });
}

const leaveRoom = (room) => {
  return new Promise((resolve, reject) =>{
    redis.hincrby('rooms', room, -1, (err, number) => {
      resolve(number);
    })
  });
}


const getRooms = () => {
  return new Promise((resolve, reject) =>{
    redis.hgetall('rooms', (err, roomsObj) => {
      if(err) reject(err);
      resolve(roomsObj);
    })
  });
}

const checkUser = (username) => {
  return new Promise((resolve, reject) => {
    getUsers().then((users) => {
      resolve(users.includes(username))
    })
  })
}

const createUser = (username) => {
  return new Promise((resolve, reject) =>{
    checkUser(username).then((exists) => {      
      if (!exists) {
        redis.rpush('users', username, (err, numUsers) => {
          resolve(numUsers);
        });
      } else {
        console.log("rejecting at createUser");
        reject("user already exists");
      }           
    })
  });
}

const createPrivateRoom = (user1, user2) => {
  return new Promise((resolve, reject) => {
    let roomName = `pm-${user1}-${user2}`;
    createRoom(roomName).then((success) => {
      if (success) {
        addRoomToUser(user1, roomName)
          .then(addRoomToUser(user2, roomName))
          .then(() => {
            resolve(roomName);
          })
      }
    })
  })
}

const getUsers = () => {
  return new Promise((resolve, reject) => {
    redis.lrange('users', 0, -1, (err, users) => {
      if (err) reject(err);
      resolve(users);
    })
  })
}

const getData = () => {
  return Promise.all([getRooms(), getUsers()]);
}

const addRoomToUser = (user, room) => {
  return new Promise((resolve, reject) => {
    redis.lpush(`user-${user}`, room, (err, numRooms) => {
      resolve()
    })
  })
}



module.exports = {
  createRoom, 
  createMessage, 
  getMessages, 
  getRooms, 
  enterRoom, 
  leaveRoom,
  createUser,
  checkUser,
  getData
};




