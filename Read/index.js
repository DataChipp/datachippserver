const _ = require('../helper.js');
const azure = require('azure-storage');
const tableService = azure.createTableService();

//While the Node.js Storage v10 is having table storage implemented, 
//I recommend wrapping table storage code into a promise structure.

async function retrieveEntityAsync(tableService, tableName, partitionName, id) {
    return new Promise( (resolve, reject) => {
        let promiseHandling = (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        };
        tableService.retrieveEntity(tableName, partitionName, id, promiseHandling);
    });
};

async function queryEntitiesAsync(tableService, tableName, query, ctoken) {
    return new Promise((resolve, reject) => {
        let promiseHandling = (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        };
        tableService.queryEntities(tableName, query, ctoken, promiseHandling);
    });
};

module.exports = async function (context, req) {
    context.log('Start ChippRead');
    let tableName = req.params.table;
    let partitionName = req.params.partition;
    let result;

    const id = req.params.id;
    if (id) {
        // return item with RowKey 'id'
        try {
            result = await _.tableExistsAsync(tableService, tableName);
            result = await retrieveEntityAsync(tableService, tableName, partitionName, id);
            result = _.entityToJSON(result);
            context.res.status(200).json(result);
        } catch (e) {
            context.log("Error: " + e);
            context.res.status(e.statusCode).json({ error: e });
        }
    }
    else {
        // return the top x items
        var query = new azure.TableQuery()
            .where('PartitionKey == ?', partitionName).top(100);

        let resultDetails = {};

        try {
            result = await _.tableExistsAsync(tableService, tableName);
            result = await queryEntitiesAsync(tableService, tableName, query, null);

            resultDetails.status = "success";

            if(result.continuationToken) resultDetails.continuationToken = result.continuationToken;

            resultDetails.data = [];

            result.entries.forEach(k => {
                let r = _.entityToJSON(k);
                resultDetails.data.push(r);
            });

            context.res.status(200).json(resultDetails);
        } catch (e) {
            context.log("Error: " + e);
            context.res.status(e.statusCode).json({ error: e });
        }
    }
};