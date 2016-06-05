'use strict';

// Register `photosList` component, along with its associated controller and template
angular.
    module('photosList')
    .factory('PagerService', PagerService)
    .component('photosList', {
      templateUrl: 'photos-list/photos-list.template.html',
      controller: ['$http', '$scope', 'PagerService', function PhotosListController($http, $scope, PagerService) {
        var self = this;
        $scope.query = "";
        $scope.photos = [];
        function PaginateItems() {
          function filterTitle(photo) {
            return photo.title.includes($scope.query);
          }
          $scope.pageObject = {};

          $scope.pageObject.filteredItems = $scope.photos.filter(filterTitle); // dummy array of items to be paged
          $scope.pageObject.pager = {};
          $scope.pageObject.setPage = setPage;
          $scope.pageObject.setPage(1);

          function setPage(page) {
            if (page < 1 || page > $scope.pageObject.pager.totalPages) {
              return;
            }

            // get pager object from service
            $scope.pageObject.pager = PagerService.GetPager($scope.pageObject.filteredItems.length, page);

            // get current page of items
            $scope.pageObject.items = $scope.pageObject.filteredItems.slice($scope.pageObject.pager.startIndex, $scope.pageObject.pager.endIndex);
          }
        }

        $http.get('http://jsonplaceholder.typicode.com/photos').then(function(response) {
          $scope.photos = response.data;

          PaginateItems();
        });
        $scope.$watch(function(scope) { return scope.query },
            function(newValue, oldValue) {
              PaginateItems();
            }
        );
      }]
    });

function PagerService() {
  // service definition
  var service = {};

  service.GetPager = GetPager;

  return service;

  // service implementation
  function GetPager(totalItems, currentPage, pageSize) {
    // default to first page
    currentPage = currentPage || 1;

    // default page size is 10
    pageSize = pageSize || 10;

    // calculate total pages
    var totalPages = Math.ceil(totalItems / pageSize);

    var startPage, endPage;
    if (totalPages <= 10) {
      // less than 10 total pages so show all
      startPage = 1;
      endPage = totalPages;
    } else {
      // more than 10 total pages so calculate start and end pages
      if (currentPage <= 6) {
        startPage = 1;
        endPage = 10;
      } else if (currentPage + 4 >= totalPages) {
        startPage = totalPages - 9;
        endPage = totalPages;
      } else {
        startPage = currentPage - 5;
        endPage = currentPage + 4;
      }
    }

    // calculate start and end item indexes
    var startIndex = (currentPage - 1) * pageSize;
    var endIndex = startIndex + pageSize;

    // create an array of pages to ng-repeat in the pager control
    var pages = _.range(startPage, endPage + 1);

    // return object with all pager properties required by the view
    return {
      totalItems: totalItems,
      currentPage: currentPage,
      pageSize: pageSize,
      totalPages: totalPages,
      startPage: startPage,
      endPage: endPage,
      startIndex: startIndex,
      endIndex: endIndex,
      pages: pages
    };
  }
}
