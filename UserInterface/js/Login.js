
Vue.component('user-name', {
    props: ['name'],
    template: '<p>Hi {{ name }}</p>'
  })

import * as Nav from './Navigation.js'
import * as User from '../../ModelLayer/Entities/User.js'
import * as Status from '../../ModelLayer/Entities/Status.js'
// import * as Prox from '../../ProxyServer/Proxy.js'
import * as APIServices from '../../ModelLayer/AppLogic/APIServices.js'

var app = new Vue({
    el: '#login-page',
    data() {
        return {
            handle: '',
            psswd: '',
            error: '',
            loginAnimation: false,
            // proxy: new Prox.Proxy(),
            navigation: new Nav.Navigation(),
            apiService: ''
        }
    }, 
    created() {
        this.apiService = new APIServices.APIServices();
        this.apiService.setMethod("post");
    },
    methods: {
        setToken(newToken) {
                var inFifteenMinutes = new Date(new Date().getTime() + 15 * 60 * 1000);
               
                Cookies.set('authToken', newToken, {
                    expires: inFifteenMinutes
                });  
        },
       async login() {
            
            if (this.handle === '') {
                this.error = "Enter a valid handle to login.";
                return;
            }

            if (this.psswd === '') {
                this.error = "Enter a valid password to login.";
                return;
            }
            
            this.error = '';
            this.loginAnimation = false;
            
            localStorage.setItem('signedInUser', JSON.stringify(this.handle));
            localStorage.setItem('user', JSON.stringify(this.handle));
            
            this.apiService.setURL("users/login");
            this.apiService.setData({"handle": this.handle, "password": this.psswd});
            let response = await this.apiService.startService();
            
            console.log("response", response);
            response = response.data.body;
            if (JSON.parse(response).authToken != "") {
                this.setToken(JSON.parse(response).authToken);
                this.navigation.goToFeed();
            } else {
                this.error = "Incorrect handle and password combination. Give it another whirl."
            }
        },
        validateHandle() {
            if (this.handle.length > 0 && this.handle.charAt(0) !== '@') {
                this.handle = "@" + this.handle;
            }
        }, 
        createAccount() {
            this.navigation.signUp();
        },
        checkForInput() {
            if (this.handle !== '' && this.psswd !== '') {
                this.loginAnimation = true;
            }
        }

    },

});