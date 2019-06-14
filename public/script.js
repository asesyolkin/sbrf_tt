'use strict';

let vm = new Vue({
  el: '#layout',
  data: {
    users: [],
    checkAllCheckBox: false,
    stateAddNewUser: false,
    checkedUsers: [],
    stateChangeUsers: false
  },
  methods: {
    sendRequest: function({data, url, callback}) {
      let xhr = new XMLHttpRequest();
    
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onload = callback;
      xhr.send(data);
    },
    getUsers: function() {
      if (this.stateAddNewUser || this.stateChangeUsers) return alert('Сначала завершите или отмените операцию по добавлению / изменению пользователей');
      
      let callback = (e) => {
        let receivedUsers = JSON.parse(e.target.response);
        this.users = receivedUsers;
      };
    
      this.sendRequest({
        url: "/get-users",
        callback
      });
    },
    getUserById: function() {
      if (this.stateAddNewUser || this.stateChangeUsers) return alert('Сначала завершите или отмените операцию по добавлению / изменению пользователей');
      
      let userId = this.$refs.inputUserId.value;

      if (!userId) return alert('Не указан ID пользователя!');
      
      userId = JSON.stringify({userId});
      
      let callback = (e) => {
        if (e.target.response[0] !== '{') {
          alert(e.target.response);
        } else {
          let receivedUser = JSON.parse(e.target.response);
          vm.users = [receivedUser];
        }
      };
      
      this.sendRequest({
        data: userId,
        url: "/get-users",
        callback
      });
    },
    addUser: function() {
      if (this.stateChangeUsers) return alert('Сначала завершите или отмените операцию по изменению пользователей');

      this.stateAddNewUser = !this.stateAddNewUser;
    },
    saveUser: function() {
      let name = this.$refs.tableWithUsers.rows[this.$refs.tableWithUsers.rows.length-1].cells[2].children[0].value;
      let age = this.$refs.tableWithUsers.rows[this.$refs.tableWithUsers.rows.length-1].cells[3].children[0].value;

      if (!name || !age) {
        return alert('Перед добавлением нового пользователя необходимо заполнить все поля ячеек таблицы');
      };
      
      let newUser = JSON.stringify({name, age});
      
      let callback = (event) => {
        let newUser = JSON.parse(event.target.response);
        alert('Добавлен новый пользователь с ID ' + newUser.id);
        this.users.push(newUser);
        this.stateAddNewUser = !this.stateAddNewUser;
      };
      
      this.sendRequest({
        data: newUser,
        url: "/add-user",
        callback
      });
    },
    changeUsers: function() {
      if (this.stateAddNewUser) return alert('Сначала завершите или отмените операцию по добавлению нового пользователя');
      
      if (!this.checkedUsers.length) {
        for (let i = 1; i < this.$refs.tableWithUsers.rows.length; ++i) {
          let currentUser = this.$refs.tableWithUsers.rows[i];
          if (currentUser.cells[0].children[0].checked) {
            let currentName = currentUser.cells[2].textContent;
            let currentAge = currentUser.cells[3].textContent;
            this.checkedUsers.push({
              linkToElem: currentUser,
              currentName,
              currentAge
            });
            currentUser.cells[2].innerHTML = `<input type="text" class="new-data" value="${currentUser.cells[2].textContent}">`;
            currentUser.cells[3].innerHTML = `<input type="number" class="new-data" value="${currentUser.cells[3].textContent}">`;
          };
        };
        
        if (!this.checkedUsers.length) return alert('Для внесения изменений отметьте галочкой хотя бы одного пользователя');
    
        this.stateChangeUsers = true;
      } else {
        for (let i = 0; i < this.checkedUsers.length; ++i) {
          let currentUser = this.checkedUsers[i];
          let currentCellName = currentUser.linkToElem.cells[2];
          let currentCellAge = currentUser.linkToElem.cells[3];
          
          currentUser.linkToElem.cells[0].children[0].checked = false;
          currentCellName.innerHTML = currentUser.currentName;
          currentCellAge.innerHTML = currentUser.currentAge;
        };
        
        this.checkAllCheckBox = false;
        this.checkedUsers = [];
        this.stateChangeUsers = false;
      }
    },
    saveModifiedUsers: function() {
      for (let i = 0; i < this.checkedUsers.length; ++i) {
        let currentUser = this.checkedUsers[i];
        let currentID = +currentUser.linkToElem.cells[1].textContent;
        let currentName = currentUser.linkToElem.cells[2].children[0].value;
        let currentAge = currentUser.linkToElem.cells[3].children[0].value;
        
        currentUser.id = currentID;
        currentUser.currentName = currentName;
        currentUser.currentAge = currentAge;
      }
      
      let checkedUsers = JSON.stringify(this.checkedUsers);
      
      let callback = (e) => {
        alert(e.target.response);

        this.changeUsers();
      };
      
      this.sendRequest({
        data: checkedUsers,
        url: "/change-users",
        callback
      });
    },
    removeUsers: function() {
      if (this.stateAddNewUser || this.stateChangeUsers) return alert('Сначала завершите или отмените операцию по добавлению / изменению пользователей');
      
      for (let i = 1; i < this.$refs.tableWithUsers.rows.length; ++i) {
        let currentUser = this.$refs.tableWithUsers.rows[i];
        if (currentUser.cells[0].children[0].checked) {
          this.checkedUsers.push({
            linkToElem: currentUser,
            id: +currentUser.cells[1].textContent
          });
        };
      };
      
      if (!this.checkedUsers.length) return alert('Для удаления отметьте галочкой хотя бы одного пользователя');
        
      let checkedUsers = JSON.stringify(this.checkedUsers);
      
      let callback = (e) => {
        for (let currentUser of this.checkedUsers) {
          currentUser.linkToElem.remove();
        }
        
        alert(e.target.response);
        
        this.checkAllCheckBox = false;
        this.checkedUsers = [];
      };
      
      this.sendRequest({
        data: checkedUsers,
        url: "/remove-users",
        callback
      });
    }
  }
});