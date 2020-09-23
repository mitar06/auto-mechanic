<script>
import {
    Pie
} from 'vue-chartjs'
export default {
    extends: Pie,
    props : ['chartdata', "options"],
    data() {
        return {
           
        }
    },

    mounted() {
        this.renderChart(this.chartdata, this.options)
    }
}
</script>
