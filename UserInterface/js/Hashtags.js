import * as nav from './Navigation.js'
import * as User from '../../ModelLayer/Entities/User.js'
import * as Status from '../../ModelLayer/Entities/Status.js'
import * as APIServices from '../../ModelLayer/AppLogic/APIServices.js'

var app = new Vue({
    el: '#feed-page',
    data() {
        return {
 
            postList: [],
            signedInUser: '',
            hashtag: '',
            navigation: new nav.Navigation(),
            apiService: '',
            lastTimeKey: '',
            lastIDKey: '' 
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
        logout() {
            //to goodbye screen that has login/sign up link
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
                this.renewToken();
                let lastKey = this.lastTimeKey == "" ? "" : "?pagesize=10&lasttimekey=" + this.lastTimeKey + "&lastidkey=" + this.lastIDKey;
                
                if (lastKey != "") {
                    
                    this.apiService.setURL("statuses/hashtag/" + this.hashtag + lastKey);
                    let response = await this.apiService.startService();
                    response.body = JSON.parse(response.body);
                    console.log("response", response.body);
                    
                    for (var i = 0; i < response.body.Items.length; i++) {
                         console.log("response", response.body.Items[i]);
                         this.apiService.setURL("users/" + response.body.Items[i].author + "/profilephoto");
                         let profilePicResponse = await this.apiService.startService();
                         response.body.Items[i].profilePic = JSON.parse(profilePicResponse.body);
                         response.body.Items[i].statusText = this.parsePost(response.body.Items[i].statusText);
                         this.postList.push(response.body.Items[i]);
                    }
                    
                    if (response.body.LastEvaluatedKey) {
                        this.lastTimeKey = response.body.LastEvaluatedKey.timestamp_sort;
                        this.lastIDKey = response.body.LastEvaluatedKey.statusId;
                    } 
                    else {
                        this.lastTimeKey = "";
                        this.lastIDKey = "";
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
            // var samplePost = '';
            for (var i = 0; i < eachWordArray.length; i++) {
                
                var substr = eachWordArray[i].substring(eachWordArray[i].length - 4, eachWordArray[i].length);
                
                if (eachWordArray[i].startsWith('@')) { // Handles
                    word = {type: 'handle', handle: eachWordArray[i]};
                    
                    // samplePost+= "{type: 'handle', handle: '" + eachWordArray[i] + "'}, ";
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
                    // samplePost+= "{type: 'url', href: '" + eachWordArray[i] + "', showAs: '" + originalURL + "'}, ";
                    
                } else if (eachWordArray[i].startsWith('#')) {
                    word = {type: 'hashtag', hashtag: eachWordArray[i]};
                    // samplePost+= "{type: 'hashtag', hashtag: '" + eachWordArray[i] + "'}, ";
                    
                }
                else {
                    // samplePost+= "{type: 'word', text: '" + eachWordArray[i] + "'}, ";
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
        
        this.hashtag = JSON.parse(localStorage.getItem('hashtag'));
        this.signedInUser = JSON.parse(localStorage.getItem('signedInUser'));
        
        this.hashtag = this.hashtag.substr(1, this.hashtag.length);
        
        this.apiService.setURL("statuses/hashtag/" + this.hashtag + "?pagesize=10");
        let hashtagResponse = await this.apiService.startService();
        
        console.log("response", hashtagResponse.body);
        hashtagResponse = JSON.parse(hashtagResponse.body);
        
        this.lastTimeKey = hashtagResponse.LastEvaluatedKey ? hashtagResponse.LastEvaluatedKey.timestamp_sort : "";
        this.lastIDKey = hashtagResponse.LastEvaluatedKey ? hashtagResponse.LastEvaluatedKey.statusId : "";
        
        hashtagResponse = hashtagResponse.Items;
        for (var i = 0; i < hashtagResponse.length; i ++) {
             console.log("response", hashtagResponse[i]);
             this.apiService.setURL("users/" + hashtagResponse[i].author + "/profilephoto");
             let profilePicResponse = await this.apiService.startService();
             hashtagResponse[i].profilePic = JSON.parse(profilePicResponse.body);
             hashtagResponse[i].statusText = this.parsePost(hashtagResponse[i].statusText);
             this.postList.push(hashtagResponse[i]);
             
        }
    },
    destroyed () {
        window.removeEventListener('scroll', this.handleScroll);
    } 
    
});