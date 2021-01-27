import { Rights } from './rights';

export class User {
    public date: Date;
    public rights: Rights;
    public readonly username: any;
    public user_firstName: string;
    public user_secondName: string;
    public user_id: number;

    constructor(date: Date, rights: Rights, username: any, user_firstName: string, user_secondName: string, user_id: number) {
        this.date = date;
        this.rights = rights;
        this.username = username;
        this.user_firstName = user_firstName;
        this.user_secondName = user_secondName;
        this.user_id = user_id;

    }
}
