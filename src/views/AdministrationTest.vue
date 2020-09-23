<template>
<div>
    <v-tabs fixed-tabs background-color="primary" light v-model="selectedTab">
        <v-tab key="1">
            Radni nalozi
        </v-tab>
        <v-tab key="2">
            Lista dijelova
        </v-tab>
        <v-tab key="3">
            Termini
        </v-tab>
        <v-tabs-items v-model="selectedTab">
            <v-tab-item key="1">
                <v-data-table :headers="headers" fixed-header height="450" :items="workOrders" :expanded.sync="expanded" item-key="docId" class="elevation-1">
                    <template v-slot:top>
                        <v-toolbar flat>
                            <v-toolbar-title>Radni Nalozi</v-toolbar-title>
                        </v-toolbar>
                    </template>

                    <template v-slot:item="{ item}">
                        <tr :style="getBackground(item)" @click="viewOrderDetails(item)">

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
            <v-tab-item key="2">
                <v-card color="basil" flat>
                    <v-data-table :headers="partheaders" @click:row="partClicked" :items="parts" item-key="docId" :items-per-page="15" fixed-header height="470" class="elevation-1">
                        <template v-slot:item="{ item }">
                            <v-chip :color="getColor(item.calories)" dark>{{ item.calories }}</v-chip>
                        </template>
                    </v-data-table>
                </v-card>
            </v-tab-item>
            <v-tab-item key="3">
                <v-card color="basil" flat class="mt-3">
                    <v-sheet height="450">
                        <v-calendar ref="calendar" v-model="today" :type="type" :end="end" :events="events" @click:event="clickedEvent" @click:more="clickedMore" color="primary" :event-color="getEventColor"></v-calendar>
                        <v-row>
                            <v-col lg="2">
                                <v-btn @click="previous"> Prethodni</v-btn>
                            </v-col>
                            <v-col lg="2">
                                <v-btn @click="addCalendarRecord" color="success" outlined> Dodaj termin</v-btn>
                            </v-col>
                            <v-col lg="2">
                                <v-btn @click="next"> Sledeci </v-btn>
                            </v-col>
                        </v-row>
                    </v-sheet>
                </v-card>
            </v-tab-item>

        </v-tabs-items>

    </v-tabs>
    <v-dialog v-model="viewDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
        <v-card ref="pdfdata">
            <v-toolbar dark color="primary">

                <v-btn icon dark @click="closeDialog">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-btn dark outlined text @click="downloadPDF" class="ml-1">Napravi racun</v-btn>

                <v-spacer></v-spacer>
                <v-toolbar-items>
                    <v-btn dark class="red--text lighten-2save mx-2" text @click="deleteOrder(currentOrder.docId)">
                        <v-icon>mdi-delete</v-icon>Delete
                    </v-btn>
                    <v-btn dark text @click="saveRecord(currentOrder.docId)">Save</v-btn>

                </v-toolbar-items>
            </v-toolbar>
            <v-row>
                <v-col lg="4">
                    <v-row class="flex-column">
                        <v-col class="pt-0">
                            <v-card>
                                <v-card-title>Klijent</v-card-title>
                                <v-container>
                                    <p>Ime: {{currentOrder.clientName}} {{currentOrder.clientLastName}}</p>
                                    <p>Broj telefona: {{currentOrder.clientPhone}}</p>
                                    <p>Email adresa: {{currentOrder.clientEmail}}</p>
                                </v-container>
                            </v-card>
                        </v-col>
                        <v-col>
                            <v-card>
                                <v-card-title>Status <v-spacer></v-spacer>
                                    <v-btn text @click="editStatus = true" v-if="!editStatus">
                                        <v-icon flat dark>mdi-pencil</v-icon>
                                    </v-btn>
                                    <v-btn text v-else color="success" @click="changeStatus(currentOrder.docId)">
                                        <v-icon flat dark>mdi-check</v-icon>
                                    </v-btn>
                                </v-card-title>
                                <template v-if="!editStatus">
                                    <v-container>
                                        <span>{{currentOrder.status}}</span>
                                    </v-container>
                                </template>
                                <template v-else>
                                    <v-container>
                                        <v-select :items="taskStatus" label="Promijeni status" v-model="status"></v-select>
                                    </v-container>

                                </template>

                            </v-card>
                        </v-col>
                    </v-row>

                </v-col>
                <v-col lg="4">
                    <v-card>
                        <v-card-title>Vozilo</v-card-title>
                        <v-container>
                            <p>Registracija: {{currentOrder.carLicensePlate}}</p>
                            <p>Marka: {{currentOrder.carMake}}</p>
                            <p>Model: {{currentOrder.carModel}}</p>
                            <p>Godina proizvidnje: {{currentOrder.carYear}}</p>
                            <p>Kilovati: {{currentOrder.carKw}} kW</p>
                            <p>Tip goriva: {{currentOrder.carFuelType}} </p>
                        </v-container>
                    </v-card>
                </v-col>
                <v-col lg="4">
                    <v-row>
                        <v-col lg="12" class="pt-0">
                            <v-card>
                                <v-card-title>Potrebni dijelovi ({{currentOrder.partTotal}} KM) </v-card-title>

                                <v-list-item v-for="(part,i) in currentOrder.parts" :key="i">
                                    <v-list-item-content>
                                        <v-list-item-title>{{part.partCode}}</v-list-item-title>
                                        <v-list-item-subtitle>{{part.partDealer}}</v-list-item-subtitle>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-card>
                        </v-col>
                        <v-col lg="12">
                            <v-card>
                                <v-card-title v-if="currentOrder.employeeId">Servis ({{currentOrder.serTotal}} KM) - {{currentOrder.employeeId.name}} {{currentOrder.employeeId.lastName}}
                                    <v-spacer></v-spacer>
                                    <v-btn text @click="editParts" v-if="!editedServices">
                                        <v-icon flat dark>mdi-pencil</v-icon>
                                    </v-btn>
                                    <v-btn color="success" text @click="calculateTotals" v-else>
                                        <v-icon flat dark>mdi-check</v-icon>
                                    </v-btn>
                                </v-card-title>
                                <template v-if="!editedServices">
                                    <v-list-item v-for="(service,i) in currentOrder.services" :key="i">
                                        <v-list-item-content>
                                            <v-list-item-title>{{service.service}} </v-list-item-title>
                                            <v-list-item-subtitle>{{service.price}}KM</v-list-item-subtitle>
                                        </v-list-item-content>
                                    </v-list-item>
                                </template>
                                <template v-else>
                                    <v-container>
                                        <div v-for="(service,i) in currentOrder.services" :key="i">
                                            <v-row>
                                                <v-col lg="8">
                                                    <v-text-field dense v-model="currentOrder.services[i].service"></v-text-field>
                                                </v-col>
                                                <v-col lg="4">
                                                    <v-text-field dense v-model="currentOrder.services[i].price"></v-text-field>
                                                </v-col>
                                            </v-row>
                                        </div>

                                    </v-container>

                                </template>
                            </v-card>
                        </v-col>
                    </v-row>

                </v-col>
            </v-row>
        </v-card>
    </v-dialog>
    <v-dialog v-model="viewCalendarDialog" width="500">
        <v-card>
            <v-card-title class="headline">Termini</v-card-title>
            <v-card-text>
                <v-list disabled flat>
                    <v-list-item-group>
                        <v-list-item v-for="(item, i) in todayOrders" :key="i">
                            <v-list-item-content>
                                <v-list-item-title> {{item.clientName }} {{item.clientLastName }} <span v-if="item.status">({{item.status}})</span></v-list-item-title>
                                <v-list-item-subtitle v-for="(el,index) in item.services" :key="index">
                                    {{el.service}}
                                </v-list-item-subtitle>
                                <v-list-item-subtitle v-if="item.employeeId"> Majstor: {{item.employeeId.name}} {{item.employeeId.lastName}} - {{item.employeeId.clientPhone}} </v-list-item-subtitle>
                                <v-list-item-subtitle v-else> Podatci o majstoru nisu dostupni </v-list-item-subtitle>

                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item v-for="(item, i) in todaysTermin" :key="i">
                            <v-list-item-content>
                                <v-list-item-title> {{item.name}}</v-list-item-title>
                                <v-list-item-subtitle> {{item.memo}} </v-list-item-subtitle>

                            </v-list-item-content>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn color="green darken-1" text @click="viewCalendarDialog = false">
                    Zatvori
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-dialog v-model="viewTerminDialog" width="400">
        <v-card>
            <v-card-title class="headline">Dodaj termin</v-card-title>
            <v-card-text>
                <v-select :items="availableClients" item-value="docId" label="Izaberte klijenta" v-model="terminClient">
                    <template v-slot:selection="data">
                        {{ data.item.clientName }} - {{ data.item.clientLastName }}
                    </template>
                    <template v-slot:item="data">
                        {{ data.item.clientName }} - {{ data.item.clientLastName }}
                    </template>
                </v-select>
                <v-menu ref="terminDate" v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="250px">
                    <template v-slot:activator="{ on }">
                        <v-text-field v-model="terminDate" label="Izaberite datum" readonly v-on="on"></v-text-field>
                    </template>
                    <v-date-picker v-model="terminDate" no-title scrollable type="date">
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="dailyMenu = false">Cancel</v-btn>
                        <v-btn text color="primary" @click="$refs.terminDate.save(terminDate);">OK</v-btn>
                    </v-date-picker>
                </v-menu>
                <v-text-field v-model="terminMemo" label="Dodatne poruke">

                </v-text-field>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn color="green darken-1" text @click="addTermin">
                    Dodaj
                </v-btn>
                <v-btn color="red lighten-2" outlined @click="clearTerminDialog">
                    Zatvori
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

</div>
</template>

<script>
import firebase from 'firebase'
import jsPDF from 'jspdf'
export default {
    data() {
        return {
            menu: false,
            events: [{
                name: 'Weekly Meeting',
                start: '2019-1-7',
                time: '09:00',

            }, {
                name: 'daily Meeting',
                start: '2019-01-07',
                time: '09:00',

            }],
            type: 'month',
            start: '2020-01-01',
            end: '2020-12-31',
            today: "",
            expanded: [],
            singleExpand: true,
            editStatus: false,
            status: '',
            tab: true,
            editedServices: false,
            currentOrder: {},
            taskStatus: ["Ceka se dio", 'Zavrsen', 'Nije zapocet', 'Zapocet'],
            headers: [{
                    text: 'Datum prijema',
                    align: 'center',
                    sortable: true,
                    value: 'receptionDate',
                    width: 130
                },
                {
                    text: 'Ime Klijenta',
                    align: 'left',
                    sortable: false,
                    value: 'clientName',
                    width: 120
                },
                {
                    text: 'Prezime Klijenta',
                    value: 'clientLastName',
                    width: 130
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
                    width: 100
                },
                {
                    text: 'Model',
                    value: 'carModel',
                    width: 100
                },
                {
                    text: 'Motor',
                    value: 'carEngine',
                    width: 100
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
            selectedTab : 0,
            parts: [],
            viewDialog: false,
            viewCalendarDialog: false,
            todayOrders: [],
            availableClients: [],
            viewTerminDialog: false,
            terminDate: '',
            terminMemo: '',
            terminClient: '',
            todaysTermin: []

        }
    },
    methods: {
        downloadPDF() {
            const doc = new jsPDF();
            const servicesOffset = 125;
            // const  servicesOffset= 215;
            //TOTAL PDV NE UKLJUCIJE DIJELOVE
            const totalPDV = parseFloat((((parseInt(this.currentOrder.serTotal) / 100) * 17).toFixed(2)));
            const imgData = "data:image/png;base64,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"
            //const servicesOffset = 200;
            doc.addImage(imgData, 'PNG', 10, 5, 100, 40);
            doc.line(0, 50, 310, 50)
            doc.roundedRect(10, 52, 80, 30, 4, 4)
            doc.text(25, 60, "Klijent")
            doc.setFontSize(12)
            doc.text(13, 65, `Ime klijenta: ${this.currentOrder.clientName} ${this.currentOrder.clientLastName}`)
            doc.text(13, 70, `Broj telefona: ${this.currentOrder.clientPhone}`)
            doc.text(13, 75, `Email adresa: ${this.currentOrder.clientEmail}`)
            doc.setFontSize(15);
            doc.text(95, 110, `Usluge`);
            doc.setLineWidth(1)
            doc.line(10, 112, 200, 112);
            doc.setFontSize(12)
            doc.text(10, 117, "Vrsta")
            doc.text(70, 117, "Cijena")
            doc.text(90, 117, "PDV")
            doc.text(120, 117, "Ukupno")
            doc.line(10, 120, 200, 120);
            doc.setLineWidth(.5);
            doc.setFontSize(12)
            /* this.currentOrder.services.forEach((item, index) => {
                 const PDV = ((parseInt(item.price) / 100) * 17).toFixed(2);
                 doc.text(10, partsOffset + (index * 7), `${item.partCode}`)
                 doc.text(40, partsOffset + (index * 7), `${item.partDealer}`)
                 doc.text(75, partsOffset + (index * 7), `${item.partPrice}`)
                 doc.text(90, partsOffset + (index * 7), `${PDV}`)
                 doc.text(120, partsOffset + (index * 7), `${parseInt(item.partPrice) + parseFloat(PDV) }`)
                 doc.setLineWidth(.3);
                 doc.line(10, partsOffset + (index * 7) + 2, 200, partsOffset + (index * 7) + 2)
             })*/
            this.currentOrder.services.forEach((item, index) => {
                const PDV = ((parseInt(item.price) / 100) * 17).toFixed(2);
                doc.text(10, servicesOffset + (index * 7), `${item.service}`)
                doc.text(75, servicesOffset + (index * 7), `${item.price}`)
                doc.text(90, servicesOffset + (index * 7), `${PDV}`)
                doc.text(120, servicesOffset + (index * 7), `${parseInt(item.price) + parseFloat(PDV) }`)
                doc.setLineWidth(.3);
                doc.line(10, servicesOffset + (index * 7) + 2, 200, servicesOffset + (index * 7) + 2)
            })
            doc.text(90, 260, ` Vrijednost: ${parseInt(this.currentOrder.serTotal) } KM`)
            doc.text(135, 260, `PDV: ${totalPDV}`)
            /* REMINDER *
            Trenutno se dijelovi uopste ne ispisuju na racunu // dodati po potrebi 
            */
            doc.text(160, 260, `Ukupno:${ (parseFloat(this.currentOrder.serTotal) ) + totalPDV } KM`)
            doc.text(10, 280, "Racun izdao:");
            doc.line(35, 280, 90, 280);
            doc.text(110, 280, "Racun preuzeo:");
            doc.line(140, 280, 190, 280);
            doc.save('sample.pdf');

        },
        previous() {
            this.$refs.calendar.prev()
        },
        next() {
            this.$refs.calendar.next()
        },
        clickedEvent(event) {

            this.todayOrders = this.workOrders.filter((item) => item.receptionDate == event.day.date);
            this.todaysTermin = this.events.filter((item) => item.start == event.day.date && item.workOrder == false);
            this.viewCalendarDialog = true;

        },

        clickedMore(event) {

            this.todayOrders = this.workOrders.filter((item) => item.receptionDate == event.date);
            this.todaysTermin = this.events.filter((item) => item.start == event.date && item.workOrder == false);
            this.viewCalendarDialog = true;

        },
        addCalendarRecord() {
            this.viewTerminDialog = true;
        },
        getColor(status) {
            return status == 'Odmah' ? 'success' : 'alert'
        },
        closeDialog() {
            Object.assign(this.currentOrder, {})
            this.viewDialog = false;
            this.editStatus = false;
            this.editedServices = false;
        },
        clickRow(value) {
            this.expanded.push(value);

        },
        clearTerminDialog() {
            this.viewTerminDialog = false;
            this.terminDate = '';
            this.terminMemo = '';
            this.terminClient = '';
        },
        addTermin() {
            const client = this.availableClients.filter(el => el.docId == this.terminClient)[0]
            const termin = {
                name: `${client.clientName} ${client.clientLastName}`,
                start: this.terminDate,
                memo: this.terminMemo,
                workOrder: false
            }
            firebase.firestore().collection('termini').add(termin)
                .then(() => alert("Termin uspjesno dodan")).catch(error => alert(error.message))
        },
        calculateTotals() {
            this.currentOrder.serTotal = this.currentOrder.services.reduce((a, {
                price
            }) => a + parseInt(price), 0);
            this.editedServices = false;
        },
        saveRecord(docId) {
            firebase.firestore().collection('radniNalozi').doc(docId).set(this.currentOrder).then(() => {
                this.closeDialog();
            })
        },

        /* 
        Delete order function is deleting coresponding Event in calendar and parts from dijelovi section

        Need to check if we also need to delete finances along with this 
        */
        async deleteOrder(docId) {
           await firebase.firestore().collection('radniNalozi').doc(docId).delete()
                .then(() => {
                    this.parts = this.parts.filter(item => {
                        item.orderId != docId
                    });
                    this.events = this.events.filter(event => event.docId != docId);
                });
                 firebase.firestore().collection('finansije').doc(docId).delete()
                .then(() => {})
            this.closeDialog()

        },
        editParts() {
            this.editedServices = true
        },
        viewOrderDetails(item) {
            this.viewDialog = true;
            Object.assign(this.currentOrder, item)
        },
        partClicked(item) {
            this.currentOrder = this.workOrders.filter(el => el.docId == item.orderId)[0];
            this.viewDialog = true;
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
        getEventColor(event) {
            let color = ""
            if (event.status == 'Ceka se dio') {
                color = 'rgba(26, 123, 200, 1)';
            } else if (event.status == 'Zavrsen') {
                color = 'rgba(53, 255, 34, 1)';
            } else if (event.status == 'Nije zapocet') {
                color = 'rgba(255, 0, 0, 1)'
            }
            return color
        },
        changeStatus(docId) {
            firebase.firestore().collection('radniNalozi').doc(docId).update({
                status: this.status
            }).then(() => {
                this.currentOrder.status = this.status;
                this.editStatus = false;

            });
        }
    },
    created() {
        firebase.firestore().collection('radniNalozi').where('uid', '==', firebase.auth().currentUser.uid).onSnapshot(snap => {
            snap.docChanges().forEach(change => {
                if (change.type == 'added') {
                    const payload = change.doc.data();
                    payload.docId = change.doc.id;
                    const event = {
                        name: `${payload.clientName} ${payload.clientLastName}`,
                        start: payload.receptionDate,
                        orderId: payload.docId
                    };
                    event.status = payload.status;
                    this.events.push(event);

                    if (payload.parts.length > 0) {
                        const partPayload = payload.parts;
                        partPayload.forEach(el => {
                            const item = el;
                            item.orderId = payload.docId;
                            this.parts.push(item);
                        })
                    }

                    this.workOrders = [...this.workOrders, payload];
                } else if (change.type === 'modified') {
                    const payload = change.doc.data();
                    payload.docId = change.doc.id;
                    let modIndex = this.workOrders.findIndex(x => x.docId == payload.docId);
                    this.workOrders.splice(modIndex, 1, payload);
                }else if (change.type === 'removed') {
                    const payload = change.doc.data();
                    payload.docId = change.doc.id;
                    this.workOrders = this.workOrders.filter(item => item.docId != payload.docId)
                }
            });

        });
        this.today = new Date().toISOString().slice(0, 10);
        firebase.firestore().collection('klijenti').where('uid', '==', firebase.auth().currentUser.uid).onSnapshot(snap => {
            snap.docChanges().forEach(change => {
                if (change.type == 'added') {
                    const payload = change.doc.data();
                    payload.docId = change.doc.id;
                    this.availableClients = [...this.availableClients, payload];

                }
            });
        });
        firebase.firestore().collection('termini').where('uid', '==', firebase.auth().currentUser.uid).onSnapshot(snap => {
            snap.docChanges().forEach(change => {
                if (change.type == 'added') {
                    const payload = change.doc.data();
                    payload.docId = change.doc.id;
                    this.events = [...this.events, payload];

                }
            });
        });

    },
    mounted(){
        const path = this.$route.path;
        if(path == "/termini"){
            this.selectedTab = 2;
        }else if(path == '/dijelovi'){
            this.selectedTab = 1
        }
    }

}
</script>
