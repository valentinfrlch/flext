import { ok, notFound, badRequest } from 'wix-http-functions';
import { created, serverError } from 'wix-http-functions';
import { pull } from 'backend/cloud';
import { DynamicUploadSystem } from 'backend/updateTrends';
import wixData from 'wix-data';

// URL to call this HTTP function from your published site looks like: 
// Premium site - https://mysite.com/_functions/example/multiply?leftOperand=3&rightOperand=4
// Free site - https://username.wixsite.com/mysite/_functions/example/multiply?leftOperand=3&rightOperand=4

// URL to test this HTTP function from your saved site looks like:
// Premium site - https://mysite.com/_functions-dev/example/multiply?leftOperand=3&rightOperand=4
// Free site - https://username.wixsite.com/mysite/_functions-dev/example/multiply?leftOperand=3&rightOperand=4

export async function get_upload(request) {
    const response = {
        "headers": {
            "Content-Type": "application/json"
        }
    };

    const type = request.query["type"]
    const title = request.query["title"]
    const url = request.query["url"]
    let payload = await pull(title, type, url)
    if (payload === false) {
        return badRequest(payload)
    } else {
        return ok(payload)
    }
}

export async function get_DUS(request) {
    let options = {
        "headers": {
            "Content-Type": "application/json"
        }
    }
    return wixData.query("DUS")
        .find()
        .then(async (results) => {
            // matching items were found
            if (results.items.length > 0) {
                options.body = {
                    "items": results.items[0].request
                };
                var update = results.items[0]
                update.request = []
                await wixData.update("DUS", update)
                return ok(options);
            }
            // no matching items found
            options.body = {
                "error": `'${request.path[0]} ${request.path[1]}' was not found`
            };
            return notFound(options);
        })
        // something went wrong
        .catch((error) => {
            options.body = {
                "error": error
            };
            return serverError(options);
        });
}
/*

export async function get_predicted(request) {
    let options = {
        "headers": {
            "Content-Type": "application/json"
        }
    }

    return DynamicUploadSystem().then((payload) => {
        if (payload === false) {
            return badRequest(payload)
        } else {
            options.body = {
                "items": payload
            };
            return ok(options)
        }
    })
}
*/
