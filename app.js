const express = require('express');
const bodyParser = require('body-parser');
const { urlencoded } = require('body-parser');
const mongoose = require('mongoose');
const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/todoListDB");

const itemsSchema = {
    name: {
        type: String,
        required: [true, "What's the task, bruh?"]
    }
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Wake up."
});
const item2 = new Item({
    name: "Brush your teeth."
});
const item3 = new Item({
    name: "Drink Coffee."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items : [itemsSchema],
}
const List = mongoose.model("List", listSchema);

let updateList = (item) => {
    let newItem = new Item({
        name: item
    });
    newItem.save();
};

app.get('/', (req, res) => {
    let items = [];
    let today = new Date();
    let options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    let day = today.toLocaleDateString("en-US",options);
    Item.find((err, foundItems) => {
        if(err){
            console.log(err);
        } if(foundItems.length === 0){
            Item.insertMany(defaultItems, (err) => {
                if(err){
                    console.log(err);
                } else{
                    console.log("Inserted default items successfully.");
                }
            });
            res.redirect('/');
        }
         else{
            res.render("list", {kindOfDay: day, tasks: foundItems});    
        }
        console.log(foundItems);
    });
});

app.get('/:listName', (req, res) => {
    const listName = req.params.listName;
    List.find((err, results) => {
        if(err){
            console.log(err);
        } else{
            const newList = new List({
                name: listName,
                items : defaultItems
            });
            const names = [];
            results.forEach((item) => {
                names.push(item.name);
            });
            if(names.length > 0){
                if(names.includes(listName)){
                    console.log("Already Present");
                } else{
                    newList.save();
                    console.log(`Inserted ${listName} successfully`);
                }
            } else{
                newList.save();
                console.log(`Inserted ${listName} successfully`);
            }
        }
    });
});

app.post('/', (req, res) => {
    let item = req.body.task;
    updateList(item);
    res.redirect('/');
});

app.post('/delete', (req, res) => {
    const idDelete = req.body.checkbox;
    Item.findByIdAndRemove(idDelete, (err) => {
        if(err){
            console.log(err);
        } else{
            console.log("Deleted Successfully.");
        }
    });
    res.redirect('/');
});

app.listen(3000, () => {
    console.log("Server is up and running!");
});