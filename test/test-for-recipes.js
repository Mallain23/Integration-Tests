const chai = require("chai");
const chaiHttp = require("chai-http");

const {app, runServer, closeServer} = require("../server.js")

const should = chai.should();

chai.use(chaiHttp)

describe('Recipes', function() {
    before(function() {
        return runServer();
    });

    after(function() {
        return closeServer();
    });

    it('should list items on GET', function() {
        return chai.request(app)
        .get('/recipes')
        .then(function(res) {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('array');
            res.body.length.should.be.at.least(1);
            const expectedKeys = ['name', 'id', 'ingredients'];
            res.body.forEach(function(item) {
                item.should.be.a('object');
                item.should.include.keys(expectedKeys)
            })
        });
    });

    it('should add a recipe on Post', function() {
        const newItem = {name: "cake", ingredients: ['flour', 'milk', 'eggs', 'sugar'] }
        return chai.request(app)
        .post('/recipes')
        .send(newItem)
        .then(function(res) {
            res.should.have.status(201);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.include.keys('name', 'id', 'ingredients');
            res.body.id.should.not.be.null;
            res.body.ingredients.should.be.a('array');
            res.body.name.should.equal(newItem.name)
            res.body.should.deep.equal(Object.assign(newItem, {id: res.body.id}));
        })
    })

    it('should update an item on put', function() {

      const updateItem = {
          name: "apple pie",
          ingredients: ["apples", "pie-crust"]
      }
      return chai.request(app)
        .get('/recipes')
        .then(function(res) {
            updateItem.id = res.body[0].id
            return chai.request(app)
            .put(`/recipes/${updateItem.id}`)
            .send(updateItem)
        })
        .then(function(res) {
            res.should.have.status(200);
            res.should.json;
            res.body.should.be.a('object');
            res.body.should.deep.equal(updateItem)
        })
    })

    it('should delete an item on delete', function() {
        return chai.request(app)
        .get('/recipes')
        .then(function(res) {
            return chai.request(app)
            .delete(`/recipes/${res.body[0].id}`)
        })
        .then(function(res) {
            res.should.have.status(204)
        })
    })
});
