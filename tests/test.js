var app, expect, request, sinon;

request = require('supertest');

app = require('../app');
expect = require('chai').expect;
sinon = require('sinon');

describe('GET index', function() {
  before(function() {
    return this.spy = sinon.spy(app, 'render');
  });
  after(function() {
    return this.spy.restore();
  });
  it('should exist', function() {
    return request(app).get('/favlangjs?username=esaenzc').expect(200);
  });
  return it('should render the "index" view', function() {
    return expect(this.spy.getCall(0).args[0]).to.be.eql('index');
  });
});