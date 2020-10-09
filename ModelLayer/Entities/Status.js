var status =  class Status {
    
    constructor(statusId, author, statusText, attachments, dateSort, datePosted, timePosted) {
        
        if (statusId != undefined) {
            
            this.setStatusId(statusId);
        }
        if (author != undefined) {
            
            this.setAuthor(author);
        }
        if (statusText != undefined) {
            
            this.setStatusText(statusText);
        }
        if (attachments != undefined) {
            
            this.setAttachments(attachments);
        }
        if (dateSort != undefined) {
            
            this.setDateSort(dateSort);
        }
        if (datePosted != undefined) {
            
            this.setDatePosted(datePosted);
        }
        if (timePosted != undefined) {
            
            this.setTimePosted(timePosted);
        }
    }
    
    setStatusId(statusId) {
        this.statusId = statusId;    
    }
    
    setAuthor(handle) {
        
        this.author = handle;
    }
    
    setStatusText(statusText) {
        this.statusText = statusText;
    }
    
    setAttachments(attachments) {
        this.attachments = attachments;
    }
    
    setDateSort(dateSort) {
        this.dateSort = dateSort;
    }
    setDatePosted(datePosted) {
        this.datePosted = datePosted;
    }
    setTimePosted(timePosted) {
        this.timePosted = timePosted;
    }
}
