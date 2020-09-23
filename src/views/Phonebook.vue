<template>
<div>
    <v-card>
        <v-card-title>
            Imenik
            <v-spacer></v-spacer>

        </v-card-title>
        <v-data-table :headers="headers" :items="clients" class="elevation-1">
            <template v-slot:item.createdAt="{ item }">
                <span>{{item.createdAt.toDate().toLocaleDateString()}}</span>
            </template>
            <template v-slot:top>
                <v-toolbar flat color="white">
                    <v-toolbar-title>Upravljanje Klijentima</v-toolbar-title>
                    <v-divider class="mx-4" inset vertical></v-divider>
                    <v-spacer></v-spacer>
                    <v-dialog v-model="dialog" max-width="700px">
                        <template v-slot:activator="{ on }">
                            <v-btn color="primary" dark class="mb-2" v-on="on">
                                <v-icon left>mdi-account-plus-outline</v-icon> Dodaj Musteriju
                            </v-btn>
                        </template>
                        <v-card>
                            <v-card-title>
                                <span class="headline">{{ formTitle }}</span>
                            </v-card-title>

                            <v-card-text>
                                <v-container>
                                    <v-row>
                                        <v-col cols="12" sm="6" md="6">
                                            <v-text-field v-model="editedItem.name" label="Ime klijenta"></v-text-field>
                                        </v-col>
                                        <v-col cols="12" sm="6" md="6">
                                            <v-text-field v-model="editedItem.lastName" label="Prezime"></v-text-field>
                                        </v-col>
                                        <v-col cols="12" sm="6" md="6">
                                            <v-text-field v-model="editedItem.clientEmail" label="Email adresa"></v-text-field>
                                        </v-col>
                                        <v-col cols="12" sm="6" md="6">
                                            <v-text-field v-model="editedItem.clientPhone" label="Broj telefona"></v-text-field>
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
                text: 'Ime Klijenta',
                align: 'left',
                sortable: true,
                value: 'clientName',
            },
            {
                text: 'Prezime',
                value: 'clientLastName'
            },
            {
                text: 'Email',
                value: 'clientEmail'
            },
            {
                text: 'Broj Telefona',
                value: 'clientPhone'
            },
            
            {
                text: 'Opcije',
                value: 'action',
                sortable: false
            }
           
        ],
        clients: [],
        editedIndex: -1,
        editedId : null,
        editedItem: {
            name: '',
            lastName: '',
            clientEmail: '',
            clientPhone: '',
        },
        defaultItem: {
            name: '',
            lastName: '',
            clientEmail: '',
            clientPhone: '',
        },
    }),

    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Nova Musterija' : 'Uredjivanje musterije'
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
            firebase.firestore().collection('klijenti').where('uid', '==', firebase.auth().currentUser.uid).onSnapshot(snap => {
                snap.docChanges().forEach(change => {
                    if (change.type == 'added') {
                        const payload = change.doc.data();
                        payload.docId = change.doc.id;
                        this.clients.push(payload);
                    }
                });

            })
            console.log(this.clients)
        },

        editItem(item) {
            this.editedIndex = this.clients.indexOf(item)
            this.editedId = this.clients[this.editedIndex].docId
            this.editedItem = Object.assign({}, item)
            this.dialog = true
        },

        deleteItem(item) {
            const index = this.clients.indexOf(item)
            const docId = this.clients[index].docId;
            //const id = this.employees[index].docId
            confirm('Zelite obrisati musteriju iz imenika?') && this.clients.splice(index, 1)
            firebase.firestore().collection('klijenti').doc(docId).delete().then(() => {
                alert('Musterija Uspjesno obrisana')
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

                Object.assign(this.clients[this.editedIndex], this.editedItem)
                 firebase.firestore().collection('klijenti').doc(this.editedId).set({
                     uid: uid,
                    clientName: this.editedItem.name,
                    clientLastName: this.editedItem.lastName,
                    clientPhone: this.editedItem.clientPhone,
                    clientEmail: this.editedItem.clientEmail,
                    
                })
            } else {
                
                firebase.firestore().collection('klijenti').add({
                    uid : uid,
                    clientName: this.editedItem.name,
                    clientLastName: this.editedItem.lastName,
                    clientPhone: this.editedItem.clientPhone,
                    clientEmail: this.editedItem.clientEmail,
                    
                }).then(() => {
                    alert("Musterija uspjesno dodana");

                }).catch(error => {
                    alert(error.message);
                })
            }
            this.close()
        },
    },
}
</script>
