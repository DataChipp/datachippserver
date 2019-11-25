const azure = require('azure-storage');
const tableService = azure.createTableService();

//While the Node.js Storage v10 is having table storage implemented, I recommend wrapping table storage code into a promise structure.
async function tableExistsAsync(tableService, ...args) {
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
    context.log('Start ItemCreate');

    let tableName = req.params.table;
    let partitionName = req.params.partition;
    let result;

    if (req.body) {
        try {
            result = await tableExistsAsync(tableService, tableName);
        } catch (e) {
            context.log("Error: " + e);
            // In case of an error we return an appropriate status code and the error returned by the DB
            // Calling status like this will automatically trigger a context.done()
            context.res.status(e.statusCode).json({ error: e });            
        }

        const item = req.body;
        item["PartitionKey"] = partitionName;

        //Simple, time based, without dependencies plus random numbers
        item["RowKey"] = (new Date()).getTime().toString(36) + Math.random().toString(36).slice(2);

        try {
            result = await insertEntityAsync(tableService, tableName, item, { echoContent: true });
            // This returns a 201 code + the database response inside the body
            context.res.status(201).json(result);
        } catch (e) {
            // In case of an error we return an appropriate status code and the error returned by the DB
            context.res.status(e.statusCode).json({ error: error });
        }
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass an item in the request body"
        };
    }
};