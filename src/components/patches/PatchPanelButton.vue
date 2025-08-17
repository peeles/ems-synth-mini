<template>
    <BaseButton
        class="!self-end w-full flex items-center justify-center text-xs"
        @click="showPatchPanel"
    >
        Patch Panel
    </BaseButton>
</template>

<script setup>
import useAsideStore from '@/storage/asideStore';
import BaseButton from '@/components/base/BaseButton.vue';
import PatchPanel from '@/components/patches/PatchPanel.vue';

const asideStore = useAsideStore();

const showPatchPanel = async () => {
    await asideStore.open(PatchPanel);
};
</script>
