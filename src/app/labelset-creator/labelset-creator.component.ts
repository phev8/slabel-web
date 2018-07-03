import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Observable, of as observableOf } from 'rxjs';

import { DataService } from '../services/data.service';
import { LabelSet, LabelTemplateNode, LabelTemplateFlatNode } from '../models/labelset.model';




@Component({
  selector: 'app-labelset-creator',
  templateUrl: './labelset-creator.component.html',
  styleUrls: ['./labelset-creator.component.scss'],
})
export class LabelsetCreatorComponent implements OnInit {
  treeControl: FlatTreeControl<LabelTemplateFlatNode>;
  treeFlattener: MatTreeFlattener<LabelTemplateNode, LabelTemplateFlatNode>;
  dataSource: MatTreeFlatDataSource<LabelTemplateNode, LabelTemplateFlatNode>;

  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<LabelTemplateFlatNode, LabelTemplateNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<LabelTemplateNode, LabelTemplateFlatNode>();

  currentLabelset: LabelSet;
  labelSetName = '';
  labelSetID = 0;
  nameUpdating = false;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<LabelTemplateFlatNode>(false /* if multiple */);

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this._getLevel,
      this._isExpandable, this._getChildren);
    this.treeControl = new FlatTreeControl<LabelTemplateFlatNode>(this._getLevel, this._isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    dataService.dataChange.subscribe(data => {
      const currentData = [];
      data.forEach((node) => {
        currentData.push(this.addNewNodeInput(node));
      });
      if (data.length > 0 && data[data.length - 1].ID !== 0) {
        currentData.push(new LabelTemplateNode({ID: 0, description: '', parent_id: 0, labelset_id: this.labelSetID, children: []}));
      } else if (data.length <= 0) {
        currentData.push(new LabelTemplateNode({ID: 0, description: '', parent_id: 0, labelset_id: this.labelSetID, children: []}));
      }
      return this.dataSource.data = currentData;
    });
  }

  ngOnInit() {
    this.route.params.subscribe(
      (params) => {
        this.labelSetID = +params['id'];
        console.log(this.labelSetID);
        if (!this.labelSetID) {
          this.dataService.createLabelSet().subscribe(
            (ls) => {
              this.currentLabelset = ls.labelset;
              this.labelSetName = this.currentLabelset.name;
              this.labelSetID = ls.labelset.ID;
            }
          );
        } else {
          this.dataService.fetchLabelSet(this.labelSetID).subscribe(
            (data) => {
              this.currentLabelset = data.labelset;
              this.labelSetName = this.currentLabelset.name;
            }
          );
        }
      }
    );
  }

  addNewNodeInput(node: LabelTemplateNode): LabelTemplateNode {
    const newNode = Object.assign({}, node);
    if (!newNode.children) {
      newNode.children = new Array<LabelTemplateNode>();
      newNode.children.push(
        new LabelTemplateNode({ID: 0, description: '', parent_id: newNode.ID, labelset_id: newNode.labelset_id, children: []})
      );
    } else if (newNode.children && newNode.children.length === 0) {
      newNode.children = node.children.slice();
      newNode.children.push(
        new LabelTemplateNode({ID: 0, description: '', parent_id: newNode.ID, labelset_id: newNode.labelset_id, children: []})
      );
    } else if (newNode.children && newNode.children.length > 0 ) {
      newNode.children = new Array<LabelTemplateNode>();
      node.children.forEach( (child) => {
        if (child.ID !== 0) {
          newNode.children.push(this.addNewNodeInput(child));
        }
      });
      if (newNode.children[newNode.children.length - 1].ID !== 0) {
        newNode.children.push(
          new LabelTemplateNode({ID: 0, description: '', parent_id: newNode.ID, labelset_id: newNode.labelset_id, children: []})
        );
      }
    }
    return newNode;
  }

  transformer = (node: LabelTemplateNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.ID === node.ID
        ? existingNode
        : new LabelTemplateFlatNode(false, level, node.description, node.parent_id, node.labelset_id, node.ID);

    flatNode.description = node.description;
    flatNode.ID = node.ID;
    flatNode.labelset_id = node.labelset_id;
    flatNode.parent_id = node.parent_id;
    flatNode.level = level;
    flatNode.expandable = !!node.children && node.children.length > 0;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
    // return new LabelTemplateFlatNode(node.children.length > 0, level, node.description, node.parent_id, node.labelset_id, node.ID);
  }

  private _getLevel = (node: LabelTemplateFlatNode) => node.level;

  private _isExpandable = (node: LabelTemplateFlatNode) => node.expandable;

  private _getChildren = (node: LabelTemplateNode): Observable<LabelTemplateNode[]> => observableOf(node.children);

  hasChild = (_: number, _nodeData: LabelTemplateFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: LabelTemplateFlatNode) => _nodeData.ID === 0;

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: LabelTemplateFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result; // && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: LabelTemplateFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
  }

  toggleNode(node) {
    if (this.treeControl.isExpanded(node)) {
      this.treeControl.collapseDescendants(node);
    } else {
      this.treeControl.expand(node);
    }
  }

  isNameChangedBtnDisabled(): boolean {
    if (!this.currentLabelset) {
      return true;
    }
    return this.labelSetName === this.currentLabelset.name;
  }

  saveLabelSetName() {
    // Update labelset
    this.currentLabelset.name = this.labelSetName;
    this.nameUpdating = true;
    this.dataService.updateLabelSet(this.currentLabelset).subscribe(
      (data) => {
        this.currentLabelset = data.labelset;
        this.labelSetName = this.currentLabelset.name;
        this.nameUpdating = false;
      }
    );
  }

  saveNode(node: LabelTemplateFlatNode, description: string) {
    const nestedNode = this.flatNodeMap.get(node);
    nestedNode.description = description;
    nestedNode.labelset_id = this.currentLabelset.ID;
    nestedNode.children = null;
    this.dataService.createLabelTemplateItem(nestedNode).subscribe();
  }

  deleteItem(node: LabelTemplateFlatNode) {
    if (confirm('Do you really want to delete the node and its full subtree?')) {
      this.dataService.deleteLabelTemplateItem(node.ID).subscribe(
        () => {
          this.dataService.fetchLabelSet(this.labelSetID).subscribe();
        }
      );
    }
  }
}
