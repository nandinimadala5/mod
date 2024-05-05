var RawDataService = require("mod/data/service/raw-data-service").RawDataService,
    AuthorizationPolicy = require("mod/data/service/authorization-policy").AuthorizationPolicy;

exports.OnDemandService = RawDataService.specialize(/** @lends OnDemandService.prototype */ {

    authorizationServices: {
        value: ["spec/data/logic/authorization/authorization-service"]
    },

    authorizationPolicy: {
        value: AuthorizationPolicy.ON_DEMAND
    },

    fetchRawData: {
        value: function (stream) {
            stream.dataDone();
        }
    }

});
