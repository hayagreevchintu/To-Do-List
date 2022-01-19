const express = require('express');
const bodyParser = require('body-parser');
const { urlencoded } = require('body-parser');
const mongoose = require('mongoose');
const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

let items = [];

mongoose.connect("mongodb://localhost:27017/todoListDB");

const itemsSchema = {
    name: {
        type: String,
        required: [true, "What's the task, bruh?"]
    }
};

const Item = mongoose.model("Item", itemsSchema);

Item.find((err, itemss) => {
    if(err){
        console.log(err);
    }else{
        itemss.forEach((item) => {
            items.push(item.name);
        });
    }
});

let updateList = (item) => {
    let newItem = new Item({
        name: item
    });
    newItem.save();
};

app.get('/', (req, res) => {
    let today = new Date();
    let options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    let day = today.toLocaleDateString("en-US",options);
    res.render("list", {kindOfDay: day, tasks: items});
    console.log(items);
});

app.post('/', (req, res) => {
    let item = req.body.task;
    updateList(item);
    res.redirect('/');
});

app.listen(3000, () => {
    console.log("Server is up and running!");
});