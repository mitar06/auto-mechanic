<template>
<div>
    <v-card>
        <v-card-title>
            Zaposleni
            <v-spacer></v-spacer>

        </v-card-title>
        <v-data-table :headers="headers" :items="employees" sort-by="calories" class="elevation-1">
            <template v-slot:item.createdAt="{ item }">
           <span>{{item.createdAt.toDate()}}</span>
         </template>
            <template v-slot:top>
                <v-toolbar flat color="white">
                    <v-toolbar-title>Upravljanje zaposlenima</v-toolbar-title>
                    <v-divider class="mx-4" inset vertical></v-divider>
                    <v-spacer></v-spacer>
                    <v-dialog v-model="dialog" max-width="700px">
                        <template v-slot:activator="{ on }">
                            <v-btn color="primary" dark class="mb-2" v-on="on">Dodaj Zaposlenog</v-btn>
                        </template>
                        <v-card>
                            <v-card-title>
                                <span class="headline">{{ formTitle }}</span>
                            </v-card-title>

                            <v-card-text>
                                <v-container>
                                    <v-row>
                                        <v-col cols="12" sm="6" md="6">
                                            <v-text-field v-model="editedItem.name" label="Ime zaposlenog"></v-text-field>
                                        </v-col>
                                        <v-col cols="12" sm="6" md="6">
                                            <v-text-field v-model="editedItem.lastName" label="Prezime"></v-text-field>
                                        </v-col>
                                        <v-col cols="12" sm="6" md="6">
                                            <v-text-field v-model="editedItem.employeeEmail" label="Email adresa"></v-text-field>
                                        </v-col>
                                        <v-col cols="12" sm="6" md="6">
                                            <v-text-field v-model="editedItem.employeePhone" label="Broj telefona"></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue darken-1" text @click="close">Odustani</v-btn>
                                <v-btn color="blue darken-1" text @click="save">Sacuvaj</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-toolbar>
            </template>
            <template v-slot:item.action="{ item }">
                <v-icon small class="mr-2" @click="editItem(item)">
                    mdi-pencil
                </v-icon>
                <v-icon small @click="deleteItem(item)" color='red'>
                    mdi-delete-empty
                </v-icon>
            </template>
            <template v-slot:no-data>
                <v-btn color="primary" @click="initialize">Reset</v-btn>
            </template>
        </v-data-table>
    </v-card>
</div>
</template>

<script>
import firebase from 'firebase'

export default {
    data: () => ({
        dialog: false,
        headers: [{
                text: 'Ime',
                align: 'left',
                sortable: true,
                value: 'name',
            },
            {
                text: 'Prezime',
                value: 'lastName'
            },
            {
                text: 'Email',
                value: 'employeeEmail'
            },
            {
                text: 'Broj Telefona',
                value: 'employeePhone'
            },
            {
                text: 'Opcije',
                value: 'action',
                sortable: false
            }
        ],
        employees: [],
        editedIndex: -1,
        editedId : null,
        editedItem: {
            name: '',
            lastName: '',
            employeeEmail: '',
            employeePhone: '',
        },
        defaultItem: {
            name: '',
            lastName: '',
            employeeEmail: '',
            employeePhone: '',
        },
    }),

    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Novi zaposleni' : 'Uredjivanje zaposlenog'
        },
    },

    watch: {
        dialog(val) {
            val || this.close()
        },
    },

    created() {
        this.initialize()
    },

    methods: {

        initialize() {
            firebase.firestore().collection('zaposleni').where('uid', '==', firebase.auth().currentUser.uid).onSnapshot(snap => {
                snap.docChanges().forEach(change => {
                    if (change.type == 'added') {
                        const payload = change.doc.data();
                        payload.docId = change.doc.id;
                        this.employees = [...this.employees, payload];
                    }
                });

            })
        },

        editItem(item) {
            this.editedIndex = this.employees.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.editedId = this.employees[this.editedIndex].docId;
            console.log(this.editedId)
            this.dialog = true
        },

        deleteItem(item) {
            const index = this.employees.indexOf(item)
           const docId = this.employees[index].docId;
            //const id = this.employees[index].docId
            confirm('Zelite obrisati zaposlenog iz baze?') && this.employees.splice(index, 1)
            firebase.firestore().collection('zaposleni').doc(docId).delete().then(()=>{
                alert('Zaposleni Uspjesno obrisan')
            });
        },

        close() {
            this.dialog = false
            setTimeout(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            }, 300)
        },

        save() {
            const uid = firebase.auth().currentUser.uid
            if (this.editedIndex > -1) {
                Object.assign(this.employees[this.editedIndex], this.editedItem);
                firebase.firestore().collection('zaposleni').doc(this.editedId).set({
                    uid :firebase.auth().currentUser.uid,
                     name: this.editedItem.name,
                    lastName: this.editedItem.lastName,
                    employeePhone: this.editedItem.employeePhone,
                    employeeEmail: this.editedItem.employeeEmail,
                    
                })
            } else {
                // this.desserts.push(this.editedItem)
                const createdAt = new Date();
                firebase.firestore().collection('zaposleni').add({
                    uid: uid,
                    name: this.editedItem.name,
                    lastName: this.editedItem.lastName,
                    employeePhone: this.editedItem.employeePhone,
                    employeeEmail: this.editedItem.employeeEmail,
                    cratedAt: createdAt
                }).then(() => {
                    alert("employee added successfully");

                }).catch(error => {
                    alert(error.message);
                })
            }
            this.close()
        },
    },
}
</script>
