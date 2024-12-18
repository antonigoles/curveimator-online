export default class ProjectSignature {
    uid: string;

    constructor(uid: string) {
        this.uid = uid;
    }

    static fromEncoded(buffer: string): ProjectSignature {
        const keys = buffer.split('-');
        if ( keys[0] != 'signature' || keys[1] != 'project' )
            throw new Error('Not a ProjectSignature');
        
        return new ProjectSignature(keys[2]);
    }

    encode(): string {
        // parse buffer here
        return `signature-project-${this.uid}`;
    }
}