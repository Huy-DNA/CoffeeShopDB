var express = require("express");
var router = express.Router();
var model = require('../model/model');
router.get('/', async function (req, res, next) {
    const tmp = await model.from(['Dish D', 'DishGroup G'])
                           .whereAttribute('D.group_id', '=', 'G.id')
                           .select(['D.name', 'G.name', 'D.url', 'D.id'])
                           .query()
    const dishList = tmp.map(e => ({
        name: e.name[0],
        group: e.name[1],
        url: e.url,
        id: e.id,
    }))
    res.render('dishes', { dishList })
})

router.get("/add", async function (req, res, next) {
    const tmp = await model.from(["DishGroup"]).select(["name", "id"]).query();
    const group_dishes = tmp.map((e) => ({
        name: e.name,
        id: e.id,
    }));

    res.render("dishform", { group_dishes });
});

router.post("/add", async function (req, res, next) {
    res.redirect("/dishes");
    var {
        id,
        name,
        url,
        group_id,
        dtype,
        fprice,
        fstart,
        fend,
        dsize,
        dprice,
    } = req.body;
    console.log(req.body);
});

router.get("/:dishId", function (req, res, next) {});

router.get('/:id', async function (req, res, next) {
const { id } = req.params;
const temp = await model.from(['Dish D','DishGroup G','Food F','FoodServe FS'])
                            .whereAttribute('D.group_id','=','G.id')
                            .whereAttribute('F.id','=','D.id')
                            .whereAttribute('F.id','=','FS.food_id')
                            .whereValue('D.id', '=', id)
                            .select(['D.name','G.name','D.url','D.id','F.price','FS.start_serve','FS.end_serve'])
                            .query()    

const dishInfo= temp.map(e=>({
    name: e.name[0],
    group: e.name[1],
    url: e.url,
    id: e.id,
    price: e.price,
    start: e.start_serve,
    end: e.end_serve,
}))
if (dishInfo.length > 0) {
    let mergedDishInfo = {
      name: dishInfo[0].name,
      group: dishInfo[0].group,
      url: dishInfo[0].url,
      id: dishInfo[0].id,
      price: dishInfo[0].price,
      duration: ""
    };
    for (let i = 0; i < dishInfo.length; i++) {
      const start = dishInfo[i].start.toISOString().substring(11, 16);
      const end = dishInfo[i].end.toISOString().substring(11, 16);
      mergedDishInfo.duration += start + " - " + end;
      if (i !== dishInfo.length - 1) {
        mergedDishInfo.duration += ", "; // add comma separator for all elements except the last one
      }
    }
     // replace dishInfo array with the merged object
     res.render('dishInfo',{mergedDishInfo})
  }
  ///////drink
  const temp1 = await model.from(['Dish D','DishGroup G','Drink dr','DrinkSize ds'])
                            .whereAttribute('D.group_id','=','G.id')
                            .whereAttribute('dr.id','=','D.id')
                            .whereAttribute('ds.drink_id','=','D.id')
                            .whereValue('D.id', '=', id)
                            .select(['D.name','G.name','D.url','D.id','ds.price','ds.size'])
                            .query()    

const drinkInfo= temp1.map(e=>({
    name: e.name[0],
    group: e.name[1],
    url: e.url,
    id: e.id,
    price: e.price,
    size: e.size,
}))
if (drinkInfo.length > 0) {
    let mergedDrinkInfo = {
      name: drinkInfo[0].name,
      group: drinkInfo[0].group,
      url: drinkInfo[0].url,
      id: drinkInfo[0].id,
      price: "",
    };
    for (let i = 0; i < drinkInfo.length; i++) {
      const size = drinkInfo[i].size;
      const price = drinkInfo[i].price;
      mergedDrinkInfo.price += size + " : " + price;
      if (i !== drinkInfo.length - 1) {
        mergedDrinkInfo.price += ", "; // add comma separator for all elements except the last one
      }
    }
    
    
    res.render('drinkInfo',{mergedDrinkInfo})
  }
})

module.exports = router;
