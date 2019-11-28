const _ = require('../helper.js');
const azure = require('azure-storage');
const tableService = azure.createTableService();

async function insertEntityAsync(tableService, ...args) {
    return new Promise((resolve, reject) => {
        let promiseHandling = (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        };
        args.push(promiseHandling);
        tableService.insertEntity.apply(tableService, args);
    });
};

module.exports = async function (context, req) {
    context.log('Start ChippCreate');

    let tableName = req.params.table;
    let partitionName = req.params.partition;
    let result;

    if (req.body) {
        try {
            result = await _.tableExistsAsync(tableService, tableName);
        } catch (e) {
            context.log("Error: " + e);
            context.res.status(e.statusCode).json({ error: e });            
        }

        const item = req.body;
        item["PartitionKey"] = partitionName;
        item["RowKey"] = _.uuidv4(); 

        try {
            result = await insertEntityAsync(tableService, tableName, item, { echoContent: true });
            result = _.entityToJSON(result);
            context.res.status(201).json(result);
        } catch (e) {
            context.res.status(e.statusCode).json({ error: e });
        }
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass an item in the request body"
        };
    }
};