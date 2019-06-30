'use strict';

const store = new Vuex.Store({
  state: {
    users: [],
    newUser: {},
    selectedUsers: {},
    addNewUser: false,
    changeUsers: false,
    checkboxAllUsers: false
  },
  getters: {
    usersLength(state) {
      return state.users.length;
    }
  },
  mutations: {
    setUsers(state, users) {
      state.users = users;
    },
    addNewUser(state, newState) {
      state.addNewUser = newState;
    },
    saveDataNewUser (state, user) {
      if ('name' in user) state.newUser.name = user.name;
      else state.newUser.age = +user.age;
    },
    resetDataNewUser (state) {
      state.newUser = {};
    },
    insertNewUser(state, user) {
      state.users.push(user);
    },
    changeUsers(state, newState) {
      state.changeUsers = newState;
    },
    setSelectedUsers(state, {userId, checkboxState}) {
      if (checkboxState) {
        if (!state.selectedUsers[userId]) {
          state.selectedUsers[userId] = {};
          state.selectedUsers[userId].id = userId;
        }
      } else {
        delete state.selectedUsers[userId];
      }
    },
    updateDataSelectedUsers(state, user) {
      if ('name' in user) state.selectedUsers[user.id].name = user.name;
      else state.selectedUsers[user.id].age = +user.age;
    },
    checkboxAllUsers(state, newState) {
      state.checkboxAllUsers = newState;
    }
  },
  actions: {
    sendRequest(context, {data, url, callback}) {
      let xhr = new XMLHttpRequest();
    
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onload = callback;
      xhr.send(data);
    }
  }
})

Vue.component('get-users', {
  data() {
    return {
      userId: null
    }
  },
  template: `
  <div id="wrapper-get-users">
    <form 
      name="get-users" 
      class="get-users"
    >
      <button-get-users></button-get-users>
      <br>
      <input 
        type="number" 
        name="user-id" 
        v-model="userId"
      >
      <button-get-user
        :userId="+userId"
      ></button-get-user>
    </form>
  </div>
  `
})

Vue.component('button-get-users', {
  methods: {
    getUsers() {
      if (this.$store.state.addNewUser || this.$store.state.changeUsers) return alert('Сначала завершите или отмените операцию по добавлению / изменению пользователей');
      
      let callback = (e) => {
        let receivedUsers = JSON.parse(e.target.response);
        this.$store.commit('setUsers', receivedUsers);
      };
      
      this.$store.dispatch('sendRequest', {
        url: "/get-users",
        callback
      });
    }
  },
  template: `
  <button 
    class="get-users-button" 
    @click.prevent="getUsers"
  >
    Получить всех пользователей
  </button>
  `,
})

Vue.component('button-get-user', {
  props: {
    userId: Number
  },
  methods: {
    getUserById() {
      if (this.$store.state.addNewUser || this.$store.state.changeUsers) return alert('Сначала завершите или отмените операцию по добавлению / изменению пользователей');
      
      let userId = this.userId;
      
      if (!userId) return alert('Не указан ID пользователя!');
      
      userId = JSON.stringify({userId});
      
      let callback = (e) => {
        if (e.target.response[0] !== '{') {
          alert(e.target.response);
        } else {
          let receivedUser = JSON.parse(e.target.response);
          this.$store.commit('setUsers', [receivedUser]);
        }
      };
      
      this.$store.dispatch('sendRequest', {
        data: userId,
        url: "/get-users",
        callback
      });
    }
  },
  template: `
  <button 
    class="get-user-by-id-button" 
    @click.prevent="getUserById"
  >
    Получить пользователя по ID
  </button>
  `,
})

Vue.component('table-with-users', {
  template: `
    <div id="wrapper-table-with-users">
      <table 
        class="table-with-users" 
        v-if="$store.getters.usersLength"
      >
        <tr-headers></tr-headers>
        <tr-users 
          v-for="user in $store.state.users" 
          :key="user.id"
          :user="user" 
        ></tr-users>
        <tr-new-user 
          v-if="$store.state.addNewUser"
        ></tr-new-user>
      </table>
    </div>
  `
})

Vue.component('tr-headers', {
  template: `
  <tr>
    <th class="th-check-box">
      <input-checkbox-all-users></input-checkbox-all-users>
    </th>
    <th class="th-id">ID</th>
    <th class="th-name">Имя</th>
    <th class="th-age">Возраст</th>
  </tr>
  `
})

Vue.component('input-checkbox-all-users', {
  computed: {
    stateCheckboxAllUsers() {
      return this.$store.state.checkboxAllUsers;
    }
  },
  methods: {
    reportTheStateOfTheCheckboxAllUsers(newState) {
      this.$store.commit('checkboxAllUsers', newState);
    }
  },
  template: `
    <input 
      type="checkbox" 
      class="change-all-users"
      :disabled="$store.state.changeUsers"
      :checked="stateCheckboxAllUsers"
      @change="reportTheStateOfTheCheckboxAllUsers($event.target.checked)"
    >
  `,
})

Vue.component('tr-users', {
  props: {
    user: Object
  },
  data() {
    return {
      stateLocalCheckbox: false
    }
  },
  computed: {
    stateChangingUserData() {
      return this.$store.state.changeUsers && this.stateLocalCheckbox
    },
    stateCheckboxAllUsers() {
      return this.$store.state.checkboxAllUsers;
    }
  },
  watch: {
    stateChangingUserData() {
      this.checkboxHandler(this.stateChangingUserData);
    },
    stateCheckboxAllUsers() {
      this.checkboxHandler(this.stateCheckboxAllUsers);
    }
  },
  methods: {
    checkboxHandler(newState) {
      this.changeStateLocalCheckbox(newState);
      this.saveSelectedUser(newState);
    },
    changeStateLocalCheckbox(newState) {
      this.stateLocalCheckbox = newState;
    },
    saveSelectedUser(newState) {
      this.$store.commit('setSelectedUsers', {
        userId: this.user.id,
        checkboxState: newState
      });
    },
    saveNewDataSelectedUser(dataType) {
      this.$store.commit('updateDataSelectedUsers', {
        id: this.user.id,
        [dataType]: event.target.value
      })
    }
  },
  template: `
    <tr>
      <td>
        <input 
          type="checkbox" 
          :checked="stateLocalCheckbox"
          :disabled="$store.state.changeUsers"
          @change="checkboxHandler($event.target.checked)"
        >
      </td>
      <td>{{user.id}}</td>
      <td>
        <template v-if="!stateChangingUserData">
          {{ user.name }}
        </template>
        <template v-else>
          <input 
            type="text" 
            class="new-data" 
            :value="user.name"
            @change="saveNewDataSelectedUser('name')"
          >
        </template>  
      </td>   
      <td>
        <template v-if="!stateChangingUserData">
          {{ user.age }}
        </template>
        <template v-else>
          <input 
            type="number" 
            class="new-data" 
            :value="user.age" 
            @change="saveNewDataSelectedUser('age')"
          >
        </template>  
      </td>
    </tr>
  `,
})

Vue.component('tr-new-user', {
  methods: {
    saveDataNewUser(dataType) {
      this.$store.commit('saveDataNewUser', {
        [dataType]: event.target.value
      })
    }
  },
  template: `
    <tr>
      <td>
        <input type="checkbox">
      </td>
      <td></td>
      <td>
        <input 
          type="text" 
          class="new-data"
          @change="saveDataNewUser('name')"
        >
      </td>
      <td>
        <input 
          type="number" 
          class="new-data"
          @change="saveDataNewUser('age')"
        >
      </td>
    </tr>
  `
})

Vue.component('change-users', {
  template: `
    <div id="wrapper-change-users">
      <template v-if="$store.getters.usersLength">
        <button-add-user></button-add-user>
        <button-save-user
          v-if="$store.state.addNewUser"
        ></button-save-user>
        <br>
        <button-change-users></button-change-users>
        <button-save-selected-users 
          v-if="$store.state.changeUsers"
        ></button-save-selected-users>
        <br>
        <button-delete-users></button-delete-users>
      </template>
    </div>
  `
})
      
Vue.component('button-add-user', {
  methods: {
    changeStateAddNewUser() {
      if (this.$store.state.changeUsers) return alert('Сначала завершите или отмените операцию по изменению пользователей');
      
      if (!this.$store.state.addNewUser) {
        this.$store.commit('addNewUser', true);
      } else {
        this.$store.commit('resetDataNewUser');
        this.$store.commit('addNewUser', false);
      }
    }
  },
  template: `
    <button 
      class="button-add-user" 
      @click="changeStateAddNewUser"
    >
      {{ $store.state.addNewUser ? 'Отменить добавление' : 'Добавить пользователя' }}
    </button>
  `,
})

Vue.component('button-save-user', {
  methods: {
    saveNewUser() {
      if (this.$store.state.changeUsers) return alert('Сначала завершите или отмените операцию по изменению пользователей');
      
      if (!this.$store.state.newUser.name || !this.$store.state.newUser.age) {
        return alert('Перед добавлением нового пользователя необходимо заполнить все поля ячеек таблицы');
      } 
      
      let newUser = JSON.stringify(this.$store.state.newUser);
      
      let callback = (event) => {
        newUser = JSON.parse(event.target.response);
        alert('Добавлен новый пользователь с ID ' + newUser.id);
        this.$store.commit('insertNewUser', newUser);
        this.$store.commit('resetDataNewUser', false);
        this.$store.commit('addNewUser', false);
      };
      
      this.$store.dispatch('sendRequest', {
        data: newUser,
        url: "/add-user",
        callback
      });
    }
  },
  template: `
    <button @click="saveNewUser">Сохранить</button>
  `,
})

Vue.component('button-change-users', {
  methods: {
    changeUsers() {
      if (this.$store.state.addNewUser) return alert('Сначала завершите или отмените операцию по добавлению нового пользователя');
      
      if (!this.$store.state.changeUsers) {
        let numberSelectedUsers = Object.keys(this.$store.state.selectedUsers).length;

        if (!numberSelectedUsers && !this.$store.state.changeUsers) return alert('Для внесения изменений отметьте галочкой хотя бы одного пользователя');

        this.$store.commit('changeUsers', true);
      } else {
        this.$store.commit('checkboxAllUsers', false);
        this.$store.commit('changeUsers', false);
      }
    }
  },
  template: `
    <button 
      class="button-change-users" 
      @click="changeUsers"
    >
      {{ $store.state.changeUsers ? 'Отменить изменение' : 'Изменить данные пользователей' }}
    </button>
  `,
})

Vue.component('button-save-selected-users', {
  methods: {
    saveModifiedUsers() {
      let changedUsers = [];

      for ( let [id, user] of Object.entries(this.$store.state.selectedUsers) ) {
        changedUsers.push(user);
      }

      changedUsers = JSON.stringify(changedUsers);
      
      let callback = (e) => {
        changedUsers = JSON.parse(e.target.response);
        this.$store.commit('checkboxAllUsers', false);
        this.$store.commit('changeUsers', false);
        this.$store.commit('setUsers', changedUsers);
        alert('Изменения в базу пользователей успешно внесены');
      };
      
      this.$store.dispatch('sendRequest', {
        data: changedUsers,
        url: "/change-users",
        callback
      });
    }
  },
  template: `
    <button @click="saveModifiedUsers">Сохранить</button>
  `,
})

Vue.component('button-delete-users', {
  methods: {
    removeUsers() {
      if (this.$store.state.addNewUser || this.$store.state.changeUsers) return alert('Сначала завершите или отмените операцию по добавлению / изменению пользователей');
      
      let usersToDelete = [];

      for ( let [id] of Object.entries(this.$store.state.selectedUsers) ) {
        usersToDelete.push({'id': +id});
      }
      
      if (!usersToDelete.length) return alert('Для удаления отметьте галочкой хотя бы одного пользователя');

      usersToDelete = JSON.stringify(usersToDelete);
      
      let callback = (e) => {
        let users = JSON.parse(e.target.response);
        this.$store.commit('setUsers', users);
        alert('Удаление пользователей из базы данных успешно выполнено');
      };
      
      this.$store.dispatch('sendRequest', {
        data: usersToDelete,
        url: "/remove-users",
        callback
      });
    }
  },
  template: `
    <button 
      class="delete-users-button" 
      @click="removeUsers"
    >
      Удалить пользователей
    </button>
  `,
})

let vm = new Vue({
  el: '#layout',
  store,
  data: {
    styleObject: {
      paddingLeft: '0px'
    }
  },
  computed: {
    usersLength() {
      return this.$store.usersLength;
    }
  },
  watch: {
    usersLength() {
      this.changeStylePadding();
    }
  },
  methods: {
    changeStylePadding() {
      let windowWidth = +window.innerWidth,
          documentWidth = +document.documentElement.clientWidth;
  
      if (documentWidth !== windowWidth) {
        this.styleObject.paddingLeft = windowWidth - documentWidth + 'px';
      } else {
        this.styleObject.paddingLeft = '0px';
      }
    }
  }
});