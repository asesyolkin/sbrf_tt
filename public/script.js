// 'use strict';

const state = {
  tableWithUsers: null,
  inputChangeUsers: null,
  buttonsToChangeTableWithUsers: false,
  addNewUser: false,
  addUserButton: null,
  saveAddedUserButton: null,
  checkedUsers: [],
  changeUsersButton: null,
  saveModifiedUsersButton: null,
  newRowForNewUser: null
};

const WrapperTableWithUsers = document.querySelector('#wrapper-table-with-users');
const WrapperChangeUsers = document.querySelector('#wrapper-change-users');

document.querySelector(".get-users-button").addEventListener("click", getUsers);
document.querySelector(".get-user-by-id-button").addEventListener("click", getUserById);

function sendRequest({data, url, callback}) {
  let xhr = new XMLHttpRequest();

  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = callback;
  xhr.send(data);
}

function getUsers(e) {
  e.preventDefault();
    
  if (state.addNewUser || state.checkedUsers.length) return alert('Сначала завершите или отмените операцию по добавлению / изменению пользователей');
  
  let callback = function (e) {
    let receivedUsers = JSON.parse(e.target.response);
    showTableWithUsers(receivedUsers);
  };

  sendRequest({
    url: "/get-users",
    callback
  });
}

function getUserById(e) {
  e.preventDefault();
  
  if (state.addNewUser || state.checkedUsers.length) return alert('Сначала завершите или отмените операцию по добавлению / изменению пользователей');
  
  let getUsersForm = document.forms["get-users"];
  let userId = getUsersForm.elements["user-id"].value;
  
  if (!userId) return alert('Не указан ID пользователя!');
  
  userId = JSON.stringify({userId});
  
  let callback = function(e) {
    if (e.target.response[0] !== '{') {
      alert(e.target.response);
    } else {
      let receivedUser = JSON.parse(e.target.response);
      showTableWithUsers([receivedUser]);
    }
  };
  
  sendRequest({
    data: userId,
    url: "/get-users",
    callback
  });
}

function showTableWithUsers(users) {
  let tableWithUsers = `
    <table class="table-with-users">
      <th class="th-check-box">
        <input type="checkbox" class="change-all-users">
       </th>
      <th class="th-id">ID</th>
      <th class="th-name">Имя</th>
      <th class="th-age">Возраст</th>
      ${users.map((user) => `
          <tr>
            <td><input type="checkbox"></td>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.age}</td>
          </tr>
        `
      ).join('')}
    </table>
  `;
  
  WrapperTableWithUsers.innerHTML = tableWithUsers;
  
  state.tableWithUsers = document.querySelector('.table-with-users');
  
  state.inputChangeUsers = document.querySelector('.change-all-users');
  state.inputChangeUsers.addEventListener('click', checkAllCheckBox);
  
  if (!state.buttonsToChangeTableWithUsers) {
    addButtonsToChangeTableWithUsers();
    state.buttonsToChangeTableWithUsers = true;
  };
}

function checkAllCheckBox() {
  for (let i = 1; i < state.tableWithUsers.rows.length; ++i) {
    state.tableWithUsers.rows[i].children[0].children[0].checked = this.checked;
  };
}

function addButtonsToChangeTableWithUsers() {
  WrapperChangeUsers.innerHTML = `
    <button class="add-user-button">Добавить пользователя</button>
    <br>
    <button class="change-users-button">Изменить данные пользователей</button>
    <br>
    <button class="delete-users-button">Удалить пользователей</button>
  `;
  
  state.addUserButton = document.querySelector('.add-user-button');
  state.changeUsersButton = document.querySelector('.change-users-button');
  
  state.addUserButton.addEventListener('click', addUser);
  state.changeUsersButton.addEventListener('click', changeUsers);
  document.querySelector('.delete-users-button').addEventListener('click', removeUsersFromServer);
}

function addUser(e) {
  if (state.checkedUsers.length) return alert('Сначала завершите или отмените операцию по изменению пользователей');
  
  if (!state.addNewUser) {
    let newStringForNewUser = `
      <td><input type="checkbox"></td>
      <td></td>
      <td><input type="text" class="new-data"></td>
      <td><input type="number" class="new-data"></td>
    `;
    
    state.newRowForNewUser = state.tableWithUsers.insertRow(-1);
    state.newRowForNewUser.innerHTML += newStringForNewUser;
    state.addUserButton.textContent = 'Отменить добавление';
    
    state.saveAddedUserButton = document.createElement('button');
    state.saveAddedUserButton.classList.add('add-change-users-button');
    state.saveAddedUserButton.textContent = 'Добавить';
    state.saveAddedUserButton.addEventListener('click', addNewUserToServer)
    
    state.addUserButton.after(state.saveAddedUserButton);
    
    state.addNewUser = true;
  } else {
    if (e.isTrusted) {
      state.tableWithUsers.deleteRow(-1);
    } else {
      state.newRowForNewUser.cells[1].textContent = e.detail.id;
      state.newRowForNewUser.cells[2].innerHTML = e.detail.name;
      state.newRowForNewUser.cells[3].innerHTML = e.detail.age;
    }

    state.addUserButton.textContent = 'Добавить пользователя';
    state.saveAddedUserButton.remove();
    
    state.addNewUser = false;
  };
}

function addNewUserToServer() {
  let name = state.tableWithUsers.rows[state.tableWithUsers.rows.length-1].cells[2].children[0].value;
  let age = state.tableWithUsers.rows[state.tableWithUsers.rows.length-1].cells[3].children[0].value;
  
  if (!name || !age) {
    return alert('Перед добавлением нового пользователя необходимо заполнить все поля ячеек таблицы');
  };
  
  let newUser = JSON.stringify({name, age});
  
  let callback = function(e) {
    let newUser = JSON.parse(e.target.response);
    alert('Добавлен новый пользователь с ID ' + newUser.id);
    
    let event = new CustomEvent('click', {detail: newUser});
    state.addUserButton.dispatchEvent(event);
  };
  
  sendRequest({
    data: newUser,
    url: "/add-user",
    callback
  });
}

function changeUsers(e) {
  if (state.addNewUser) return alert('Сначала завершите или отмените операцию по добавлению нового пользователя');
  
  if (!state.checkedUsers.length) {
    for (let i = 1; i < state.tableWithUsers.rows.length; ++i) {
      let currentUser = state.tableWithUsers.rows[i];
      if (currentUser.cells[0].children[0].checked) {
        let currentName = currentUser.cells[2].textContent;
        let currentAge = currentUser.cells[3].textContent;
        state.checkedUsers.push({
          linkToElem: currentUser,
          currentName,
          currentAge
        });
        currentUser.cells[2].innerHTML = `<input type="text" class="new-data" value="${currentUser.cells[2].textContent}">`;
        currentUser.cells[3].innerHTML = `<input type="number" class="new-data" value="${currentUser.cells[3].textContent}">`;
      };
    };
    
    if (!state.checkedUsers.length) return alert('Для внесения изменений отметьте галочкой хотя бы одного пользователя');
    
    state.changeUsersButton.textContent = 'Отменить изменение';
    
    state.saveModifiedUsersButton = document.createElement('button');
    state.saveModifiedUsersButton.classList.add('add-change-users-button');
    state.saveModifiedUsersButton.textContent = 'Изменить';
    state.saveModifiedUsersButton.addEventListener('click', addModifiedUsersToServer)

    state.changeUsersButton.after(state.saveModifiedUsersButton);

    state.changeUsers = true;
  } else {
    for (let i = 0; i < state.checkedUsers.length; ++i) {
      let currentUser = state.checkedUsers[i];
      let currentCellName = currentUser.linkToElem.cells[2];
      let currentCellAge = currentUser.linkToElem.cells[3];
      
      currentCellName.innerHTML = currentUser.currentName;
      currentCellAge.innerHTML = currentUser.currentAge;
    };
    
    let event = new Event('click');
    state.inputChangeUsers.checked = false;
    state.inputChangeUsers.dispatchEvent(event);
    
    state.changeUsersButton.textContent = 'Изменить данные пользователей';
    state.saveModifiedUsersButton.remove();
    
    state.checkedUsers = [];
  }
}

function addModifiedUsersToServer() {
  for (let i = 0; i < state.checkedUsers.length; ++i) {
    let currentUser = state.checkedUsers[i];
    let currentID = +currentUser.linkToElem.cells[1].textContent;
    let currentName = currentUser.linkToElem.cells[2].children[0].value;
    let currentAge = currentUser.linkToElem.cells[3].children[0].value;
    
    currentUser.id = currentID;
    currentUser.currentName = currentName;
    currentUser.currentAge = currentAge;
  }
  
  let checkedUsers = JSON.stringify(state.checkedUsers);
  
  let callback = function(e) {
    alert(e.target.response);
    
    let event = new Event('click');
    state.changeUsersButton.dispatchEvent(event);
  };
  
  sendRequest({
    data: checkedUsers,
    url: "/change-users",
    callback
  });
}

function removeUsersFromServer() {
  if (state.addNewUser || state.checkedUsers.length) return alert('Сначала завершите или отмените операцию по добавлению / изменению пользователей');
  
  for (let i = 1; i < state.tableWithUsers.rows.length; ++i) {
    let currentUser = state.tableWithUsers.rows[i];
    if (currentUser.cells[0].children[0].checked) {
      state.checkedUsers.push({
        linkToElem: currentUser,
        id: +currentUser.cells[1].textContent
      });
    };
  };
  
  if (!state.checkedUsers.length) return alert('Для удаления отметьте галочкой хотя бы одного пользователя');
    
  let checkedUsers = JSON.stringify(state.checkedUsers);
  
  let callback = function(e) {
    for (let currentUser of state.checkedUsers) {
      currentUser.linkToElem.remove();
    }
    
    alert(e.target.response);
    
    let event = new Event('click');
    state.inputChangeUsers.checked = false;
    state.inputChangeUsers.dispatchEvent(event);
    
    state.checkedUsers = [];
  };
  
  sendRequest({
    data: checkedUsers,
    url: "/remove-users",
    callback
  });
}