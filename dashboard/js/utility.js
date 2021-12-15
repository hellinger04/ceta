// const dbName = 'quiz-results-test';
// const pdb = new PouchDB(dbName); // create the database or opens an existing one
// const URL_addr = "https://apikey-v2-z2frlgnif66ieg8kweulj9zzsx3exfb79bheve3boa6:16a559585c476da6d94848028b14a1e5@f9fa405b-4f67-44c7-812d-be5a2a9a8a6d-bluemix.cloudantnosqldb.appdomain.cloud";
// var URL_pdb = URL_addr + '/' + dbName;
// var CETA_login = ""; // needed for login functions
// var CETA_user = "NN"; // initialize to NN

// var pdb_id = 0;

// pdb.changes({
//     since: 'now',
//     live: true
// }).on('change',writeData)

const writeData = async (data,id="",include_submit_date=true) => { // add option for id for update option and default to including submit date
  if (id == "") {
    data._id = Date.now().toString(); // use date for new id
    await put();
  } else {
    data._id = id; // save the id and then look for existing data
    pdb.get(id).then(async doc => {
      data._rev = doc._rev; // found it, use _rev to update
      await put();
    }).catch(async err => {
      if (err.status == 404 && err.message == 'missing') {
        data._id = Date.now().toString(); // use date for new id
        await put(); // id does not exist, so create new doc
      } else {
        console.log('!!!!!!!!!! writeData(data,id) > pdb.get() > err',data,id,err)
      }
    });
  }

  async function put() {
    if (include_submit_date) {
      let d = new Date();
      data.submit_year = d.getFullYear();
      data.submit_month = d.getMonth();
      data.submit_date = d.getDate();
      data.submit_hour = d.getHours();
      data.submit_minute = d.getMinutes();
    }
    await pdb.put(data).then(result => {
      if (typeof data.questionType !== "undefined" && typeof data.time !== "undefined") {
        $(`button[id='time_${data.time.toString()}']`).css("background-color","blue");
      }
      // console.log('Successfully posted data into PouchDB with the following data, result:',data,result);
    }).catch(err => {
      console.log('!!!!!!!!!! writeData() > pdb.put() > data,error:',data,err);
    });
  }
};

const sortRows = (rows) => {
  let sortedRows = [];
  rows.find(row => {
    if (typeof row == "undefined") {
      currentQuizzes.push(newQuiz); // if no previously saved quizzes with the same quizString, save
    } else if (findQuiz._id < newQuiz._id) {
      findQuiz = newQuiz; // if the previously saved quiz is earlier, save the new quiz
    }      
  });
}

const readAllData = async () => {
  let doc = await pdb.allDocs({include_docs: true, descending: true, deleted: 'ok'}, (err,doc) => {
    if (err) {
        console.log('PouchDB > readAllData() error:',err);
    } else {
        console.log('Successfully read data from PouchDB with the following doc:',doc);
        // return doc; // do not use return
    }
  });
  return doc.rows;
};

const deleteItemFromData = async (data={},id="") => {
  if (id == "") {
    await remove(data);
  } else {
    await pdb.get(id).then(async d => {
      await remove(d);
    })
  }

  async function remove(d) {
    await pdb.remove(d).then(result => {
      console.log('Successfully deleted data from PouchDB with the following data,result:',d,result);
    }).catch(err => {
      console.log('!!!!!!!!!! deleteItemFromData() > data,error:',d,err);
    });    
  }
};

const sync_pdb = () => {
    console.log('***** sync_pdb() > pdb.replicate.to() *****');
    // pdb.sync(URL_pdb, opts, (err,result) => { // standard Node.js callback
    let rep = pdb.replicate.to(URL_pdb, {
      live: true,
      retry: true, 
      back_off_function: (delay) => {
        const minute = 1000 * 60; // one minute in milliseconds
        if (delay === 0) {
          return 1 * minute; // first time interval for retry in min
        }
        const max_delay = 30 * minute;
        const new_delay = Math.min(max_delay,delay * 3);
        return new_delay;
      }
    }).on('change', (info) => {
      // handle change
      console.log('---------- PouchDB change info',info);
    }).on('paused', (err) => {
      // replication paused (e.g. replication up to date, user went offline)
      console.log('---------- PouchDB paused',err);
    }).on('active', () => {
      // replicate resumed (e.g. new changes replicating, user went back online)
      console.log('---------- PouchDB active ----------');
    }).on('denied', (err) => {
      // a document failed to replicate (e.g. due to permissions)
      console.log('---------- PouchDB denied error',err);
    }).on('complete', (info) => {
      // handle complete
    }).on('error', (err) => {
      // handle error
      console.log('---------- PouchDB replicate error',err);
    });
    // rep.cancel(); // need this to remove live updates
}

const replicate_from = () => { // UNUSED
    console.log('***** replicate_from() > pdb.replicate.from() *****');
    // pdb.sync(URL_pdb, opts, (err,result) => { // standard Node.js callback
    let rep = pdb.replicate.from(URL_pdb).on('change', (info) => {
      // handle change
      console.log('---------- PouchDB change info',info);
    }).on('paused', (err) => {
      // replication paused (e.g. replication up to date, user went offline)
      console.log('---------- PouchDB paused',err);
    }).on('active', () => {
      // replicate resumed (e.g. new changes replicating, user went back online)
      console.log('---------- PouchDB active ----------');
    }).on('denied', (err) => {
      // a document failed to replicate (e.g. due to permissions)
      console.log('---------- PouchDB denied error',err);
    }).on('complete', (info) => {
      // handle complete
    }).on('error', (err) => {
      // handle error
      console.log('---------- PouchDB replicate error',err);
    });
    // rep.cancel(); // need this to remove live updates
}

// const clearAllData = (storeName) => {
//     return dbPromise
//         .then(db => {
//             const tx = db.transaction(storeName, 'readwrite');
//             const store = tx.objectStore(storeName);
//             store.clear();
//             return tx.complete;
//         });
// };
// 
// const dataURItoBlob= dataURI => {
//     const byteString = atob(dataURI.split(',')[1]);
//     const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
//     const ab = new ArrayBuffer(byteString.length);
//     const ia = new Uint8Array(ab);
//     for (let i = 0; i < byteString.length; i++) {
//         ia[i] = byteString.charCodeAt(i);
//     }
//     const blob = new Blob([ab], {type: mimeString});
//     return blob;
// };

window.addEventListener('unhandledrejection', event => {
  console.log("Error: " + event.reason.message);
});

// LOGIN (OLD)
// function UserLogin() {
//   var loginWindow = document.getElementById("CETA_login");
//   var NavWindow = document.getElementById("CETA_navigator");
//   var Username = document.getElementById("Username").value;
//   CETA_login = Username;
//   loginWindow.setAttribute('style','display: none');
//   NavWindow.setAttribute('style','display:block');
// }

// function OpenEnableRegisterModal() {
//   document.getElementById('EnableRegisterUsername').value = $('#Username').val();
//   $('#EnableLoginModal').modal('show');
// }

// function CommentSubmit() {
//   var Input = document.getElementById('floatingInput').value;
//   document.getElementById('CommentModalBody').innerHTML = '<p>' + Input + '</p>';
//   var CommentModal = document.getElementById('CommentModal');
//   CommentModal.show();
// }

// function EnableLogin() {
//   var loginWindow = document.getElementById("CETA_login");
//   var NavWindow = document.getElementById("CETA_navigator");
//   loginWindow.setAttribute('style','display: none');
//   NavWindow.setAttribute('style','display:block');
//   $('#EnableLoginModal').modal('hide');
// }

// OLD IDB METHODS
// const dbPromise = idb.openDb('Quiz-data', 1, upgradeDB => {
//     if (!upgradeDB.objectStoreNames.contains('quiz-score')) {
//         upgradeDB.createObjectStore('quiz-score', {keyPath: 'id'});
//     }
// });

// const writeData = (storeName, data) => {
//     return dbPromise
//         .then(db => {
//             const tx = db.transaction(storeName, 'readwrite');
//             const store = tx.objectStore(storeName);
//             store.put(data);
//             return tx.complete;
//         });
// };

// const readAllData = (storeName) => {
//     return dbPromise
//         .then(db => {
//             const tx = db.transaction(storeName, 'readonly');
//             const store = tx.objectStore(storeName);
//             return store.getAll();
//         });
// };

// const clearAllData = (storeName) => {
//     return dbPromise
//         .then(db => {
//             const tx = db.transaction(storeName, 'readwrite');
//             const store = tx.objectStore(storeName);
//             store.clear();
//             return tx.complete;
//         });
// };

// const deleteItemFromData = (storeName, id) => {
//     dbPromise
//         .then(db => {
//             const tx = db.transaction(storeName, 'readwrite');
//             const store = tx.objectStore(storeName);
//             store.delete(id);
//             return tx.complete;
//         })
//         .then(() => console.log('Item deleted!'));
// };

// const dataURItoBlob= dataURI => {
//     const byteString = atob(dataURI.split(',')[1]);
//     const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
//     const ab = new ArrayBuffer(byteString.length);
//     const ia = new Uint8Array(ab);
//     for (let i = 0; i < byteString.length; i++) {
//         ia[i] = byteString.charCodeAt(i);
//     }
//     const blob = new Blob([ab], {type: mimeString});
//     return blob;
// };