

export class Events {
    public eventName: string;
    //public eventPicture: string;
    public eventDate: string;
    public eventDateEnding: string;
    public eventHour: string;
    public eventHourEnding: string;
    public eventPublisher: string;
    public eventDescription: string;
    public eventGenre: string;
    public eventCosts: number;
    public eventPic: any;
    public eventID: number;

    constructor(eventName: string, eventDate: string, eventDateEnding: string, eventHour: string, eventHourEnding: string, eventPublisher: string, eventDescription: string, eventGenre:string, eventCosts: number, eventPic: any, eventID: number) {
        this.eventName = eventName;
        this.eventDate = eventDate;
        this.eventDateEnding = eventDateEnding;
        this.eventHour = eventHour;
        this.eventHourEnding = eventHourEnding;
        this.eventPublisher = eventPublisher;
        this.eventDescription = eventDescription;
        this.eventGenre = eventGenre;
        this.eventCosts = eventCosts;
        this.eventPic = eventPic;
        this.eventID = eventID;
    }
}