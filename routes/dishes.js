var express = require("express");
var router = express.Router();
var model = require('../model/model');

router.get('/', async function (req, res, next) {
    if (req.query.q === undefined) {
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
    }
    else {
        const tmp = await model.from(['Dish D', 'DishGroup G'])
                               .whereAttribute('D.group_id', '=', 'G.id')
                               .whereValue('D.name', 'LIKE', `%${req.query.q}%`)
                               .select(['D.name', 'G.name', 'D.url', 'D.id'])
                               .query()
        const dishList = tmp.map(e => ({
            name: e.name[0],
            group: e.name[1],
            url: e.url,
            id: e.id,
        }))
        res.render('dishes', { dishList })
    }
})

router.get('/add', function (req, res, next) {
    const type = req.query.type

    if (type === 'food') {
        res.redirect("/dishes/add/food")
    }
    else if (type === 'drink') {
        res.redirect("/dishes/add/drink")
    }
    else
        res.render("dishform/prompt", {})
});

router.get('/add/food', async function (req, res, next) {
    const dishGroup = await model.from(['DishGroup'])
                                 .select(['name', 'id'])
                                 .query()
    
    res.render("dishform/foodForm", { dishGroup })
})

router.post('/add/food', async function (req, res, next) {
    console.log(req.body)

    try {
        await model.from(['Dish'])
                .insert({
                        id: req.body.id,
                        group_id: req.body.group_id,
                        url: req.body.url,
                        name: req.body.name,
                })
        
        await model.from(['Food'])
                .insert({
                        id: req.body.id,
                        price: req.body.price,
                })
        
        if (typeof req.body.start_serve === "object" && typeof req.body.end_serve === "object")
            for (let i = 0; i < req.body.start_serve.length; ++i)
                await model.from(['FoodServe'])
                        .insert({
                                food_id: req.body.id,
                                start_serve: req.body.start_serve[i],
                                end_serve: req.body.end_serve[i],
                            })
        else await model.from(['FoodServe'])
                        .insert({
                            food_id: req.body.id,
                            start_serve: req.body.start_serve,
                            end_serve: req.body.end_serve,
                        })
        
        res.redirect('/dishes')
    }
    catch (e) {
        next(e)
    }
    
})

router.get('/add/drink', async function (req, res, next) {
    const dishGroup = await model.from(['DishGroup'])
                                 .select(['name', 'id'])
                                 .query()

    res.render("dishform/drinkForm", { dishGroup })
})

router.post('/add/drink', async function (req, res, next) {
    console.log(req.body)

    try {
        await model.from(['Dish'])
                .insert({
                        id: req.body.id,
                        group_id: req.body.group_id,
                        url: req.body.url,
                        name: req.body.name,
                })
        
        await model.from(['Drink'])
                .insert({
                        id: req.body.id,
                })
        
        if (typeof req.body.price === "object" && typeof req.body.size === "object")
            for (let i = 0; i < req.body.size.length; ++i)
                await model.from(['DrinkSize'])
                        .insert({
                                drink_id: req.body.id,
                                size: req.body.size[i],
                                price: req.body.price[i],
                        })
        else await model.from(['DrinkSize'])
                        .insert({
                            drink_id: req.body.id,
                            size: req.body.size,
                            price: req.body.price,
                        })
        
        res.redirect('/dishes')
    }
    catch (e) {
        next(e)
    }
})

router.get('/:dishId', async function (req, res, next) {
    const { dishId } = req.params;

    if (dishId.match(/^F\d{4}$/)) {
        const tmp_1 = await model.from(['Dish D', 'DishGroup G', 'Food F'])
                                 .whereAttribute('D.group_id', '=', 'G.id')
                                 .whereAttribute('F.id', '=', 'D.id')
                                 .whereValue('D.id', '=', dishId)
                                 .select(['D.name', 'G.name', 'D.url', 'D.id', 'F.price'])
                                 .query()
        
        const tmp_2 = await model.from(['FoodServe F'])
                                 .whereValue('F.food_id', '=', dishId)
                                 .select(['*'])
                                 .query()
        
        if (tmp_1.length === 0)
            return next("No dish found!")
        
        const foodInfo = {
            name: tmp_1[0].name[0],
            group: tmp_1[0].name[1],
            url: tmp_1[0].url,
            id: tmp_1[0].id,
            price: tmp_1[0].price,
            startServe: tmp_2.map(e => e.start_serve.toISOString().substring(11, 16)),
            endServe: tmp_2.map(e => e.end_serve.toISOString().substring(11, 16)),
        }
        
        res.render('dish/foodInfo', { foodInfo })
    }
    else if (dishId.match(/^D\d{4}$/)) {
        const tmp_1 = await model.from(['Dish D', 'DishGroup G'])
                                 .whereAttribute('D.group_id', '=', 'G.id')
                                 .whereValue('D.id', '=', dishId)
                                 .select(['D.name', 'G.name', 'D.url', 'D.id'])
                                 .query()
                                 
        const tmp_2 = await model.from(['DrinkSize D'])
                                 .whereValue('D.drink_id', '=', dishId)
                                 .select(['*'])
                                 .query()

        if (tmp_1.length === 0)
            return next("No dish found!")

        const drinkInfo = {
            name: tmp_1[0].name[0],
            group: tmp_1[0].name[1],
            url: tmp_1[0].url,
            id: tmp_1[0].id,
            price: tmp_2.map(e => e.price),
            size: tmp_2.map(e => e.size),
        }

        res.render('dish/drinkInfo', { drinkInfo })
    }
    else 
        return next("No dish found!")
})

module.exports = router;
