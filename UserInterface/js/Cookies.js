export class Cookies {
    
    constructor() {
        
    }
    
    setCookieLifeSpan(authToken, minutes) {
        if (authToken == undefined || null) {
            return;
        }
        if (minutes == undefined || minutes == null) {
            minutes = 60;   
        }
        
        var secondsPerMin = 60;
        var millisecondsPreSecond = 1000;
        var inBlanksMinutes = new Date(new Date().getTime() + minutes * secondsPerMin * millisecondsPreSecond);
               
        Cookies.set('authToken', authToken, {
            expires: inBlanksMinutes
        });
    }
    
    destroyCookie() {
        var a = document.createElement('a');
        a.href='./Following.html';
        a.click();
    }
    
}
