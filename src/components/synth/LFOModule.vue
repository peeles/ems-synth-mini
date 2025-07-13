<template>
    <SynthPanel :title="'LFO Modulator'">
        <template #heading>
            <section class="flex flex-row items-center justify-end px-8 mb-8">
                <JackPanel
                    :count="1"
                    type="output"
                    :module-id="id"
                    :connected="connectedOutputs"
                    @patch="handlePatch"
                />
            </section>
            <h3
                class="text-center text-wrap text-xl font-medium mb-8 uppercase"
            >
                Low Frequency Oscillator
            </h3>
        </template>

        <div class="mb-1">
            <label class="block text-xs font-semibold mb-1"> Frequency </label>
            <input
                type="range"
                min="0.1"
                max="15"
                step="0.1"
                v-model.number="lfoFrequency"
                class="w-full h-[8px] accent-black bg-black/10 rounded-full"
            />
            <div class="text-center mt-1">{{ lfoFrequency.toFixed(1) }} Hz</div>
        </div>

        <div>
            <label class="block text-xs font-semibold mb-1"> Waveform </label>
            <select
                v-model="lfoWaveform"
                class="w-full text-[10px] px-3 py-1.5 border border-black bg-yellow-50 font-mono uppercase rounded-sm"
            >
                <option value="sine">Sine</option>
                <option value="triangle">Triangle</option>
                <option value="square">Square</option>
                <option value="sawtooth">Sawtooth</option>
            </select>
        </div>
    </SynthPanel>
</template>

<script setup>
import SynthPanel from '../SynthPanel.vue'
import JackPanel from '../JackPanel.vue'
import {computed, onMounted, onUnmounted} from 'vue'
import {useSynthStore} from '../../storage/synthStore'
import {useModuleRegistry} from '../../composables/useModuleRegistry'
import {usePatchStore} from '../../storage/patchStore'

const synth = useSynthStore()
const registry = useModuleRegistry()
const patchStore = usePatchStore()
const id = 'lfo-module'

const getOutputNode = () => synth.getLFOOutputNode?.()

onMounted(() => {
    registry.register(id, { id, getOutputNode })
})

onUnmounted(() => {
    registry.unregister(id)
})

const connectedOutputs = computed(() =>
    patchStore
        .getConnectionsFor(id, true)
        .map(p => p.from.index)
)

const lfoFrequency = computed({
    get: () => synth.lfoFrequency,
    set: val => synth.setLfoFrequency(val),
})

const lfoWaveform = computed({
    get: () => synth.lfoWaveform,
    set: val => synth.setLfoWaveform(val),
})
onMounted(async () => {
    await synth.resume()
})

const handlePatch = ({ type, index }) => {
    if (type === 'output') {
        const from = registry.get(id)
        const to = registry.get('vca-module')

        if (from && to) {
            patchStore.togglePatch(from, index, to, 0)
        }
    }
}
</script>
