import { IMIDIAccess, MIDIVal } from "../../src/index";

const inputsContainer = document.querySelector("#midi-inputs");
const outputsContainer = document.querySelector("#midi-outputs");

const renderInput = (access: IMIDIAccess) => {
    const ul = document.createElement("ul");
    access.inputs.forEach(input => {
        const li = document.createElement("li");
        li.innerHTML = input.name + " (" + input.manufacturer + ")";
        ul.appendChild(li);
    });
    inputsContainer.replaceChildren(ul);
}

const renderOutput = (access: IMIDIAccess) => {
    const ul = document.createElement("ul");
    access.outputs.forEach(output => {
        const li = document.createElement("li");
        li.innerHTML = output.name + " (" + output.manufacturer + ")";
        ul.appendChild(li);
    });
    outputsContainer.replaceChildren(ul);
}

const render = (access: IMIDIAccess) => {
    renderInput(access);
    renderOutput(access);
}

const connect = () => {
    MIDIVal.connect()
    .then(access => {
        render(access);
        MIDIVal.onInputDeviceConnected(() =>
            renderInput(access));
        MIDIVal.onInputDeviceDisconnected(() => {
            renderInput(access)
        });

        MIDIVal.onOutputDeviceConnected(() => renderOutput(access));
        MIDIVal.onOutputDeviceDisconnected(() => renderOutput(access));
    });
}

connect();