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
    sendRequest: Function
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
        eventBus.$emit('set-users', receivedUsers);
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
          eventBus.$emit('set-users', [receivedUser]);
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
    stateChangeUsers: Boolean,
    sendRequest: Function
  },
  template: `
    <div id="wrapper-table-with-users">
      <table class="table-with-users" v-if="users.length">
        <tr-headers></tr-headers>
        <tr-users 
          v-for="user in users" 
          :key="user.id"
          :user="user" 
          :stateChangeUsers="stateChangeUsers" 
        ></tr-users>
        <tr-new-user 
          v-if="stateAddNewUser"
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
  data() {
    return {
      stateCheckboxAllUsers: false
    };
  },
  created() {
    eventBus.$on('check-checkbox-all-users', (value) => {
      this.stateCheckboxAllUsers = value;
      eventBus.$emit('check-local-checkbox', value);
    });
  },
  template: `
    <input 
      type="checkbox" 
      class="change-all-users" 
      v-model="stateCheckboxAllUsers"
      @change="checkboxHandler"
    >
  `,
  methods: {
    checkboxHandler(e) {
      eventBus.$emit('check-local-checkbox', e.target.checked)
    }
  }
})

Vue.component('tr-users', {
  props: {
    stateChangeUsers: Boolean,
    user: Object
  },
  computed: {
    stateChangingUserData() {
      if (this.stateChangeUsers && this.stateLocalCheckbox) return true;
      else if (this.stateChangeUsers && this._computedWatchers.stateChangingUserData.value) return true;
      else return false;
    }
  },
  data() {
    return {
      stateLocalCheckbox: this.checkAllCheckbox,
      changedTheUser: {
        name: this.user.name,
        age: this.user.age
      }
    }
  },
  created() {
    eventBus.$on('get-number-of-selected-users', () => {
      if (this.stateLocalCheckbox) {
        eventBus.$emit('set-number-of-selected-users', 1);
      }
      else {
        eventBus.$emit('set-number-of-selected-users', 0);
      }
    });
    eventBus.$on('get-changed-users', () => {
      if (this.stateChangingUserData) {
        let user = {
          currentName: this.changedTheUser.name,
          currentAge: +this.changedTheUser.age,
          id: this.user.id
        };

        eventBus.$emit('set-changed-users', user);
      }
    });
    eventBus.$on('get-users-to-delete', () => {
      if (this.stateLocalCheckbox) {
        eventBus.$emit('set-users-to-delete', {id: this.user.id});
      }
    });
    eventBus.$on('check-local-checkbox', (value) => {
      this.stateLocalCheckbox = value;
    });
  },
  template: `
    <tr>
      <td><input type="checkbox" v-model="stateLocalCheckbox"></td>
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
            @change="saveModifiedUserData('name')"
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
            @change="saveModifiedUserData('age')"
          >
        </template>  
      </td>
    </tr>
  `,
  methods: {
    saveModifiedUserData(dataType) {
      if (dataType === 'name') this.changedTheUser.name = event.target.value;
      else this.changedTheUser.age = +event.target.value;
    }
  }
})

Vue.component('tr-new-user', {
  data() {
    return {
      newUser: {
        name: '',
        age: null
      }
    }
  },
  created() {
    eventBus.$on('get-data-new-user', () => {
      eventBus.$emit('set-data-new-user', this.newUser);
    });
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
          v-model="newUser.name"
        >
      </td>
      <td>
        <input 
          type="number" 
          class="new-data"
          v-model="newUser.age"
        >
      </td>
    </tr>
  `
})

Vue.component('change-users', {
  props: {
    stateAddNewUser: Boolean,
    stateChangeUsers: Boolean,
    sendRequest: Function,
    usersLength: Number
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
        ></button-change-users>
        <button-save-modified-users 
          v-if="stateChangeUsers"
          :sendRequest="sendRequest"
        ></button-save-modified-users>
        <br>
        <button-delete-users
          :stateAddNewUser="stateAddNewUser"
          :stateChangeUsers="stateChangeUsers"
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
  data() {
    return {
      newUser: {}
    }
  },
  created() {
    eventBus.$on('set-data-new-user', (newUser) => {
      this.newUser = newUser;
    })
  },
  template: `
    <button @click="saveUser">Сохранить</button>
  `,
  methods: {
    saveUser: function() {
      if (this.stateChangeUsers) return alert('Сначала завершите или отмените операцию по изменению пользователей');
      
      eventBus.$emit('get-data-new-user');

      if (!this.newUser.name || !this.newUser.age) {
        return alert('Перед добавлением нового пользователя необходимо заполнить все поля ячеек таблицы');
      };
      
      let newUser = JSON.stringify(this.newUser);
      
      let callback = (event) => {
        newUser = JSON.parse(event.target.response);
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
  },
  data: function() {
    return {
      numberCheckedUsers: 0
    }
  },
  created() {
    eventBus.$on('set-number-of-selected-users', (number) => {
      this.numberCheckedUsers += number;
    });
    eventBus.$on('reset-number-of-selected-users', () => {
      this.numberCheckedUsers = 0;
    });
  },
  template: `
    <button class="button-change-users" @click="changeUsers">
      {{ stateChangeUsers ? 'Отменить изменение' : 'Изменить данные пользователей' }}
    </button>
  `,
  methods: {
    changeUsers: function() {
      if (this.stateAddNewUser) return alert('Сначала завершите или отмените операцию по добавлению нового пользователя');
      
      if (!this.numberCheckedUsers) {
        eventBus.$emit('get-number-of-selected-users');

        if (!this.numberCheckedUsers) return alert('Для внесения изменений отметьте галочкой хотя бы одного пользователя');

        eventBus.$emit('change-users', true);
      } else {
        this.numberCheckedUsers = 0;
        eventBus.$emit('check-checkbox-all-users', false);
        eventBus.$emit('change-users', false);
      }
    }
  }
})

Vue.component('button-save-modified-users', {
  props: {
    sendRequest: Function
  },
  data() {
    return {
      changedUsers: []
    }
  },
  created() {
    eventBus.$on('set-changed-users', (user) => {
      this.changedUsers.push(user);
    });
  },
  template: `
    <button @click="saveModifiedUsers">Сохранить</button>
  `,
  methods: {
    saveModifiedUsers: function() {
      eventBus.$emit('get-changed-users');
      
      let changedUsers = JSON.stringify(this.changedUsers);

      let callback = (e) => {
        changedUsers = JSON.parse(e.target.response);
        eventBus.$emit('save-changed-users', changedUsers);
        alert('Изменения в базу пользователей успешно внесены');
      };
      
      this.sendRequest({
        data: changedUsers,
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
    sendRequest: Function
  },
  data() {
    return {
      usersToDelete: []
    }
  },
  created() {
    eventBus.$on('set-users-to-delete', (user) => {
      this.usersToDelete.push(user);
    })
  },
  template: `
    <button class="delete-users-button" @click="removeUsers">
      Удалить пользователей
    </button>
  `,
  methods: {
    removeUsers: function() {
      if (this.stateAddNewUser || this.stateChangeUsers) return alert('Сначала завершите или отмените операцию по добавлению / изменению пользователей');
      
      eventBus.$emit('get-users-to-delete');
      
      if (!this.usersToDelete.length) return alert('Для удаления отметьте галочкой хотя бы одного пользователя');
        
      let usersToDelete = JSON.stringify(this.usersToDelete);
      
      let callback = (e) => {
        let users = JSON.parse(e.target.response);
        eventBus.$emit('set-users', users);
        alert('Удаление пользователей из базы данных успешно выполнено');
      };
      
      this.sendRequest({
        data: usersToDelete,
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
    stateChangeUsers: false,
    styleObject: {
      paddingLeft: '0px'
    }
  },
  created: function() {
    eventBus.$on('set-users', (users) => {
      this.users = users;
    });
    eventBus.$on('add-user', () => {
      this.stateAddNewUser = !this.stateAddNewUser;
    });
    eventBus.$on('save-user', (newUser) => {
      this.users.push(newUser);
      this.stateAddNewUser = false;
    });
    eventBus.$on('change-users', (value) => {
      this.stateChangeUsers = value;
    });
    eventBus.$on('save-changed-users', (changedUsers) => {
      eventBus.$emit('check-checkbox-all-users', false);
      eventBus.$emit('reset-number-of-selected-users');
      this.stateChangeUsers = false;
      this.users = changedUsers;
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