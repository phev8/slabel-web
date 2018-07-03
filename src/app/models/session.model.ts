export class Session {
    ID: number;
    session_name: string;
    start_date: Date;
    labels: Label[];

    constructor(object?: {}) {
        if (object) {
            Object.assign(this, object);
        }
    }
}

export class Label {
    ID: number;
    description: string;
    subject: string;
    start: number;
    end: number;
    session_id: number;
    created_by: string;

    constructor(object?: {}) {
        if (object) {
            Object.assign(this, object);
        }
    }
}
