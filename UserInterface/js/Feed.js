import * as nav from './Navigation.js'
import * as User from '../../ModelLayer/Entities/User.js'
import * as Status from '../../ModelLayer/Entities/Status.js'
import * as APIServices from '../../ModelLayer/AppLogic/APIServices.js'

var app = new Vue({
    el: '#feed-page',
    data() {
        return {
            
            myFeed: [],
            userName: '',
            signedInUser: '',
            navigation: new nav.Navigation(),
            apiService: '',
            lastQueryKey: ''
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
        goToFollowers() {
            this.navigation.goToFollowers();
        },
        goToFollowing() {
            this.navigation.goToFollowing();
        },
        goToUser(userInfo) {
            console.log(userInfo);
            localStorage.setItem('user', JSON.stringify(userInfo.handle ? userInfo.handle : userInfo));
            this.navigation.goToUser();
        },
        goToFeed() {
            this.navigation.goToFeed();
        },
        goToSingleStatus(status) {
            console.log(status);
            localStorage.setItem('singleStatus', JSON.stringify(status));
            this.navigation.goToSingleStatus();
        },
        goToSite(URL) {
            this.navigation.goToSite(URL);
        },
        goToHashtag(hashtag) {
            console.log(hashtag);
            localStorage.setItem('hashtag', JSON.stringify(hashtag));
            this.navigation.goToHashtag();
        },
        signOut() {
            this.navigation.signOut();
        },
        seeAllUsers(){
          this.navigation.seeAllUsers();  
        },
        async handleScroll(ev) {
            window.removeEventListener('scroll', this.handleScroll);
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        
                let lastKey = this.lastQueryKey == "" ? "" : "lastkey=" + this.lastQueryKey;
                    
                if (lastKey != "") {
                    
                    this.apiService.setURL("users/" + this.userName + "/feed?" + lastKey + "&pagesize=10");
                    this.apiService.setMethod("get");
                    let response = await this.apiService.startService();
                    response.body = JSON.parse(response.body);
                    console.log("response", response.body);
    
                    
                    // response.body = response.body.Items;
                    for (var i = 0; i < response.body.Items.length; i++) {
                         console.log("response", response.body.Items[i]);
                         this.apiService.setURL("users/" + response.body.Items[i].author + "/profilephoto");
                         let profilePicResponse = await this.apiService.startService();
                         response.body.Items[i].profilePic = JSON.parse(profilePicResponse.body);
                         response.body.Items[i].statusText = this.parsePost(response.body.Items[i].statusText);
                         this.myFeed.push(response.body.Items[i]);
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
        parsePost(post) {
            
            var eachWordArray = post.split(" ");
            
            let status = [];
            let word = {};
            var samplePost = '';
            for (var i = 0; i < eachWordArray.length; i++) {
                
                var substr = eachWordArray[i].substring(eachWordArray[i].length - 4, eachWordArray[i].length);
                
                if (eachWordArray[i].startsWith('@')) { // Handles
                    word = {type: 'handle', handle: eachWordArray[i]};
                    
                    samplePost+= "{type: 'handle', handle: '" + eachWordArray[i] + "'}, ";
                } else if ((substr === ".com" || substr === ".org" 
                            || substr === ".gov" || substr === ".edu") && eachWordArray[i].length > 4) {// URLS
                
                    let originalURL = eachWordArray[i];
                    if (!eachWordArray[i].startsWith('http://') && !eachWordArray[i].startsWith('https://')) {
                        if (eachWordArray[i].startsWith('www.')) {
                            eachWordArray[i] = 'https://' + eachWordArray[i];
                        } else {
                            eachWordArray[i] = 'https://www.' + eachWordArray[i];
                        }
                    }

                    word = {type: 'url', href: eachWordArray[i], showAs: originalURL};
                    samplePost+= "{type: 'url', href: '" + eachWordArray[i] + "', showAs: '" + originalURL + "'}, ";
                    
                } else if (eachWordArray[i].startsWith('#')) {
                    word = {type: 'hashtag', hashtag: eachWordArray[i]};
                    samplePost+= "{type: 'hashtag', hashtag: '" + eachWordArray[i] + "'}, ";
                    
                }
                else {
                    samplePost+= "{type: 'word', text: '" + eachWordArray[i] + "'}, ";
                    word = {type: 'word', text: eachWordArray[i]};
                }
                
                status.push(word);

            }
            return status;
        },
    },
    async created() {
        this.renewToken();
        this.apiService = new APIServices.APIServices();
        this.apiService.setMethod("get");
        
        window.addEventListener('scroll', this.handleScroll);
        
        this.userName = JSON.parse(localStorage.getItem('user'));
        this.signedInUser = JSON.parse(localStorage.getItem('signedInUser'));
        
        if (this.userName.handle) {
            this.userName = this.userName.handle;
        }
        
        this.apiService.setURL("users/" + this.userName + "/feed?pagesize=10");
        this.apiService.setMethod("get");
        
        let response = await this.apiService.startService();
        
        console.log("response", response.body);
        response = JSON.parse(response.body);
        this.lastQueryKey = response.LastEvaluatedKey ? response.LastEvaluatedKey.timestamp_sort: "";
        
        response = response.Items; 
        for (var i = 0; i < response.length; i++) {
             console.log("response", response[i]);
             this.apiService.setURL("users/" + response[i].author + "/profilephoto");
             let profilePicResponse = await this.apiService.startService();
             response[i].profilePic = JSON.parse(profilePicResponse.body);
             response[i].statusText = this.parsePost(response[i].statusText);
             this.myFeed.push(response[i]);
        }
    },
    computed: {
      orderedFeed: function () {
        return this.myFeed.sort((a, b) => (a.timestamp_sort < b.timestamp_sort) ? 1 : -1)
      }
    },
    destroyed () {
        window.removeEventListener('scroll', this.handleScroll);
    } 
    
});



