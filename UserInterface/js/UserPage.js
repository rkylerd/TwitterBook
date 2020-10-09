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
    el: '#user-page',
    data() {
        return {
            
            user: '',
            postPreview: '',
            signedInUser: '',
            post: '',
            lastQueryKey: '',
            myStory: [],
            attachments: [],
            onlineVideoURL: '',
            onlineImageURL: '',
            userMentions: [],
            hashtagMentions: [],
            followers: [],
            following: [],
            navigation: new nav.Navigation(),
            apiService: ''
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
        browseFiles(context) {
            var input = document.createElement('input');
            input.type = "file";
            input.click();
            
            switch (context) {
                case "post":
                    input.addEventListener("change", (event) => {
                        this.attachStatusFile(event);
                    });
                    break;
                case "profilePhoto":
                    input.addEventListener("change", (event) => {
                        this.attachProfilePhoto(event);
                    });
                    break;
                default:
            }
        },
        attachStatusFile(event) {
            
            const files = event.target.files;
            
            if (!files.length) {
                console.log('No attachments to display');
              } else {
                
                for (let i = 0; i < files.length; i++) {
                    
                    
                    let dotIndex = files[i].name.indexOf('.');
                    var fileExtension = files[i].name.substring(dotIndex+1, files[i].name.length);
                    fileExtension = fileExtension.toLowerCase();
                    // var reader = new FileReader();
                    
                    // reader.onload = async () => {
                    //     var uploadPhoto = reader.result;
                        
                        if (fileExtension === 'png' || fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'gif') {
                        
                        const img = document.createElement("img");
                        img.src = window.URL.createObjectURL(files[i]);
                        this.postPreview += "<img class='img-attachment' src='" + img.src + "'>";
                        
                        this.attachments.push({type: 'image', src: img.src});
                        } else if (fileExtension === 'mp4' || fileExtension === 'm4a' || fileExtension === 'm4v' ||
                        fileExtension === 'f4v' || fileExtension === 'f4a' || fileExtension === 'm4b' 
                        || fileExtension === 'm4r' || fileExtension === 'f4b' || fileExtension === 'mov') {
                            
                            try {
                                const video = document.createElement("video");
                                video.src = window.URL.createObjectURL(files[i]);
                                this.postPreview += "<video class='video-attachment'><source src='" + video.src + "'></source></video>";
                                this.attachments.push({type: 'video', src: video.src});
                                
                            } catch (error) {
                                // this.src = window.URL.createObjectURL(stream);
                                console.log("error", error);
                            }
    
                        } else {
                            alert("You must either enter an image file of type: .png, .jpg, .jpeg, or .gif, OR a video file of type: mp4, m4a, m4v, f4v, f4a, m4b, m4r, f4b, mov");
                            return;
                        }

                    // }
                    
                    // reader.readAsDataURL(files[i]);
                }
                
            }
            
        },
        enableOnlineContent() {
          document.getElementById("onlineImageURL").style.display = "inline";
          document.getElementById("onlineVideoURL").style.display = "inline";
        },
        attachOnlineContent() {
          if (this.onlineImageURL != '') {
              this.postPreview += "<img class='img-attachment' src='" + this.onlineImageURL + "'>";
              this.attachments.push({type: 'image', src: this.onlineImageURL})
              this.onlineImageURL = '';
          }  
          if (this.onlineVideoURL != '') {
              let startIndex = this.onlineImageURL.indexOf("youtube.com/");
            //   this.onlineImageURL = this.onlineImageURL.splice(startIndex + 12, 0, "embed/");
              this.postPreview += "<iframe class='video-attachment' src='" + this.onlineVideoURL + "'></iframe>";
              this.attachments.push({type: 'video', src: this.onlineVideoURL})
              this.onlineVideoURL = '';
          }  
        },
        async postStatus() {
            if (!this.renewToken()) {
                this.navigation.login();
            }
            
            if (this.post.length == 0) {
                alert("You must include text to post a status.");
                return;
            }
            this.attachOnlineContent();
            let newStatus = this.parsePost(this.post);
            this.postPreview = "";
            
            // this.myStory.unshift({ handle: this.user.handle, attachments: this.attachments, statusText: newStatus, dateTimePosted: moment().format('h:mm a') });
            
            try {

                this.apiService.setData({authToken: Cookies.get('authToken'), statusId: uuidv4(), author: this.user.handle, statusText: this.post, attachments: this.attachments, dateSort: moment().format('YYYY MM DD h:mm:ss a'), datePosted: moment().format('Do MMMM YYYY'), timePosted: moment().format('h:mm a')});
                this.apiService.setURL("statuses/" + this.myStory[0].handle);
                this.apiService.setMethod("post");
                let addPostResult = await this.apiService.startService();
                
                
                console.log("post result", addPostResult);
                this.apiService.setMethod("get");
                this.apiService.setURL("users/" + this.user.getHandle() + "/story?pagesize=10");
    
                let response = await this.apiService.startService();
                console.log("response", response.body);
                response = JSON.parse(response.body);
            
                this.lastQueryKey = response.LastEvaluatedKey ? response.LastEvaluatedKey.timestamp_sort: "";
                
                response = response.Items;
                this.myStory = [];
                for (var i = 0; i < response.length; i ++) {
                    response[i].statusText = this.parsePost(response[i].statusText);
                    response[i].profilePic = this.user.profilePic;
                    this.myStory.push(response[i]);
                }
            } catch (err) {
                console.log("post status error", err);
            }
            
            this.post = "";
            document.getElementById("onlineImageURL").style.display = "none";
            document.getElementById("onlineVideoURL").style.display = "none";
            this.attachments = [];
           
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
        parseInput() {
            
            var eachWordArray = this.post.split(" ");
            
            this.userMentions = [];
            this.hashtagMentions = [];
            
            for (var i = 0; i < eachWordArray.length; i++) {
                
                var substr = eachWordArray[i].substring(eachWordArray[i].length - 4, eachWordArray[i].length);
                
                if (eachWordArray[i].startsWith('@')) {
                    this.userMentions.push(eachWordArray[i]);
                } else if (eachWordArray[i].startsWith('#')) {
                    this.hashtagMentions.push(eachWordArray[i]);
                }
            }
            
        },
        addFollower(follower) {
            this.followers.push(follower);
        },
        addToFollowing(user) {
            this.following.push(user)
        },
        goToFeed(handle) {
            if (!handle.type) {
                localStorage.setItem("user", JSON.stringify(handle))    
            }
            
            this.navigation.goToFeed();
        },
        goToFollowers() {
            this.navigation.goToFollowers();
        },
        goToFollowing() {
            this.navigation.goToFollowing();
        },
        goToUser(userInfo) {
            
            localStorage.setItem('user', JSON.stringify(userInfo.handle ? userInfo.handle : userInfo));
            this.navigation.goToUser();
        },
        goToSingleStatus(status) {
            
            localStorage.setItem('singleStatus', JSON.stringify(status));
            this.navigation.goToSingleStatus();
        },
        goToSite(URL) {
            this.navigation.goToSite(URL);
        },
        goToHashtag(hashtag) {
            
            localStorage.setItem('hashtag', JSON.stringify(hashtag));
            this.navigation.goToHashtag();
        },
        signOut() {
            this.navigation.signOut();
        },
        seeAllUsers(){
          this.navigation.seeAllUsers();  
        },
        browseFiles(context) {
            if (!this.renewToken()) {
                this.navigation.login();
            }
            
            var input = document.createElement('input');
            input.type = "file";
            input.click();
            
            switch (context) {
                case "post":
                    input.addEventListener("change", (event) => {
                        this.attachStatusFile(event);
                    });
                    break;
                case "profilePhoto":
                    input.addEventListener("change", (event) => {
                        this.attachProfilePhoto(event);
                    });
                    break;
                default:
            }
        },
        async attachProfilePhoto(event) {
            
            console.log(event);
            const files = event.target.files;
            this.fileList = "";

            if (!files.length) {
                console.log('No attachments to display');
            } else if (files.length > 1) {
                this.outputError(7);
                return;
            } 
            else {
                var reader = new FileReader();
                this.apiService.setURL("users/" + this.user.handle + "/profilephoto");
                this.apiService.setMethod("post");
                
                reader.onload = async () => {
                    var uploadPhoto = reader.result;
                    this.user.profilePic = uploadPhoto;
                    this.apiService.setData({file: uploadPhoto});
                    let profilePicUpdate = await this.apiService.startService();
                    console.log("profilePicUpdate", profilePicUpdate);
                };
                
                await reader.readAsDataURL(files[0]);
                    
            }
        },
        // toDataURL(src, callback, outputFormat) {
        //   var img = new Image();
        //   img.crossOrigin = 'Anonymous';
        //   img.onload = function() {
        //     var canvas = document.createElement('CANVAS');
        //     var ctx = canvas.getContext('2d');
        //     var dataURL;
        //     canvas.height = this.naturalHeight;
        //     canvas.width = this.naturalWidth;
        //     ctx.drawImage(this, 0, 0);
        //     dataURL = canvas.toDataURL(outputFormat);
        //     callback(dataURL);
        //   };
        //   img.src = src;
        //   if (img.complete || img.complete === undefined) {
        //     img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        //     img.src = "data:image/gif;base64," + src;
        //   }
        // },
        // async updateProfilePhoto(imgFile) {
        //     let src = "";
        //     let that = this;
        //     this.toDataURL(window.URL.createObjectURL(imgFile), function(dataUrl) {
              
        //       src = dataUrl;
                
        //         that.picPreview = src;
        //         that.proxyCall(src);
                
        //     })
        
        // }, 
        // async proxyCall(base64) {
        //     // let profilePicUpdate = await this.proxy.sendPostRequest("users/" + this.handle + "/profilephoto", {url: base64});
        //     this.apiService.setURL("users/" + this.handle + "/profilephoto");
        //     this.apiService.setData({url: base64});
        //     this.apiService.setMethod("post");
        //     let profilePicUpdate = await this.apiService.startService();
        //     console.log(profilePicUpdate.data);
        // },
        async handleScroll(ev) {
            ev.preventDefault();
            window.removeEventListener('scroll', this.handleScroll);
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
                this.renewToken();
                let lastKey = this.lastQueryKey == "" ? "" : "lastkey=" + this.lastQueryKey;
                
                if (lastKey != "") {
                    
                    this.apiService.setURL("users/" + this.user.getHandle() + "/story?" + lastKey + "&pagesize=10");
                    this.apiService.setMethod("get");
                    let response = await this.apiService.startService();
                    response.body = JSON.parse(response.body);

                    
                    // response.body = response.body.Items;
                    for (var i = 0; i < response.body.Items.length; i++) {
                         response.body.Items[i].statusText = this.parsePost(response.body.Items[i].statusText);
                         response.body.Items[i].profilePic = this.user.profilePic;
                         this.myStory.push(response.body.Items[i]);
                    }
                    
                    if (response.body.LastEvaluatedKey) {
                        this.lastQueryKey = response.body.LastEvaluatedKey.timestamp_sort;
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
        callAPI() {
            return new Promise(async (resolve, reject) => {
        
                let response = await this.apiService.startService();
                
                response = JSON.parse(response.body);
                
                resolve(response);
            });
        }
    },
    async created() {
        
        this.renewToken();
        
        this.apiService = new APIServices.APIServices();
        this.apiService.setMethod("get");
        
        window.addEventListener('scroll', this.handleScroll);
        
        let userName = JSON.parse(localStorage.getItem('user'));
        userName = userName.handle ? userName.handle : userName;
        
        this.signedInUser = JSON.parse(localStorage.getItem('signedInUser'));
        this.user = new User.User(userName, '', 'firstName', 'lastName');
        this.user.profilePicture = "https://cdn1.vectorstock.com/i/thumb-large/46/55/person-gray-photo-placeholder-woman-vector-22964655.jpg";
        
        try {
            
            this.apiService.setURL("users/" + this.user.handle + "/profilephoto");
            let profilePicResponse = await this.apiService.startService();
            this.user.profilePic = JSON.parse(profilePicResponse.body);
        } catch (error) {
            console.log(error);
        }
        
        this.apiService.setURL("users/" + this.user.getHandle() + "/following");
        // let followingResponse = await this.apiService.startService();
        this.callAPI().then(async (followingResponse) => {
            followingResponse = followingResponse.Items;
            for (var i = 0; i < followingResponse.length; i++) {
                
                    this.apiService.setURL("users/" + followingResponse[i].followeeID + "/profilephoto");
                    
                    await this.callAPI().then( (profilePicResponse) => {
                        
                        this.addToFollowing({handle: followingResponse[i].followeeID, profilePic: profilePicResponse});
                        console.log("following " + i, this.following);
                    })
                }
        });
        
        this.apiService.setURL("users/" + this.user.getHandle() + "/followers");
        this.callAPI().then(async (followersResponse) => {
            followersResponse = followersResponse.Items;
            for (var i = 0; i < followersResponse.length; i++) {
                    // this.apiService.setURL("users/" + followersResponse[i].followerID + "/profilephoto");
                    
                    // await this.callAPI().then( (profilePicResponse) => {
                        let profilePicture = "https://cdn1.vectorstock.com/i/thumb-large/46/55/person-gray-photo-placeholder-woman-vector-22964655.jpg";
                        this.addFollower({handle: followersResponse[i].followerID, profilePic: profilePicture});
                        console.log("follower " + i, this.followers);
                    // })

                }
        });

            
        this.apiService.setURL("users/" + this.user.getHandle() + "/story?pagesize=10");
    
        let response = await this.apiService.startService();
        console.log("response", response.body);
        response = JSON.parse(response.body);
    
        this.lastQueryKey = response.LastEvaluatedKey ? response.LastEvaluatedKey.timestamp_sort: "";
        
        response = response.Items;
        for (var i = 0; i < response.length; i ++) {
            response[i].statusText = this.parsePost(response[i].statusText);
            response[i].profilePic = this.user.profilePic;
            this.myStory.push(response[i]);
        }

    },
    computed: {
      profilePhoto: function() {
          return this.user.profilePhoto;
      },
      orderedStatuses: function () {
        return this.myStory.sort((a, b) => (a.timestamp_sort < b.timestamp_sort) ? 1 : -1)
      }, currentDate: function () {
          return moment().format('Do MMMM YYYY');
      }

    },
    destroyed () {
        window.removeEventListener('scroll', this.handleScroll);
    } 
    
    
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


        // parseInput() {
            
        //     var eachWordArray = this.post.split(" ");
        //     console.log("post", this.post);
        //     this.newStatus = [];
        //     let word = {};
        //     for (var i = 0; i < eachWordArray.length; i++) {
                
                
        //         // Handles
        //         if (eachWordArray[i].startsWith('@')) {
        //             word = {type: 'handle', handle: eachWordArray[i]};
        //             // eachWordArray[i] =  "<span><a class='handles uniquePostEntry' href='goToUser'>" + eachWordArray[i] + "</a></span>";
                
        //         } 

                
        //         // URLS
        //         var substr = eachWordArray[i].substring(eachWordArray[i].length - 4, eachWordArray[i].length);
        //         if ((substr === ".com" || substr === ".org" || substr === ".edu") && eachWordArray[i].length > 4) {
        //             let originalURL = eachWordArray[i];
        //             if (!eachWordArray[i].startsWith('http://') && !eachWordArray[i].startsWith('https://')) {
        //                 if (eachWordArray[i].startsWith('www.')) {
        //                     eachWordArray[i] = 'https://' + eachWordArray[i];
        //                 } else {
        //                     eachWordArray[i] = 'https://www.' + eachWordArray[i];
        //                 }
        //             }

        //             word = {type: 'url', href: eachWordArray[i], showAs: originalURL};
        //             // eachWordArray[i] = " <a href='" + eachWordArray[i] + "' class='URL uniquePostEntry' target='_blank'>" + eachWordArray[i] + "</a>";
                    
        //         }
                

        //         else if (eachWordArray[i].startsWith('#')) {
        //             word = {type: 'hashtag', hashtag: eachWordArray[i]};
        //             // eachWordArray[i] = " <span class='hashtag uniquePostEntry'>" + eachWordArray[i] + "</span>";
        //         }
        //         else {
        //             word = {type: 'word', text: eachWordArray[i]};
        //         }
                
        //         this.newStatus.push(word);
                
        //         // this.newStatus.push(eachWordArray[i]);
                
        //     }
            
        // },