'use strict';

const eventBus = new Vue();

Vue.component('get-users', {
  data: function() {
    return {
      userId: null
    }
  },
  props: {
    stateAddNewUser: Boolean,
    stateChangeUsers: Boolean,
    sendRequest: Function,
    refAsdf: Object
  },
  template: `
  <div id="wrapper-get-users">
    <form name="get-users" class="get-users">
      <button-get-users 
        :stateAddNewUser="stateAddNewUser"
        :stateChangeUsers="stateChangeUsers"
        :sendRequest="sendRequest"
      />
      <br>
      <input type="number" name="user-id" v-model="userId">
      <button-get-user
        :stateAddNewUser="stateAddNewUser"
        :stateChangeUsers="stateChangeUsers"
        :sendRequest="sendRequest"
        :userId="+userId"
      ></button-get-user>
    </form>
  </div>
  `
})

Vue.component('button-get-users', {
  props: {
    stateAddNewUser: Boolean,
    stateChangeUsers: Boolean,
    sendRequest: Function
  },
  template: `
  <button class="get-users-button" @click.prevent="getUsers">
    Получить всех пользователей
  </button>
  `,
  methods: {
    getUsers: function() {
      if (this.stateAddNewUser || this.stateChangeUsers) return alert('Сначала завершите или отмените операцию по добавлению / изменению пользователей');
      
      let callback = (e) => {
        let receivedUsers = JSON.parse(e.target.response);
        eventBus.$emit('get-users', receivedUsers);
        // this.users = receivedUsers;
      };
    
      this.sendRequest({
        url: "/get-users",
        callback
      });
    }
  }
})

Vue.component('button-get-user', {
  props: {
    stateAddNewUser: Boolean,
    stateChangeUsers: Boolean,
    sendRequest: Function,
    userId: Number
  },
  template: `
  <button class="get-user-by-id-button" @click.prevent="getUserById">
    Получить пользователя по ID
  </button>
  `,
  methods: {
    getUserById: function() {
      if (this.stateAddNewUser || this.stateChangeUsers) return alert('Сначала завершите или отмените операцию по добавлению / изменению пользователей');
      
      let userId = this.userId;

      if (!userId) return alert('Не указан ID пользователя!');
      
      userId = JSON.stringify({userId});
      
      let callback = (e) => {
        if (e.target.response[0] !== '{') {
          alert(e.target.response);
        } else {
          let receivedUser = JSON.parse(e.target.response);
          eventBus.$emit('get-users', [receivedUser]);
        }
      };
      
      this.sendRequest({
        data: userId,
        url: "/get-users",
        callback
      });
    }
  }
})

Vue.component('table-with-users', {
  props: {
    users: Array,
    stateAddNewUser: Boolean,
    sendRequest: Function,
    checkAllCheckbox: Boolean
  },
  template: `
    <div id="wrapper-table-with-users">
      <table class="table-with-users" v-if="users.length">
        <tr-headers
          :checkAllCheckbox="checkAllCheckbox"
        ></tr-headers>
        <tr-users 
          v-for="user in users" 
          :key="user.id"
          :user="user" 
          :checkAllCheckbox="checkAllCheckbox" 
        ></tr-users>
        <tr-new-user 
          v-if="stateAddNewUser"
        ></tr-new-user>
      </table>
    </div>
  `
})

Vue.component('tr-headers', {
  props: {
    checkAllCheckbox: Boolean
  },
  template: `
  <tr>
    <th class="th-check-box">
      <input-checkbox-all-users
        :checkAllCheckbox="checkAllCheckbox"
      ></input-checkbox-all-users>
    </th>
    <th class="th-id">ID</th>
    <th class="th-name">Имя</th>
    <th class="th-age">Возраст</th>
  </tr>
  `
})

Vue.component('input-checkbox-all-users', {
  props: {
    checkAllCheckbox: Boolean
  },
  template: `
    <input 
      type="checkbox" 
      class="change-all-users" 
      :checked="checkAllCheckbox"
      @change="checkboxHandler"
    >
  `,
  methods: {
    checkboxHandler(e) {
      eventBus.$emit('checkAllCheckbox', e.target.checked)
    }
  }
})

Vue.component('tr-users', {
  functional: true,
  props: {
    checkAllCheckbox: Boolean,
    user: Object
  },
  render: function(createElement, context) {
    return createElement(
      'tr',
      [
        createElement('td',
          [
            createElement('input-checkbox-user', {
              props: {
                checkAllCheckbox: context.props.checkAllCheckbox,
              }
            })
          ]
        ),
        createElement('td', context.props.user.id),
        createElement('td', context.props.user.name),
        createElement('td', context.props.user.age)
      ]
    )
  },
  // template: `
  //   <tr>
  //     <td><input type="checkbox" :checked="checkAllCheckbox"></td>
  //     <td>{{user.id}}</td>
  //     <td>{{user.name}}</td>
  //     <td>{{user.age}}</td>
  //   </tr>
  // `
})

Vue.component('input-checkbox-user', {
  props: {
    checkAllCheckbox: Boolean
  },
  template: `
    <input type="checkbox" :checked="checkAllCheckbox"></input>
  `
})

Vue.component('tr-new-user', {
  template: `
    <tr>
      <td><input type="checkbox"></td>
      <td></td>
      <td><input type="text" class="new-data"></td>
      <td><input type="number" class="new-data"></td>
    </tr>
  `
})

Vue.component('change-users', {
  props: {
    stateAddNewUser: Boolean,
    stateChangeUsers: Boolean,
    sendRequest: Function,
    usersLength: Number,
    checkedUsers: Array
  },
  template: `
    <div id="wrapper-change-users">
      <template v-if="usersLength">
        <button-add-user
          :stateAddNewUser="stateAddNewUser"
          :stateChangeUsers="stateChangeUsers"
        ></button-add-user>
        <button-save-user
          v-if="stateAddNewUser"
          :stateChangeUsers="stateChangeUsers"
          :sendRequest="sendRequest"
        ></button-save-user>
        <br>
        <button-change-users
          :stateAddNewUser="stateAddNewUser"
          :stateChangeUsers="stateChangeUsers"
          :parentCheckedUsers="checkedUsers"
        ></button-change-users>
        <button-save-modified-users 
          v-if="stateChangeUsers"
          :parentCheckedUsers="checkedUsers"
          :sendRequest="sendRequest"
        ></button-save-modified-users>
        <br>
        <button-delete-users
          :stateAddNewUser="stateAddNewUser"
          :stateChangeUsers="stateChangeUsers"
          :parentCheckedUsers="checkedUsers"
          :sendRequest="sendRequest"
        ></button-delete-users>
      </template>
    </div>
  `
})
      
Vue.component('button-add-user', {
  props: {
    stateAddNewUser: Boolean,
    stateChangeUsers: Boolean
  },
  template: `
    <button class="button-add-user" @click="buttonAddUserHandler">
      {{ stateAddNewUser ? 'Отменить добавление' : 'Добавить пользователя' }}
    </button>
  `,
  methods: {
    buttonAddUserHandler: function() {
      if (this.stateChangeUsers) return alert('Сначала завершите или отмените операцию по изменению пользователей');

      eventBus.$emit('add-user');
    }
  }
})

Vue.component('button-save-user', {
  props: {
    stateChangeUsers: Boolean,
    sendRequest: Function
  },
  computed: {
    tableWithUsers: function() {
      return vm.$refs.componentTableWithUsers.$el.children[0];
    }
  },
  template: `
    <button @click="saveUser">Сохранить</button>
  `,
  methods: {
    saveUser: function() {
      if (this.stateChangeUsers) return alert('Сначала завершите или отмените операцию по изменению пользователей');
      
      let name = this.tableWithUsers.rows[this.tableWithUsers.rows.length-1].cells[2].children[0].value;
      let age = this.tableWithUsers.rows[this.tableWithUsers.rows.length-1].cells[3].children[0].value;

      if (!name || !age) {
        return alert('Перед добавлением нового пользователя необходимо заполнить все поля ячеек таблицы');
      };
      
      let newUser = JSON.stringify({name, age});
      
      let callback = (event) => {
        let newUser = JSON.parse(event.target.response);
        alert('Добавлен новый пользователь с ID ' + newUser.id);
        eventBus.$emit('save-user', newUser);
      };
      
      this.sendRequest({
        data: newUser,
        url: "/add-user",
        callback
      });
    }
  }
})

Vue.component('button-change-users', {
  props: {
    stateAddNewUser: Boolean,
    stateChangeUsers: Boolean,
    parentCheckedUsers: Array
  },
  computed: {
    tableWithUsers: function() {
      return vm.$refs.componentTableWithUsers.$el.children[0];
    },
    checkedUsers: function() {
      return this.parentCheckedUsers
    }
  },
  template: `
    <button class="button-change-users" @click="changeUsers">
      {{ stateChangeUsers ? 'Отменить изменение' : 'Изменить данные пользователей' }}
    </button>
  `,
  methods: {
    changeUsers: function() {
      if (this.stateAddNewUser) return alert('Сначала завершите или отмените операцию по добавлению нового пользователя');
      
      if (!this.checkedUsers.length) {
        for (let i = 1; i < this.tableWithUsers.rows.length; ++i) {
          let currentUser = this.tableWithUsers.rows[i];
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
    
        eventBus.$emit('change-users', true);
      } else {
        eventBus.$emit('change-users', false);
      }
    }
  }
})

Vue.component('button-save-modified-users', {
  props: {
    parentCheckedUsers: Array,
    sendRequest: Function
  },
  computed: {
    checkedUsers: function() {
      return this.parentCheckedUsers
    }
  },
  template: `
    <button @click="saveModifiedUsers">Сохранить</button>
  `,
  methods: {
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
        
        eventBus.$emit('change-users', false);
      };
      
      this.sendRequest({
        data: checkedUsers,
        url: "/change-users",
        callback
      });
    }
  }
})

Vue.component('button-delete-users', {
  props: {
    stateAddNewUser: Boolean,
    stateChangeUsers: Boolean,
    parentCheckedUsers: Array,
    sendRequest: Function
  },
  computed: {
    checkedUsers: function() {
      return this.parentCheckedUsers
    },
    tableWithUsers: function() {
      return vm.$refs.componentTableWithUsers.$el.children[0];
    }
  },
  template: `
    <button class="delete-users-button" @click="removeUsers">
      Удалить пользователей
    </button>
  `,
  methods: {
    removeUsers: function() {
      if (this.stateAddNewUser || this.stateChangeUsers) return alert('Сначала завершите или отмените операцию по добавлению / изменению пользователей');
      
      for (let i = 1; i < this.tableWithUsers.rows.length; ++i) {
        let currentUser = this.tableWithUsers.rows[i];
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
        
        eventBus.$emit('remove-users');
      };
      
      this.sendRequest({
        data: checkedUsers,
        url: "/remove-users",
        callback
      });
    }
  }
})

let vm = new Vue({
  el: '#layout',
  data: {
    users: [],
    stateAddNewUser: false,
    checkedUsers: [],
    stateChangeUsers: false,
    checkAllCheckbox: false,
    styleObject: {
      paddingLeft: '0px'
    }
  },
  created: function() {
    eventBus.$on('get-users', (users) => {
      this.users = users;
    });
    eventBus.$on('add-user', () => {
      this.stateAddNewUser = !this.stateAddNewUser;
    });
    eventBus.$on('checkAllCheckbox', (check) => {
      this.checkAllCheckbox = check;
    });
    eventBus.$on('save-user', (newUser) => {
      this.users.push(newUser);
      this.stateAddNewUser = !this.stateAddNewUser;
    });
    eventBus.$on('change-users', (changeOriginalState) => {
      if (changeOriginalState) {
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

        this.checkAllCheckbox = false;
        this.checkedUsers = [];
        this.stateChangeUsers = false;
      }
    });
    eventBus.$on('remove-users', () => {
      this.checkAllCheckbox = false;
      this.checkedUsers = [];
    });
  },
  updated: function() {
    let windowWidth = +window.innerWidth,
        documentWidth = +document.documentElement.clientWidth;

    if (documentWidth !== windowWidth) {
      this.styleObject.paddingLeft = windowWidth - documentWidth + 'px';
    } else {
      this.styleObject.paddingLeft = '0px';
    }
  },
  methods: {
    sendRequest: function({data, url, callback}) {
      let xhr = new XMLHttpRequest();
    
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onload = callback;
      xhr.send(data);
    }
  }
});