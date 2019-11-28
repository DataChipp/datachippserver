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