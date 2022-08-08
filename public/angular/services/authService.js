//Authorization Factory to manage token
myApp.factory('authService' , ['$window' , ($window)=>{

	let authToken = {};

	//accesing local storage through $window service
    let store = $window.localStorage;
    let key = 'auth-token';



      // Function to check if user is currently logged in
    authToken.isLoggedIn = ()=> {
        // CHeck if token is in local storage
        if (authToken.getToken()) {
            return true; // Return true if in storage
        } else {
            return false; // Return false if not in storage
        }
    };
    //function to get token from local storage
	authToken.getToken = ()=>{
		//console.log(store.getItem(key));
		return store.getItem(key);
	}
	
    //function to set token to local storage
	authToken.setToken = (token)=>{
		if(token){
			store.setItem(key, token);
		}else{
			store.removeItem(key);
		}
	}
	
	return authToken;

	
}]);