﻿angular.module("userApp", ['ui.router', 'ngResource'])
    .config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
        $httpProvider.defaults.headers.delete = { 'Content-Type': 'application/json' }; //default to application/json for deletes
        
        //set up robust, extendable routing that supports 1-to-lots of different pages
        $urlRouterProvider.otherwise("/user")
        $stateProvider
            .state('user', {
                url: "/user",
                templateUrl: "userLists.html",
                controller: 'userCtrl'
            })
            .state('user.detail', {
                url: "/:id",
                templateUrl: "userLists.detail.html",
                controller: 'userDetailCtrl'
            });
    })

    .factory('UserList', function ($resource) {
        //resource provides easy interaction with a RESTful endpoint. DI'ed into controllers below
        return new $resource('/api/User/:id');
    })

    .controller('userCtrl', function ($scope, UserList) {
        $scope.userLists = UserList.query();

        //?? not work 
        //delete remove just the item from DB and client, don't re-query. less chatty
        //$scope.delete = function (userList, index) {
        //    userList.$delete(function () {
        //        $scope.userLists.splice(index, 1);
        //    });
        //};
      
        $scope.delete = function (list, index) {
            UserList.delete({id:list.UserId});
            $scope.userLists.splice(index, 1);
            
            //userList.$delete(function () {
            //    $scope.userLists.splice(index, 1);
            //});
        };


        $scope.$on('userChanged', function() { //could get crazy here and ONLY replace the item that changed, but not doing for brevity
            $scope.userLists = UserList.query();
        });
    })

    .controller('userDetailCtrl', function ($scope, UserList, $stateParams, $state) {
      
        $scope.reset = function () {

            $scope.userList.Email = "";
            $scope.userList.FirstName = "";
            $scope.userList.LastName = "";
            $scope.userList.Passowrd = "";
            //$scope.userList.Email = "";
            //$scope.userList = { Email: '', FirstName: '', LastName: '', Passowrd: '' };
            $scope.ConfirmPassword = "";
        }

        $scope.userList = $stateParams.id === 'new' ?
            new UserList({ Items: [] }) :
            UserList.get({ id: $stateParams.id });
        
        $scope.save = function() {
            $scope.userList.$save(function () {
                $scope.errors = null;
                $state.go('^');
                $scope.$emit('userChanged');
            }, function(resp) {
                $scope.errors = resp.data;
            });
        };
    });