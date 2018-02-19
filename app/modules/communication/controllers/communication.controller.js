(function () {
  "use strict";

  angular
    .module("pb.ds.communication")
    .controller("CommunicationController", function ($log, $uibModal, $http) {
      var _this = this;

      this.byLocationAllowed = true;
      this.byStatusAllowed = true;
      this.byCarrierAllowed = true;
      this.displayNavigator =
        this.byLocationAllowed && this.byStatusAllowed && this.byCarrierAllowed;
      _this.totalEmailsSent = 2000;
      _this.opened = 1000;
      _this.delivered = 500;
      _this.unsubscribed = 100;
      _this.clicked = 200;
      _this.usSeries = [];
      _this.frSeries = [];
      _this.caSeries = [];

      _this.colors = [
        "#3e53a4",
        "#cf0989",
        "#009bdf",
        "#ef8200",
        "#edb700",
        "#a03f9b",
        "#00b140",
        "#0072b8"
      ];

      _this.getEmailSentGraph = function () {
        _this.emailSentGraph = {
          labels: ["2017", "2018"],
          options: {
            legend: {
              display: true,
              position: "top",
              fullWidth: false,
              labels: {
                boxWidth: 15
              }
            }
          },
          data: [_this.usSeries, _this.frSeries, _this.caSeries],
          series: ["en-US", "en-FR", "en-CA"],
          colors: _this.colors,
          click: function (points, evt) {
            //
          }
        };
      };


      _this.getEmailSentGraphData = function () {
        console.log(_this.startDate);
        console.log(_this.endDate);
        // AREA

        // $http.get("welcome.htm").then(function(response) {
        //   response.data.forEach((data) => {
        //     _this.labels.push();
        //     _this.count.push();
        //   });
        // _this.totalEmailsSent = 2000;
        // _this.totalEmailsSent = 1000;
        // _this.totalEmailsSent = 500;
        //   _this.getEmailSentGraph();
        // });
        _this.getEmailSentGraph();
      };


      _this.getDataForAllCounts = function () {
        _this.dataName = [];
        $http.get("../modules/communication/communication.csv").then(function (response) {
          Papa.parse(response.data, {
            worker: true,
            delimiter: ',',
            header: true,
            step: function (results) {
              _this.dataName.push(results.data[0]);
            },
            complete: function () {
              console.log(_this.dataName);
              alasql('SELECT count(*) as delivered FROM ? WHERE Delivered = "Yes" ', [_this.dataName], function (res) {
                _this.delivered = res[0].delivered;
              });
              alasql('SELECT count(*) as totalEmailsSent FROM ?', [_this.dataName], function (res) {
                _this.totalEmailsSent = res[0].totalEmailsSent;
              });
              alasql('SELECT count(*) as unsubscribed FROM ? WHERE Unsubscibed = "Yes" ', [_this.dataName], function (res) {
                _this.unsubscribed = res[0].unsubscribed;
              });
              alasql('SELECT count(*) as opened FROM ? WHERE Opened = "Yes" ', [_this.dataName], function (res) {
                _this.opened = res[0].opened;
              });
              alasql('SELECT count(*) as clicked FROM ? WHERE Clicked = "Yes" ', [_this.dataName], function (res) {
                _this.clicked = res[0].clicked;
              });

              alasql('SELECT count(*) as usData FROM ? WHERE  dim_date_key LIKE "2017%" and locale = "en-US"', [_this.dataName], function (res) {
                _this.usSeries.push(res[0].usData);
              });

              alasql('SELECT count(*) as usData FROM ? WHERE dim_date_key LIKE "2018%" and locale = "en-US"', [_this.dataName], function (res) {
                _this.usSeries.push(res[0].usData);
              });

              alasql('SELECT count(*) as frData FROM ? WHERE dim_date_key LIKE "2017%" and locale = "en-FR"', [_this.dataName], function (res) {
                _this.frSeries.push(res[0].frData);
              });

              alasql('SELECT count(*) as frData FROM ? WHERE dim_date_key LIKE "2018%" and locale = "en-FR"', [_this.dataName], function (res) {
                _this.frSeries.push(res[0].frData);
              });

              alasql('SELECT count(*) as caData FROM ? WHERE dim_date_key LIKE "2017%" and locale = "en-CA"', [_this.dataName], function (res) {
                _this.caSeries.push(res[0].caData);
              });

              alasql('SELECT count(*) as caData FROM ? WHERE dim_date_key LIKE "2018%" and locale = "en-CA"', [_this.dataName], function (res) {
                _this.caSeries.push(res[0].caData);
              });

              console.log(_this.caSeries);
              console.log(_this.usSeries);
              console.log(_this.frSeries);

            }
          });
        });
      };
      _this.getDataForAllCounts();

      _this.dateRangePicker = {
        date: {
          startDate: moment().startOf("day"),
          endDate: moment().endOf("day")
        },
        options: {
          singleDatePicker: false,
          format: "MM/DD/YYYY",
          opens: "center",
          autoApply: true,
          ranges: {
            Today: [moment(), moment()],
            "Last 7 Days": [moment().subtract(6, "days"), moment()],
            "Month to date": [moment().startOf("month"), moment()],
            "Year to date": [moment().startOf("year"), moment()]
          },
          eventHandlers: {
            "apply.daterangepicker": function () {
              _this.startDate = moment(_this.dateRangePicker.date.startDate).format("MM/DD/YYYY");
              _this.endDate = moment(_this.dateRangePicker.date.endDate).format("MM/DD/YYYY");
              _this.getEmailSentGraphData();
            }
          }
        },
        displayDate: function (start, end) {
          var startDate = start || _this.dateRangePicker.date.startDate;
          var endDate = end || _this.dateRangePicker.date.endDate;
          var today = moment();

          var dateDiff = endDate.diff(startDate, "days");
          var result = "";

          if (dateDiff === 0) {
            var isDaySame = startDate.isSame(today, "day");
            var isMonthSame = startDate.isSame(today, "month");
            var isYearSame = startDate.isSame(today, "year");

            // if the selected date is the same as today date, display "Today" in the result
            if (isDaySame && isMonthSame && isYearSame) {
              result = "Today " + moment(startDate).format("MM/DD/YYYY");
            } else {
              result = moment(startDate).format("MM/DD/YYYY");
            }
          } else if (dateDiff === 6) {
            result = "Last 7 days";
          } else {
            result =
              "From " +
              moment(startDate).format("MM/DD/YYYY") +
              " to " +
              moment(endDate).format("MM/DD/YYYY");
          }

          return result;
        }
      };

      _this.startDate = moment(_this.dateRangePicker.date.startDate).format("MM/DD/YYYY");
      _this.endDate = moment(_this.dateRangePicker.date.endDate).format("MM/DD/YYYY");
      _this.getEmailSentGraphData();

    });
})();
