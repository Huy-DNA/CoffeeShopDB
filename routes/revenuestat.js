var express = require('express');
var router = express.Router();
var model = require('../model/model');
const { DateTime } = require('luxon')

router.get('/', async function (req, res, next) {
    const year = Number.parseInt(req.query.year)
    if (!isNaN(year)) {
        const tmp = await model.execTableFunc('ThongKeDoanhThu', year) 

        const rawYearRevenue = tmp.map(e => ({
            month: e.Month,
            total_revenue: e['Total revenue (VND)'],
        }))

        const yearRevenue = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(e => ({
            month: e,
            total_revenue: 0,
        }))

        for (let monthRevenue of rawYearRevenue)
            yearRevenue[monthRevenue.month - 1].total_revenue = monthRevenue.total_revenue

        res.render('revenuestat', { yearRevenue: yearRevenue, defaultYear: year })
    }
    else {
        res.render('revenuestat', { yearRevenue: [], defaultYear: DateTime.now().year })
    }
});

module.exports = router;