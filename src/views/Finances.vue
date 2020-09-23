<template>
<div class="finance">
    <h1 class="subheading grey--text">
        Finansije
    </h1>
    <v-row>
        <v-col lg="12">
             <v-card>
                <v-card-title>Dijelovi i Usluge</v-card-title>
                <v-row>
                    <v-col><v-alert color="primary" dark icon="mdi-cog" border="left" prominent>
                    Promet od dijelova od pocetka koristenja : {{parts}} KM
                </v-alert></v-col>
                    <v-col><v-alert color="primary" dark icon="mdi-account-cash-outline" border="left" prominent>
                    Promet od usluga od pocetka koristenja : {{services}} KM
                </v-alert></v-col>
                </v-row>
                
                

            </v-card>
        </v-col>
    </v-row>
    <v-row justify="space-around">
        <v-col lg="6" md="12" sm="12">
            <v-card class="scroll-y">
                <v-card-title>
                    Dnevni izvjestaj <v-spacer></v-spacer> <span v-if="dailyTotal">{{dailyTotal}} KM</span>

                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    <v-row justify="space-between" align="center">
                        <v-col lg="6">
                            <v-menu ref="dailyMenu" v-model="dailyMenu" :close-on-content-click="false" class="p-1" :return-value.sync="reportDate" transition="scale-transition" offset-y min-width="250px">
                                <template v-slot:activator="{ on }">
                                    <v-text-field v-model="dailyReportDate" label="Izaberite datum" readonly v-on="on"></v-text-field>
                                </template>
                                <v-date-picker v-model="dailyReportDate" no-title scrollable>
                                    <v-spacer></v-spacer>
                                    <v-btn text color="primary" @click="dailyMenu = false">Cancel</v-btn>
                                    <v-btn text color="primary" @click="$refs.dailyMenu.save(reportDate);">OK</v-btn>
                                </v-date-picker>
                            </v-menu>
                        </v-col>
                        <v-col>
                            <v-btn color="success" small @click="generateDailyReport">Run report</v-btn>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col>
                            <v-data-table dense fixed-header height="200px" :headers="dailyHeaders" :items="dailyFinances"></v-data-table>
                        </v-col>

                    </v-row>
                </v-card-text>

            </v-card>
        </v-col>
        <v-col lg="6" md="12">
            <v-card class="lighten-3">
                <v-card-title>
                    Mjesecni izvjestaj <v-spacer></v-spacer> {{monthlyTotal}} KM
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    <v-row justify="space-between" align="center">
                        <v-col lg="6">
                            <v-menu ref="dailyMenu" v-model="monthlyMenu" :close-on-content-click="false" :return-value.sync="monthlyreportDate" transition="scale-transition" offset-y min-width="250px">
                                <template v-slot:activator="{ on }">
                                    <v-text-field v-model="monthlyReportDate" label="Izaberite datum" readonly v-on="on"></v-text-field>
                                </template>
                                <v-date-picker v-model="monthlyReportDate" no-title scrollable type="month">
                                    <v-spacer></v-spacer>
                                    <v-btn text color="primary" @click="dailyMenu = false">Cancel</v-btn>
                                    <v-btn text color="primary" @click="$refs.dailyMenu.save(monthlyreportDate);">OK</v-btn>
                                </v-date-picker>
                            </v-menu>
                        </v-col>
                        <v-col>
                            <v-btn small @click="generateMonthlyReport">Run report</v-btn>
                        </v-col>
                    </v-row>

                    <v-row>

                        <v-col>
                            <v-data-table dense fixed-header height="200px" :headers="dailyHeaders" :items="ordersByMonth"></v-data-table>
                        </v-col>

                    </v-row>
                </v-card-text>

            </v-card>
        </v-col>
        <v-col>
            <v-card>
                <v-card-title>
                    Godisnji izvjestaj <v-spacer></v-spacer>

                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    <v-row justify="space-between" align="center">
                        <v-col lg="6">
                            <v-select :items="years" label="Izaberite godinu" v-model="selectedYear"></v-select>
                        </v-col>
                        <v-col>
                            <v-btn smal @click="generateYearlyReport">Run report</v-btn>
                        </v-col>
                    </v-row>
                    <v-divider></v-divider>
                    <v-row>
                        <v-col>
                            <v-data-table dense fixed-header height="200px" :headers="yearlyHeaders" :items="breakTest"></v-data-table>
                        </v-col>
                    </v-row>
                </v-card-text>

            </v-card>
        </v-col>
    </v-row>
</div>
</template>

<script>
import firebase from 'firebase'

export default {
    data() {
        return {
            workOrders : [],
            dailyFinances: [],
            monthlyFinances: [],
            yearlyFinances: {},
            yearlyBreakdown : [],
            salesByMonth: [],
            dailyReportDate: '',
            monthlyReportDate: '',
            dailyCount: '',
            years: ['2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020'],
            selectedYear: '',
            dailyHeaders: [{

                    text: 'Datum prijema',
                    align: 'center',
                    sortable: true,
                    value: 'date',
                    width: 150
                },
                {
                    text: 'Pazar',
                    align: 'center',
                    sortable: false,
                    value: 'amount',
                    width: 100
                },
                {
                    text: 'Ime zaposlenog',
                    align: 'center',
                    sortable: false,
                    value: 'employeeId.name',
                    width: 150
                },
                {
                    text: 'Prezime zaposlenog',
                    align: 'center',
                    sortable: false,
                    value: 'employeeId.lastName',
                    width: 150
                }

            ],
            yearlyHeaders: [{
                    text: 'Mjesec',
                    align: 'center',
                    sortable: false,
                    value: 'month',
                    width: 100
                },
                {
                    text: 'Broj naloga',
                    align: 'center',
                    sortable: false,
                    value: 'count',
                    width: 100
                },
                {
                    text: 'Pazar',
                    align: 'center',
                    sortable: false,
                    value: 'amount',
                    width: 100
                },
            ]
        }

    },

    methods: {
        generateDailyReport() {
            this.dailyFinances = []
            firebase.firestore().collection('finansije').where("date", '==', this.dailyReportDate).where('uid', '==', firebase.auth().currentUser.uid).get().then(snap => {
                this.dailyCount = snap.size
                snap.forEach(el => {
                    const data = el.data();
                    data.id = el.id
                    this.dailyFinances.push(data)
                })
            })

        },
        generateMonthlyReport() {
            this.monthlyFinances = [];
            firebase.firestore().collection('finansije').where('uid', '==', firebase.auth().currentUser.uid).get().then(snap => {
                snap.forEach(el => {
                    const data = el.data();
                    data.id = el.id
                    this.monthlyFinances.push(data)
                })

            })

        },
        generateYearlyReport() {
          this.yearlyBreakdown = []
          this.yearlyFinances = {}
            firebase.firestore().collection('finansije').where("year", '==', this.selectedYear).where('uid', '==', firebase.auth().currentUser.uid).get().then(snap => {
                snap.forEach(el => {
                    let data = el.data();
                    data.id = el.id
                    switch (data.date.slice(5, 7)) {
                         case '01':
                            if (!Object.prototype.hasOwnProperty.call(this.yearlyFinances, "january")) {
                                let item = {
                                    month: 'january',
                                    amount: data.amount,
                                    count: 1,
                                }
                                this.yearlyFinances.january = item;
                            }else{
                                this.yearlyFinances.january.amount += data.amount;
                                this.yearlyFinances.january.count += 1;
                            }
                            break;
                        case '02':
                            if (!Object.prototype.hasOwnProperty.call(this.yearlyFinances, "february")) {
                                let item = {
                                    month: 'February',
                                    amount: data.amount,
                                    count: 1,
                                }
                                this.yearlyFinances.february = item;
                            }else{
                                this.yearlyFinances.february.amount += data.amount;
                                this.yearlyFinances.february.count += 1;
                            }
                            break;
                        case '03':
                            if (!Object.prototype.hasOwnProperty.call(this.yearlyFinances, "march")) {
                                let item = {
                                    month: 'March',
                                    amount: data.amount,
                                    count: 1,
                                }
                                this.yearlyFinances['march'] = item;
                            }else{
                                this.yearlyFinances['march'] .amount += data.amount;
                                this.yearlyFinances['march'] .count += 1;
                            }
                            break;
                            case '04':
                            if (!Object.prototype.hasOwnProperty.call(this.yearlyFinances, "april")) {
                                let item = {
                                    month: 'April',
                                    amount: data.amount,
                                    count: 1,
                                }
                                this.yearlyFinances.april = item;
                            }else{
                                this.yearlyFinances.april.amount += data.amount;
                                this.yearlyFinances.april.count += 1;
                            }
                            break;
                             case '05':
                            if (!Object.prototype.hasOwnProperty.call(this.yearlyFinances, "may")) {
                                const item = {
                                    month: 'May',
                                    amount: data.amount,
                                    count: 1,
                                }
                                this.yearlyFinances.may = item;
                            }else{
                                this.yearlyFinances.may.amount += data.amount;
                                this.yearlyFinances.may.count += 1;
                            }
                            break;
                             case '06':
                            if (!Object.prototype.hasOwnProperty.call(this.yearlyFinances, "june")) {
                                const item = {
                                    month: 'June',
                                    amount: data.amount,
                                    count: 1,
                                }
                                this.yearlyFinances.june = item;
                            }else{
                                this.yearlyFinances.june.amount += data.amount;
                                this.yearlyFinances.june.count += 1;
                            }
                            break;
                            case '07':
                            if (!Object.prototype.hasOwnProperty.call(this.yearlyFinances, 'july')) {
                                const item = {
                                    month: 'July',
                                    amount: data.amount,
                                    count: 1,
                                }
                                this.yearlyFinances.july = item;
                            }else{
                                this.yearlyFinances.july.amount += data.amount;
                                this.yearlyFinances.july.count += 1;
                            }
                            break;
                            case '08':
                            if (!Object.prototype.hasOwnProperty.call(this.yearlyFinances, "august")) {
                                const item = {
                                    month: 'August',
                                    amount: data.amount,
                                    count: 1,
                                }
                                this.yearlyFinances.august = item;
                            }else{
                                this.yearlyFinances.august.amount += data.amount;
                                this.yearlyFinances.august.count += 1;
                            }
                            break;
                             case '09':
                            if (!Object.prototype.hasOwnProperty.call(this.yearlyFinances, "september")) {
                                const item = {
                                    month: 'September',
                                    amount: data.amount,
                                    count: 1,
                                }
                                this.yearlyFinances.september = item;
                            }else{
                                this.yearlyFinances.september.amount += data.amount;
                                this.yearlyFinances.september.count += 1;
                            }
                            break;
                             case '10':
                            if (!Object.prototype.hasOwnProperty.call(this.yearlyFinances, "october")) {
                                const item = {
                                    month: 'october',
                                    amount: data.amount,
                                    count: 1,
                                }
                                this.yearlyFinances.october = item;
                            }else{
                                this.yearlyFinances.october.amount += data.amount;
                                this.yearlyFinances.october.count += 1;
                            }
                            break;
                             case '11':
                            if (!Object.prototype.hasOwnProperty.call(this.yearlyFinances, "november")) {
                                const item = {
                                    month: 'november',
                                    amount: data.amount,
                                    count: 1,
                                }
                                this.yearlyFinances.november = item;
                            }else{
                                this.yearlyFinances.november.amount += data.amount;
                                this.yearlyFinances.november.count += 1;
                            }
                            break;
                             case '12':
                            if (!Object.prototype.hasOwnProperty.call(this.yearlyFinances, "december")) {
                                const item = {
                                    month: 'december',
                                    amount: data.amount,
                                    count: 1,
                                }
                                this.yearlyFinances.december = item;
                            }else{
                                this.yearlyFinances.december.amount += data.amount;
                                this.yearlyFinances.december.count += 1;
                            }
                            break;
                            

                    }

                });
                this.yearlyBreakdown.push(this.yearlyFinances.january)
          this.yearlyBreakdown.push(this.yearlyFinances.february)
          this.yearlyBreakdown.push(this.yearlyFinances.march)
          this.yearlyBreakdown.push(this.yearlyFinances.april)
          this.yearlyBreakdown.push(this.yearlyFinances.may)
          this.yearlyBreakdown.push(this.yearlyFinances.june)
          this.yearlyBreakdown.push(this.yearlyFinances.july)
          this.yearlyBreakdown.push(this.yearlyFinances.august)
          this.yearlyBreakdown.push(this.yearlyFinances.september)
          this.yearlyBreakdown.push(this.yearlyFinances.october)
          this.yearlyBreakdown.push(this.yearlyFinances.november)
          this.yearlyBreakdown.push(this.yearlyFinances.december)
                
            });
            
          
        }

    },
    computed: {
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
        },
        dailyTotal() {
            return this.dailyFinances.reduce((a, {
                amount
            }) => {
                return a += parseFloat(amount)
            }, 0)
        },
        monthlyTotal() {
            return this.ordersByMonth.reduce((a, {
                amount
            }) => {
                return a += parseFloat(amount)
            }, 0)
        },
        ordersByMonth() {
            return this.monthlyFinances.filter((item) => item.date.slice(0, 7) === this.monthlyReportDate)
        },
        breakTest(){
            return this.yearlyBreakdown.filter(item => {  return item != undefined})
        }
       
    },
    created(){
          firebase.firestore().collection('radniNalozi').where('uid', '==', firebase.auth().currentUser.uid).get().then(snap => {
            snap.forEach(doc => {
                const payload = doc.data();
                payload.docId = doc.id;
                this.workOrders.push(payload);
            })
        });
        this.dailyReportDate = new Date().toISOString().slice(0,10);
        this.monthlyReportDate = new Date().toISOString().slice(0,7);
        this.selectedYear = new Date().toISOString().slice(0,4);
        this.generateDailyReport();
        this.generateMonthlyReport();
        this.generateYearlyReport();
    }
}
</script>
