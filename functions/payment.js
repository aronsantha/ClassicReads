const axios = require("axios");

exports.handler = function (request, context, callback) {

    const parsedBody = JSON.parse(request.body)
    const headers = {
        "Accept-Version": "v10",
        // "Authorization": "" I removed my quickpay token from here. Please fill in your own quickpay api-key in the quotation marks.
    };
    let trans_id;
    axios({
        method: "post",
        url: "https://api.quickpay.net/payments",
        data: {
            order_id: parsedBody.order_id,
            currency: parsedBody.currency,
        },
        headers: headers
    })
        .then(response => {
            trans_id = response.data.id;
            console.log(trans_id);
            data = {
                amount: parsedBody.amount*100,
                framed: true,
            }
        
            axios({
                method: "put",
                url: `https://api.quickpay.net/payments/${trans_id}/link`, // ` is NOT a quote, it is a back-tick. It allows variables to be used in the url.
                data: data,
                headers: headers
            })
                .then(response => {
                    console.log(response);
                    callback(null, {
                        statusCode: 200,
                        body: JSON.stringify(response.data.url)
                    })
                })
                    .catch(err => {
                            console.log(err);
                            callback(new Error("Something went wrong in the second call."))
                        })   
        
            })
            .catch(err => {
                    console.log(err);
                    callback(new Error("Something went wrong in your first call."))
                })

}

