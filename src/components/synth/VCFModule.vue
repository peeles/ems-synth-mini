<template>
    <SynthPanel :id="id">
        <template #heading>
            <h3 class="text-center text-wrap text-xl font-medium mb-4 uppercase">
                Voltage Filter
            </h3>
        </template>

        <div class="mb-1">
            <label class="block text-xs font-semibold mb-1">
                Frequency (Cut-Off)
            </label>
            <input
                type="range"
                min="50"
                max="10000"
                step="1"
                v-model.number="filterCutoff"
                class="w-full h-[8px] accent-black bg-black/10 rounded-full"
            />
            <p class="text-center text-xs mt-1 text-gray-700">
                {{ filterCutoff }} Hz
            </p>
        </div>

        <div class="block mb-3">
            <label class="block text-xs font-semibold mb-1">
                Type
            </label>
            <select
                v-model="filterType"
                class="w-full text-[10px] px-3 py-1.5 border border-black bg-yellow-50 font-mono uppercase rounded-sm"
            >
                <option value="lowpass">Low-Pass</option>
                <option value="highpass">High-Pass</option>
                <option value="bandpass">Band-Pass</option>
            </select>
        </div>

        <div>
            <label class="block text-xs font-semibold mb-1">
                Resonance (Q) {{ filterResonance.toFixed(1) }}
            </label>
            <input
                type="range"
                min="0.1"
                max="20"
                step="0.1"
                v-model.number="filterResonance"
                class="w-full h-[8px] accent-black bg-black/10 rounded-full"
            />
        </div>

        <section class="flex flex-row items-center justify-between mt-8">
            <JackPanel
                :count="1"
                type="input"
                :module-id="id"
                :connected="connectedInputs"
                @patch="handlePatch"
            />
            <JackPanel
                :count="1"
                type="output"
                :module-id="id"
                :connected="connectedOutputs"
                @patch="handlePatch"
            />
        </section>
    </SynthPanel>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useSynthStore } from '../../storage/synthStore'
import { useModuleRegistry } from '../../composables/useModuleRegistry'
import { usePatchStore } from '../../storage/patchStore'
import SynthPanel from "../SynthPanel.vue";
import JackPanel from '../JackPanel.vue'

const synth = useSynthStore()
const registry = useModuleRegistry()
const patchStore = usePatchStore()
const id = 'vcf-module'

const getInputNode = () => synth.getVCFInputNode?.()
const getOutputNode = () => synth.getVCFOutputNode?.()

onMounted(() => {
    registry.register(id, { id, getInputNode, getOutputNode })
})

onUnmounted(() => {
    registry.unregister(id)
})

const connectedInputs = computed(() =>
    patchStore
        .getConnectionsFor(id, false)
        .map(p => p.to.index)
)

const connectedOutputs = computed(() =>
    patchStore
        .getConnectionsFor(id, true)
        .map(p => p.from.index)
)

const filterCutoff = computed({
    get: () => synth.filterCutoff,
    set: (val) => synth.setFilterCutoff(val)
})

const filterResonance = computed({
    get: () => synth.filterResonance,
    set: (val) => synth.setFilterResonance(val)
})

const filterType = computed({
    get: () => synth.filterType,
    set: (val) => synth.setFilterType(val)
})

onMounted(() => {
    // Optional: synth.initVCF() if not globally initialized
})

const handlePatch = (jack) => {
    patchStore.selectJack(jack)
}
</script>
