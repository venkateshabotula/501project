const Sequelize = require("sequelize");
const database = "capstone_dev";
const username = "postgres";
const password = "9090";
const sequelize = new Sequelize(database,username,password,{
    host : "localhost",
    dialect : "postgres",
    logging : false,
});
const connect = async() =>{
    return sequelize.authenticate();
}
module.exports = {
    connect,
    sequelize
} 


// this part is to check whether db is connecting or not 
// sequelize.authenticate()
//     .then(()=>{
//         console.log("Connected Succesfully");
//     })
//     .catch((error)=>{
//         console.log("couldnt connect",error)
//     });