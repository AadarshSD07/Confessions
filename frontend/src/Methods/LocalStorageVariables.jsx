import React from 'react'

const LocalStorageVariables = (props) => {
    let response = "";
    if (props === "config"){
        const access = localStorage.getItem("access");
        response = {
            headers: {
                'Authorization': `Bearer ${access}`,
                'Content-Type': 'application/json'
            }
        };
    } else {
        response = localStorage.getItem(props) ?? "";
    }
    return response;
}

export default LocalStorageVariables
