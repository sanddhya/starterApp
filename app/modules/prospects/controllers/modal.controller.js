(function () {

  'use strict';

  angular.module('pb.ds.prospects').controller('ModalController', function ($log, $uibModalInstance, itemResolve) {

    var _this = this;

    _this.item = itemResolve;

    _this.close = function () {
      $uibModalInstance.close();
    };

    _this.facet = {
      list: [],
      groups: ['Root', 'Contributors', 'Danbury', 'Shelton', 'Stamford', 'Troy', 'Noida', 'Pune', 'Austin', 'Lanham', 'Boulder', 'Watford', 'Paris', 'Sydney', 'Dallas', 'San Diego', 'Toronto', 'Chatham', 'Kyiv', 'Hartford'],
      clear: function () {
        _this.facet.list = [];
  
        angular.forEach(_this.table.search, function (value, key, obj) {
          var parent = value;
  
          angular.forEach(parent, function (value, key, obj) {
            if (parent[key]) {
              parent[key] = false;
            }
          });
  
          _this.table.search.country = '';
        });
      },
      selectChange: function () {
        var selected = _this.table.search.country;
  
        if (selected) {
          _this.facet.list.push(_this.table.search.country);
        }
      },
      checked: function (value, item) {
        if (value) {
          _this.facet.list.push(item);
        } else {
          var index = _this.facet.list.indexOf(item);
          _this.facet.list.splice(index, 1);
        }
      },
  
      clearBadge: function (item, event) {
        event.stopPropagation();
        event.preventDefault();
  
        var itemIndex = _this.facet.list.indexOf(item);
        _this.facet.list.splice(itemIndex, 1);
  
        if (_this.table.search.country === item) {
          _this.table.search.country = '';
          return;
        }
  
        angular.forEach(_this.table.search, function (value, key, obj) {
          var parent = value;
  
          angular.forEach(parent, function (value, key, obj) {
            if (key === item) {
              parent[item] = false;
            }
          });
        });
      }
  
    };

    $log.debug(_this.item);

  });

})();
