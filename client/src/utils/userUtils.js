export function OrderUserList(userList, clientList, hasGameStarted) {

    //Will remove disconnected Users if game hasn't started yet
    if (userList.length > clientList.length && !hasGameStarted) {
        userList = RemoveDisconnectedUsers(userList, clientList);
    }

    for (let i = 0; i < clientList.length; i++) {
        let client = JSON.parse(clientList[i]);
        let foundMatch = false;

        for (let j = 0; j < userList.length; j++) {

            //Client exists in userList state already; update
            if (client.id === userList[j].id) {
                userList[j] = client;
                foundMatch = true;
                continue;
            }
        }

        if (!foundMatch) {
            userList.push(client);
        }
    }
    // console.log(userList[0])
    return userList
}

const RemoveDisconnectedUsers = (userList, clientList) => {
    let usersToKeep = [];

    for (let i = 0; i < userList.length; i++) {

        for (let j = 0; j < clientList.length; j++) {
            let client = JSON.parse(clientList[j]);

            if (userList[i].id === client.id) {
                usersToKeep.push(client.id);
            }
        }
    }

    return userList.filter(user => usersToKeep.includes(user.id))
}