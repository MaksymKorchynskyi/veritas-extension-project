const test = { detail: [{loc: "body", msg: "missing"}] };
let errMsg = test.detail || "Server error";
if (typeof errMsg === 'object') errMsg = JSON.stringify(errMsg);
console.log(errMsg);
