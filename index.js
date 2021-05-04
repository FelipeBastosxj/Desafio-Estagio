const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const objectID = require('mongodb').objectID
const mongoClient = require("mongodb").mongoClient
const MongoClient  = require('mongodb')
const uri = "mongodb+srv://felipe:123@cluster0.yqtwa.mongodb.net/crudd?retryWrites=true&w=majority"

MongoClient.connect(uri, (err, client)=> {
    if(err){
        return console.log("deu erro")
    }
    db = client.db("crudd")
    app.listen(3000, function(){
        console.log('ouvindo')
    })
})

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static('./view/DesafioEstagio/Projeto-Vue'));

app.get('/', function(req, res){
        
        
})

app.post('/show', function(req, res){
    data = new Date();
    ano4 = data.getFullYear()
    idade = ano4 - +req.body['Data-de-Nascimento'].split('-')[0]

    let MarcaDaVacina

    if(idade >= 60){

        MarcaDaVacina = "Oxford"

    }else if(idade < 60 && idade > 30){

        MarcaDaVacina = "Coronavac"

    }else if(idade <= 30){

        MarcaDaVacina = "AstraZeneca"

    }

    let DataDeNascimento = req.body['Data-de-Nascimento'].split('-').reverse().join('-')
    delete req.body['Data-de-Nascimento']
    const savedb = {...req.body, MarcaDaVacina, DataDeNascimento}
    
    db.collection("paciente").save(savedb, (err, result) => {
        if(err){
            return console.log("deu erro")
        }
        console.log(req)
        console.log("Salvo no mongoDB")
        res.redirect("localhost")
    })
})