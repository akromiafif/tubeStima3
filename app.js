const express = require('express');
const bodyParser = require("body-parser");
const router = express.Router();
const app = express();
const DB = require('./database.js');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/", router);
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile('./views/index.html', { root: __dirname });
});

app.get('/chat', function (req, res) {
  res.sendFile('./views/chat.html', { root: __dirname });
});

app.get('/proccess/:taskDesc', function(req, res) {
  EngineTask2(req.params.taskDesc.trim(), res);
});
 
app.listen(3000);

function runAllMain(inputString, resObj) {
  let task1 = EngineTask1(inputString, resObj);
  let task2 = EngineTask2(inputString, resObj);
  let task3 = EngineTask3(inputString, resObj);
  let task4 = EngineTask4(inputString, resObj);
  let task5 = EngineTask5(inputString, resObj);

  let result = [];
  result.push(task1);
  result.push(task2);
  result.push(task3);
  result.push(task4);
  result.push(task5);

  console.log(result);

  let isAllInvalid = true;
  result.forEach((item) => {
    if (item == undefined) {
      isAllInvalid = false;
    }
  });

  if (isAllInvalid) {
    resObj.send("Bot tidak bisa memahami perintah");
  }
}






// =================================== ENGINE ===================================

// DB.createDatabase();
// DB.createTable();

function buildPatternTable(pattern) {
  const patternTable = [0];
  let prefixIndex = 0;
  let suffixIndex = 1;

  while (suffixIndex < pattern.length) {
    if (pattern[prefixIndex] === pattern[suffixIndex]) {
      patternTable[suffixIndex] = prefixIndex + 1;
      suffixIndex += 1;
      prefixIndex += 1;
    } else if (prefixIndex === 0) {
      patternTable[suffixIndex] = 0;
      suffixIndex += 1;
    } else {
      prefixIndex = patternTable[prefixIndex - 1];
    }
  }

  return patternTable;
}

function KMP(text, word) {
  if (word.length === 0) {
    return 0;
  }

  let textIndex = 0;
  let wordIndex = 0;

  const patternTable = buildPatternTable(word);

  while (textIndex < text.length) {
    if (text[textIndex] === word[wordIndex]) {
      if (wordIndex === word.length - 1) {
        return (textIndex - word.length) + 1;
      }
      wordIndex += 1;
      textIndex += 1;
    } else if (wordIndex > 0) {
      wordIndex = patternTable[wordIndex - 1];
    } else {
      wordIndex = 0;
      textIndex += 1;
    }
  }

  return -1;
}

function getDate(inputString, ptrRegexDate) {
  let result = inputString.matchAll(ptrRegexDate);

  result = Array.from(result);

  if (result.length != 0) {
    if (result.length > 1) {
      let arr = result;
      let arrDate = [];
      arr.forEach((item) => {
        arrDate.push(new Date(item[0]));
      });
      return arrDate;
    } 

    return new Date(result[0][0]);    
  }

  return false;
}

function getAllDate(inputString) {
  let ptrDate = /([0-9]{2}|[0-9]{1})\s((J|j)anuari|(F|f)ebruari|(M|m)aret|(A|a)pril|(M|m)ay|(J|j)uni|(J|j)uli|(A|a)ugust|(S|s)eptember|(O|o)ktober|(N|n)ovember|(D|d)ecember)\s[0-9]{4}/g; // dd mm yyyy

  let arrPattern = [];
  arrPattern.push(ptrDate);

  let result = [];

  arrPattern.forEach((item) => {
    result.push(getDate(inputString, item));
  });

  return result;
}

function getIDMatkul(inputString) {
  let matkulPtr = /IF\d{4}/g;
  let result = inputString.matchAll(matkulPtr);
  result = Array.from(result);

  if (result.length > 0) {
    let arr = result;
    let arrIDMatkul = [];
    arr.forEach((item) => {
      arrIDMatkul.push(item[0]);
    });

    return [arrIDMatkul, result[0].index];
  }

  return false;
}

function getDescription(inputString, indexMatkul) {
  let indexPada = KMP(inputString, "pada");
  let description;

  if (indexPada != -1) {
    description = inputString.slice(indexMatkul+7, indexPada);
  } else {
    description = false;
  }

  return description;
}

function getIDTask(inputString) {
  let matkulPtr = /ID_\d{4}IF\d{4}/g;
  let result = inputString.matchAll(matkulPtr);
  result = Array.from(result);

  if (result.length != 0) {
    return result;
  } else {
    return false;
  }
}

function formatDate(date) {
  if (date != false) {
    let nDate = new Date(date);
    return `${nDate.getFullYear()}-${nDate.getMonth()+1}-${nDate.getDate()}`;
  } else {
    return false;
  }
}

function getConvert(inputString, rgxPtr) {
  let result = inputString.matchAll(rgxPtr);
  result = Array.from(result);

  if (result.length > 0) {
    return result[0][0].split(" ")[0];
  } else {
    return false;
  }
}

function EngineTask1(inputString, resObj) {
  let kataKunci = ['Kuis', 'Ujian', 'Tucil', 'Tubes', 'Praktikum'];
  let arrIDMatkul = getIDMatkul(inputString);
  let arrDate = getAllDate(inputString);
  let tugas = false;
  let singleDate;
  let id_tugas;
  let status = "F";
  let desc = getDescription(inputString, arrIDMatkul[1]);

  kataKunci.forEach((item) => {
    if (KMP(inputString, item) != -1) {
      tugas = item;
    }
  });

  if (arrDate.length == 1) {
    singleDate = new Date(arrDate[0]);
  } else {
    singleDate = false;
  }

  if (singleDate.getMonth()+1 < 10){
    if (singleDate.getDate() < 10){
      id_tugas = "ID_0"+(singleDate.getMonth()+1) + "0"+ singleDate.getDate()+ arrIDMatkul[0];
    }else{
      id_tugas = "ID_0"+(singleDate.getMonth()+1) + singleDate.getDate()+ arrIDMatkul[0];
    }
  }else{
    if (singleDate.getDate() < 10){
      id_tugas = "ID_"+(singleDate.getMonth()+1) + "0"+ singleDate.getDate()+ arrIDMatkul[0];
    }else{
      id_tugas = "ID_"+(singleDate.getMonth()+1) + singleDate.getDate()+ arrIDMatkul[0];
    }
  }
  
  if (tugas && arrIDMatkul && singleDate && (desc != "")) {
    let resTask1 = `[TASK BERHASIL DICATAT] \n \n
    (ID: 1) - ${singleDate.toLocaleDateString()} - ${arrIDMatkul[0]} - ${tugas} - ${getDescription(inputString, arrIDMatkul[1])}`;
    
    console.log("[TASK BERHASIL DICATAT]");
    console.log(`(ID: 1) - ${singleDate.toLocaleDateString()} - ${arrIDMatkul[0]} - ${tugas} - ${getDescription(inputString, arrIDMatkul[1])}`);
    
    let date = `${singleDate.getFullYear()}-${singleDate.getMonth()+1}-${singleDate.getDate()}`;
    
    DB.insertToDB(id_tugas, date, arrIDMatkul[0], tugas, getDescription(inputString, arrIDMatkul[1]).trim(), status);
    
    resObj.send(resTask1);
  } else {
    console.log("Non Valid");
    return false;
  }
}
function EngineTask2(inputString, resObj) {
  let ptrRegexWeek = /\d{1,}\sminggu/g;
  let ptrRegexDay = /\d{1,}\shari/g;

  // a. Seluruh task yang sudah tercatat oleh assistant
  // Contoh perintah yang dapat digunakan: “Apa saja deadline yang dimiliki
  // sejauh ini?”

  let kataKunci = ['hari ini'];
  let keyword = ['kuis', 'ujian', 'tucil', 'tubes', 'praktikum'];
  let kataKunciA = ['milik'];
  let kataKunciB = ['antara'];
  let kataKunciC = ['minggu ke depan'];
  let id_tugas = getIDTask(inputString);
  let id_date = getAllDate(inputString);
  let timeNow = new Date();
  let dateNow = formatDate(timeNow);

  let convertDay = getConvert(inputString, ptrRegexDay);
  let convertWeek = getConvert(inputString, ptrRegexWeek);

  kataKunci.forEach((item) => {
    let result = KMP(inputString, item);

    if (result != -1) {
      kataKunci = item;
    } else {
      kataKunci = false;
    }
  });

  let keywordAsu = ["asu"];

  keyword.forEach((item) => {
    let result = KMP(inputString, item);

    if (result != -1) {
      keywordAsu = item;
    }
  });

  if (kataKunci != false) {

    let sql = 'asu';
    // console.log(keywordAsu);
    // console.log(keywordAsu==['asu']);
    if (keywordAsu != "asu"){
      sql = `SELECT T.* FROM (
        SELECT a.*
        FROM jadwal a
        WHERE a.tanggal ='${dateNow}'
      ) AS T WHERE T.nama_tugas = '${keywordAsu}';
      `;
    }else{
      sql = `SELECT * FROM jadwal WHERE tanggal ='${dateNow}'`;
    }
    DB.connection.query(sql, (err, res) => {
      if (!err) {
        res.forEach((item) => {
          let x = JSON.parse(JSON.stringify(item));
          let newDate = new Date(x.tanggal);
          newDate = `${newDate.getFullYear()}-${newDate.getMonth()+1}-${newDate.getDate()}`;
          let resTask2 = "ID : "+x.id+"\nID TUGAS : "+x.id_tugas+"\nTANGGAL : "+ newDate+"\nKODE : "+x.kode+"\nNAMA TUGAS : "+x.nama_tugas+"\nDESKRIPSI : "+x.deskripsi+"\nSTATUS : "+x.status;
          resObj.send(resTask2);
          // console.log("ID : "+x.id);
          // console.log("ID TUGAS : "+x.id_tugas);
          // console.log("TANGGAL : "+ newDate);
          // console.log("KODE : "+x.kode);
          // console.log("NAMA TUGAS : "+x.nama_tugas);
          // console.log("DESKRIPSI : "+x.deskripsi);
          // console.log("STATUS : "+x.status+"\n");
        });
      }else{
        return false;
      }
    });
  };
  

  if (convertDay != false) {
    convertDay = parseInt(convertDay) * 86400000;
    convertDay = new Date(timeNow.getTime() + convertDay);

    let dateLater = formatDate(convertDay);

    let sql = 'asu';
    // console.log(keywordAsu==['asu']);
    if (keywordAsu != "asu"){
      sql = `SELECT T.* FROM (
        SELECT a.*
        FROM jadwal a
        WHERE a.tanggal BETWEEN '${dateNow}' AND '${dateLater}'
      ) AS T WHERE T.nama_tugas = '${keywordAsu}';
      `;
    }else{
      sql = `SELECT * FROM jadwal WHERE tanggal BETWEEN '${dateNow}' AND '${dateLater}'`;
    }
    DB.connection.query(sql, (err, res) => {
      if (!err) {
        res.forEach((item) => {
          let x = JSON.parse(JSON.stringify(item));
          let newDate = new Date(x.tanggal);
          newDate = `${newDate.getFullYear()}-${newDate.getMonth()+1}-${newDate.getDate()}`;
          let resTask2 = "ID : "+x.id+"\nID TUGAS : "+x.id_tugas+"\nTANGGAL : "+ newDate+"\nKODE : "+x.kode+"\nNAMA TUGAS : "+x.nama_tugas+"\nDESKRIPSI : "+x.deskripsi+"\nSTATUS : "+x.status;
          resObj.send(resTask2);
        });
      }else{
        return false;
      }
    });
  };
  

  if (convertWeek != false) {
    convertWeek = parseInt(convertWeek) * 7 * 86400000;
    convertWeek = new Date(timeNow.getTime() + convertWeek);

    let dateLater = `${convertWeek.getFullYear()}-${convertWeek.getMonth()+1}-${convertWeek.getDate()}`;
    let sql = 'asu';
    // console.log(keywordAsu);
    // console.log(keywordAsu==['asu']);
    if (keywordAsu != "asu"){
      sql = `SELECT T.* FROM (
        SELECT a.*
        FROM jadwal a
        WHERE a.tanggal BETWEEN '${dateNow}' AND '${dateLater}'
      ) AS T WHERE T.nama_tugas = '${keywordAsu}';
      `;
    }else{
      sql = `SELECT * FROM jadwal WHERE tanggal BETWEEN '${dateNow}' AND '${dateLater}'`;
    }
    DB.connection.query(sql, (err, res) => {
      if (!err) {
        res.forEach((item) => {
          let x = JSON.parse(JSON.stringify(item));
          let newDate = new Date(x.tanggal);
          newDate = `${newDate.getFullYear()}-${newDate.getMonth()+1}-${newDate.getDate()}`;
          let resTask2 = "ID : "+x.id+"\nID TUGAS : "+x.id_tugas+"\nTANGGAL : "+ newDate+"\nKODE : "+x.kode+"\nNAMA TUGAS : "+x.nama_tugas+"\nDESKRIPSI : "+x.deskripsi+"\nSTATUS : "+x.status;
          resObj.send(resTask2);
        });
      }else{
        return false;
      }
    });
  };

  let date1 = id_date[0][0].getDate()+"/"+(id_date[0][0].getMonth()+1)+"/"+id_date[0][0].getFullYear();
  let date2 = id_date[0][1].getDate()+"/"+(id_date[0][1].getMonth()+1)+"/"+id_date[0][1].getFullYear();
  
  // let newDate = new Date(id_date[0]);
  // console.log(newDate);
  // console.log(newDate.getTime());
  // let mil = newDate.getTime() + 86400000;
  // console.log(mil);
  // let newDate2 = new Date(mil);
  // console.log(newDate2.toDateString());
  // let kunciA = " ";
  let kunciB = " ";
  // let kunciC = " ";

  // kataKunciA.forEach((item) => {
  //   if (KMP(inputString, item) != -1) {
  //     kunciA = item;
  //   }
  // });

  kataKunciB.forEach((item) => {
    if (KMP(inputString, item) != -1) {
      kunciB = item;
    }
  });

  // if (kunciA != " ") {
  //   DB.con.connect((err) => {  
  //     if (err) throw err;
  //     let sql = `SELECT * FROM jadwal`;
  
  //     DB.con.query(sql, (err, res) => {
  //       if (!err) {    
  //         res.forEach((item) => {
  //           let x = JSON.parse(JSON.stringify(item));
  //           console.log("ID : "+x.id);
  //           console.log("ID TUGAS : "+x.id_tugas);
  //           console.log("TANGGAL : "+x.tanggal);
  //           console.log("KODE : "+x.kode);
  //           console.log("NAMA TUGAS : "+x.nama_tugas);
  //           console.log("DESKRIPSI : "+x.deskripsi);
  //           console.log("STATUS : "+x.status+"\n");
  //         });
  //       }
  //     });
  //   });
  if (kunciB != " ") {
    
    let sql = `SELECT * FROM jadwal WHERE tanggal BETWEEN '${date1}' AND '${date2}'`;
    // console.log(date1);
    // console.log(date2);
    DB.connection.query(sql, (err, res) => {
      console.log(res);
      if (!err) {
        res.forEach((item) => {
          let x = JSON.parse(JSON.stringify(item));
          let resTask2 = "ID : "+x.id+"\nID TUGAS : "+x.id_tugas+"\nTANGGAL : "+ newDate+"\nKODE : "+x.kode+"\nNAMA TUGAS : "+x.nama_tugas+"\nDESKRIPSI : "+x.deskripsi+"\nSTATUS : "+x.status;
          resObj.send(resTask2);
        });
      }
    });
  };
  }


function EngineTask3(inputString, resObj) {
  let kataKunci = ['Kapan', 'Bila', 'Waktu', 'Ketika'];
  let kodeMatkul = getIDMatkul(inputString);
  let kunci = " ";

  kataKunci.forEach((item) => {
    if (KMP(inputString, item) != -1) {
      kunci = item;
    }
  });

  if (kodeMatkul != false) {
    if (kodeMatkul[0].length != 1) {
      // console.log("Tidak valid pertama");
      return false;
    } else {
      if (kunci != " ") {
        let sql = `SELECT tanggal FROM jadwal WHERE kode='${kodeMatkul[0][0]}'`;

        DB.connection.query(sql, (err, res) => {
          if (!err) {    
            if (res.length != 0) {
              let result = JSON.parse(JSON.stringify(res));
              let arrRes = [];
      
              result.forEach((item) => {
                // console.log(formatDate(new Date(item.tanggal)));
                arrRes.push(formatDate(new Date(item.tanggal)));
              });
              
              console.log("Task ditemukan");
              resObj.send(arrRes);
            } else {
              console.log("Task tidak ditemukan");
              resObj.send("Task tidak ditemukan");
            }
          }
        });
      } else {
        console.log("Tidak valid");
        return false
      }
    }
  } else {
    console.log("Tidak aman");
    return false
  }
}

function EngineTask4(inputString, resObj) {
  let arrDate = getAllDate(inputString);
  let id_task = getIDTask(inputString);
  let date = formatDate(arrDate[0]);

  let isValid = (date == false || id_task == false) || (date == false && id_task == false);
  if (isValid) {
    // console.log("Tidak Valid");
    return false;
  } else {
    let sql = `SELECT * FROM jadwal WHERE id_tugas='${id_task[0][0]}'`;

    DB.connection.query(sql, (err, res) => {
      if (!err) {  
        if (res.length != 0) {
            let sql = `UPDATE jadwal SET tanggal = '${date}' WHERE id_tugas = '${id_task[0][0]}'`;
            DB.connection.query(sql, function (err, result) {
              if (err) throw err;
              console.log(result.affectedRows + " record(s) updated");
            });
            resObj.send(`${id_task[0][0]} berhasil di update ke tanggal ${date}`);
          
        } else {
          console.log("Task tidak ditemukan");
          resObj.send("Task tidak ditemukan");
        }
      }
    });
  }
}

function EngineTask5(text, resObj){
  let kataKunci = ['selesai', 'sudah', 'tuntas', 'telah', 'beres','kelar','rampung','mari'];
  let id_tugas = getIDTask(text);
  let isKataKunciExist = false;

  kataKunci.forEach((item) => {
    let res = KMP(text, item);

    if (res != -1) {
      isKataKunciExist = true;
    }
  });

  if (id_tugas.length != 1 || isKataKunciExist == false){
    console.log("Masukan invalid, silahkan masukkan 1 id_tugas saja");
    return false;
  }else{
    let sql = `SELECT * FROM jadwal WHERE id_tugas='${id_tugas[0][0]}'`;

    DB.connection.query(sql, (err, res) => {
      if (!err) {  
        if (res.length != 0) {
            let sql = `UPDATE jadwal SET status = 'T' WHERE id_tugas = '${id_tugas[0][0]}'`;
            DB.connection.query(sql, function (err, result) {
              if (err) throw err;
              console.log(result.affectedRows + " record(s) updated");
              resObj.send(`ID Tugas ${id_tugas[0][0]} berhasil di update ke selesai`)
            });
        } else {
          console.log("Task tidak ditemukan");
          resObj.send("Task tidak ditemukan");
        }
      }
    });
  }
}

let testString = 'Hallo bot tolong ingatkan Kuis IF1150 AngularJS pada 28 April 2021';
let testString2 = 'Apa saja deadline yang dimiliki sejauh ini ?';
let testString3 = 'Kapan deadline tugas IF1150 ?';
let testString4 = 'Deadline task ID_0502IF1150 diundur menjadi 10 April 2020';
let testString5 = 'Saya sudah mengerjakan task ID_0502IF1150';
let testString6 = 'Deadline 2 minggu ke depan apa saja';
let testString7 = 'Apa saja deadline hari ini ?';

// EngineTask3(testString3);

function help(){
  console.log('Fitur VCS Bot :\n- 1. Menambahkan task baru\n- 2. Melihat daftar task yang harus dikerjakan\n- 3. Menampilkan deadline dari suatu task tertentu\n- 4. Memperbaharui task tertentu\n- 5. Menandai bahwa suatu task sudah selesai dikerjakan\n\nDaftar kata penting yang harus anda muat salah satu didalam chat anda ialah : Kuis, Ujian, Tucil, Tubes, Praktikum\n\n- Periode date 1 sampai date 2, usage : Apa saja deadline antara date1 sampai date2 ?\n- N Minggu kedepan, usage : Deadline N minggu kedepan apa saja ?\n- N Hari kedepan, usage : Deadline N hari kedepan apa saja ?\n- Hari ini, usage : Apa saja deadline hari ini ?\n- Menampilkan deadline tertentu : Deadline tugas tugas123 itu kapan ?\n- Ingin menyesuaikan deadline task, usage : Deadline tugas tugas123 diundur/dimajukan menjadi date123\n- Menyelesaikan tugas, usage : Saya sudah selesai mengerjakan task task123 ( ID Task tersebut )')
}

//help();