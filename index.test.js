
// test("working",()=>{
//     expect(true).toBe(true)
// })

//test when entering the data in the database for (POST /add)
const supertest = require('supertest');
const app = require('./app.js');

describe("POST /add", () => {
    describe("all details are there", () => {
        test("should return status code 200", async () => {
            const response = await supertest(app)
                .post("/add")
                .send({
                    officename: "a",
                    pincode: 744201,
                    officetype: "c",
                    deliverystatus: "d",
                    divisionname: "e",
                    regionname: "f",
                    circlename: "g",
                    taluk: "h",
                    districtname: "i",
                    statename: "j"
                });
            expect(response.statusCode).toBe(201);
        });
        test("server send back json as content type",async()=>{
            const response = await supertest(app)
            .post("/add")
            .send({
                officename: "a",
                pincode: 744201,
                officetype: "c",
                deliverystatus: "d",
                divisionname: "e",
                regionname: "f",
                circlename: "g",
                taluk: "h",
                districtname: "i",
                statename: "j"
            });
        expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
        })
    });
    describe("when details are not there",()=>{
        test("should return status code 500", async () => {
        const response = await supertest(app)
                .post("/add")
                .send({
                    officename: "a"
        })
        expect(response.statusCode).toBe(500)
    })
})
});

