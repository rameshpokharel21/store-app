
const errorBus = new EventTarget();

//Subscribe to Errors: lets any component listen for errors
//automatically cleans up the listener when component unmounts
export function onError(callback){
    const handler = event => callback(event.detail);
    errorBus.addEventListener("error", handler);

    return () => errorBus.removeEventListener("error", handler);
}

//formats the error
//broadcasts it globally
//logs it in development mode
export function notifyError(error){
    const formatted = formatError(error);
    errorBus.dispatchEvent(new CustomEvent("error", {detail: formatted}));

    if(import.meta.env.DEV){
        console.error("[Error Handler]:", formatted);
    }
}

//Format different error types
export function formatError(error){
    //Axios error
    if(error.response){
        return {
            type: "API_ERROR",
            status: error.response.status,
            message: error.response.data?.message || "Server error occurred",
            data: error.response.data,
        };
    }

    //Network error(no response)
    if(error.request){
        return {
            type: "NETWORK_ERROR",
            status: 0,
            message: "Network error, Please check your connection.",
        };
    }

    //other js error
    return {
        type: "CLIENT_ERROR",
        status: 0,
        message: error.message || "An unexpected error occurred.",
    }
}