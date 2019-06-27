const users = require("./users");

const Users = {
  getUsers() {
    return users;
  },  
  getUser(userId) {
    for (let user of users) {
      if (user.id === +userId) return user;
    }
    return 'Пользователь с ID ' + userId + ' не найден!'
  },
  addUser(newUser) {
    if (users.length) newUser.id = users[users.length - 1].id + 1;
    else newUser.id = 1;
    
    users.push({
      id: newUser.id,
      name: newUser.name,
      age: newUser.age
    });
    
    return newUser;
  },
  changeUsers(modifiedUsers) {
    for (let i = z = 0; z < modifiedUsers.length && i < users.length; i++) {
      if (users[i].id === modifiedUsers[z].id) {
        users[i].name = modifiedUsers[z].currentName || '';
        users[i].age = modifiedUsers[z].currentAge || null;
        z++;
      };
    };

    return users;
  },
  removeUsers(deletedUsers) {
    for (let i = 0, z = 0; z < deletedUsers.length && i < users.length;) {
      if (users[i].id === deletedUsers[z].id) {
        users.splice(i, 1);
        z++;
        continue;
      };
       i++
    };

    return users;
  }
};

module.exports = Users;