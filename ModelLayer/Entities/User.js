export class User {
    constructor(handle, password, firstName, lastName, email) {
        
        if (firstName != null) {
            this.firstName = firstName;
        }
        
        if (lastName != null) {
            this.lastName = lastName;
        }
        
        if (handle != null) {
            this.handle = handle;
        }
        
        if (email != null) {
            this.email = email;
        }
        
        if (password != null) {
            this.password = password;
        }
        
    }

    addFollower(user) {
        this.followers.push(user);
    }
    
    getHandle() {
        return this.handle;
    }
}
