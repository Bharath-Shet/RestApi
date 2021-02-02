const express = require('express');
const app = express();
const port = process.env.PORT || 9900;
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const bodyParser = require('body-parser');
const cors = require('cors');

const mongourl = "mongodb+srv://bshet153:9986435153qwerty@eduintern.itkce.mongodb.net/EduRest?retryWrites=true&w=majority";
let db;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.get('/', (req, res) => {
    console.log('Health ok')
})

/*

add user to users collections
display users detail
update users detail wrt id
delete 
    -> soft delete
    -> hard delete


*/
app.put('/deactivate', (req, res) => {
    var id = mongo.ObjectID(req.body._id)
    db.collection('users').update({ _id: id }, {
        $set: {
            isActive: false
        }
    }, (err, result) => {
        if (err) console.log(result)
        res.status(200).send("Account deactivated")
    })
})

app.put('/activate', (req, res) => {
    var id = mongo.ObjectID(req.body._id)
    db.collection('users').update({ _id: id }, {
        $set: {
            isActive: true
        }
    }, (err, result) => {
        if (err) console.log(result)
        res.status(200).send("Account activated")
    })
})

app.delete('/deleteUser', (req, res) => {
    var id = mongo.ObjectID(req.body._id)
    db.collection('users').remove({ _id: id }, (err, result) => {
        if (err) console.log(err);
        res.status(200).send('Account deleted')
    })
})


app.put('/updateUsers', (req, res) => {
    var id = mongo.ObjectID(req.body._id)
    db.collection('users').update({ _id: id }, {
        $set: {
            name: req.body.name,
            city: req.body.city,
            role: req.body.role,
            phone: req.body.phone,
            isActive: req.body.isActive
        }
    }, (err, result) => {
        if (err) console.log(err);
        res.status(200).send('User data updated')
    })
})

app.post('/addUsers', (req, res) => {
    db.collection(colleciton_name).insert(req.body, ((err, result) => {
        if (err) throw err;
        res.status(200).send('Data inserted');
    }))
});

app.get('/users', (req, res) => {
    var sortcondition = { name: 1 }
    var limit = 100
    if (req.query.sort) {
        sortcondition = { name: Number(req.query.sort) }
    }
    if (req.query.limit) {
        limit = Number(req.query.limit)
    }

    db.collection('users').find({}).sort(sortcondition).limit(limit).toArray((err, result) => {
        if (err) throw err;
        res.status(200).send(result);
    })
})


//place order

app.post('/placeorder', (req, res) => {
    db.collection('orders').insert(req.body, (err, result) => {
        if (err) console.log(err);
        res.status(200).send('Order placed')
    })
})


//get order list

app.get('/orders', (req, res) => {
    db.collection('orders').find().toArray((err, result) => {
        if (err) console.log(err)
        res.send(result);
    })
})


/*
get list of city > done
get list of meal > done
get restaurent on basis of city > done
get restaurent on basis of meal > done
get restaurent on basis of meal+cuisine >done
get restaurent on basis of meal+cost > done
get restaurent details > done
post restaurent order
get booking list
*/

app.get('/rest/:id', (req, res) => {
    var id = req.params.id
    db.collection('restaurent').find({ _id: id }).toArray((err, result) => {
        if (err) throw err;
        res.send(result)
    })
})

//Rest route 
app.get('/rest', (req, res) => {
    var condition = {}
    if (req.query.mealtype && req.query.lcost && req.query.hcost) {
        condition = { $and: [{ "type.mealtype": req.query.mealtype }, { cost: { $lt: (Number(req.query.hcost)), $gt: (Number(req.query.lcost)) } }] }
    }
    if (req.query.mealtype && req.query.cuisine) {
        condition = { $and: [{ "type.mealtype": req.query.mealtype }, { "Cuisine.cuisine": req.query.cuisine }] }
    } else if (req.query.mealtype) {
        conditon = { "type.mealtype": req.query.mealtype }
    } else if (req.query.city) {
        condition = { city: req.query.city }
    }
    db.collection('restaurent').find(condition).toArray((err, result) => {
        if (err) throw err;
        res.send(result)
    })
})


app.get('/meal', (req, res) => {

    db.collection('mealType').find().toArray((err, result) => {
        if (err) console.log(err);
        res.send(result);
    })
});

//city route
app.get('/city', (req, res) => {
    db.collection('city').find().toArray((err, result) => {
        if (err) console.log(err);
        res.send(result);
    })
});

//cuisine route
app.get('/cuisine', (req, res) => {
    db.collection('cuisine').find().toArray((err, result) => {
        if (err) console.log(err);
        res.send(result);
    })
})



MongoClient.connect(mongourl, (err, connection) => {
    if (err) console.log(err);
    db = connection.db('EduRest');
    app.listen(port, (err) => {
        if (err) throw err;
        console.log(`Server is runing on port ${port}`);
    })
});
