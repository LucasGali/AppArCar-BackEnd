const { expect } = require('chai')
const request = require('supertest')
const chai = require('chai')
const init = require('../app')
chai.use(require("chai-http"))

let app

before(async() => {
  app = await init()
})

describe('API', () => {
  describe('GET /users', () => {
    it('return all users data from db', async () => {
      // To be deprecated in the future
      const token  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDhhYWI1MzUxMTU3MzQxNzYxY2IxMjMiLCJpYXQiOjE2MTk3MDA1NjN9.Mit0yaHscG7BPwtcst0fiNa-cKfp0vJR-B1scMTjRBI"
      let response = await request(app).get('/users').set({ "Authorization": `Bearer ${token}` })
      expect(response.status).to.eql(200);
      expect(response.body).to.be.an('array');
    })
  })

  describe('GET /signin', () => {
    it('succesfuly signin', async () => {      
      let response = await request(app).post('/signin').send({
        email: 'gonzalo@gmail.com',
        password: 'asd123',
      });
      expect(response.status).to.eql(200)
      expect(response.body.token).to.be.a('string')
    })
  })

  describe('GET /signin', () => {
    it('try to signin without a password', async () => {      
      let response = await request(app).post('/signin').send({
        "email": "asd@gmail.com"
    })
      expect(response.status).to.eql(404);
      expect(response.error.text).to.contain('Must provide email and password')
    })
  })

  describe('GET /signin', () => {
    it('unsuccesfuly signin', async () => {
      let response = await request(app).post('/signin').send({
        email: 'asd@gmail.com',
        password: 'olivierDoesntLikeMyVariableNames',
      });
      expect(response.status).to.eql(404);
      expect(response.error.text).to.contain('Invalid password or email');
    });
  });

  // BE CAREFUL RUN THIS AS LITTLE AS POSIBLE AND later delete the test users from the DB, use it and comment it again
  // describe('Post /signup', () => {
  //   it('return data from db', async () => {
  //     let response = await request(app).post('/signup').send({
  //       "name": "Automated Test",
  //       "surname": "Automated Test",
  //       "age": 31,
  //       "email": `test${Math.floor(Math.random() * 9999)}@gmail.com`,
  //       "password": "asd123"
  //     })
  //     expect(response.status).to.eql(201);
  //     expect(response.body.token).to.be.a('string');
  //     expect(response.body.user).to.be.an('object');
  //   });
  // });

  after(async () => {
    await require('mongoose').disconnect()
  })
})
