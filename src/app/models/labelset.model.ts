export class LabelTemplateNode {
    ID: number;
    children: LabelTemplateNode[];
    description: string;
    parent_id: number;
    labelset_id: number;

    constructor(object?: {}) {
        if (object) {
            Object.assign(this, object);
        }
    }
}

  /** Flat node with expandable and level information */
export class LabelTemplateFlatNode {
    constructor(
        public expandable: boolean,
        public level: number,
        public description: string,
        public parent_id: number,
        public labelset_id: number,
        public ID: number
    ) {}
}
