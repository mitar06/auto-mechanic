<template>
<v-row justify="center">
    <v-col lg="8">
        <v-row>
            <v-col> <v-text-field v-model="title" label="Rashod"></v-text-field>
                    <v-text-field v-model="amount" label="Iznos(KM)"></v-text-field>
                     <v-menu ref="itemDate" v-model="itemMenu" :close-on-content-click="false" :return-value.sync="itemDate" transition="scale-transition" offset-y min-width="250px">
                                <template v-slot:activator="{ on }">
                                    <v-text-field v-model="itemDate" label="Izaberite datum" readonly v-on="on"></v-text-field>
                                </template>
                                <v-date-picker v-model="itemDate" no-title scrollable type="date">
                                    <v-spacer></v-spacer>
                                    <v-btn text color="primary" @click="itemMenu = false">Cancel</v-btn>
                                    <v-btn text color="primary" @click="$refs.itemDate.save(itemDate);">OK</v-btn>
                                </v-date-picker>
                            </v-menu>
                    <v-text-field v-model="memo" label="Dodatna poruka"></v-text-field>
                    <v-btn color="success" block @click.prevent="addItem">Dodaj</v-btn>
            </v-col>
            <v-col>
                <v-card flat>
                    <v-card-title>Rashodi</v-card-title>
                    <v-divider></v-divider>
                    <v-card-content>
                   <v-data-table :headers="headers" @click:row="partClicked" :items="deductables" item-key="docId" :items-per-page="15" fixed-header height="470" class="elevation-1">
                        <template v-slot:item.calories="{ item }">
                            <v-chip :color="getColor(item.calories)" dark>{{ item.calories }}</v-chip>
                        </template>
                    </v-data-table>
                    </v-card-content>
                </v-card>
            </v-col>
        </v-row>
    </v-col>
</v-row>
</template>


<script>
import firebase from 'firebase'
export default {
    data(){
        return {
            deductables : [],
            title : '',
            amount : null,
            memo: '',
            itemMenu: false,
            itemDate: '',
             headers: [{
                    text: 'Datum prijema',
                    align: 'center',
                    sortable: true,
                    value: 'date',
                    width: 130
                },
                {
                    text: 'Rashod',
                    align: 'left',
                    sortable: false,
                    value: 'title',
                    width: 120
                },
                {
                    text: '',
                    value: 'memo',
                    width: 130
                },
                {
                    text: 'Vrijednost',
                    value: 'amount'
                }]

        
    }},
    methods:{
        addItem(){
            firebase.firestore().collection('rashodi').add(
                {
                    uid : firebase.auth().currentUser.uid,
                    title : this.title,
                    amount: this.amount,
                    memo : this.memo,
                    date : this.itemDate
                }
            ).then(() =>{
                alert("Rashod uspjesno dodan");
                this.title = "",
                this.amount = null,
                this.memo = '',
                this.date = '',
                this.itemMenu = false;
            })
        }
    },
    computed:{

    },
    created(){
        firebase.firestore().collection('rashodi').where("uid" , '==', firebase.auth().currentUser.uid)
        .onSnapshot(snap =>{
            snap.docChanges().forEach(change => {
                if(change.type == 'added'){
                     const payload = change.doc.data();
                    payload.docId = change.doc.id;
                    this.deductables = [...this.deductables, payload];
                }
            });
        })
    }
}
</script>