var app = angular.module("app", ['ngRoute', 'angular-jwt', 'angular-storage']);

app.constant('CONFIG', {
	APIURL: "http://localhost/codeigniter/cijwt",
})
.config(["$routeProvider", "$httpProvider", "jwtInterceptorProvider",  function ($routeProvider, $httpProvider, jwtInterceptorProvider) 
{
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
    
    jwtInterceptorProvider.tokenGetter = ['moviesFactory', function(moviesFactory) {
        return localStorage.getItem('token');
    }];

    $httpProvider.interceptors.push('jwtInterceptor');

	$routeProvider.when('/', {
        redirectTo: "/home"
    })
    .when("/home", {
        templateUrl: 'templates/home.html',
        controller: 'homeCtrl',
        authorization: true
    })
    .when("/login", {
        templateUrl: 'templates/login.html',
        controller: 'loginCtrl',
        authorization: false
    })
}])

.controller('homeCtrl', ['$scope','CONFIG', 'jwtHelper', 'store', 'moviesFactory', function($scope, CONFIG, jwtHelper, store, moviesFactory)
{
    //obtenemos el token en localStorage
    var token = store.get("token");
    //decodificamos para obtener los datos del user
    var tokenPayload = jwtHelper.decodeToken(token);
    //los mandamos a la vista como user
    $scope.user = tokenPayload;
    $scope.getMovies = function()
    {
        moviesFactory.get().then(function(res)
        {
            if(res.data && res.data.code == 0)
            {
                store.set('token', res.data.response.token);
                $scope.movies = res.data.response.movies;
            }
        });
    }
}])

.controller('loginCtrl', ['$scope','CONFIG', 'authFactory', 'jwtHelper', 'store', '$location', function($scope, CONFIG, authFactory, jwtHelper, store, $location)
{
	$scope.login = function(user)
    {
        authFactory.login(user).then(function(res)
        {
            if(res.data && res.data.code == 0)
            {
                store.set('token', res.data.response.token);
                $location.path("/home");
            }
        });
    }
}])

.factory("authFactory", ["$http", "$q", "CONFIG", function($http, $q, CONFIG)
{
	return {
		login: function(user)
		{
			var deferred;
            deferred = $q.defer();
            $http({
                method: 'POST',
                skipAuthorization: true,
                url: CONFIG.APIURL+'/auth/login',
                data: "email=" + user.email + "&password=" + user.password,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            })
            .then(function(res)
            {
                deferred.resolve(res);
            })
            .then(function(error)
            {
                deferred.reject(error);
            })
            return deferred.promise;
		}
	}
}])

.factory("moviesFactory", ["$http", "$q", "CONFIG", function($http, $q, CONFIG)
{
    return{
        get: function()
        {
            var deferred;
            deferred = $q.defer();
            $http({
                method: 'GET',
                skipAuthorization: false,
                url: CONFIG.APIURL+'/movies'
            })
            .then(function(res)
            {
                deferred.resolve(res);
            })
            .then(function(error)
            {
                deferred.reject(error);
            })
            return deferred.promise;
        }
    }
}])

.run(["$rootScope", 'jwtHelper', 'store', '$location', function($rootScope, jwtHelper, store, $location)
{
    $rootScope.$on('$routeChangeStart', function (event, next) 
    {
        var token = store.get("token") || null;
        if(!token)
            $location.path("/login");

        var bool = jwtHelper.isTokenExpired(token);
        if(bool === true)
            $location.path("/login");
    });
}])