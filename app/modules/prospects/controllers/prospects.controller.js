(function () {

  'use strict';

  angular.module('pb.ds.prospects').controller('ProspectsController',
    function ($log, $uibModal, $http, $scope, $interval) {

      var _this = this;

      this.byLocationAllowed = true;
      this.byStatusAllowed = true;
      this.byCarrierAllowed = true;
      this.displayNavigator = this.byLocationAllowed && this.byStatusAllowed && this.byCarrierAllowed;
      _this.barGraph = false;
    
      _this.colors = ['#3e53a4', '#cf0989', '#009bdf', '#ef8200', '#edb700', '#a03f9b', '#00b140', '#0072b8'];
      _this.mono = ['#00436E', '#005A93', '#0072B8', '#66AAD4', '#CCE3F1', '#E5F1F8'];

      $scope.numberOfOpportunities  = 6019;
      _this.existingOpportunityBarGraphLabels = [];
      _this.existingOpportunityBarGraphCount = [];

      $scope.$watch('numberOfOpportunities', function (newValue, oldValue) {
        console.log(newValue);
        console.log(oldValue);
        $scope.numberOfOpportunities  = newValue;
      });
    
      // ExistingOpportunityBarGraph
      _this.getExistingOpportunityBarGraph = function() {
        _this.existingOpportunityBarGraph = {
          labels: _this.existingOpportunityBarGraphLabels,
          options: {
            scaleShowGridLines: false,
            scales: {
              yAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Number of clients (' +  $scope.numberOfOpportunities  + ')'
                }
              }],
              xAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Conversion probability in percentage'
                }
              }]
            }
          },
          data: [
            _this.existingOpportunityBarGraphCount
          ],
          colors: _this.colors,
          click: function (points, evt) {
            //
          }
        };        
      }; 
      _this.dataName = []; 
      _this.getExistingOpportunityBarGraphData = function() {
        $http.get("../modules/prospects/sampleCSVData.csv").then(function(response) {
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
              for(var i = 0;i < 10; i++) {
                _this.existingOpportunityBarGraphLabels.push(_this.dataName[i].Zip_Code);
                _this.existingOpportunityBarGraphCount.push(_this.dataName[i].Median_Age);
              };
              console.log(_this.existingOpportunityBarGraphLabels);
              console.log(_this.existingOpportunityBarGraphCount);
              var res = alasql('SELECT dep, SUM(qt) AS qt, SUM(qt*price) AS amt, AGGR(amt/qt) AS price FROM ? GROUP BY dep',[_this.dataName]);
              _this.getExistingOpportunityBarGraph();
            }
          });
        });
        // _this.getExistingOpportunityBarGraph();
      };

      // ExistingClientsBarGraph
      _this.existingClientsFilter = [
        {
          'value': 'label_printers',
          'name': 'Label Printers',
          'isSelected': false
        },
        {
          'value': 'multicarrier_subscriptions',
          'name': 'Multicarrier Subscriptions',
          'isSelected': false
        },
        {
          'value': 'SIC8_new',
          'name': 'SIC8',
          'isSelected': false
        }
      ]
      _this.existingClientsBarGraphLabels = [];
      _this.existingClientsBarGraphCount = [];
      _this.getExistingClientsBarGraph = function() {
        _this.barGraph = true;
        _this.existingClientsBarGraph = {
          labels:  _this.existingClientsBarGraphLabels,
          options: {
            scaleShowGridLines: false,
            scales: {
              yAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Number of clients (' +  $scope.numberOfOpportunities  + ')'
                }
              }],
              xAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Conversion probability in percentage'
                }
              }]
            }
          },
          data: [
            _this.existingClientsBarGraphCount
          ],
          colors: _this.colors,
          click: function (points, evt) {
            //
          }
        };
      };
      _this.filter = {
        'label': false,
        'multicarrierSubscription': false
      };
      _this.dataName2 = [];
      _this.getExistingClientsBarGraphData = function() {
        _this.dataName2 = [];
        $http.get("../modules/prospects/existingClients.csv").then(function(response) {
          console.log(response);
          Papa.parse(response.data, {
            worker: true,
            delimiter: ',',
            header: true,
            step: function(results) {
              _this.dataName2.push(results.data[0]);
            },
            complete: function() {
              // var param = [];
              var labelCount = 0;
              console.log(labelCount);
              console.log(_this.dataName2);
              for (let i = 0; i<_this.dataName2.length; i++) {
                if (_this.filter.label === true && _this.filter.multicarrierSubscription === true && _this.dataName2[i].score > 20) {
                  if (_this.dataName2[i].label_printers === "yes" && _this.dataName2[i].multicarrier_subscriptions === "yes") {
                    labelCount++;
                  }
                } else if (_this.filter.label === true && _this.filter.multicarrierSubscription === false && _this.dataName2[i].score > 20) {
                    if (_this.dataName2[i].label_printers === "yes") {
                      labelCount++;
                    }
                } else if (_this.filter.label === false && _this.filter.multicarrierSubscription === true && _this.dataName2[i].score > 20) {
                    if (_this.dataName2[i].multicarrier_subscriptions === "yes") {
                      labelCount++;
                    }
                } else if(_this.dataName2[i].score > 20) {
                      labelCount++
                } 
              }
              console.log(labelCount);
              $scope.numberOfOpportunities  = labelCount;
              _this.count($scope.numberOfOpportunities);
              // var res = 'SELECT label_printers FROM ? WHERE label_printers = "Yes"'
              // alasql(res,[_this.dataName2],function(res){
              //   console.log(res);
              //   for(var i = 0; i < 10; i++) {
              //     _this.existingClientsBarGraphLabels.push(res[i].bpn);
              //     _this.existingClientsBarGraphCount.push(parseInt(res[i].score));
              //   };
              //   console.log(_this.existingClientsBarGraphLabels);
              //   console.log(_this.existingClientsBarGraphCount);
              //   _this.getExistingClientsBarGraph();
              // });
            }
          });
        });
      };

      _this.count = function(count) {
        $scope.numberOfOpportunities = count;
      };  

      $scope.callAtInterval = function() {
        $scope.numberOfOpportunities = $scope.numberOfOpportunities;
      }

      $interval( function(){ $scope.callAtInterval(); }, 500);

      
      // ShippingOpportunitiesBarGraph
      _this.getShippingOpportunitiesBarGraph = function() {
        _this.shippingOpportunitiesBarGraph = {
          labels: ['2011', '2012', '2013', '2014', '2015'],
          options: {
            scaleShowGridLines: false,
            scales: {
              yAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Number of clients (' +  $scope.numberOfOpportunities  + ')'
                }
              }],
              xAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Conversion probability in percentage'
                }
              }]
            }
          },
          data: [
            [45, 28, 35, 85, 55]
          ],
          colors: _this.colors,
          click: function (points, evt) {
            //
          }
        };
      };      
      
      _this.getShippingOpportunitiesBarGraphData = function() {
        // $http.get("welcome.htm").then(function(response) {
        //   response.data.forEach((data) => {
        //     _this.labels.push();
        //     _this.count.push();
        //   });
            // _this.totalEmailsSent = 2000;
            // _this.totalEmailsSent = 1000;
            // _this.totalEmailsSent = 500;
        //   _this.getShippingOpportunitiesBarGraph();
        // });
        _this.getShippingOpportunitiesBarGraph();
      }; 
      
      _this.getShippingOpportunitiesBarGraphData();
      _this.getExistingOpportunityBarGraphData();
      _this.getExistingClientsBarGraphData();
      _this.filter;
      _this.open = function (item) {
        $uibModal.open({
          templateUrl: 'modules/prospects/templates/modal.html',
          controller: 'ModalController as modal',
          size: 'md',
          resolve: {
            itemResolve: function () {
              return _this.filter;
            }
          }
        }).result.then(function(response){
            console.log(response);
            _this.filter = response;
            _this.getExistingClientsBarGraphData();
         }, function(){
            //
         });
      };

    });

})();
