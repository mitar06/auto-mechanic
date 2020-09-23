<template>
<v-content class="pl-0">
    <v-row justify="center">
        <v-col lg="10" md="10">
            <v-stepper v-model="e1" class="mt-3">
                <v-stepper-header dense>
                    <v-stepper-step :complete="e1 > 1" step="1" editable>Musterija</v-stepper-step>
                    <v-divider></v-divider>
                    <v-stepper-step :complete="e1 > 2" step="2" editable>Automobil</v-stepper-step>
                    <v-divider></v-divider>
                    <v-stepper-step :complete="e1 > 3" step="3" editable>Servis</v-stepper-step>
                    <v-divider></v-divider>
                    <v-stepper-step :complete="e1 > 4" step="4" editable>Dijelovi</v-stepper-step>
                </v-stepper-header>
                <v-stepper-items>
                    <v-stepper-content step="1">
                        <v-row justify="center">
                            <v-col lg='6' md="8">
                                <v-col lg="12">

                                    <v-select :items="availableClients" label="Postojeci Klijenti" item-value="docId" @change="autofillClientInfo()" v-model="clientId" v-if="existingClient">
                                        <template v-slot:selection="data">
                                            {{ data.item.clientName }} - {{ data.item.clientLastName }}
                                        </template>
                                        <template v-slot:item="data">
                                            {{ data.item.clientName }} - {{ data.item.clientLastName }}
                                        </template>
                                    </v-select>
                                </v-col>
                                <v-col lg="12">
                                    <v-btn v-if="newClient == true" block @click="showClientInfo=true;existingClient=false;newClient=false;">+ Nova Musterija</v-btn>
                                </v-col>

                                <v-row flat dense v-show="showClientInfo">
                                    <v-col lg="6">
                                        <v-text-field label="Ime" :rules="[rules.required]" v-model="clientName"> </v-text-field>
                                    </v-col>
                                    <v-col lg="6">
                                        <v-text-field label="Prezime" :rules="[rules.required]" v-model="clientLastName"> </v-text-field>
                                    </v-col>
                                </v-row>

                                <v-text-field v-show="showClientInfo" label="Broj Telefona" :rules="[rules.required]" v-model="clientPhone"> </v-text-field>
                                <v-text-field v-show="showClientInfo" label="Email" :rules="[rules.required, rules.email]" validate-on-blur v-model="clientEmail"> </v-text-field>
                                <v-menu ref="menu" v-show="showClientInfo" v-model="menu" :close-on-content-click="false" :return-value.sync="date" transition="scale-transition" offset-y min-width="200px">
                                    <template v-slot:activator="{ on }">
                                        <v-text-field v-model="date" label="Datum prijema vozila" readonly v-on="on" v-show="showClientInfo"></v-text-field>
                                    </template>
                                    <v-date-picker v-model="date" no-title scrollable v-show="showClientInfo">
                                        <v-spacer></v-spacer>
                                        <v-btn text color="primary" @click="menu = false">Cancel</v-btn>
                                        <v-btn text color="primary" @click="$refs.menu.save(date)">OK</v-btn>
                                    </v-date-picker>
                                </v-menu>
                                <v-select v-show="showClientInfo" :items="paymentMethods" label="Nacin Placanja" v-model="selectedMethod"></v-select>
                            </v-col>

                        </v-row>
                        <v-btn color="primary" @click="e1 = 2">
                            Nastavi
                        </v-btn>

                    </v-stepper-content>
                    <v-stepper-content step="2">
                        <v-row justify="center">
                            <v-col lg="4">
                                <v-btn @click="vechileFields=true;existingVechile=false" v-if="!existingVechile">Novo vozilo</v-btn>
                            </v-col>
                            <v-col lg="4">

                                <v-select :items="getVechiles" label="Vozila" item-value="carId" @change="autofillVechileInfo()" v-if="existingClient">
                                    <template v-slot:selection="data">
                                        {{ data.item.carId }} - {{ data.item.carMake }}
                                    </template>
                                    <template v-slot:item="data">
                                        {{ data.item.carId }} - {{ data.item.carMake }}
                                    </template>
                                </v-select>
                            </v-col>
                        </v-row>
                        <v-row justify="center" v-show="vechileFields">
                            <v-col lg='4' md="8">
                                <v-text-field label="Registracija" v-model="licensePlate"></v-text-field>
                                <v-text-field label="Broj Sasije" :rules="[rules.required]" v-model="carId"> </v-text-field>
                                <template v-if="existingVechile == false">
                                    <v-select :items="availableCarBrands" label="Marka vozila" item-value="name" @change="getCarModels" v-model="carMake">
                                        <template v-slot:selection="data">
                                            {{ data.item.name }}
                                        </template>
                                        <template v-slot:item="data">
                                            {{ data.item.name }}
                                        </template>
                                    </v-select>

                                    <v-select :items="availableCarModels" label="Model vozila" item-value="item" v-model="carModel">
                                        <template v-slot:selection="data">
                                            {{ data.item }}
                                        </template>
                                        <template v-slot:item="data">
                                            {{ data.item }}
                                        </template>
                                    </v-select>
                                    </template>
                                        <template v-else>
                                            <v-text-field label="Marka" :rules="[rules.required]" v-model="carMake"> </v-text-field>
                                            <v-text-field label="Model" :rules="[rules.required]" v-model="carModel"> </v-text-field>
                                        </template>
                            </v-col>
                            <v-col lg='4' md="8" v-show="vechileFields">

                                <v-text-field label="Motor" :rules="[rules.required]" v-model="carEngine"> </v-text-field>
                                <v-text-field label="Kilovati (KW)" :rules="[rules.required]" v-model="carKw"> </v-text-field>
                                <v-text-field label="Godina" :rules="[rules.required]" v-model="carYear"> </v-text-field>
                                <v-select :items="fuelTypes" label="Tip goriva" v-model="carFuel"></v-select>
                            </v-col>
                        </v-row>
                        
                        <v-btn color="primary" @click="e1 = 3" append-icon>
                            Nastavi
                        </v-btn>
                    </v-stepper-content>
                    <v-stepper-content step="3">
                        <v-row justify="space-around">
                            <v-col lg="7">
                                <v-row class="flex-column">
                                    <v-col lg="7">
                                        <v-select :items="taskStatus" item-value="item" label="Status radnog naloga" v-model="status"></v-select>
                                        <v-select :items="employees" name="item.name" item-value="item.id" label="Majstor" v-model="selectedEmployee">
                                            <template v-slot:selection="data">
                                                {{ data.item.name }} - {{ data.item.lastName }}
                                            </template>
                                            <template v-slot:item="data">
                                                {{ data.item.name }} - {{ data.item.lastName }}
                                            </template>
                                        </v-select>
                                    </v-col>
                                    <v-col lg="7">
                                        <v-select :items="availableServices" item-value="item" label="Usluge" v-model="serviceType">
                                            <template v-slot:selection="data">
                                                {{ data.item.name }} - {{ data.item.price }} KM
                                            </template>
                                            <template v-slot:item="data">
                                                {{ data.item.name }} - {{ data.item.price }} KM
                                            </template>
                                        </v-select>

                                    </v-col>
                                    <v-col lg='7' md="3">
                                        <v-btn block color="success" class="mx-auto" small @click="addService">Dodaj</v-btn>
                                    </v-col>
                                </v-row>

                            </v-col>
                            <v-col lg="5">
                                <v-card flat height="400px">
                                    <v-card-title class="pt-0 pb-2">Usluge <v-spacer></v-spacer>
                                        <v-menu v-model="serviceMenu" :close-on-content-click="false" :nudge-width="200" offset-x>
                                            <template v-slot:activator="{ on }">
                                                <v-btn small color="indigo" dark v-on="on">
                                                    Nova usluga
                                                </v-btn>
                                            </template>
                                            <v-card>
                                                <v-container>
                                                    <v-text-field v-model="newServiceName" label="Naziv usluge"></v-text-field>

                                                    <v-text-field v-model="newServicePrice" label="Cijena usluge" type="number"></v-text-field>
                                                </v-container>

                                                <v-card-actions>
                                                    <v-spacer></v-spacer>
                                                    <v-btn text @click="closeServiceMenu">Cancel</v-btn>
                                                    <v-btn color="primary" text @click="addNewService">Save</v-btn>
                                                </v-card-actions>
                                            </v-card>
                                        </v-menu>
                                    </v-card-title>
                                    <v-divider></v-divider>
                                    <v-list dense flat max-height="300px" class="overflow-y-auto">
                                        <v-list-item-group color="primary">
                                            <v-list-item v-for="(item, i) in services" :key="i">
                                                <v-list-item-icon>
                                                    <v-icon color="red" @click="services.splice(i,1)">mdi-delete-alert</v-icon>
                                                </v-list-item-icon>
                                                <v-list-item-content>
                                                    {{item.service}}
                                                    <v-divider></v-divider> {{item.price}} KM
                                                </v-list-item-content>
                                            </v-list-item>
                                        </v-list-item-group>

                                    </v-list>

                                </v-card>
                                <p class="text-lg-right"> Ukupno: {{servicesTotal}} KM</p>
                            </v-col>

                        </v-row>
                        <v-btn color="primary" @click="e1 = 4">
                            Nastavi
                        </v-btn>
                    </v-stepper-content>
                    <v-stepper-content step="4">
                        <v-row justify="space-around">
                            <v-col lg='5'>
                                <v-text-field label="Sifra dijela" v-model="partCode" required> </v-text-field>
                                <v-text-field label="Broj Sasije" v-model="carId" required> </v-text-field>
                                <v-select :items="availableDealers" label="Dobavljac dijela" v-model="selectedDealer" item-value="item">
                                    <template v-slot:selection="data">
                                        {{ data.item.name }}
                                    </template>
                                    <template v-slot:item="data">
                                        {{ data.item.name }}
                                    </template>
                                </v-select>
                                <v-text-field label="Cijela dijela" v-model="partPrice" type="number" required> </v-text-field>
                                <v-select label="Garancija (mjeseci)" :items="warrantyOptions" v-model="partWarranty" required></v-select>
                            </v-col>
                            <v-col lg="6">
                                <v-card flat height="350px" class="pt-0 mt-0">
                                    <v-card-title class="pt-0 mt-0">Dodani dijelovi <v-spacer></v-spacer>
                                        <v-menu v-model="dealerMenu" :close-on-content-click="false" :nudge-width="200" offset-x>
                                            <template v-slot:activator="{ on }">
                                                <v-btn small color="indigo" dark v-on="on">
                                                    Novi dobavljac
                                                </v-btn>
                                            </template>
                                            <v-card>
                                                <v-container>
                                                    <v-text-field v-model="newDealerName" label="Naziv dobavljaca"></v-text-field>
                                                </v-container>

                                                <v-card-actions>
                                                    <v-spacer></v-spacer>
                                                    <v-btn text @click="closeDealerMenu">Cancel</v-btn>
                                                    <v-btn color="primary" text @click="addNewDealer">Save</v-btn>
                                                </v-card-actions>
                                            </v-card>
                                        </v-menu>
                                    </v-card-title>
                                    <v-divider></v-divider>
                                    <v-list dense flat max-height="300px" class="overflow-y-auto">
                                        <v-list-item-group color="primary">
                                            <v-list-item v-for="(item, i) in parts" :key="i">
                                                <v-list-item-icon>
                                                    <v-icon color="red" @click="parts.splice(i,1)">mdi-delete-alert-outline</v-icon>
                                                </v-list-item-icon>
                                                <v-list-item-content>
                                                    <v-list-item-title v-text="item.partCode"></v-list-item-title>
                                                </v-list-item-content>
                                            </v-list-item>
                                        </v-list-item-group>
                                    </v-list>
                                </v-card>
                                <p class="text-lg-right"> Ukupno: {{partsTotal}} KM</p>
                            </v-col>

                        </v-row>
                        <v-row class=" mx-3">

                            <v-btn color="primary" @click="addPart">
                                <v-icon left>mdi-plus-circle-outline</v-icon>
                                Dodaj dio
                            </v-btn>
                            <v-spacer></v-spacer>
                            <v-btn color="success" class="ml-2" @click="e1 = 4" @click.prevent="submitWorkOrder">
                                Zavrsi nalog
                            </v-btn>

                        </v-row>

                    </v-stepper-content>
                </v-stepper-items>
            </v-stepper>
        </v-col>

    </v-row>

</v-content>
</template>

<script>
import {db, auth} from '@/fb'

export default {

    data() {
        return {
            status: '',
            serviceMenu: false,
            menu: false,
            taskStatus: ['Zavrsen', 'Ceka se dio', 'Nije zapocet', 'Zapocet'],
            warrantyOptions: [6, 12, 18, 24],
            date: '',
            clientId: '',
            newServiceName: '',
            newServicePrice: null,
            newDealerName: '',
            availableDealers: [],
            availableCarBrands: [],
            availableCarModels: [],
            dealerMenu: false,
            e1: 1,
            fuelTypes: ['Benzin', 'Disel', 'Plin'],
            validated: false,
            firma: false,
            clientName: null,
            clientLastName: null,
            clientPhone: null,
            clientEmail: null,
            existingClient: true,
            existingVechile: false,
            vechileFields: false,
            showClientInfo: false,
            selectedMethod: '',
            availableVechiles: [],
            carYear: null,
            newClient: true,
            carModel: null,
            carMake: null,
            carKw: null,
            carEngine: null,
            parts: [],
            partCode: null,
            carId: null,
            licensePlate: null,
            partDealer: null,
            partPrice: null,
            serviceType: null,
            servicePrice: null,
            partWarranty: null,
            carFuel: null,
            paymentMethods: ['Odmah', 'Odgodjeno'],
            availableClients: [],
            availableServices: [],
            services: [],
            serTotal: null,
            partTotal: null,
            employees: [],
            selectedEmployee: null,
            selectedDealer: null,
            rules: {
                required: value => !!value || 'Required.',
                counter: value => value.length <= 20 || 'Max 20 characters',
                email: value => {
                    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    return pattern.test(value) || 'Invalid e-mail.'
                }
            }
        }
    },
    methods: {
        addPart() {
            const part = {
                partDealer: this.selectedDealer.name,
                partDealerId: this.selectedDealer.docId,
                partPrice: this.partPrice,
                partCode: this.partCode,
                partWarranty: this.partWarranty
            };
            this.parts = [...this.parts, part];
            this.partWarranty = '';
            this.partPrice = '';
            this.selectedDealer = null;
            this.partCode = '';
        },
        addNewService() {
            const newService = {
                uid: auth.currentUser.uid,
                name: this.newServiceName,
                price: this.newServicePrice,
                createdAt: new Date().toISOString()
            }
            db.collection('usluge').add(newService).then(() => {
                alert("Nova usluga je uspjesno sacuvana")
                this.closeServiceMenu();
            }).catch((e) => {console.log(e.message)});
        },
        closeServiceMenu() {
            this.newServiceName = '';
            this.newServicePrice = null;
            this.serviceMenu = false;

        },
        addNewDealer() {
            const newDealer = {
                uid: auth.currentUser.uid,
                name: this.newDealerName,
                createdAt: new Date().toISOString()
            }
           db.collection('dobavljaci').add(newDealer).then(() => {
                alert("Nova dobavljac je uspjesno dodan")
                this.closeDealerMenu();
            });

        },
        closeDealerMenu() {
            this.dealerMenu = false;
            this.newDealerName = '';
        },
        getCarModels() {
           
            if (this.carMake != null) {
                this.availableCarModels = [];
                db.collection('modeliVozila').where('parent', "==", this.carMake).get()
                    .then((snap) => {
                        snap.forEach(doc => {
                            const data = doc.data();
                            data.docId = doc.id;
                            console.log(data)
                            this.availableCarModels = [...this.availableCarModels, ...data.models];
                        });
                    });
            }
        },

        formCleanup() {
            this.clientId = null;
            this.clientName = '',
                this.clientLastName = null;
            this.clientEmail = null;
            this.clientPhone = null;
            this.selectedMethod = null;
            this.carYear = null;
            this.carModel = null;
            this.carMake = null;
            this.carEngine = null;
            this.licensePlate = null;
            this.carId = null;
            this.carKw = null;
            this.carFuel = null;
            this.date = null;
            this.parts = [];
            this.services = [];
            this.serTotal = null;
            this.partTotal = null;
            this.status = null;
            this.selectedEmployee = null;
            this.existingClient = true;
            this.showClientInfo = false;
        },
        autofillClientInfo() {
            const data = this.availableClients.find(el => el.docId == this.clientId);
            this.clientName = data.clientName;
            this.clientLastName = data.clientLastName;
            this.clientPhone = data.clientPhone;
            this.clientEmail = data.clientEmail;
            this.existingClient = true;
            this.showClientInfo = true;
            this.newClient = false;
            // this.newClient = true;
        },
        addService() {
            if (this.serviceType) {
                const data = {
                    service: this.serviceType.name,
                    price: this.serviceType.price,
                    serviceId: this.serviceType.docId
                }
                this.services = [...this.services, data];
                this.serviceType = null
            }

        },
        submitWorkOrder() {
            const uid = auth.currentUser.uid;
            this.serTotal = this.services.reduce((a, {
                price
            }) => a + parseFloat(price), 0);
            this.partTotal = this.parts.reduce((a, {
                partPrice
            }) => a + parseFloat(partPrice), 0);

            /*Adding the client to client collection if it is a new client */
            if (this.existingClient === false) {
                db.collection('klijenti').add({
                    uid: uid,
                    clientName: this.clientName,
                    clientLastName: this.clientLastName,
                    clientEmail: this.clientEmail,
                    clientPhone: this.clientPhone

                }).then((doc) => {
                    this.clientId = doc.id
                });
            }
            db.collection('radniNalozi').add({
                uid: uid,
                clientName: this.clientName,
                clientLastName: this.clientLastName,
                clientEmail: this.clientEmail,
                clientPhone: this.clientPhone,
                paymentMethod: this.selectedMethod,
                carYear: this.carYear,
                carModel: this.carModel,
                carMake: this.carMake,
                carEngine: this.carEngine,
                carLicensePlate: this.licensePlate,
                carId: this.carId,
                carKw: this.carKw,
                carFuelType: this.carFuel,
                receptionDate: this.date,
                parts: this.parts,
                services: this.services,
                serTotal: this.serTotal,
                partTotal: this.partTotal,
                employeeId: this.selectedEmployee,
                status: this.status

            }).then((doc) => {
                db.collection('finansije').doc(doc.id).set({
                    uid: uid,
                    amount: this.serTotal + this.partTotal,
                    employeeId: this.selectedEmployee,
                    date: new Date().toISOString().slice(0, 10),
                    year: new Date().toISOString().slice(0, 4),
                    orderRef: doc.id
                }).then(() => {});
                if (this.existingVechile === false) {
                 db.collection('vozila').add({
                        uid: uid,
                        clientId: this.clientId,
                        carYear: this.carYear,
                        carModel: this.carModel,
                        carMake: this.carMake,
                        carEngine: this.carEngine,
                        carLicensePlate: this.licensePlate,
                        carId: this.carId,
                        carKw: this.carKw,
                        carFuelType: this.carFuel,
                    }).then(() => {})
                }
                alert('Radni nalog je uspjesno dodan');
                this.formCleanup();
                this.e1 = 1
            }).catch((error) => {
                console.log(error);
            });

        },
        autofillVechileInfo() {

            this.carYear = this.getVechiles[0].carYear;
            this.carModel = this.getVechiles[0].carModel;
            this.carMake = this.getVechiles[0].carMake;
            this.carKw = this.getVechiles[0].carKw;
            this.carEngine = this.getVechiles[0].carEngine;
            this.carFuel = this.getVechiles[0].carFuelType;
            this.licensePlate = this.getVechiles[0].carLicensePlate;
            this.carId = this.getVechiles[0].carId;
            this.existingVechile = true;
            this.vechileFields = true;
        }
    },

    computed: {
        servicesTotal() {
            let sum = 0;
            this.services.forEach(el => sum += parseFloat(el.price))
            return sum
        },
        partsTotal() {
            let sum = 0;
            this.parts.forEach(el => sum += parseFloat(el.partPrice))
            return sum
        },
        getVechiles() {
            return this.availableVechiles.filter(el => el.clientId == this.clientId)
        }

    },
    created() {
        db.collection('klijenti').where('uid', '==', auth.currentUser.uid).get().then(snap => {
            snap.forEach(element => {
                const data = element.data();

                const payload = {
                    docId: element.id,
                    clientName: data.clientName,
                    clientLastName: data.clientLastName,
                    clientEmail: data.clientEmail,
                    clientPhone: data.clientPhone
                }
                this.availableClients.push(payload);

            });
        });
        db.collection('zaposleni').where('uid', '==', auth.currentUser.uid).get().then(snap => {
            snap.forEach(element => {
                const data = element.data();

                const payload = {
                    docId: element.id,
                    name: data.name,
                    lastName: data.lastName,
                    clientEmail: data.employeeEmail,
                    clientPhone: data.employeePhone
                }
                this.employees.push(payload);

            });
        });
        db.collection('vozila').where('uid', '==', auth.currentUser.uid)
            .get()
            .then(snap => {
                snap.forEach(doc => {
                    const payload = doc.data();
                    this.availableVechiles.push(payload)
                });
            });

        db.collection('usluge').where('uid', '==', auth.currentUser.uid).onSnapshot(snap => {
            snap.docChanges().forEach(change => {
                if (change.type == 'added') {
                    const payload = change.doc.data();
                    payload.docId = change.doc.id;
                    this.availableServices = [...this.availableServices, payload];

                }
            });
        });
       db.collection('dobavljaci').where('uid', '==', auth.currentUser.uid).onSnapshot(snap => {
            snap.docChanges().forEach(change => {
                if (change.type == 'added') {
                    const payload = change.doc.data();
                    payload.docId = change.doc.id;
                    this.availableDealers = [...this.availableDealers, payload];

                }
            });
        });
        db.collection('markeVozila').onSnapshot(snap => {
            snap.docChanges().forEach(change => {
                if (change.type == 'added') {
                    const payload = change.doc.data();
                    payload.docId = change.doc.id;
                    this.availableCarBrands.push(payload);

                }
            });
        });

    }
}
</script>
