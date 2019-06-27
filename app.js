const express = require("express");
const fs = require("fs");
const users = require("./database/users");
const Users = require("./database/usersMethods");
  
const app = express();
const jsonParser = express.json();

app.use(express.static(__dirname + "/public"));
  
app.post("/get-users", jsonParser, function (request, response) {
  if (!request.body) return response.sendStatus(400);
  
  if (JSON.stringify(request.body) === '{}') {
    return response.send(Users.getUsers());
  };
  
  if (request.body.userId) return response.send(Users.getUser(request.body.userId));
});

app.post("/add-user", jsonParser, function (request, response) {
  let newUserString = JSON.stringify(Users.addUser(request.body));
  
  fs.writeFileSync("./database/users.js", newDatabaseString(users));
  
  response.send(newUserString);
});

app.post("/change-users", jsonParser, function (request, response) {
  let changeUsersString = JSON.stringify(Users.changeUsers(request.body));
  
  fs.writeFileSync("./database/users.js", newDatabaseString(users));
  
  response.send(changeUsersString);
});

app.post("/remove-users", jsonParser, function (request, response) {
  let usersString = JSON.stringify(Users.removeUsers(request.body));
  
  fs.writeFileSync("./database/users.js", newDatabaseString(users));
  
  response.send(usersString);
});
  
app.listen(3000);

console.log("Сервер начал прослушивание запросов на порту 3000");

function newDatabaseString(users) {
  let str = 'const users = [\n';
  
  for (let user of users) {
    str += '\t{\n' +
      '\t\tid: ' + user.id + ',\n' +
      '\t\tname: ' + '"' + user.name + '"' + ',\n' +
      '\t\tage: ' + user.age + '\n' +
      '\t';
    str += user === users[users.length-1] ? '}\n' : '},\n';
    ;
  }
  
  return str += '];\n\n' + 'module.exports = users;'
}