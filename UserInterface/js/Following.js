import * as nav from './Navigation.js'
import * as User from '../../ModelLayer/Entities/User.js'
import * as Status from '../../ModelLayer/Entities/Status.js'
// import * as Prox from '../../ProxyServer/Proxy.js'
import * as APIServices from '../../ModelLayer/AppLogic/APIServices.js'

Vue.component('user-name', {
    props: ['name', 'onClick', 'handle'],
    template: '<div class="name-follow" @click="onClick({handle})">{{handle}}</div>',
    methods: {
        
    }
})
  
var app = new Vue({
    el: '#following-page',
    data() {
        return {
            
            user: {handle: 'Kyler'},
            error: '',
            following: [],
            viewingUserFollow: [],
            lastQueryKey: '',
            userName: '',
            signedInUser: '',
            apiService: '',
            navigation: new nav.Navigation()
        }
    }, 
    async created() {
        this.renewToken();
        
        this.apiService = new APIServices.APIServices();
        this.apiService.setMethod("get");
        
        window.addEventListener('scroll', this.handleScroll);
        
        this.userName = JSON.parse(localStorage.getItem('user'));
        this.signedInUser = JSON.parse(localStorage.getItem('signedInUser'));
        
        this.apiService.setURL("users/" + this.userName + "/following?pagesize=10");
        let followingResponse = await this.apiService.startService();
        
        console.log("response", followingResponse.body);
        followingResponse = JSON.parse(followingResponse.body);
        this.lastQueryKey = followingResponse.LastEvaluatedKey ? followingResponse.LastEvaluatedKey.followeeID: "";
        followingResponse = followingResponse.Items;
        for (var i = 0; i < followingResponse.length; i ++) {
             
            this.apiService.setURL("users/" + this.signedInUser + "/following/" + followingResponse[i].followeeID);
            let newResponse = await this.apiService.startService();
            newResponse = JSON.parse(newResponse.body);
            this.viewingUserFollow.push(newResponse);
    
            this.apiService.setURL("users/" + followingResponse[i].followeeID + "/profilephoto");
            newResponse = await this.apiService.startService();
            let profilePicture = "";
            if (newResponse.body) {
                profilePicture = JSON.parse(newResponse.body);
             } else {
                 profilePicture = "https://cdn1.vectorstock.com/i/thumb-large/46/55/person-gray-photo-placeholder-woman-vector-22964655.jpg";
             }
            // this.addToUsersList({handle: usersListResponse[i], profilePic: profilePicture});
            this.addToFollowing({handle: followingResponse[i].followeeID, profilePic: profilePicture});
             
        }
    },
    destroyed () {
        window.removeEventListener('scroll', this.handleScroll);
    }, 
    methods: {
        renewToken() {
            let authToken = Cookies.get('authToken'); 
            if (authToken != undefined) {
                
                var inFifteenMinutes = new Date(new Date().getTime() + 15 * 60 * 1000);
                       
                Cookies.set('authToken', authToken, {
                    expires: inFifteenMinutes
                });
                return true;
            } 
            
            return false; 
        },
        getViewingUserFollow(compareHandle) {
        console.log("compareHandle " + compareHandle);
          for (var i = 0; i < this.following.length; i++) {
             if (this.following[i].handle == compareHandle) {
                 console.log("found it", this.viewingUserFollow[i]);
                 return this.viewingUserFollow[i];
             }
             
          }  
        },
        addToFollowing(user) {
            this.following.push(user)
        },
        goToUser(userInfo) {
            console.log(userInfo);
            localStorage.setItem('user', JSON.stringify(userInfo.handle ? userInfo.handle : userInfo));
            this.navigation.goToUser();
        },
        goToFeed() {
            this.navigation.goToFeed();
        },
        goToSite(URL) {
            this.navigation.goToSite(URL);
        },
        signOut() {
            this.navigation.signOut();
        },
        seeAllUsers(){
          this.navigation.seeAllUsers();  
        },
        async followAction(handle) {
            
            if (!this.renewToken()) {
                this.navigation.login();
            }
            
            let action = this.getViewingUserFollow(handle);
        
            
            if (action == "follow") {
                this.apiService.setData({followinghandle: handle, datetime: moment().format('YYYY MM DD'), authToken: Cookies.get('authToken')});
                this.apiService.setURL("users/" + this.userName + "/following/add");
                this.apiService.setMethod("post");
            } else {
                this.apiService.setURL("users/" + this.userName + "/following/remove/" + handle + "?authToken=" + Cookies.get('authToken'));
                this.apiService.setMethod("get");
            }
            
            let response = await this.apiService.startService();
            console.log("response", response);
            
        },
        async handleScroll(ev) {

            window.removeEventListener('scroll', this.handleScroll);
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
                this.renewToken();
                let lastKey = this.lastQueryKey == "" ? "" : "lastkey=" + this.lastQueryKey;
                    
                if (lastKey != "") {
                    
                    this.apiService.setURL("users/" + this.userName + "/following?" + lastKey + "&pagesize=10");
                    this.apiService.setMethod("get");
                    let response = await this.apiService.startService();
                    response.body = JSON.parse(response.body);
                    console.log("response", response.body);
                    
                    // response.body = response.body.Items;
                    for (var i = 0; i < response.body.Items.length; i++) {
                         console.log("response", response.body.Items[i]);
                         this.apiService.setURL("users/" + response.body.Items[i].followeeID + "/profilephoto");
                         let profilePicResponse = await this.apiService.startService();
                         response.body.Items[i].profilePic = JSON.parse(profilePicResponse.body);

                         this.addToFollowing.push(response.body.Items[i]);
                    }
    
                    if (response.body.LastEvaluatedKey) {
                        this.lastQueryKey = response.body.LastEvaluatedKey.timestamp_sort;
                    } else {
                        this.lastQueryKey = "";
                        
                        window.removeEventListener('scroll', this.handleScroll);
                        return;
                    }
                }
            }
            window.addEventListener('scroll', this.handleScroll);
            
        },
        
    }
});