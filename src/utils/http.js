import https from "https";
import http from "http";

export function httpsRequest(params) {
  return new Promise(function (resolve, reject) {
    var request = https.request(params, function (response) {
      let data = "";

      response.on("data", (chunk) => {
        data = data + chunk.toString();
      });

      response.on("end", () => {
        resolve([response.statusCode, data]);
      });
    });

    request.on("error", (error) => {
      reject([500, error]);
    });

    request.end();
  });
}

export function httpRequest(params) {
  return new Promise(function (resolve, reject) {
    var request = http.request(params, function (response) {
      let data = "";

      response.on("data", (chunk) => {
        data = data + chunk.toString();
      });

      response.on("end", () => {
        resolve([response.statusCode, data]);
      });
    });

    request.on("error", (error) => {
      reject([500, error]);
    });

    request.end();
  });
}
