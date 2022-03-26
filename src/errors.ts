export class MIDIValError extends Error {
    constructor(message: string) {
        super(message);
    }

    get name() {
        return this.constructor.name;
    }
}

export class MIDIValConfigurationError extends MIDIValError {
    
}