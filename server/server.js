/**
 * @FileOverview Backend endpoints
 * @author Michael, Andrew, JJ, Kevin, Michelle, Brandon
 * @version: 1.0
 */

import express from "express";
import http from "http";
import mysql from "mysql";
import url from "url"
import WebSocket from "ws";

const pool = mysql.createPool({
  connectionLimit : 50,
  host: 'us-cdbr-iron-east-05.cleardb.net',
  user: 'beffa2b11a15f1',
  password: '704f96be',
  database: 'heroku_f4bd3eb0d7b7de1',
});
//
// const pool = mysql.createPool({
//     connectionLimit : 20,
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'cs130_project',
//   });

const dbQuery = (query, callback) => {
    pool.getConnection((err, connection) => {
        connection.query(query, (error, results) => {
            connection.release();
            callback(error, results);
        });
    });
};

export const app = express();
const server = http.Server(app);
const PORT = process.env.PORT || 3000;
const HttpStatus = require('http-status-codes');

// HTTP body parser
let bodyParser = require('body-parser');
let multer = require('multer'); // v1.0.5
let upload = multer(); // for parsing multipart/form-data
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const wss = new WebSocket.Server({ server });
const connections = {}; // { userId: ws }

// When userId opens his message session with otherUserId, userId creates a
// websocket connection with the server. otherUserId may not have a websocket
// connection with the server.
wss.on('connection', (ws, req) => {
    const { userId, otherUserId } = url.parse(req.url, true).query;

    connections[userId] = ws;

    // TODO: JJ need to test
    ws.on('message', message => {
        connections[otherUserId] && connections[otherUserId].send(message);
    });

    // TODO: JJ need to test
    ws.on('close', () => {
        connections[userId] = undefined;
    });
});

app.get('/', (req, res) => {
    // TODO1: This breaks the test for some reason
    // res.setHeader('Content-Type', 'application/json');
    dbQuery('SELECT * FROM User', (error, results) => {
        res.status(HttpStatus.OK).send(results);
        // res.status(HttpStatus.OK).send("Test GET request");
    });
});

/**
 * Called when a user first signs up for Convenifriends.
 *
 * Example call:
 * http://localhost:3000/v1/user/testUserId/signup
 *
 * @name /v1/user/{userId}/signup
 *
 * @version 1
 * @param {string} userId - The user's desired username.
 * @param {string} password - The user's password.
 * @returns {res} The response, including an HTTP status indicating success or failure, and error info, if any.
 */
app.post('/v1/user/:userId/signup', upload.array(), (req, res) => {
    const userId = req.params.userId;
    const password = req.body['password'];

    const query = `INSERT INTO User(userId,password) ` +
                  `VALUES("${userId}","${password}")`;

    dbQuery(query, (error, results) => {
        if (error) {
            // console.log(error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .send({ message: "Internal server error." });
        }
        else {
            console.log("Success");
            res.status(HttpStatus.OK).send({});
        }
    });
});

/********************************** USERS **********************************/

/**
 * Called when a user logs into Convenifriends.
 *
 * Example call:
 * http://localhost:3000/v1/user/testUserId/login
 *
 * @name /v1/user/{userId}/login
 *
 * @version 1
 * @param {string} userId - The user's username.
 * @param {string} password - The user's password.
 * @returns {res} The response, including an HTTP status indicating success or failure, and error info, if any.
 */
app.post('/v1/user/:userId/login', upload.array(), (req, res) => {
    const userId = req.params.userId;
    const password = req.body['password'];

    const query = `SELECT * FROM User ` +
                  `WHERE BINARY password="${password}" and BINARY userId="${userId}"`;

    dbQuery(query, (error, results) => {
        if (error) {
            console.log(error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .send({ message: "Internal server error." });
        }
        else if (results.length > 0) {
            console.log("Success");
            res.status(HttpStatus.OK).send({});
        }
        else {
            console.log("Invalid credentials presented");
            res.status(HttpStatus.EXPECTATION_FAILED).send({});
        }
    });
});

/**
 * Called when a user updates their password in Convenifriends.
 *
 * Example call:
 * http://localhost:3000/v1/user/testUserId/update
 *
 * @name /v1/user/{userId}/update
 *
 * @version 1
 * @param {string} userId - The user's username.
 * @param {string} password - The user's old password.
 * @param {string} newPassword - The user's new password.
 * @returns {res} The response, including an HTTP status indicating success or failure, and error info, if any.
 */
app.post('/v1/user/:userId/update', upload.array(), (req, res) => {
    const userId = req.params.userId;
    const password = req.body['password'];
    const newPassword = req.body['newPassword'];

    const query = `UPDATE User SET password="${newPassword}" ` +
                  `WHERE BINARY userId="${userId}"`;

    dbQuery(query, (error, results) => {
        if (error) {
            console.log(error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .send({ message: "Internal server error." });
        }
        else if (results.affectedRows > 0){
            console.log("Success");
            res.status(HttpStatus.OK).send({});
        }
        else {
            console.log("Invalid credentials presented");
            res.status(HttpStatus.EXPECTATION_FAILED).send({});
        }
    });
});

// Returns messageSessions
// Returns messageSessions
app.get('/v1/user/:userId/messageSessions', (req, res) => {
    const { userId } = req.params;

    // TODO: We need a POST route for creating a new messageSession between
    // two users when a request is accepted.

    // TODO: return MessageSessions where userId == userId1 or userId == userId2.
    // Need to think about the case when user1 accepts 2+ of user2's requests.
    const query = `SELECT * FROM MessageSession `
                + `WHERE BINARY userId1="${userId}" OR BINARY userId2="${userId}"`;

    dbQuery(query, (error, results) => {
        if (error) {
            console.log(error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .send({ message: "Internal server error." });
        }
        else {
            let messageSessions = []

            for (let i = 0; i < results.length; i++) {
                let messageSession = {
                    messageSessionId: results[i].messageSessionId,
                    userId1: results[i].userId1,
                    userId2: results[i].userId2
                }
                messageSessions.push(messageSession)
            }
            console.log("Success");
            res.status(HttpStatus.OK).send(messageSessions);
        }
    });
});

/********************************** REQUESTS **********************************/

/**
 * Called when a user creates a new request.
 *
 * @name /v1/request/create
 *
 * @version 1
 * @param {string} userId - The user's username.
 * @param {string} title - The title of the request.
 * @param {string} description - A description of the user's request.
 * @param {float} latitude - The latitude of the request's location.
 * @param {float} longitude - The longitude of the request's location.
 * @param {string} address - The address of the request's location.
 * @param {string} timeStart - The time the request was made.
 * @param {string} timeEnd - The time the request expires.
 * @returns {res} The response, including an HTTP status indicating success or failure. In the case of success, a requestId is also returned, and error info is returned in case of a failure.
 */
app.post('/v1/request/create', (req, res) => {
    // In practice, will use req.params, but easier to modify the URL
    // query params during development

    // We're also currently assuming that the frontend passes strings like
    // "string" rather than string.
    const { userId, title, description } = req.body;
    const { latitude, longitude, address, timeStart, timeEnd } = req.body;

    // TODO: Gotta figure out a more cleaner way to do our queries ..
    const query = `INSERT INTO Request (requesterId, title, latitude, ` +
                  `longitude, address, description, timeStart, timeEnd) ` +
                  `VALUES ('${userId}', '${title}', ${latitude}, ${longitude}, ` +
                  `'${address}', '${description}', '${timeStart}', '${timeEnd}')`;

    dbQuery(query, (error, results) => {
        if (error) {
            console.log(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR)
               .send({  message: "Internal server error."  });
        }
        else {
            console.log("Success");
            res.status(HttpStatus.OK).send({});
        }
    });
});

/**
 * Called when a user deletes one of their existing requests.
 *
 * Example call:
 * http://localhost:3000/v1/request/1/delete?userId="test"
 *
 * @name /v1/request/{requestId}/delete
 *
 * @version 1
 * @param {int} requestId - The id of the request to be deleted.
 * @param {string} userId - The user's username.
 * @returns {res} The response, including an HTTP status indicating success or failure, and error info, if any.
 */
app.post('/v1/request/:requestId/delete', (req, res) => {
    const requestId = req.params.requestId;
    const { userId } = req.query;

    const query = `DELETE FROM Request ` +
                  `WHERE BINARY requestId=${requestId} AND BINARY requesterId=${userId}`;

    dbQuery(query, (error, results) => {
        if (error) {
            console.log(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR)
               .send({ message: error.message });
        } else {
            // Request doesn't exist or is expired
            if (results.affectedRows <= 0) {
                const err = "Request doesn't exist or is expired.";
                console.log(err);
                res.status(HttpStatus.NOT_FOUND).send({ message: err });

            // Delete succesful
            } else {
                console.log("Success");
                res.status(HttpStatus.OK).send({});
            }
        }
    });
});

/**
 * Called when a provider accepts a nearby unaccepted request.
 *
 * Example call:
 * http://localhost:3000/v1/request/1/accept?userId="test"&time="2017-04-04%2011:11:011"
 *
 * @name /v1/request/{requestId}/accept
 *
 * @version 1
 * @param {int} requestId - The id of the request to be accepted.
 * @param {string} userId - The provider's username.
 * @param {string} time - The time of acceptance.
 * @returns {res} The response, including an HTTP status indicating success or failure, and error info, if any.
 */
app.post('/v1/request/:request_id/accept', (req, res) => {
    const requestId = req.params.request_id;
    const { userId, time } = req.body;

    const query = `UPDATE Request ` +
                  `SET accepted='${time}', providerId='${userId}' ` +
                  `WHERE BINARY requestId=${requestId} AND '${time}' < timeEnd;`

    dbQuery(query, (error, results) => {
        if (error) {
            console.log(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR)
               .send({ message: "Internal server error." });
        } else {
            // Request doesn't exist or is expired
            if (results.affectedRows <= 0) {
                const err = "Request doesn't exist or is expired.";
                console.log(err);
                res.status(HttpStatus.NOT_FOUND).send({ message: err });

            // Accept succesful
            } else {
                console.log("Success");
                res.status(HttpStatus.OK).send({});
            }
        }
    });
});

/**
 * Called when a requester confirms the acceptance of one of their requests.
 *
 * Example call:
 * http://localhost:3000/v1/request/1/confirm?userId="test"&time="2017-04-04%2011:11:011"
 *
 * @name /v1/request/{requestId}/confirm
 *
 * @version 1
 * @param {int} requestId - The id of the request to be confirmed.
 * @param {string} userId - The requester's username.
 * @param {string} time - The time of confirmation.
 * @returns {res} The response, including an HTTP status indicating success or failure, and error info, if any.
 */
app.post('/v1/request/:request_id/confirm', (req, res) => {
    const requestId = req.params.request_id;
    const { userId, time } = req.query;

    const query = `UPDATE Request ` +
                  `SET confirmed=${time}, providerId=${userId} ` +
                  `WHERE BINARY requestId=${requestId} AND ${time} < timeEnd;`

    dbQuery(query, (error, results) => {
        if (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR)
               .send({ message: "Internal server error." });
        } else {
            // Request doesn't exist or is expired
            if (results.affectedRows <= 0) {
                const err = "Request doesn't exist or is expired.";
                console.log(err);
                res.status(HttpStatus.NOT_FOUND).send({ message: err });

            // Confirm succesful
            } else {
                console.log("Success");
                res.status(HttpStatus.OK).send({});
            }
        }
    });
});

/**
 * Called when a provider completes one of their confirmed requests.
 *
 * Example call:
 * http://localhost:3000/v1/request/1/complete?userId="test"&time="2017-04-04%2011:11:011"
 *
 * @name /v1/request/{requestId}/complete
 *
 * @version 1
 * @param {int} requestId - The id of the request to be completed.
 * @param {string} userId - The provider's username.
 * @param {string} time - The time of completion.
 * @returns {res} The response, including an HTTP status indicating success or failure, and error info, if any.
 */
app.post('/v1/request/:requestId/complete', (req, res) => {
    const { userId, time } = req.query;
    const { requestId } = req.params;

    const query = `UPDATE Request SET completed=${time} `
                + `WHERE BINARY requestId=${requestId} AND providerId=${userId}`
                + `AND ${time} < timeEnd`;

    dbQuery(query, (error, results) => {
        if (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR)
               .send({ message: "Internal server error." });
        } else {
            // Request doesn't exist or is expired
            if (results.affectedRows <= 0) {
                const err = "Request doesn't exist or is expired.";
                console.log(err);
                res.status(HttpStatus.NOT_FOUND).send({ message: err });

            // Complete succesful
            } else {
                console.log("Success");
                res.status(HttpStatus.OK).send({});
            }
        }
    });
});

/**
 * Called when a user looks up their existing requests.
 *
 * @name /v1/user/{userId}/requests
 *
 * @version 1
 * @param {int} userId - The username of the user.
 * @returns {res} The response, including an HTTP status indicating success or failure, and the relevant requests. In the case of error, the response contains error info.
 */
app.get('/v1/user/:userId/requests', (req, res) => {
    const { userId } = req.params;

    const query = `SELECT * FROM Request `
                + `WHERE BINARY requesterId="${userId}" OR BINARY providerId="${userId}"`;

    dbQuery(query, (error, results) => {
        let retValue = [];
        if (error) {
            console.log(error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .send({ message: "Internal server error." });
        }
        else {
            console.log("Success");
            for (let i = 0; i < results.length; i++) {
                retValue.push({
                    request : results[i],
                });
            }
        }
        res.status(HttpStatus.OK).send(retValue);
    });
});

// Credit for the following function goes to:
// http://www.movable-type.co.uk/scripts/latlong.html
// User: Deduplicator
// https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
// Modified to return miles instead of kilometers
/**
 * Utility function from Stack Overflow user Deduplicator, used to get distance in miles when given longitude/latitude points
 *
 * Example call:
 * getDistanceFromLatLonInMiles(0.1, 0.1, 0.1, 0.1)
 *
 * @name getDistanceFromLatLonInMiles
 *
 * @version 1
 * @param {float} lat1 - The first latitude point.
 * @param {float} lon1 - The first longitude point.
 * @param {float} lat2 - The second latitude point.
 * @param {float} lon2 - The second longitude point.
 *
 * @returns {float} The distance in miles between the two points given.
 */
function getDistanceFromLatLonInMiles(lat1,lon1,lat2,lon2) {
  let R = 6371; // Radius of the earth in km
  let dLat = deg2rad(lat2-lat1);  // deg2rad below
  let dLon = deg2rad(lon2-lon1);
  let a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;

  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  let d = R * c; // Distance in km
  let miles = d * 0.621371

  return miles;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

/**
 * Called when a user looks up nearby requests.
 *
 * Example call:
 * http://localhost:3000/v1/requests/all?userId="test"&latitude=30&longitude=30
 *
 * @name /v1/requests/all
 *
 * @version 1
 * @param {int} userId - The username of the user.
 * @param {float} latitude - The current latitude of the user.
 * @param {float} longitude - The current longitude of the user.
 *
 * @returns {res} The response, including an HTTP status indicating success or failure, and the relevant requests. Also associate distance in miles. In the case of error, the response contains error info.
 */
app.get('/v1/requests/all', (req, res) => {
    const { userId, latitude, longitude } = req.query;
    const time = new Date().toISOString().slice(0, 19).replace('T', ' ');
    // Check within a set box with a magic number (long/lat of 0.1 in this case) for now
    const query = `SELECT * FROM Request ` +
                  `WHERE accepted is NULL ` +
                  `AND latitude <= (${latitude} + 0.1) AND latitude >= (${latitude} - 0.1) ` +
                  `AND longitude <= (${longitude} + 0.1) AND longitude >= (${longitude} - 0.1)` +
                  `AND '${time}' < timeEnd`;

    dbQuery(query, (error, results) => {
        if (error) {
            console.log(error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .send({ message: "Internal server error." });
        }
        else {
            console.log("Success");

            // List of request, along with the distance from user in miles
            let retValue = [];

            for (let i = 0; i < results.length; i++) {
                if (results[i].requesterId !== userId) {
                    let dist = getDistanceFromLatLonInMiles(latitude, longitude, results[i].latitude, results[i].longitude);
                    retValue.push({
                        request : results[i],
                        distance: dist
                    });
                }
            }

            // Sort ascending, based on distance from user
            retValue.sort(function(a, b) {
                return b.distance - a.distance
            });

            res.status(HttpStatus.OK).send(retValue);
        }
    });
});

/********************************** MESSAGES **********************************/
/**
 * Called when creating a new message session
 *
 * Example call:
 * http://localhost:3000/v1/message/session/create?userId1=0&userId2=1
 *
 * @name /v1/message/session/create
 *
 * @version 1
 * @param {string} userId1 - The id of the first user in message session
 * @param {string} userId2 - The id of the second user in message session
 */
app.post('/v1/message/session/create', (req, res) => {
    const { userId1, userId2 } = req.body;

     const query1 = `SELECT * FROM MessageSession ` +
                    `WHERE (userId1='${userId1}' AND userId2 = '${userId2}') ` +
                    `OR (userId1='${userId2}' AND userId2 = '${userId1}')`;

    dbQuery(query1, (error, results) => {
    	if (error) {
    		console.log(error);
    		return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
    			.send({ message: "Internal server error." });

        // Found MessageSession
        } else if (results.length == 1){
            res.status(HttpStatus.OK).json(JSON.stringify(results[0]));

        // Create MessageSession
        } else {
            const query2 = `INSERT INTO MessageSession(userId1, userId2) ` +
                           `VALUES('${userId1}','${userId2}')`;

            dbQuery(query2, (error, results) => {
                if (error) {
                    console.log(error);
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .json({ message: "Internal server error." });
                }
                else {
                    console.log("Success");
                    res.status(HttpStatus.OK).json(JSON.stringify(results[0]));
                }
            });
        }
    });
});

/**
 * Called when requesting messages based off a message session ID
 *
 * Example call:
 * http://localhost:3000/v1/message/session/2
 *
 * @name /v1/message/session/:messageSessionId
 *
 * @version 1
 * @param {messageSessionId} userId - The ID of the requested message session
 *
 * @returns {res} An array of messages from requested message session, including an HTTP status indicating success or failure. In the case of error, the response contains error info.
 */
app.get('/v1/message/session/:messageSessionId', (req, res) => {
    const { messageSessionId } = req.params;

    // NOTE: user._id and user.name is always equal to senderId (this is how GiftedChat
    // knows who sent what).
    //
    // We are using GiftedChat (https://github.com/FaridSafi/react-native-gifted-chat)
    // for the messaging interface, for a message object has the form:
    //
    // { _id, text, createdAt, user: { _id } }

    const query = `SELECT * FROM Message ` +
                  `WHERE messageSessionId=${messageSessionId}`;

    dbQuery(query, (error, results) => {
        if (error) {
            console.log(error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .send({ message: "Internal server error." });
        }
        else {
            console.log("Success");

            let messageList = [];

            for (let i = results.length-1; i >= 0; i--) {

                const message = {
                    _id: results[i]['giftedChatId'],
                    text: results[i]['text'],
                    createdAt: results[i]['createdAt'],
                    user: {
                        _id: results[i]['senderId']
                    }

                }
                messageList.push(message);
            }

            res.status(HttpStatus.OK).send(messageList);
        }
    });
});

/**
 * Called when a user wants to send a message
 *
 * Example call:
 * http://localhost:3000/v1/message/send?messageSessionId=1&senderId="sender"&receiverId="receiver"&content="this is the message"
 *
 * @name /v1/message/send
 *
 * @version 1
 * @param {int} messageSessionId - The session ID for the message.
 * @param {string} senderId - The ID for the sender.
 * @param {string} receiverId - The ID for the receiver.
 * @param {string} content - The message body.
 *
 * @returns {res} The response, including an HTTP status indicating success or failure, and error info, if any.
 */
app.post('/v1/message/send', upload.array(), (req, res) => {
    const { messageSessionId, senderId, receiverId, content} = req.query;
    const contentJSON = JSON.parse(content)
    const text = contentJSON[0]['text'];
    const createdAt = contentJSON[0]['createdAt'].slice(0, 19).replace('T', ' ');
    const _id = contentJSON[0]['_id'];
    // NOTE: The GiftedChat._id is different than our Message schema id (which
    // currently is an autoincremented int). This needs to be addressed somehow.

    const query = `INSERT INTO MESSAGE(messageSessionId, senderId, ` +
                  `receiverId, text, timeCreated, giftedChatId) ` +
                  `VALUES(${messageSessionId}, '${senderId}', '${receiverId}', ` +
                  `"${text}", "${createdAt}", "${_id}")`;

    dbQuery(query, (error, results) => {
        if (error) {
            console.log(error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .send({ message: "Internal server error." });
        }
        else {
            console.log("Success");
            res.status(HttpStatus.OK).send({});
        }
    });
});

server.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});

export default server;
