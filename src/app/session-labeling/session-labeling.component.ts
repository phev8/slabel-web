import { Component,  OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Observable, of as observableOf } from 'rxjs';

import { DataService } from '../services/data.service';
import { LabelSet, LabelTemplateNode, LabelTemplateFlatNode } from '../models/labelset.model';


@Component({
  selector: 'app-session-labeling',
  templateUrl: './session-labeling.component.html',
  styleUrls: ['./session-labeling.component.scss']
})
export class SessionLabelingComponent implements OnInit {
  labelsets: Array<LabelSet>;
  selectedLabelSet: number;

  treeControl: FlatTreeControl<LabelTemplateFlatNode>;
  treeFlattener: MatTreeFlattener<LabelTemplateNode, LabelTemplateFlatNode>;
  dataSource: MatTreeFlatDataSource<LabelTemplateNode, LabelTemplateFlatNode>;
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<LabelTemplateFlatNode, LabelTemplateNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<LabelTemplateNode, LabelTemplateFlatNode>();

  /** The selection for checklist */
  checklistSelection = new SelectionModel<LabelTemplateFlatNode>(false /* if multiple */);

  constructor(
    private dataService: DataService
  ) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this._getLevel,
      this._isExpandable, this._getChildren);
    this.treeControl = new FlatTreeControl<LabelTemplateFlatNode>(this._getLevel, this._isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    dataService.dataChange.subscribe(data => this.dataSource.data = data);
  }

  ngOnInit() {
    this.dataService.labelsetsChanged.subscribe(
      (data) => {
        this.labelsets = data;
        if (this.labelsets.length > 0 ) {
          this.selectedLabelSet = this.labelsets[0].ID;
          this.changeLabelSet(this.selectedLabelSet);
        }
      }
    );

    this.dataService.fetchLabelSets().subscribe();
  }

  changeLabelSet(id: number) {
    console.log(id);
    this.dataService.fetchLabelSet(this.selectedLabelSet).subscribe();
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
}
