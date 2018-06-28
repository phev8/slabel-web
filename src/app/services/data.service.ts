import { Injectable } from '@angular/core';
import { LabelTemplateNode, LabelTemplateFlatNode } from '../models/labelset.model';
import { BehaviorSubject, Observable, of as observableOf } from 'rxjs';



const LABELSET_DATA = JSON.stringify([
    {ID: 1, description: 'root label 1', parent_id: 0, labelset_id: 1, children: [{ID: 2}, {ID: 3}]},
    {ID: 2, description: 'label 2', parent_id: 1, labelset_id: 1, children: [{ID: 6}, {ID: 7}]},
    {ID: 3, description: 'label 3', parent_id: 1, labelset_id: 1, children: []},
    {ID: 4, description: 'root label 2', parent_id: 0, labelset_id: 1, children: [{ID: 5}]},
    {ID: 5, description: 'label 4', parent_id: 4, labelset_id: 1, children: []},
    {ID: 6, description: 'label 5', parent_id: 2, labelset_id: 1, children: []},
    {ID: 7, description: 'label 6', parent_id: 2, labelset_id: 1, children: []}
  ]);


@Injectable()
export class DataService {
    username: string;
    dataChange = new BehaviorSubject<LabelTemplateNode[]>([]);

    constructor() {
        this.username = "todo in dataservice";
        this.initializeLabelset();
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

    get labelsetData(): LabelTemplateNode[] { return this.dataChange.value; }


    initializeLabelset() {
        // Parse the string to json object.
        const dataObject = JSON.parse(LABELSET_DATA);

        // Build the tree nodes from Json object. The result is a list of `FileNode` with nested
        //     file node as children.
        const data = this.buildNestedObject(dataObject);

        // Notify the change.
        this.dataChange.next(data);
    }

    buildNestedObject(dataObject: Array<Object>): LabelTemplateNode[] {
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
        return children;
    }
}
