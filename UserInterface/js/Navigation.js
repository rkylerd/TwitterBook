export class Navigation {
    
    constructor() {
        
    }
    
    goToFollowers() {
        var a = document.createElement('a');
        a.href='./Followers.html';
        a.click();
    }
    
    goToFollowing() {
        var a = document.createElement('a');
        a.href='./Following.html';
        a.click();
    }
    
    goToUser() {
        
        var a = document.createElement('a');
        a.href='./UserPage.html';
        a.click();
        
    }
    
    goToFeed() {
        var a = document.createElement('a');
        a.href='./Feed.html';
        a.click();
    }
    
    goToSingleStatus() {
        
        var a = document.createElement('a');
        a.href = a.href = './SingleStatus.html';;
        a.click();
    }
    
    goToSite(URL) {
        
        var a = document.createElement('a');
        a.target = '_blank';
        a.href=URL;
        a.click();
    }
    
    goToHashtag() {
        
        var a = document.createElement('a');
        a.href= './Hashtags.html';
        a.click();
    }
    
    login() {
        var a = document.createElement('a');
        a.href='./Login.html';
        a.click();
    }
     
     signUp() {
        var a = document.createElement('a');
        a.href='./SignUp.html';
        a.click();
    }
    
    signOut() {
        var a = document.createElement('a');
        a.href='./SignedOut.html';
        a.click();
    }
    
    seeAllUsers() {
        var a = document.createElement('a');
        a.href='./AllUsers.html';
        a.click();
    }
}
