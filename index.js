const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const objectID = require('mongodb').objectID
const mongoClient = require("mongodb").mongoClient
const MongoClient  = require('mongodb')
const nodemailer = require('nodemailer')
const session = require('express-session')
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
app.set('view engine', 'ejs')
app.use(express.static('./views/Vue'));
app.use(express.static('./views/'));
app.use(session({secret:'felipe',resave:false,saveUninitialized:true}))

app.post('/login', (req, res) =>{
    db.collection('aplicadores').find().toArray(
        (err, results) => {

            if (err) {
                return console.log(err)
            }
            
            Emaildbb = results.map(e =>{
                return e.EmailA
            })
            Senhadbb = results.map(e =>{
                return e.SenhaA
            })
            Emaildb = Emaildbb.join('')
            Senhadb = Senhadbb.join('')

           
            if(req.body.EmailA == Emaildb && req.body.SenhaA == Senhadb){
                req.session.user = Emaildb
                res.redirect('tabela')
            }else{
             res.status(401).end('Incorrect Username and/or Password!')
            }
            
        })

    
})

app.get('/', function (req, res){
    res.send('ola')
})

app.get('/tabela', function (req, res) {
    if(!req.session.user){
        return res.status(401).send('Acesso restrito');
    }

    db.collection('PrimeiraDose').find().toArray(
        (err, results) => {

            if (err) {
                return console.log(err)
            }

            res.render('tabela', {dado: results})
             
            
        })

})

/*Faz o logout*/
app.get('/Deslogar', function (req, res) {
        req.session.user = ''
           
      res.redirect('/')

})


app.get('/SegundaDose', function (req, res) {
    if(!req.session.user){
        return res.status(401).send('Acesso restrito');
    }
    db.collection('SegundaDose').find().toArray(
        (err, results) => {

            if (err) {
                return console.log(err)
            }
            
            res.render('SegundaDose', {dado: results})
             
            
        })

})



/*ENVIAR DADOS DO PACIENTE PARA O BANCO*/
app.post('/show', async function(req, res){


    /*verifica CPF dos cadastrados da primeira Dose*/
    try{

        const results = await db.collection('PrimeiraDose').find({ "Cpf": req.body.Cpf }).toArray();

        results.map(e=>{
            if(req.body.Cpf == e.Cpf){
                return res.send('CPF ja cadastrado')
            }
        })
    }catch(err){
        return err
    }

    /*verifica CPF dos cadastrados da Segunda Dose*/
    try{

        const resultados = await db.collection('SegundaDose').find({ "Cpf": req.body.Cpf }).toArray();

        resultados.map(e=>{
            if(req.body.Cpf == e.Cpf){
                return res.send('CPF ja cadastrado')
            }
        })
    }catch(err){
        return err
    }

    /*Verifica se n tem incopatibilidade de horario de agendamento da primeira dose*/
    try{
        const results = await db.collection('PrimeiraDose').find({ "LocaldeVacinação": req.body.LocaldeVacinação }).toArray();
        
        results.map(e=>{
        if(e.DatadeVacinação == req.body['DatadeVacinação'] && e.HorarioVacinação == req.body['HorarioVacinação']){
            return res.send('horario indisponivel')
        }
        })
    }catch(err){
        return err
    }

    /*Verifica se n tem incopatibilidade de horario de agendamento da segunda dose*/
    try{
        const results = await db.collection('SegundaDose').find({ "LocaldeVacinação": req.body.LocaldeVacinação }).toArray();
        
        results.map(e=>{
        if(e.DatadeVacinação == req.body['DatadeVacinação'] && e.HorarioVacinação == req.body['HorarioVacinação']){
            return res.send('horario indisponivel')
        }
        })
    }catch(err){
        return err
    }
   
    

    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth: {user:"savteste30@gmail.com" ,pass:"@Lodefelipe3"} 
    })
    
    
    let mailOptions = {
    from: 'savteste30@gmail.com',
    to: req.body.email,
    subject:"Agendamento de Vacinação covid-19",
    text: `Ole muito obrigado por ser cadastrar ${req.body.Nome} no nosso sistema, 
    sua vacinação foi agendada para a data de ${req.body['DatadeVacinação']}, no posto/hospital ${req.body['LocaldeVacinação']}, no horario ${req.body["HorarioVacinação"]} 
    Aguardamos sua presença.`
}
    transporter.sendMail(mailOptions, function(){
    if(err){
    console.log("qubrou")
    } else{
    console.log("Enviado")
    }
})
                    
               
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

if(savedb.dose == "Segunda Dose"){
    db.collection("SegundaDose").insertOne(savedb, (err, result) => {
        if(err){
            return console.log("deu erro")
        }
    
        console.log("Salvo no mongoDB")
        
        res.redirect("back")
        
        })
            }else{
    db.collection("PrimeiraDose").insertOne(savedb, (err, result) => {
        if(err){
            return console.log("deu erro")
        }
            console.log("Salvo no mongoDB")
            res.redirect("back")  
    })
}
        

})

   






/*Vacina o paciente*/
app.route('/Vacinado/:id')
.get((req, res) =>{
    var id = req.params.id
    db.collection('PrimeiraDose').deleteOne({
        _id: MongoClient.ObjectID(id)
    },
    (err, result) =>{
        if(err) return console.log(err) 

        console.log('Paciente Vacinado')
        res.redirect('/tabela')
    }
    


    )
    
})

app.route('/Vacinado2/:id')
.get((req, res) =>{
    var id = req.params.id
    db.collection('SegundaDose').deleteOne({
        _id: MongoClient.ObjectID(id)
    },
    (err, result) =>{
        if(err) return console.log(err) 

        console.log('Paciente Vacinado')
        res.redirect('/SegundaDose')
    }
    


    )
    
})