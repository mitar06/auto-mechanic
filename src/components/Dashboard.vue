<template>
<div class="dashboard">
    <h1 class="subheading grey--text pt-4">
        Dashboard
    </h1>
    <v-container class="my-5">
       
    </v-container>
</div>
</template>

<script>
// @ is an alias to /src

export default {
    name: 'Dashboard',
    components: {

    },
    data() {
        return {
            items: []
        }
    },
    methods: {
        sortBy(prop) {
            this.items.sort((a, b) => a[prop] < b[prop] ? -1 : 1);
        }
    }
}
</script>
