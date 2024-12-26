export default class KeyframeableProperty {
    private parent: KeyframeableProperty|null;
    private children: KeyframeableProperty[];
    private propName: string;
    private prettyName: string;
    constructor(
        propName: string,
        prettyName: string|null = null,
        parent: KeyframeableProperty|null = null,
        children: KeyframeableProperty[]|null = null,
    ) {
        this.propName = propName;
        this.parent = parent;
        if(children) this.children = children;
        else this.children = [];
        if (prettyName) this.prettyName = prettyName;
        else this.prettyName = propName;
    }

    public assignParent(parent: KeyframeableProperty): void {
        this.parent = parent;
        if(!parent.children.includes(this)) parent.addChild(this);
    }

    public addChild(child: KeyframeableProperty): void {
        this.children.push(child);
        if(child.parent !== this) child.assignParent(this);
    }

    getPrettyName(): string {
        return this.prettyName;
    }

    getFullPropertyPath(): string {
        return `${this.parent?this.parent.getFullPropertyPath()+".":''}${this.propName}`;
    }

    isLeaf(): boolean {
        return this.children.length <= 0;
    }

    isNested(): boolean {
        return Boolean(this.parent);
    }

    nestDepth(): number {
        return this.parent?this.parent.nestDepth()+1:1;
    }

    getChildren(): KeyframeableProperty[] {
        return this.children;
    }
}