import * as nav from './Navigation.js'
import * as User from '../../ModelLayer/Entities/User.js'
import * as Status from '../../ModelLayer/Entities/Status.js'
import * as APIServices from '../../ModelLayer/AppLogic/APIServices.js'

Vue.component('user-name', {
    props: ['name', 'onClick', 'handle'],
    template: '<div class="name-follow" @click="onClick({handle})">{{handle}}</div>',
    methods: {
        
    }
  })
       
var app = new Vue({
    el: '#followers-page',
    data() {
        return {
            followers: [],
            viewingUserFollow: [],
            userName: '',
            signedInUser: '',
            apiService: '',
            lastQueryKey: '',
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
        
        // let followersResponse = await this.proxy.sendGetRequest("users/" +  this.userName + "/followers");
        this.apiService.setURL("users/" +  this.userName + "/followers?pagesize=30");
        this.callAPI().then(async (followersResponse) => {
            this.lastQueryKey = followersResponse.LastEvaluatedKey ? followersResponse.LastEvaluatedKey.followerID: "";
            followersResponse = followersResponse.Items;
            for (var i = 0; i < followersResponse.length; i++) {
                    
                    this.apiService.setURL("users/" +  this.signedInUser + "/following/" + followersResponse[i].followerID);
                    this.callAPI().then( (newResponse) => {
                        
                        this.viewingUserFollow.push(newResponse);
                        console.log("followers " + i, this.viewingUserFollow);
                    })
                    
                    this.apiService.setURL("users/" + followersResponse[i].followerID + "/profilephoto");
                    await this.callAPI().then( (profilePicResponse) => {
                        
                        let profilePicture = "";
                        if (profilePicResponse) {
                            profilePicture = profilePicResponse;
                        }
                        this.addFollower({handle: followersResponse[i].followerID, profilePic: profilePicture});
                        console.log("followers " + i, this.viewingUserFollow);
                    }).catch(error => {
                        let profilePicture = "https://cdn1.vectorstock.com/i/thumb-large/46/55/person-gray-photo-placeholder-woman-vector-22964655.jpg";
                        this.addFollower({handle: followersResponse[i].followerID, profilePic: profilePicture});
                    });
                }
        });
        // let followersResponse = await apiService.startService();
        
        // console.log("followersResponse", followersResponse.body);
        // followersResponse = JSON.parse(followersResponse.body);
        
        // for (var i = 0; i < followersResponse.length; i ++) {
        //      this.addFollower(followersResponse[i]);
        //     //  let newResponse = await this.proxy.sendGetRequest("users/" +  this.userName + "/following/" + this.followers[i].handle);
        //     apiService.setURL("users/" +  this.userName + "/following/" + this.followers[i].handle);
    
        //      let newResponse = await apiService.startService();
        //      newResponse = JSON.parse(newResponse.body);
             
        //      this.viewingUserFollow.push(newResponse);
        // }
        
        
        console.log('follower array', this.followers);
    },
    destroyed () {
        window.removeEventListener('scroll', this.handleScroll);
    },
    computed: {
        action: function() {
             return compareHandle => this.viewingUserFollow[this.followers.findIndex(x => x.handle === compareHandle)];
        }
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
        getFollowAction(compareHandle) {
              console.log("compareHandle " + compareHandle);
              return this.viewingUserFollow[this.followers.findIndex(x => x.handle === compareHandle)];
        },
        setFollowAction(compareHandle, newValue) {
            let index = this.followers.findIndex(x => x.handle === compareHandle);
            this.viewingUserFollow[index] = newValue;
        },
        addFollower(follower) {
            this.followers.push(follower);
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
        callAPI() {
            return new Promise(async (resolve, reject) => {
        
                let response = await this.apiService.startService();
                if (response.errorMessage != null) {
                    reject(response.errorMessage);
                    throw new Error(response.errorMessage);
                }
                response = JSON.parse(response.body);
                resolve(response);
            }).catch(error => {
               throw new Error(error);
            });
        },
        async followAction(handle) {
            
            if (!this.renewToken()) {
                this.navigation.login();
            }
            
            let action = this.getFollowAction(handle);
            let toggledAction = "";
            let apiService = new APIServices.APIServices();
            
            
            if (action == "follow") {
                toggledAction = "unfollow";
                apiService.setData({authToken: Cookies.get('authToken'), followinghandle: handle, datetime: moment().format('YYYY MM DD')});
                apiService.setURL("users/" + this.signedInUser + "/following/add");
                apiService.setMethod("post");

            } else {
                toggledAction = "follow";
                apiService.setURL("users/" + this.userName + "/following/remove/" + handle + "?authToken=" + Cookies.get('authToken'));
                apiService.setMethod("get");

            }
            this.setFollowAction(handle, toggledAction);
            
            let response = await apiService.startService();
            console.log("response", response);
        },
        async handleScroll(ev) {
            window.removeEventListener('scroll', this.handleScroll);
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
                this.renewToken();
                let lastKey = this.lastQueryKey == "" ? "" : "?pagesize=20&lastkey=" + this.lastQueryKey;
                
                if (lastKey != "") {
                    
                    let apiService = new APIServices.APIServices("users/" + this.userName + "/followers" + lastKey, "get");
                    let response = await apiService.startService();
                    response.body = JSON.parse(response.body);
                    console.log("response", response.body);
                    
                    // response.body = response.body.Items;
                    for (var i = 0; i < response.body.Items.length; i++) {
                        this.apiService.setURL("users/" +  this.signedInUser + "/following/" + response.body.Items[i].followerID);
                        this.callAPI().then( (newResponse) => {
                            
                            this.viewingUserFollow.push(newResponse);
                            console.log("followers " + i, this.viewingUserFollow);
                        })
                        
                         console.log("response", response.body.Items[i]);
                        let profilePicture = "https://cdn1.vectorstock.com/i/thumb-large/46/55/person-gray-photo-placeholder-woman-vector-22964655.jpg";
                         this.addFollower({handle: response.body.Items[i].followerID, profilePic: profilePicture });
                    }
                    
                    if (response.body.LastEvaluatedKey) {
                        this.lastQueryKey = response.body.LastEvaluatedKey.followerID;
                    } 
                    else {
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