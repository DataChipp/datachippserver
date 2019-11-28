exports.uuidv4 = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
}

exports.entityToJSON = function (entity, includeMetadata=false) {
    let result = {};
    Object.keys(entity).forEach(k => {
        if (k !== ".metadata" || includeMetadata) {
            let prop = Object.getOwnPropertyDescriptor(entity, k);
            if (prop && k!== ".metadata") {
                result[k] = prop.value["_"];
            } else {
                result[k] = prop.value;
            }
        }
    });
    return result;
}

//While the Node.js Storage v10 is having table storage implemented, I recommend wrapping table storage code into a promise structure.
exports.tableExistsAsync = async function (tableService, ...args) {
    return new Promise((resolve, reject) => {
        let promiseHandling = (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        };
        args.push(promiseHandling);
        tableService.createTableIfNotExists.apply(tableService, args);
    });
};