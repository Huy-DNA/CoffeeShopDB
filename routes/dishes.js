var express = require('express');
var router = express.Router();
var model = require('../model/model');

router.get('/', async function (req, res, next) {
    const tmp = await model.from(['Dish D', 'DishGroup G'])
                           .whereAttribute('D.group_id', '=', 'G.id')
                           .select(['D.name', 'G.name', 'D.url'])
                           .query()
    const dishList = tmp.map(e => ({
        name: e.name[0],
        group: e.name[1],
        url: e.url,
    }))
    res.render('dishes', { dishList })
})

router.get('/add', function (req, res, next) {

})

router.post('/add', function (res, req, next) {

})

router.get('/:dishId', function (req, res, next) {
    
})

module.exports = router;