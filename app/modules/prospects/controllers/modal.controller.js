(function() {
  "use strict";

  angular
    .module("pb.ds.prospects")
    .controller("ModalController", function(
      $log,
      $uibModalInstance,
      itemResolve,
      $http
    ) {
      console.log(itemResolve);
      var _this = this;

      _this.item = itemResolve;


      _this.close = function() {
        $uibModalInstance.close();
      };

      _this.labelPrinterFilter = itemResolve.label;
      _this.multicarrierSubscriptionFilter = itemResolve.multicarrierSubscription;
      _this.dataName = [];
      $http.get("../modules/prospects/existingClients.csv").then(function(response) {
        console.log(response);
        Papa.parse(response.data, {
          worker: true,
          delimiter: ',',
          header: true,
          step: function(results) {
            _this.dataName.push(results.data[0]);
          },
          complete: function() {
            console.log(_this.dataName);
            alasql('SELECT DISTINCT SIC8_DESCRIPTION FROM ? ',[_this.dataName],function(res){
              console.log(res);
            });
          }
        });
      });
      _this.SIC8_NewFilter = [];

      _this.apply = function() {
        _this.filter = {
          'label': _this.labelPrinterFilter,
          'multicarrierSubscription': _this.multicarrierSubscriptionFilter
        };
        $uibModalInstance.close(_this.filter);
      };

      _this.cancel = function() {
        $uibModalInstance.dismiss();
      };

      $log.debug(_this.item);
    });
})();
