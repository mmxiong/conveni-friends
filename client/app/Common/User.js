//user class metadata
import Request from 'client/app/Common/Request';
import axios from 'axios';
import moment from 'moment';
import config from 'client/config';

export default class User {
    /**
     * Creates a new User
     * @param userId        the userId for the User object
     * @return User   returns a new User object
     */
    constructor(userId='') {
        this.userId = userId;
    }

    /**
    * Validates the userId and password and returns whether
    * the credentials are valid
    * @param password      password of the account
    * @param userId        userId of the account
    * @return response      is the login info valid?
    */
    login(userId, password) {
        let url = `${config.API_URL}/v1/user/` + userId + '/login';
        return axios.post(url, {
                password: password
        }).then((response) => {
            return response.status;
          })
          .catch((error) => {
            throw error;
          });
    }

    /**
     * Attempts to create an account for the user
     * @param userId            Desired userId of the account
     * @param password          Password of the account
     * @return response         Did the signup succeed?
     */
    signup(userId, password) {
        let url = `${config.API_URL}/v1/user/` + userId + '/signup';
        return axios.post(url, {
            password: password
        }).then((response) => {
            return response;
        }).catch((error) => {
            console.log(error);
            throw error;
        });
    }

    /**
     * Changes the password of the user
     * @param oldPassword       The old password of the account
     * @param newPassword       The new password of the account
     * @return response         Was the change successful?
     */
    changePassword(oldPassword, newPassword) {
        let url = `${config.API_URL}/v1/user/` + this.userId + '/update';
        return axios.post(url, {
            password: oldPassword,
            newPassword: newPassword
        }).then((response) => {
            return response;
        }).catch((error) => {
            console.log(error);
            throw error;
        });
    }


    /**
    * Creates a request
    * @param latitude      latitude where the request was made
    * @param longitude     longitude where the request was made
    * @param title         title of the request
    * @param address       address of the user
    * @param startTime     when the request will start
    * @param endTime       when the request will end
    * @param description   description of request with additional details
    * @param requesterId   userId of the requester
    */
    createRequest(request) {
        return axios.post(`${config.API_URL}/v1/request/create`, {
                userId: request.requesterId,
                title: request.title,
                latitude: request.latitude,
                longitude: request.longitude,
                address: request.address,
                description: request.description,
                timeStart: request.timeStart,
                timeEnd: request.timeEnd
        }).then((response) => {
            return response.data;
            })
            .catch((error) => {
            console.log(error);
            throw error;
            });
    }

    /**
    * Gets the requests for the user (both made and accepted)
    * @return              requests as an array, both made and accepted
    */
    getMyRequests() {
        let url = `${config.API_URL}/v1/user/` + this.userId + '/requests'
        return axios.get(url)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.log(error);
            throw error;
        });
    }

   /**
    * Gets the requests for the user (both made and accepted)
    * @param latitude      current latitude of the user
    * @param longitude     current longitude of the user
    * @return              requests as an array, both made and accepted
    */
    getNearbyRequests(latitude, longitude) {
        return axios.get(`${config.API_URL}/v1/requests/all`, {
            params: {
                userId: this.userId,
                latitude: latitude,
                longitude: longitude
            }
        }).then((response) => {
            return response.data;
        }).catch((error) => {
            console.log(error);
            throw error;
        });
    }

    /**
     * Accepts a request.
     * @param requestId     the requestId of the request to accept
     * @return response     Was the acceptance successful?
     */
    acceptRequest(requestId) {
        return axios.post(`${config.API_URL}/v1/request/${requestId}/accept`, {
            userId: this.userId,
            time: moment().format('YYYY-MM-DD HH:MM:ss')
        }).then((response) => {
            return response;
        }).catch((error) => {
            throw error;
        });  
    }

    /**
     * Completess a request.
     * @param requestId     the requestId of the request to complete
     * @return response     Was the completion successful?
     */
    completeRequest(requestId) {
        return axios.post(`${config.API_URL}/v1/request/${requestId}/complete`, {
            userId: this.userId,
            time: moment().format('YYYY-MM-DD HH:MM:ss')
        }).then((response) => {
            return response;
        }).catch((error) => {
            throw error;
        }); 
    }
}
