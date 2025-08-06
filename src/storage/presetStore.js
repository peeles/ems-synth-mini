import {acceptHMRUpdate, defineStore} from 'pinia';
import {ref, watch} from 'vue';
import {useModuleRegistry} from '@/composables/useModuleRegistry';
import {usePatchStore} from './patchStore';
import {useSynthStore, DEFAULTS} from './synthStore';

import leadSynth from '@/presets/lead-synth.json';
import bassDrone from '@/presets/bass-drone.json';
import noiseFx from '@/presets/noise-fx.json';

export const usePresetStore = defineStore('presets', () => {
    const STORAGE_KEY = 'user_presets_v1';
    const patchStore = usePatchStore();
    const synthStore = useSynthStore();
    const registry = useModuleRegistry();

    const builtinPresets = [leadSynth, bassDrone, noiseFx];
    const userPresets = ref([]);

    const loadFromStorage = () => {
        if (typeof window === 'undefined') return;
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return;
        try {
            userPresets.value = JSON.parse(stored);
        } catch {}
    };

    const saveToStorage = () => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userPresets.value));
    };

    watch(userPresets, saveToStorage, {deep: true});

    loadFromStorage();

    const snapshotParams = () => ({
        vcoFrequency: synthStore.vcoFrequency,
        vcoWaveform: synthStore.vcoWaveform,
        lfoFrequency: synthStore.lfoFrequency,
        lfoWaveform: synthStore.lfoWaveform,
        filterCutoff: synthStore.filterCutoff,
        filterResonance: synthStore.filterResonance,
        filterType: synthStore.filterType,
        envelopeAttack: synthStore.envelopeAttack,
        envelopeDecay: synthStore.envelopeDecay,
        vcoLevel: synthStore.vcoLevel,
        noiseLevel: synthStore.noiseLevel,
        vcaMode: synthStore.vcaMode,
    });

    const applyParams = params => {
        if (!params) return;
        synthStore.setVcoFrequency(
            params.vcoFrequency ?? synthStore.vcoFrequency
        );
        synthStore.setVcoWaveform(params.vcoWaveform ?? synthStore.vcoWaveform);
        synthStore.setLfoFrequency(
            params.lfoFrequency ?? synthStore.lfoFrequency
        );
        synthStore.setLfoWaveform(params.lfoWaveform ?? synthStore.lfoWaveform);
        synthStore.setFilterCutoff(
            params.filterCutoff ?? synthStore.filterCutoff
        );
        synthStore.setFilterResonance(
            params.filterResonance ?? synthStore.filterResonance
        );
        synthStore.setFilterType(params.filterType ?? synthStore.filterType);
        synthStore.setEnvelopeAttack(
            params.envelopeAttack ?? synthStore.envelopeAttack
        );
        synthStore.setEnvelopeDecay(
            params.envelopeDecay ?? synthStore.envelopeDecay
        );
        const vcoLvl = params.vcoLevel ?? synthStore.vcoLevel;
        const noiseLvl = params.noiseLevel ?? synthStore.noiseLevel;
        synthStore.setMixerLevels(vcoLvl, noiseLvl);
        synthStore.setVcaMode(params.vcaMode ?? synthStore.vcaMode);
    };

    const savePreset = name => {
        if (!name) return;
        const preset = {
            name,
            params: snapshotParams(),
            patches: patchStore.patches.map(p => ({from: p.from, to: p.to})),
        };
        const idx = userPresets.value.findIndex(p => p.name === name);
        if (idx !== -1) userPresets.value[idx] = preset;
        else userPresets.value.push(preset);
    };

    const loadPreset = preset => {
        if (!preset) return;
        patchStore.resetPatches();
        applyParams(preset.params);
        preset.patches?.forEach(p => {
            const fromModule = registry.get(p.from.id);
            const toModule = registry.get(p.to.id);
            if (fromModule && toModule) {
                patchStore.connectNodes(
                    fromModule,
                    p.from.index,
                    toModule,
                    p.to.index
                );
            }
        });
    };

    const findPreset = name =>
        builtinPresets.find(p => p.name === name) ||
        userPresets.value.find(p => p.name === name);

    const loadPresetByName = name => {
        const preset = findPreset(name);
        loadPreset(preset);
    };

    const resetToDefault = () => {
        applyParams(DEFAULTS);
        patchStore.resetPatches();
    };

    return {
        builtinPresets,
        userPresets,
        savePreset,
        loadPresetByName,
        resetToDefault,
    };
});

export default usePresetStore;

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(usePresetStore, import.meta.hot));
}
