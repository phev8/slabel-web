import { Component } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Observable, of as observableOf } from 'rxjs';

import { DataService } from '../services/data.service';
import { LabelTemplateNode, LabelTemplateFlatNode } from '../models/labelset.model';




@Component({
  selector: 'app-labelset-creator',
  templateUrl: './labelset-creator.component.html',
  styleUrls: ['./labelset-creator.component.scss'],
})
export class LabelsetCreatorComponent {
  treeControl: FlatTreeControl<LabelTemplateFlatNode>;
  treeFlattener: MatTreeFlattener<LabelTemplateNode, LabelTemplateFlatNode>;
  dataSource: MatTreeFlatDataSource<LabelTemplateNode, LabelTemplateFlatNode>;

  labelsetName = 'test';

  /** The selection for checklist */
  checklistSelection = new SelectionModel<LabelTemplateFlatNode>(false /* if multiple */);

  constructor(dataService: DataService) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this._getLevel,
      this._isExpandable, this._getChildren);
    this.treeControl = new FlatTreeControl<LabelTemplateFlatNode>(this._getLevel, this._isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    dataService.dataChange.subscribe(data => this.dataSource.data = data);
  }

  transformer = (node: LabelTemplateNode, level: number) => {
    return new LabelTemplateFlatNode(node.children.length > 0, level, node.description, node.parent_id, node.labelset_id, node.ID);
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
