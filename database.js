let mysql = require('mysql');

let connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  port:"3307",
  database: "stima"
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Database connected");
});

const createDatabase = () => { 
  connection.query("CREATE DATABASE stima", function (err, result) {
    if (err) throw err;
    console.log("Database created");
  });
}

const createTable = () => {
  var sql = "CREATE TABLE jadwal (id INT AUTO_INCREMENT PRIMARY KEY, id_tugas VARCHAR(255), tanggal DATE, kode VARCHAR(255), nama_tugas VARCHAR(255), deskripsi VARCHAR(255), status VARCHAR(1))";
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });
}

const insertToDB = (id_tugas,tgl, kode, nama, deskripsi,status) => {
  let sql = `INSERT INTO jadwal (id_tugas, tanggal, kode, nama_tugas, deskripsi, status) VALUES ('${id_tugas}','${tgl}', '${kode}', '${nama}', '${deskripsi}','${status}')`;
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });
}

module.exports = {
  createDatabase: createDatabase,
  createTable: createTable,
  insertToDB: insertToDB,
  connection: connection
}