import {createApp} from 'vue';
import {createPinia} from 'pinia';
import App from './App.vue';
import './styles/style.css';

const app = createApp(App);
app.use(createPinia());

// Register global components
import BaseButton from '@/components/base/BaseButton.vue';

app.component('BaseButton', BaseButton);

app.mount('#app');
