const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const mongoDBConnectionString = process.env.connectionString;
mongoose.connect(mongoDBConnectionString);

const itemsSchema = {
    name: String,
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
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {

    let day = "Today";
    Item.find({},(err, foundItems) => {
        
        if(foundItems.length === 0){
            Item.insertMany(defaultItems, (err) => {
                if(err){
                    console.log(err);
                } else{
                    console.log("Inserted default items successfully.");
                }
            });
            res.redirect("/");
        } else{
            res.render("list", {listName: day, newListItems: foundItems});    
        }
        console.log(foundItems);
    });
});

app.get("/:listName", (req, res) => {
    const listName = _.capitalize(req.params.listName);
    List.findOne({name: listName}, (err, foundList) => {
        if(!err){
            if(!foundList){
                const newList = new List({
                    name: listName,
                    items : defaultItems
                });
                newList.save();
                res.redirect("/" + listName);
            } else{
                res.render("list", {listName: foundList.name, newListItems: foundList.items});
            }
        }
    });
});

app.post("/", (req, res) => {
    let item = req.body.task;
    let listName = req.body.list;
    let newItem = new Item({
        name: item
    });
    if(listName === "Today"){
        newItem.save();
        res.redirect("/");
    } else{
        List.findOne({name : listName}, (err, foundItems) => {
            foundItems.items.push(newItem);
            foundItems.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete", (req, res) => {
    const listName = req.body.listName;
    const idDelete = req.body.checkbox;
    console.log(listName);
    console.log(idDelete);
    if(listName === "Today"){
        Item.findByIdAndRemove(idDelete, (err) => {
            if(err){
                console.log(err);
            } else{
                console.log("Deleted Successfully.");
            }
        });
        res.redirect("/");
    } else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: idDelete}}}, (err, result) => {
            if(!err){
                res.redirect("/" + listName);
            }
        });
    }
});

let port = process.env.port;
if(port == null || port == ""){
    port = 3000;
}

app.listen(port, () => {
    console.log("Server is up and running!");
});