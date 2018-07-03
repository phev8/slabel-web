import { Component,  OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { Observable, of as observableOf } from 'rxjs';

import { DataService } from '../services/data.service';
import { LabelSet, LabelTemplateNode, LabelTemplateFlatNode } from '../models/labelset.model';
import { Session, Label } from '../models/session.model';

import * as moment from 'moment';

@Component({
  selector: 'app-session-labeling',
  templateUrl: './session-labeling.component.html',
  styleUrls: ['./session-labeling.component.scss']
})
export class SessionLabelingComponent implements OnInit {
  displayedColumns: string[] = ['label', 'start', 'end', 'subject', 'created_by', 'action'];
  sessionLabelsDataSource = new MatTableDataSource<Label>();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  labelsets: Array<LabelSet>;
  selectedLabelSet: number;

  currentSession: Session;
  sessionName = '';
  sessionDate = new Date();
  sessionID = 0;
  nameUpdating = false;

  realTimeMode = true;
  labelEventStarted = false;
  currentLabelDescription = '';
  subjectName = '';
  labelStart = '';
  labelEnd = '';

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
    private dataService: DataService,
    private route: ActivatedRoute
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

    this.dataService.currentSessionChanged.subscribe(
      (data) => {
        this.currentSession = data;
        this.sessionName = this.currentSession.session_name;
        this.sessionDate = this.currentSession.start_date;
        this.sessionLabelsDataSource.data = this.currentSession.labels.slice().reverse();
      }
    );

    this.dataService.fetchLabelSets().subscribe();

    this.route.params.subscribe(
      (params) => {
        this.sessionID = +params['id'];
        this.dataService.fetchSession(this.sessionID).subscribe();
      }
    );

    this.sessionLabelsDataSource.paginator = this.paginator;
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
    if (this.labelEventStarted) {
      if (!confirm('Label event is running, do you really want to change the current label (this will be saved at the end of the event)?')) {
        return;
      }
    }
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    if (this.checklistSelection.isSelected(node)) {
      const treePath = this.getLabelTree([node]);

      this.currentLabelDescription = '[';
      treePath.forEach(label => {
        this.currentLabelDescription +=
          '{"id":"' + label.ID.toString() + '","description":"' + label.description + '"},';
      });
      this.currentLabelDescription = this.currentLabelDescription.slice(0, -1);
      this.currentLabelDescription += ']';
    }
  }

  getLabelTree(selectedNodes: LabelTemplateFlatNode[]): LabelTemplateFlatNode[] {
    const parent = this.findParent(selectedNodes[selectedNodes.length - 1]);
    if (!parent) {
      return selectedNodes;
    }
    selectedNodes.push(parent);
    return this.getLabelTree(selectedNodes);

  }

  findParent(node: LabelTemplateFlatNode): LabelTemplateFlatNode {
    if (node.parent_id === 0) {
      return null;
    }
    return this.treeControl.dataNodes.find(x => x.ID === node.parent_id);
  }

  toggleNode(node) {
    if (this.treeControl.isExpanded(node)) {
      this.treeControl.collapseDescendants(node);
    } else {
      this.treeControl.expand(node);
    }
  }

  isNameChangedBtnDisabled(): boolean {
    if (!this.currentSession) {
      return true;
    }
    return this.sessionName === this.currentSession.session_name && this.sessionDate === this.currentSession.start_date;
  }

  saveSessionName() {
    // Update labelset
    this.currentSession.session_name = this.sessionName;
    this.currentSession.start_date = this.sessionDate;
    this.nameUpdating = true;
    this.dataService.updateSession(this.currentSession).subscribe(
      (data) => {
        this.nameUpdating = false;
      }
    );
  }

  startLabelEvent() {
    if (this.subjectName === '') {
      alert('Please enter a subject name, before start to record an event.');
      return;
    }
    this.labelEventStarted = true;
    this.labelStart = moment().unix().toString();
  }

  stopLabelEvent() {
    this.labelEventStarted = false;
    this.labelEnd = moment().unix().toString();
    this.addNewLabel();
  }

  addNewLabel() {
    const newLabel = new Label(
      {
        description: this.currentLabelDescription,
        subject: this.subjectName,
        start: parseFloat(this.labelStart),
        end: parseFloat(this.labelEnd),
        created_by: this.dataService.username,
        session_id: this.currentSession.ID
      }
    );

    this.dataService.createLabel(newLabel).subscribe();
  }

  deleteLabel(id: number) {
    if (confirm('Do you realy want to remove this label?')) {
      this.dataService.removeLabel(id, this.sessionID).subscribe();
    }
  }
}
