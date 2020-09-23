<template>
<div>
    <h1 class="subheading grey--text pt-4">
        Dashboard
    </h1>
    <v-row>
        <v-col lg="3">
            <v-card>
                <v-card-title>Radni nalozi</v-card-title>
                <v-alert type="success" dense>
                    {{doneOrders}} zavrsenih radnih naloga
                </v-alert>
                <v-alert type="info" dense>
                    {{pendingOrders}} naloga ceka dio
                </v-alert>
                <v-alert type="error" dense>
                    {{notStartedOrders}} naloga nije zapoceto
                </v-alert>
            </v-card>
        </v-col>
        <v-col lg="3" md="6" sm="12">
            <v-card height="500">
                <v-card-title>Broj naloga po modelu vozila</v-card-title>
                <v-container>
                    <pie-chart :chartdata="brandchartData" :options="options" v-if="brandDataLoaded" />
                </v-container>

            </v-card>

        </v-col>
        <v-col lg="3" md="6" sm="12">
            <v-card height="500">
                <v-card-title>Broj naloga po modelu vozila</v-card-title>
                <v-container>
                    <pie-chart :chartdata="modelChartData" :options="options" v-if="modelDataLoaded" />
                </v-container>

            </v-card>

        </v-col>
        <v-col lg="3" md="6" sm="12">
            <v-card height="500">
                <v-card-title>Dijelova po dobavljacu</v-card-title>
                <v-container>
                    <pie-chart :chartdata="dealerChartData" :options="options" v-if="dealerDataLoaded" />
                </v-container>
            </v-card>

        </v-col>
        <v-col lg="12" md="12" sm="12">
            <v-card color="primary lighten-3">
                <v-card-title>Kursna lista (u odnosu na BAM)</v-card-title>
                <v-divider></v-divider>
                <v-container>
                    <v-row justify="space-between">
                        <v-col v-for="(item, name,index) in excahange" :key="index" lg="2">
                            <img :src="'https://www.countryflags.io/' + name.slice(0,2) + '/flat/32.png'"> {{name}} {{(item / 1.95).toFixed(2)}}
                        </v-col>
                    </v-row>
                </v-container>

            </v-card>
        </v-col>
    </v-row>
</div>
</template>

<script>
import firebase from 'firebase'
import axios from 'axios'
import PieChart from '../components/PieChart.vue'
export default {
    components: {
        'pie-chart': PieChart
    },

    data() {
        return {
            workOrders: [],
            excahange: [],
            carBrands: [],
            carModels: [],
            partDealers: [],
            modelData: {},
            brandData: {},
            dealerData: {},
            brandDataLoaded: false,
            modelDataLoaded: false,
            dealerDataLoaded: false,
            brandchartData: {},
            modelChartData: {},
            dealerChartData: {},
            options: {
                responsive: true,
                maintainAspectRatio: false
            }

        }
    },

    methods: {
        async getBrandChartData() {
            await firebase.firestore().collection('markeVozila').get().then((snap) => {
                snap.forEach(doc => {
                    const data = doc.data();
                    this.carBrands.push(data.name);
                })
            });
            if (this.carBrands.length > 0) {
                this.carBrands.forEach(el => {
                    this.brandData[el] = this.workOrders.filter(item => item.carMake.toLowerCase() == el.toLowerCase()).length
                });
            }
            this.brandchartData.labels = Object.keys(this.brandData);
            this.brandchartData.datasets = [];
            this.brandchartData.datasets.push({
                data: Object.values(this.brandData),
                label: "Dijelovi",
                backgroundColor: ['#C70039', "#F97825"],
            });
            this.brandDataLoaded = true;
        },
        async getModelChartData() {
            await firebase.firestore().collection('modeliVozila').get().then((snap) => {
                snap.forEach(doc => {
                    const data = doc.data();
                   this.carModels = [...this.carModels, ...data.models]

                })
            });
            if (this.carBrands.length > 0) {
                this.carModels.forEach(el => {
                    const perModel = this.workOrders.filter(item => item.carModel == el).length
                    if (perModel > 0) {
                        this.modelData[el] = perModel
                    }
                });
                this.modelChartData.labels = Object.keys(this.modelData);
                this.modelChartData.datasets = [];
                this.modelChartData.datasets.push({
                    data: Object.values(this.modelData),
                    label: "Modeli",
                    backgroundColor: ['#257CF9', "#2BF925", '#C70039'],
                });
                this.modelDataLoaded = true;

            }
        },
        async getDealerChartData() {
            await firebase.firestore().collection('dobavljaci').where('uid', '==', firebase.auth().currentUser.uid).get().then((snap) => {
                snap.forEach(doc => {
                    const data = doc.data();
                    this.partDealers.push(data);
                })
            });
            this.partDealers.forEach(el => {
                let perDealer = this.justParts.filter(item =>
                    item.partDealer != null && (item.partDealer.toLowerCase() == el.name.toLowerCase())).length
                if (perDealer > 0) {
                    this.dealerData[el.name] = perDealer;
                }
                this.dealerChartData.labels = Object.keys(this.dealerData);
                this.dealerChartData.datasets = [];
                this.dealerChartData.datasets.push({
                    data: Object.values(this.dealerData),
                    label: "Dobavljaci",
                    backgroundColor: ['#FFC300', "#FF5733 ", '#C70039'],
                })
            })
            this.dealerDataLoaded = true;

        }
    },
    computed: {
        justParts() {
            let parts = [];
            this.workOrders.forEach(item => {
                if (item.parts.length > 0) {
                    parts = [...parts, ...item.parts];
                }
            })
            return parts;
        },
        doneOrders() {
            return this.workOrders.filter(item => item.status == 'Zavrsen').length
        },
        pendingOrders() {
            return this.workOrders.filter(item => item.status == 'Ceka se dio').length
        },
        notStartedOrders() {
            return this.workOrders.filter(item => item.status == 'Nije zapocet').length
        },
        services() {
            return this.workOrders.reduce((a, {
                serTotal
            }) => {
                return a += parseFloat(serTotal)
            }, 0)
        },
        parts() {
            return this.workOrders.reduce((a, {
                partTotal
            }) => {
                return a += parseFloat(partTotal)
            }, 0)
        }
    },
    created() {
        firebase.firestore().collection('radniNalozi').where('uid', '==', firebase.auth().currentUser.uid).get().then(snap => {
            snap.forEach(doc => {
                const payload = doc.data();
                payload.docId = doc.id;
                this.workOrders.push(payload);
            })
        });
        axios.get('https://api.exchangeratesapi.io/latest').then(res => {
            this.excahange = res.data.rates
        });
        this.getBrandChartData();
        this.getModelChartData();
        this.getDealerChartData();

        
    }
}
</script>
