const request = require('request');
const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const mysql = require('mysql');
const assert = require('assert');

const app = require('../index.js');

const expect = chai.expect;
const should = chai.should();

chai.use(chaiHttp);

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cs130_project',
    multipleStatements: true,
});

//Clear the test database
const query = `SET FOREIGN_KEY_CHECKS = 0; TRUNCATE TABLE User; ` +
				`TRUNCATE TABLE Request; SET FOREIGN_KEY_CHECKS = 1;`;

db.query(query, (error, res) => {
    if (error) {
        console.log(error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .send({ message: "Internal server error." });
    }
    else {
        console.log("Success");
    }
});


// TODO:
// Dynmically switch server.js database to cs130_project_test when testing
it('GET /', done => {
    chai.request(app)
      .get('/')
      .end(function(err, res) {
        expect(res).to.have.status(200);
        // See TODO1 in server.js, we need to set the content type to
        // json but it isn't working for some reason
        expect(res.text).to.equal('[]');
        done();
      });
});

/******************************* USER TESTS *******************************/

it('Should sign up a user', function(done) {
	chai.request(app)
	.post('/v1/user/0/signup')
	.send({"password":"abc"})
	.end(function(err, res) {
		res.should.have.status(200);
		done();
	});
});

it('Should prevent duplicate user', function(done) {
	chai.request(app)
	.post('/v1/user/0/signup')
	.send({"password":"abc"})
	.end(function(err, res) {
		res.should.have.status(500);
		done();
	});
});

it('Should login a user', function(done) {
	chai.request(app)
	.post('/v1/user/0/login')
	.send({"password":"abc"})
	.end(function(err, res) {
		res.should.have.status(200);
		done();
	});
});

it('Should reject a user login with incorrect password', function(done) {
	chai.request(app)
	.post('/v1/user/0/login')
	.send({"password":"abcd"})
	.end(function(err, res) {
		res.should.have.status(417);
		expect(res.text).to.equal('{}');
		done();
	});
});

it('Should update password', function(done) {
    chai.request(app)
    .post('/v1/user/0/update')
    .send({"password":"abc",
            "newPassword": "bcd"})
    .end(function(err, res) {
        res.should.have.status(200);
        done();
    });
});

it('Should reject a password update with incorrect password', function(done) {
    chai.request(app)
    .post('/v1/user/0/update')
    .send({"password":"abcd",
            "newPassword": "bcd"})
    .end(function(err, res) {
        res.should.have.status(417);
        expect(res.text).to.equal('{}');
        done();
    });
});

/******************************* REQUEST TESTS *******************************/

it('Should create a request', function(done) {
    chai.request(app)
    .post('/v1/request/create')
    .send({"userId":"0",
            "title":"first request",
            "latitude":32.001,
            "longitude":32.001,
            "address":"527 Midvale",
            "description":"first request",
            "timeStart":"2017-01-09 00:00:00",
            "timeEnd":"2017-01-11 00:00:00"
        })
    .end(function(err, res) {
        res.should.have.status(200);
        done();
    });
});

it('Should get a user\'s requests', function(done) {
    chai.request(app)
    .get('/v1/user/0/requests')
    .end(function(err, res) {
        res.should.have.status(200);
        done();
    });
});

it('Should reject acceptance of an expired request', function(done) {
    chai.request(app)
    .post('/v1/request/1/accept')
    .send({"userId":"0",
           "time":"2017-01-12 00:00:00",
        })
    .end(function(err, res) {
        res.should.have.status(404);
        done();
    });
});

it('Should accept a user\'s request', function(done) {
    chai.request(app)
    .post('/v1/request/1/accept')
    .send({"userId":"0",
           "time":"2017-01-10 00:00:00",
        })
    .end(function(err, res) {
        res.should.have.status(200);
        done();
    });
});

it('Should reject confirmation of an expired request', function(done) {
    chai.request(app)
    .post('/v1/request/1/confirm?userId="0"&time="2017-01-12 00:00:00"')
    .end(function(err, res) {
        res.should.have.status(404);
        done();
    });
});

it('Should confirm a user\'s request', function(done) {
    chai.request(app)
    .post('/v1/request/1/confirm?userId="0"&time="2017-01-10 00:00:00"')
    .end(function(err, res) {
        res.should.have.status(200);
        done();
    });
});

it('Should reject completion of an expired request', function(done) {
    chai.request(app)
    .post('/v1/request/1/complete?userId="0"&time="2017-01-12 00:00:00"')
    .end(function(err, res) {
        res.should.have.status(404);
        done();
    });
});

it('Should complete a user\'s request', function(done) {
    chai.request(app)
    .post('/v1/request/1/complete?userId="0"&time="2017-01-10 00:00:00"')
    .end(function(err, res) {
        res.should.have.status(200);
        done();
    });
});

it('Should delete a request', function(done) {
    chai.request(app)
    .post('/v1/request/1/delete?userId="0"')
    .end(function(err, res) {
        res.should.have.status(200);
        done();
    });
});

it('Should get all nearby requests', function(done) {
    chai.request(app)
    .get('/v1/requests/all?userId="1"&latitude="35"&longitude="35"')
    .end(function(err, res) {
        res.should.have.status(200);
        done();
    });
});

/******************************* MESSAGE TESTS *******************************/
it('Should create a message session', function(done) {
	chai.request(app)
	.post('/v1/user/1/signup')
	.send({"password":"abc"})
	.end(function(err, res) {
		res.should.have.status(200);
	});

    chai.request(app)
    .post('/v1/message/session/create')
    .send({"userId1":"0",
		   "userId2":"1"})
    .end(function(err, res) {
        res.should.have.status(200);
        done();
    });
});

it('Should return a user\'s message sessions', function(done) {
	chai.request(app)
	.get('/v1/user/1/messageSessions')
	.end(function(err, res) {
		res.should.have.status(200);
		done();
	});
});

it('Should get messages from a message session', function(done) {
	chai.request(app)
	.get('/v1/message/session/1')
	.end(function(err, res) {
		res.should.have.status(200);
		done();
	});
});

