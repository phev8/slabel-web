import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { LabelSet, LabelTemplateNode } from '../models/labelset.model';
import { Session, Label } from '../models/session.model';
import { BehaviorSubject, Subject, Observable, of as observableOf } from 'rxjs';
import { tap } from 'rxjs/operators';



const LABELSET_DATA = JSON.stringify([
    {ID: 1, description: 'root label 1', parent_id: 0, labelset_id: 1, children: [{ID: 2}, {ID: 3}]},
    {ID: 2, description: 'label 2', parent_id: 1, labelset_id: 1, children: [{ID: 6}, {ID: 7}]},
    {ID: 3, description: 'label 3', parent_id: 1, labelset_id: 1, children: []},
    {ID: 4, description: 'root label 2', parent_id: 0, labelset_id: 1, children: [{ID: 5}]},
    {ID: 5, description: 'label 4', parent_id: 4, labelset_id: 1, children: []},
    {ID: 6, description: 'label 5', parent_id: 2, labelset_id: 1, children: []},
    {ID: 7, description: 'label 6', parent_id: 2, labelset_id: 1, children: []}
  ]);

interface LabelsetsResponse {
    labelsets: LabelSet[];
}

interface LabelsetResponse {
    labelset: LabelSet;
}

interface SessionsResponse {
    sessions: Session[];
}

interface SessionResponse {
    session: Session;
}

@Injectable()
export class DataService {
    username: string;
    dataChange = new BehaviorSubject<LabelTemplateNode[]>([]);

    labelsets: Array<LabelSet>;
    labelsetsChanged = new Subject<LabelSet[]>();

    sessions: Array<Session>;
    sessionsChanged = new Subject<Session[]>();

    currentSession: Session;
    currentSessionChanged = new Subject<Session>();

    apiAddr = 'http://localhost:65432/api/v1';

    constructor(
        private http: HttpClient
    ) {
        this.username = "todo in dataservice";
        this.labelsets = new Array<LabelSet>();
    }

    // Username methods
    setUsername(newUser: string) {
        this.username = newUser;
    }

    isLoggedIn(): boolean {
        if (!this.username || this.username.length <= 0) {
            return false;
        }
        return true;
    }

    // Labelset methods:
    fetchLabelSets() {
        const url = this.apiAddr + '/labelset';
        return this.http.get<LabelsetsResponse>(url).pipe(
            tap(
                data => {
                    this.labelsets = data.labelsets.map(x => new LabelSet(x));
                    this.labelsetsChanged.next(this.labelsets.slice());
                    return 'labelset list received';
                }
            ));
    }

    fetchLabelSet(id: number) {
        const url = this.apiAddr + '/labelset/labels';
        const params = new HttpParams().set('id', id.toString());
        const options = {
            params: params
        };

        return this.http.get<LabelsetResponse>(url, options).pipe(
            tap(
                data => {
                    const newData = this.buildNestedObject(data.labelset.labels);
                    // Notify the change.
                    this.dataChange.next(newData);
                    return data.labelset;
                }
            ));
    }

    createLabelSet() {
        const labelset = new LabelSet();
        const url = this.apiAddr + '/labelset';
        return this.http.post<LabelsetResponse>(url, labelset).pipe(
            tap(
                (data) => {
                    const newData = this.buildNestedObject(data.labelset.labels);
                    // Notify the change.

                    this.dataChange.next(newData);
                    return data.labelset;
        }));
    }

    updateLabelSet(ls: LabelSet) {
        const url = this.apiAddr + '/labelset';
        return this.http.put<LabelsetResponse>(url, ls).pipe(
            tap(
                (data) => {
                    const newData = this.buildNestedObject(data.labelset.labels);
                    // Notify the change.
                    this.dataChange.next(newData);
                    return data.labelset;
        }));
    }

    deleteLabelSet(id: number) {
        const url = this.apiAddr + '/labelset';
        const params = new HttpParams().set('id', id.toString());
        const options = {
            params: params
        };
        return this.http.delete(url, options);
    }

    get labelsetData(): LabelTemplateNode[] { return this.dataChange.value; }


    buildNestedObject(dataObject: Array<Object>): LabelTemplateNode[] {
        if (!dataObject) {
            return new Array<LabelTemplateNode>();
        }
        return dataObject.reduce<LabelTemplateNode[]>((accumulator, key) => {
            const currentNode = new LabelTemplateNode(key);
            if (currentNode.parent_id <= 0) {
                const children = this.findLabeltemplateChildren(currentNode.children, dataObject);
                if (children.length > 0) {
                    currentNode.children = children;
                } else {
                    currentNode.children = null;
                }
                return accumulator.concat(currentNode);
            }
            return accumulator;
        }, []);
    }

    findLabeltemplateChildren(children_ids: Array<{ID: number}>, dataArray: Array<Object>): LabelTemplateNode[] {
        const children_IDs = children_ids.reduce((accumulator, key) => {
            return accumulator.concat(key.ID);
        }, []);

        const children = new Array<LabelTemplateNode>();
        dataArray.forEach( (item) => {
            const cItem = new LabelTemplateNode(item);
            if (children_IDs.includes(cItem.ID)) {
                if (cItem.children.length > 0) {
                    cItem.children = this.findLabeltemplateChildren(cItem.children, dataArray);
                }
                children.push(cItem);
            }
        });
        return children.splice(0, children.length);
    }

    createLabelTemplateItem(label: LabelTemplateNode) {
        const url = this.apiAddr + '/labelset/label';
        return this.http.post<LabelsetResponse>(url, label).pipe(
            tap(
                (data) => {
                    this.fetchLabelSet(label.labelset_id).subscribe();
        }));
    }

    updateLabelTemplateItem(label: LabelTemplateNode) {
        const url = this.apiAddr + '/labelset/label';
        return this.http.put<LabelsetResponse>(url, label).pipe(
            tap(
                (data) => {
                    this.fetchLabelSet(label.labelset_id).subscribe();
        }));
    }

    deleteLabelTemplateItem(id: number) {
        const url = this.apiAddr + '/labelset/label';
        const params = new HttpParams().set('id', id.toString());
        const options = {
            params: params
        };
        return this.http.delete(url, options);
    }

    // Session methods:
    fetchSessions() {
        const url = this.apiAddr + '/session';
        return this.http.get<SessionsResponse>(url).pipe(
            tap(
                data => {
                    this.sessions = data.sessions.map(x => new Session(x));
                    this.sessionsChanged.next(this.sessions.slice());
                    return 'session list received';
                }
            ));
    }

    fetchSession(id: number) {
        const url = this.apiAddr + '/session/labels';
        const params = new HttpParams().set('id', id.toString());
        const options = {
            params: params
        };

        return this.http.get<SessionResponse>(url, options).pipe(
            tap(
                data => {
                    this.currentSession = data.session;
                    // Notify the change.
                    this.currentSessionChanged.next(this.currentSession);
                    return data.session;
                }
            ));
    }

    createSession(session: Session) {
        const url = this.apiAddr + '/session';
        return this.http.post<SessionResponse>(url, session).pipe(
            tap(
                (data) => {
                    this.currentSession = data.session;
                    // Notify the change.
                    this.currentSessionChanged.next(this.currentSession);
                    this.fetchSessions().subscribe();
                    return data.session;
        }));
    }

    updateSession(ls: Session) {
        const url = this.apiAddr + '/session';
        return this.http.put<SessionResponse>(url, ls).pipe(
            tap(
                (data) => {
                    this.currentSession = data.session;
                    // Notify the change.
                    this.currentSessionChanged.next(this.currentSession);
                    return data.session;
        }));
    }

    deleteSession(id: number) {
        const url = this.apiAddr + '/session';
        const params = new HttpParams().set('id', id.toString());
        const options = {
            params: params
        };
        return this.http.delete(url, options);
    }

    createLabel(label: Label) {
        const url = this.apiAddr + '/session/label';
        return this.http.post<SessionResponse>(url, label).pipe(
            tap(
                (data) => {
                    this.fetchSession(label.session_id).subscribe();
        }));
    }

    removeLabel(id: number, currentSessionID: number) {
        const url = this.apiAddr + '/session/label';
        const params = new HttpParams().set('id', id.toString());
        const options = {
            params: params
        };
        return this.http.delete(url, options).pipe(
            tap(
                (data) => {
                    this.fetchSession(currentSessionID).subscribe();
        }));
    }
}
