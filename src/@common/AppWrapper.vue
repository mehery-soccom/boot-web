<template>
    <div id="app" class="app-wrapper">
        <component :is="apped"> </component>
    </div>
</template>

<script>
    export default {
        name: 'AppWrapper',
        props: {
            app: {},
        },
        computed: {
            apped() {
                return this.app;
            },
        },
    };
</script>

<style lang="scss">
    //@import "./assets/base.scss";
</style>
