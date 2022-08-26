import https from "https";
import http from "http";

export function httpsRequest(url, params) {
  return new Promise(function (resolve, reject) {
    var request = https.request(url, params, function (response) {
      let data = "";

      response.on("data", (chunk) => {
        data = data + chunk.toString();
      });

      response.on("end", () => {
        resolve([response.statusCode, response.headers["content-type"], data]);
      });
    });

    request.on("error", (error) => {
      reject([500, error]);
    });

    request.end();
  });
}

export function httpRequest(url, params) {
  return new Promise(function (resolve, reject) {
    var request = http.request(url, params, function (response) {
      let data = "";

      response.on("data", (chunk) => {
        data = data + chunk.toString();
      });

      response.on("end", () => {
        resolve([response.statusCode, response.headers["content-type"], data]);
      });
    });

    request.on("error", (error) => {
      reject([500, error]);
    });

    request.end();
  });
}
