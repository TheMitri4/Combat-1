let store = {};

let getStoreValue = (key)=>{
	if(store[key]){
		return store[key];
	} else if(localStorage.getItem(key)){
		store[key] = localStorage.getItem(key);
		return store[key];
	} else{
		throw new Error('Error: No key data!');
	}
};

let setStoreValue = (key, value)=>{
	localStorage.setItem(key, value);
};

let POST_HEADER = {'Content-Type': 'application/x-www-form-urlencoded'};
let BASE_URL = 'http://localhost:3333'

let onDOMReady = (handler)=>{
    addEventListener('DOMContentLoaded' , handler)
};

let AJAX = (configObj) => {
        const body = { ...configObj.body };
        if (getStoreValue('token')) {
            body.id = getStore('id'),
            body.token = getStore('token')
        };

        body += new URLSearchParams({...body});

        if(configObj.method === 'POST'){
            return fetch(configObj.url, {
                method : configObj.method,
                headers: new Headers(POST_HEADER),
                body : new URLSearchParams({body}).toString()
            });
        }

        const url = new URL(configObj.url, BASE_URL);
        Object.entries(body).forEach(
            ([key, val])=>t.searchParams.append(key, val)
        );

        return fetch(
            url.toString(), 
            {
                method : configObj.method
            }
        );
};
