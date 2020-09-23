<template>
<div>
    <v-tabs fixed-tabs background-color="primary" light v-model="activeTab">
        <v-tab key="0">
            Radni nalozi
        </v-tab>
        <v-tab key="1">
            Lista dijelova
        </v-tab>
        <v-tab key="2">
            Termini
        </v-tab>
        <v-tabs-items v-model="activeTab">
            <v-tab-item key="0">
                <v-data-table :headers="headers" :slngle-expand=true :items="workOrders" :expanded.sync="expanded" item-key="docId" show-expand class="elevation-1">
                    <template v-slot:top>
                        <v-toolbar flat>
                            <v-toolbar-title>Radni Nalozi</v-toolbar-title>
                        </v-toolbar>
                    </template>
                    <template v-slot:item.data-table-expand="{ item, isExpanded, expand }">
                        <v-btn @click="expand(true)" v-if="item.canExpand && !isExpanded">Expand</v-btn>
                        <v-btn @click="expand(false)" v-if="item.canExpand && isExpanded">close</v-btn>
                    </template>
                    <template v-slot:item.expand="{ item }">
                        <v-btn x-small @click="expanded = [item]" v-if="!expanded.includes(item)">open</v-btn>
                        <v-btn x-small @click="expanded = []" v-if="expanded.includes(item)">close</v-btn>
                    </template>

                    <template v-slot:item="{ item, expand, isExpanded }">
                        <tr :style="getBackground(item)" @click="viewOrderDetails(item)">
                            <td>
                                <v-btn @click="expand(!isExpanded)">Vise</v-btn>
                            </td>
                            <td class="text-xs-left">{{ item.receptionDate }}</td>
                            <td class="text-xs-left">{{ item.clientName }}</td>
                            <td class="text-xs-left">{{ item.clientLastName }}</td>
                            <td class="text-xs-left">{{ item.clientPhone }}</td>
                            <td class="text-xs-left">{{ item.clientEmail }}</td>
                            <td class="text-xs-left">{{ item.carLicensePlate }}</td>
                            <td class="text-xs-left">{{ item.carId }}</td>
                            <td class="text-xs-left">{{ item.carMake }}</td>
                            <td class="text-xs-left">{{ item.carModel }}</td>
                            <td class="text-xs-left">{{ item.carEngine }}</td>
                            <td class="text-xs-left">{{ item.carYear}}</td>
                            <td class="text-xs-left">{{ item.carKw }}</td>
                            <td class="text-xs-left">{{ item.carFuelType }}</td>
                        </tr>
                    </template>

                    <template v-slot:expanded-item="{ item }">
                        <td :colspan="headers.length">
                            <v-row>
                                <v-col lg="4">
                                    <v-card>
                                        <v-card-title>Potrebni dijelovi ({{item.partTotal}} KM) </v-card-title>
                                        <v-divider></v-divider>
                                        <v-list-item v-for="(part,i) in item.parts" :key="i">
                                            <v-list-item-content>
                                                <v-list-item-title>{{part.partCode}}</v-list-item-title>
                                                <v-list-item-subtitle>{{part.partDealer}}</v-list-item-subtitle>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </v-card>

                                </v-col>
                                <v-col lg="4">
                                    <v-card>
                                        <v-card-title>Usluge ({{item.serTotal}} KM) - {{item.employeeId.name}} {{item.employeeId.lastName}}</v-card-title>
                                        <v-divider></v-divider>
                                        <v-list-item v-for="(service,i) in item.services" :key="i">
                                            <v-list-item-content>
                                                <v-list-item-title>{{service.service}} </v-list-item-title>
                                                <v-list-item-subtitle>{{service.price}}KM</v-list-item-subtitle>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </v-card>
                                </v-col>
                                <v-col lg="3">
                                    <v-select :items="taskStatus" label="Promijeni status" v-model="status"></v-select>
                                    <v-btn class="mb-2" small @click="changeStatus(item.docId)">Promijeni status</v-btn>
                                    <p>Placanje : <v-chip :color="getColor(item.paymentMethod)">{{item.paymentMethod}}</v-chip>
                                    </p>
                                    <span class="subtitle-1">
                                        Ukupno <span v-if="item.paymentMethod=='Odgodjeno'">(za uplatu)</span>: {{item.serTotal + item.partTotal}}KM
                                    </span>
                                </v-col>
                            </v-row>
                        </td>
                    </template>
                </v-data-table>
            </v-tab-item >
            <v-tab-item key="1">
                <v-card color="basil" flat>
                    <v-data-table :headers="partheaders" :items="parts" :items-per-page="5" class="elevation-1"></v-data-table>
                </v-card>
            </v-tab-item>
            <v-tab-item key="2">
                <v-card color="basil" flat>
                    <v-card-text>Termini placeholder</v-card-text>
                </v-card>
            </v-tab-item>

        </v-tabs-items>

    </v-tabs>
</div>
</template>

<script>
import firebase from 'firebase'
import jsPDF from 'jspdf'
export default {
    data() {
        return {
            expanded: [],
            singleExpand: true,
            status: '',
            activeTab: 2,
            taskStatus: ["Ceka se dio", 'Zavrsen'],
            headers: [{
                    text: '',
                    value: 'data-table-expand'
                },
                {
                    text: 'Datum prijema',
                    align: 'center',
                    sortable: true,
                    value: 'receptionDate',
                    width: 130
                },
                {
                    text: 'Ime Klijenta',
                    align: 'center',
                    sortable: false,
                    value: 'clientName',
                },
                {
                    text: 'Prezime Klijenta',
                    value: 'clientLastName',
                    width: 100
                },
                {
                    text: 'Broj Telefona',
                    value: 'clientPhone'
                },
                {
                    text: 'Email adresa',
                    value: 'clientEmail'
                },
                {
                    text: 'Registracija',
                    value: 'carLicensePlate'
                },
                {
                    text: 'Broj sasije',
                    value: 'carId'
                },
                {
                    text: 'Marka',
                    value: 'carMake',
                    width: 150
                },
                {
                    text: 'Model',
                    value: 'carModel',
                    width: 150
                },
                {
                    text: 'Motor',
                    value: 'carEngine',
                    width: 150
                },
                {
                    text: 'Godina proizvodnje',
                    value: 'carYear'
                },
                {
                    text: 'Broj kilovata',
                    value: 'carKw'
                },
                {
                    text: 'Tip goriva',
                    value: 'carFuelType'
                }

            ],
            partheaders: [{
                    text: 'Sifra dijela',
                    value: 'partCode',
                    width: 150
                },
                {
                    text: 'Cijena dijela (KM)',
                    value: 'partPrice',
                    width: 150
                },
                {
                    text: 'Dobavljac',
                    value: 'partDealer',
                    width: 150
                },
                {
                    text: 'Garancija',
                    value: 'partWarranty',
                    width: 150
                },
            ],
            workOrders: [],
            parts: []

        }
    },
    methods: {
        downloadPDF() {
            alert("called")
            const doc = new jsPDF();
            const partsOffset = 130;
            doc.roundedRect(1, 50, 100, 50, 4, 4)
            doc.text(25, 58, "Client information")
            doc.setFontSize(12)

            doc.text(3, 65, `Ime klijenta: ${this.currentOrder.clientName} ${this.currentOrder.clientLastName}`)
            doc.text(3, 70, `Broj telefona: ${this.currentOrder.clientPhone}`)

            doc.text(3, 75, `Email adresa: ${this.currentOrder.clientEmail}`)

            doc.roundedRect(109, 50, 100, 50, 4, 4);
            doc.setFontSize(15)

            doc.text(126, 58, "Vechile information");
            doc.setFontSize(12);
            doc.text(110, 65, `Make: ${this.currentOrder.carMake}`)
            doc.text(110, 70, `Model: ${this.currentOrder.carModel}`)
            doc.text(110, 75, `Year: ${this.currentOrder.carYear}`)
            doc.text(110, 80, `License plate: ${this.currentOrder.carLicensePlate}`)
            doc.text(110, 85, `KW: ${this.currentOrder.carKw}`)
            doc.text(110, 90, `Fuel type: ${this.currentOrder.carFuelType}`)
            doc.roundedRect(1, 102, 100, 50, 4, 4);
            doc.setFontSize(15)
            doc.text(25, 110, `Parts - ${this.currentOrder.partTotal}KM total`);
            doc.setFontSize(12)
            this.currentOrder.parts.forEach((item, index) => {
                doc.text(10, partsOffset + (index * 5), `${item.partCode} - ${item.partDealer}`)
            })
            doc.roundedRect(109, 102, 100, 50, 4, 4);
            doc.setFontSize(15)
            doc.text(126, 110, `Services - ${this.currentOrder.serTotal}KM total`);
            doc.setFontSize(12)
            this.currentOrder.services.forEach((item, index) => {
                doc.text(120, partsOffset + (index * 5), `${item.service} - ${item.price} KM`)
            })
            doc.save('sample.pdf');
        },

        getColor(status) {
            return status == 'Odmah' ? 'success' : 'alert'
        },
        getBackground(item) {
            let color = ""
            if (item.status == 'Ceka se dio') {
                color = 'rgba(26, 123, 200, 0.6)';
            } else if (item.status == 'Zavrsen') {
                color = 'rgba(53, 255, 34, 0.6)';
            } else if (item.status == 'Nije zapocet') {
                color = 'rgba(255, 0, 0, 0.5)'
            }

            return {
                'background-color': color
            }

        },
        changeStatus(docId) {
            firebase.firestore().collection('radniNalozi').doc(docId).update({
                status: this.status
            }).then(() => {
                this.$router.go()
            })
        }
    },
    created() {
        firebase.firestore().collection('radniNalozi').where('uid', '==', firebase.auth().currentUser.uid).onSnapshot(snap => {
            snap.docChanges().forEach(change => {
                if (change.type == 'added') {
                    const payload = change.doc.data();
                    payload.docId = change.doc.id;
                    this.workOrders = [...this.workOrders, payload];
                    const partPayload = payload.parts;
                    partPayload.forEach(el => {
                        this.parts.push(el);
                    })

                }
            });

        })
    },
 mounted(){
     this.activeTab = 2;
 }
}
</script>
