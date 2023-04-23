var express = require("express");
var router = express.Router();
var model = require("../model/model");

router.get("/", function (req, res, next) {});

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

module.exports = router;
