import { Injectable } from '@angular/core';

@Injectable()
export class DataService {
    username: string;

    constructor() {
        this.username = "todo in dataservice";
    }

    setUsername(newUser: string) {
        this.username = newUser;
    }

    isLoggedIn(): boolean {
        if (!this.username || this.username.length <= 0) {
            return false;
        }
        return true;
    }

}
