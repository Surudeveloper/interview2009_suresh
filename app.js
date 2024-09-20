var express = require('express');
var mysql = require('mysql');
var port = 9000;

var app = express();
app.use(express.json())

var db = mysql.createConnection({
    host: 'nodejs-technical-test.cm30rlobuoic.ap-southeast-1.rds.amazonaws.com',
    user: 'candidate',
    password: 'NoTeDeSt^C10.6?SxwY882}',
    database: "conqtvms_dev"
})

db.connect((err) => {
    if (!err) {
        console.log(`Db is connected successfully`);

        app.listen(port, (err) => {
            console.log(`App is listening to the port ${port}`);
        })
    } else {
        console.log(`Error while connecting db: ${err}`);
    }
})

// app.get('/getProductDetail/:pageNo', (req, res) => {
// app.get('/getProductDetail', (req, res) => {
app.post('/getProductDetail', (req, res) => {
    // let currentPage = req.params.pageNo?Number(req.params.pageNo):1
   
    let queries = req.body
    let currentPage = queries.pageNo?Number(queries.pageNo):1
    let pageSize = queries.pageSize?Number(queries.pageSize):10

    let orderBy = queries.orderBy?queries.orderBy:"createdAt"
    let orderDir = queries.orderDir?queries.orderDir:"desc"
    let searchBy = queries.searchBy? queries.searchBy:''
    let searchFields = queries.searchFields?queries.searchFields: []

    let offset = (currentPage-1)*pageSize
    var query

    query = `select * from Products limit ${pageSize} offset ${offset} `
    
    if(searchBy!=''){
        query = `select * from Products limit ${pageSize} offset ${offset} like %${searchBy}%`
    }
    
    if(orderDir && orderBy){
        query = `select * from Products limit ${pageSize} offset ${offset} order by ${orderBy} ${orderDir}` 
    }

    //If `searchBy` is an empty string and `searchFields` is an empty array, the API should return all records without any filtering.

     
    if(searchFields.length>0 && searchBy!=''){
        // If `searchBy` is provided as "product1" and `searchFields` are provided as ["productName", "description"], the API should only search in the `productName` and `description` columns for the term "product1".
        // SELECT Col2, Col1 FROM (SELECT * FROM tblEmployees WHERE Empid = 200) a
        // UNPIVOT(Col1 FOR Col2 IN (EmpID, Name, Sex)) AS unp
        
        let allFields = searchFields.join(', ')
        //select productName, description from (SELECT * FROM Products WHERE productName = ${searchBy})
        query = `select * from Products limit ${pageSize} offset ${offset} where column_name in (${allFields})`

    } else if(searchFields.length==0 && searchBy=='') {
        query = `select * from Products`

    } else if(searchFields.length>0){
        let allFields = searchFields.join(', ')
        query = `select * from Products limit ${pageSize} offset ${offset} where column_name in (${allFields})`
    } 
    
    // let query = `select productId, productName, productImageName, productImageURL, brandName, description, itemCode,itemType,currency,currencyCode,saleAmount,brochureFileName,brochureFileURL,vendors,status,createdBy,created,updated,subCategoryId,categoryId, uomId, shippingMethodId,shippingTermsId, paymentTermsId, categoryName, subCategoryName, uomCode, uomDescription, organisationName, organisationId, vendorInfo 
    // from Products`

    
    db.query(query, (err, data) => {
        if (!err) {
            res.send({ status: true, msg: data })
        } else {
            res.send({ status: false, msg: `Error while getting product data, ${err}` })
        }
    })
})
