<template>
    <DynamicPanel />
    <main class="flex flex-col h-screen">
        <WorkspacePanel />
    </main>
</template>

<script setup>
import WorkspacePanel from '@/components/WorkspacePanel.vue';
import DynamicPanel from '@/components/base/DynamicPanel.vue';
</script>
