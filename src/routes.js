const Router = require('express').Router;
const api = Router();
const twitter = require('./twitterApi/apiFacade.js');
const httpUtils = require('./httpUtils.js');

module.exports = function(consumerKey, consumerSecret, oauth_callback, callback) {
    twitter.init(consumerKey, consumerSecret, oauth_callback);
    registerRoutes(callback);
    return api;
};

function registerRoutes(callback) {
    api.post('/twitter/signin', function(req, res, next) {
        twitter
            .getRequestToken()
            .then(token => httpUtils.sendSuccessResponse(res, { oauth_token: token }), err => httpUtils.serverError(res, err));
    });

    api.post('/twitter/callback', function(req, res, next) {
        twitter
            .getAccessToken(req.query.oauth_token, req.query.oauth_verifier)
            .then(token => {
                twitter
                    .getUserDetails(token)
                    .then(user => {
                        if (callback) {
                            token.request_token = req.query.oauth_token;
                            callback(req, res, user, token);
                        }
                    }, err => httpUtils.serverError(res, err));
            }, err => httpUtils.serverError(res, err));
    });
}
