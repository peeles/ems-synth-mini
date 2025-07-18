# ems-synth-100

A browser based experiment inspired by the EMS Synthi 100 modular synthesiser. The app is built with Vue 3 and Web Audio and aims to model a small selection of the original machine's modules.

## Getting started

```bash
# install dependencies
yarn install
# run the development server
yarn dev
```

Use `yarn build` to create a production bundle and `yarn preview` to serve it locally.

### Formatting

Run `yarn lint` to check formatting with Prettier and ESLint. To automatically fix issues run `yarn format`.

## Available modules

The interface exposes a simplified set of modules which can be patched together:

- **Voltage Oscillator (VCO)** – adjustable frequency and waveform.
- **Voltage Controlled Filter (VCF)** – low‑pass, high‑pass or band‑pass with cutoff and resonance controls.
- **LFO Modulator** – low‑frequency oscillator for modulation or ring‑mod.
- **Mixer** – mixes the VCO and Noise generator levels.
- **Noise Generator** – white noise source with level control.
- **Envelope Generator** – attack and decay sliders and a manual trigger button.
- **VCA** – gain stage whose behaviour is set with the *Mix Mode* slider.
- **Inverter** – simple phase‑inverting utility.
- **Master Output** – final stage with oscilloscope display.
- **Master Volume** – stereo level meter and output level control.
- **Input Module** – placeholder sliders representing external sources.
- **Slider Keyboard** – touch strip that sets the VCO frequency and triggers the envelope.

## Patching

Click an output jack and then an input jack to connect them. Clicking the same pair again removes the cable. Multiple outputs can be patched into the same input — the Web&nbsp;Audio graph simply sums those signals. Likewise an output can feed several inputs at once.

Removing a module automatically clears any of its cables.

## VCA Mix Mode

The VCA's slider blends between an amplitude envelope and ring modulation from the LFO:

- **0** – the VCA follows only the envelope (attack/decay).
- **1** – pure ring modulation from the LFO.
- **0‑1** – values in between mix the two. Labels such as "Sine Wave" or "Exponential" are currently descriptive only; the implementation is a simple linear blend.

Triggering the envelope is still possible in ring‑mod mode but its effect diminishes as the slider approaches 1.

## Current limitations

- This is a lightweight recreation and does not attempt to reproduce the real Synthi 100 circuitry.
- The Input Module does not yet connect to actual audio input.
- Patch connections are not persisted between sessions.
- Large numbers of summed signals may clip.
