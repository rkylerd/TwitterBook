import * as nav from './Navigation.js'
import * as User from '../../ModelLayer/Entities/User.js'
import * as Status from '../../ModelLayer/Entities/Status.js'
// import * as Prox from '../../ProxyServer/Proxy.js'
import * as APIServices from '../../ModelLayer/AppLogic/APIServices.js'

var app = new Vue({
    el: '#home-page',
    data() {
        return {
            
            user: {handle: ''},
            signedInUser: '',
            status: {},
            navigation: new nav.Navigation()
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
    },
    created() {
        this.renewToken();
        this.status = JSON.parse(localStorage.getItem('singleStatus'));
        if (!this.status.author) {
            this.status.author = this.status.handle;
        }
        this.signedInUser = JSON.parse(localStorage.getItem('signedInUser'));
        // this.status = {handle: '@Kyler', status: [{type: 'url', href: 'https://learningsuite.byu.edu', showAs: 'learningsuite.byu.edu'}, {type: 'word', text: 'my'}, {type: 'word', text: 'facebook'}, {type: 'word', text: '! The'}, {type: 'word', text: 'reason'}, {type: 'word', text: 'why'}, {type: 'word', text: 'stories'}, {type: 'word', text: 'work'}, {type: 'word', text: 'is'}, {type: 'word', text: 'because'}, {type: 'word', text: 'it'}, {type: 'word', text: 'is'}, {type: 'word', text: 'personal'}, {type: 'word', text: 'and'}, {type: 'word', text: 'your'}, {type: 'word', text: 'fans'}, {type: 'word', text: 'will'}, {type: 'word', text: 'probably'}, {type: 'word', text: 'have'}, {type: 'word', text: 'a'}, {type: 'word', text: 'similar'}, {type: 'word', text: 'story'}, {type: 'word', text: 'or'}, {type: 'word', text: 'situation'}, {type: 'word', text: 'that'}, {type: 'word', text: 'they'}, {type: 'word', text: 'are'}, {type: 'word', text: 'going'}, {type: 'word', text: 'through.'}, {type: 'word', text: 'This'}, {type: 'word', text: 'allows'}, {type: 'word', text: 'you'}, {type: 'word', text: 'to'}, {type: 'word', text: 'connect'}, {type: 'word', text: 'on'}, {type: 'word', text: 'a'}, {type: 'word', text: 'personal'}, {type: 'word', text: 'level.<br>Make'}, {type: 'word', text: 'sure'}, {type: 'word', text: 'to'}, {type: 'word', text: 'share'}, {type: 'word', text: 'stories'}, {type: 'word', text: 'about'}, {type: 'word', text: 'your'}, {type: 'word', text: 'life'}, {type: 'word', text: 'and'}, {type: 'word', text: 'business'}, {type: 'word', text: 'on'}, {type: 'word', text: 'Facebook.'}, {type: 'word', text: 'Quest'}, {type: 'word', text: 'nutrition'}, {type: 'word', text: 'does'}, {type: 'word', text: 'this'}, {type: 'word', text: 'well'}, {type: 'word', text: 'sharing'}, {type: 'word', text: 'stories'}, {type: 'word', text: 'and'}, {type: 'word', text: 'information'}, {type: 'word', text: 'that'}, {type: 'word', text: 'speaks'}, {type: 'word', text: 'to'}, {type: 'word', text: 'their'}, {type: 'word', text: 'audiences'}, {type: 'word', text: 'biggest'}, {type: 'word', text: 'struggles'}, {type: 'word', text: 'and'}, {type: 'word', text: 'needs.'}], attachments: [{type: 'image', src: 'http://food.fnr.sndimg.com/content/dam/images/food/fullset/2017/1/10/2/FN_san-antonio-restaurant-TacoTaco-Shredded-Chicken-Fried-Puffy-Tacos_s4x3.jpg.rend.hgtvcom.616.462.suffix/1484082180375.jpeg'}], date: moment().format('MMMM Do YYYY, h:mm a')};
    },
    
});


//   Vue.component('user-status', {
//     props: ['status', 'onChange'],
//     template: '<span class="post-output" @change="onChange({status})">{{status}}</span>',
//     methods: {
//         parseInput: function() {
//             alert('status');
//         }
//     }
//   })