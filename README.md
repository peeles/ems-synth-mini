# EMS Synth 100 Mini

## Overview

**EMS Synth 100 Mini** is a browser‑based synthesiser inspired by the EMS Synth 100 modular system. It is implemented with
Vue 3 and the Web Audio API and aims to provide a modular patchable environment in the browser. Each module is represented
as its own component, and users can drag virtual patch cables between jacks to build unique sounds.

### Features

* **Modular architecture** – on‑screen panels represent common synthesiser modules such as oscillators, filters, amplifiers,
mixers, low‑frequency oscillators, noise generators, envelope generators and an output stage.
* **Patch bay** – drag from an output jack to an input jack to create a connection. Multiple outputs can feed one input, 
and vice versa. Patch colours help identify connections.
* **State management** – the application uses Pinia for shared state. Patches and module settings persist across sessions 
via browser storage, and undo/redo is supported for patch operations.

## Modules

### Voltage‑Controlled Oscillator (VCO)

Generates audio waveforms. Each VCO offers sine, square, saw and triangle outputs with adjustable frequency. Two outputs
allow multiple destinations.

### Voltage‑Controlled Filter (VCF)

Applies frequency‑dependent attenuation. The filter offers low‑pass and band‑pass modes with adjustable cutoff frequency 
and resonance (Q). The output may be modulated via external control voltages.

### Voltage‑Controlled Amplifier (VCA)

Controls signal amplitude. It includes an envelope follower and a mix mode switch, allowing the envelope generator to 
shape amplitude linearly or exponentially. A manual level control sets the overall gain.

### Mixer

Combines signals. Four input channels each have independent level controls. An inverter channel provides phase inversion
for creative routing. The summed output can be patched to other modules or the master output.

### Low‑Frequency Oscillator (LFO)

Produces slow modulation signals (sine, square, saw, triangle) for vibrato, tremolo and other effects. The rate is 
adjustable, and the output can modulate any compatible parameter via patching.

### Noise Generator

Emits white noise by filling an audio buffer with random samples. Use it to create percussive sounds or to modulate other
parameters.

### Envelope Generator

Generates a transient control signal when triggered. Attack and decay times are adjustable. Envelopes are typically 
patched to VCAs or filters to shape amplitude or timbre.

### Master Output

Acts as the final stage. It provides a stereo output, mute control, and a normalise function that scales the mix to 
maximise headroom. Level meters display peak levels for the left and right channels.

## Using the Synthesiser

1. **Drag cables** between jacks to patch modules. Outputs and inputs are type‑checked to prevent invalid connections.
2. **Adjust parameters** with sliders, knobs and switches on each module’s panel. For example, slide the VCF cutoff frequency, toggle the VCA mix mode, or change the LFO waveform.
3. **Trigger envelopes** via the envelope generator’s button or by patching a signal into its trigger input. The envelope shapes the amplitude or filter cutoff when connected to VCAs or VCFs.
4. **Monitor levels** on the master panel. Use the normalise button to scale the mix if the output is too quiet or clipping.
5. **Undo/redo** patch operations using the arrows in the patch bay. Patches and settings persist to local storage, so your work is saved across sessions.

## Running Locally

The project requires Node-16 or later. Use the following commands to run a development server:

