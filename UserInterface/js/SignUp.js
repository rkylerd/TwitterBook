import * as nav from './Navigation.js'
import * as User from '../../ModelLayer/Entities/User.js'
// const Status = require('../../ModelLayer/Entities/Status.js')
import * as Image from '../../ModelLayer/Entities/Image.js'
// import * as Prox from '../../ProxyServer/Proxy.js'
import * as APIServices from '../../ModelLayer/AppLogic/APIServices.js'

Vue.component('user-name', {
    props: ['name'],
    template: '<p>Hi {{ name }}</p>'
  })
  
var app = new Vue({
    el: '#sign-up-page',
    data() {
        return {
            email: '',
            handle: '',
            psswd: '',
            psswdConf: '',
            firstName:'',
            lastName: '',
            error: '',
            loginAnimation: false,
            isHiding: false,
            picPreview: '',
            uploadPhoto: '',
            navigation: new nav.Navigation(),
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
        browseFiles() {
            console.log("getting profile image");
            var input = document.createElement('input');
            input.type = "file";
            input.click();
            input.addEventListener("change", (event) => {
                this.attachFile(event);
            });
        },
        attachFile(event) {
            
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
                // this.updateProfilePhoto(files[0]);
                this.picPreview = "";
                console.log(files.length + ' attachments to display');

                // for (let i = 0; i < files.length; i++) {
                    let img = document.createElement("img");
                    img.src = window.URL.createObjectURL(files[0]);
                    console.log("file[0]", files[0]);
                    
                    var reader = new FileReader();
                    
                    reader.onload = () => {
                      var dataURL = reader.result;
                      this.uploadPhoto = dataURL;
                      this.picPreview = dataURL;
                      console.log("output of reader: ", dataURL);
                    };
                    
                    reader.readAsDataURL(files[0]);
                    
                    // this.picPreview = img.src;
                    console.log("profilepic", img);
                    
                    // localStorage.setItem('profilePic', JSON.stringify(img));
                // }
                
                this.isHiding = true;
                
            }
        },
        confirmPhoto() {
            this.isHiding = false;
        },
        login() {
            this.navigation.login();
        },
        validateHandle() {
            if (this.handle.length > 0 && this.handle.charAt(0) !== '@') {
                this.handle = "@" + this.handle;
            }
        }, 
        createAccount() {

            if (this.handle.length < 2) {
                this.outputError(3);
                
            } else if (this.psswd === '') {
                this.outputError(2);
            } else if (this.firstName === '') {
                this.outputError(4);
                
            } else if (this.lastName === '') {
                this.outputError(5);
            } else if (this.psswd != this.psswdConf) {
                this.outputError(6);
            } else if (this.email == '') {
                this.outputError(8);
            } else {this.error = ''}

            if (this.error !== '') return;
            
            this.signUp();

        },
        async signUp() {
            
            let successfulSignUp = await this.callServices();
            if (successfulSignUp) {
                this.navigation.goToFeed();
            } else {
                this.outputError(9);
            }
            
            
            localStorage.setItem('user', JSON.stringify(this.handle));
            localStorage.setItem('signedInUser', JSON.stringify(this.handle));
        },
        moveForward() {
            
            if (this.handle.length < 2) {
                this.outputError(3);
            } else if (this.psswd === '') {

                this.outputError(2);
            } else if (this.psswd != this.psswdConf) {
                this.outputError(6);
            }  else if (this.email == '') {
                this.outputError(8);
            }  {this.error = ''}

            if (this.error !== '') return;

            this.loginAnimation = false;
        
        },
        outputError(error) {

            switch (error) {
                case 0: 
                    this.error = "Give me some data to work with, fool.";
                    break;
                case 1: 
                    this.error = "You can't sign up without an email.";
                    break;
                case 2: 
                    this.error = "Bro, how you gonna login without a password?";
                    break;
                case 3: 
                    this.error = "Give us a creative handle or else...";
                    break;
                case 4: 
                    this.error = "You forgot to enter your first name.";
                    break;
                case 5: 
                    this.error = "The last name too, pal.";
                    break;
                case 6:
                    this.error = "Passwords don't match.";
                    break;
                case 7:
                    this.error = "You uploaded too many profile photos. Try again.";
                    break;
                case 8:
                    this.error = "We need to know where to spam you. Come on.";
                    break;
                case 9:
                    this.error = "Try to be unique. Someone else already took that handle.";
                    break;
                default:
                    this.error = "default";
                    break;
            } 
           
        },
        checkForInput() {
            if (this.handle !== '' && this.psswd !== '') {
                this.loginAnimation = true;
            }
        },
        // async updateProfilePhoto(imgFile) {
        //     let src = "";
        //     let that = this;
        //     let imageAttachment = new Image.ImageAttachment(imgFile);
            
        //     await imageAttachment.toBase64Image(window.URL.createObjectURL(imgFile), function(dataUrl) {
        //       console.log('RESULT:', dataUrl)
        //       src = dataUrl;
        //         console.log("after calling toDataURL");
        //         that.picPreview = src;
        //     })
        // }, 
        async callServices() {
            if (this.uploadPhoto == "") {
                alert ("You must upload a profile photo to proceed"); 
                return false;
            }
            this.apiService.setURL("users/signup");
            this.apiService.setData({handle: this.handle, password: this.psswd, firstName: this.firstName, lastName: this.lastName, email: this.email});
            let signUpResponse = await this.apiService.startService();
            signUpResponse = JSON.parse(signUpResponse.data.body);
            console.log(signUpResponse);
            if (JSON.parse(signUpResponse).authToken != "") {
                this.setToken(JSON.parse(signUpResponse).authToken);
                this.apiService.setURL("users/" + this.handle + "/profilephoto");
                
                console.log("this.uploadPhoto: " + this.uploadPhoto);
                
                this.apiService.setData({authToken: JSON.parse(signUpResponse).authToken, file: this.uploadPhoto});
                
                let profilePicUpdate = await this.apiService.startService();
                console.log(profilePicUpdate);
                return true;
            } else return false;
            
        }

    },

});