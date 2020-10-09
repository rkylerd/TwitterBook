import * as nav from './Navigation.js'

var app = new Vue({
    el: '#signed-out-page',
    data() {
        return {
            navigation: new nav.Navigation()
        }
    }, 
    
    methods: {
        login() {
            this.navigation.login();
        }, 
        signUp() {
            this.navigation.signUp();
        },
    }
});