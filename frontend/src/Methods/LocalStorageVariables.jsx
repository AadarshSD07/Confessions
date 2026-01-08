import React from 'react'

const LocalStorageVariables = (props) => {
    let response = "";
    if (props === "config"){
        const access = localStorage.getItem("access");
        response = {
            headers: {}
        };
        if (access) {
            response["headers"]["Authorization"] = `Bearer ${access}`;
        }
        response["headers"]["Content-Type"] = "application/json";

    } else {
        response = localStorage.getItem(props) ?? "";
    }
    return response;
}

export default LocalStorageVariables
