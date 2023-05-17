import { Omnibus } from "@hypersphere/omnibus";
import { IMIDIInput } from "../../wrappers/inputs/IMIDIInput";

export interface MPEInputOptions {

}

export class MPEMidivalInput {
    private omnibus: Omnibus = new Omnibus();
    
    constructor(input: IMIDIInput, private readonly options: MPEInputOptions) {
        
    }
}