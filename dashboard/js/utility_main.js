const dbName = 'main-install';

const pdb = new PouchDB(dbName); // create the database or opens an existing one

const URL_addr = "https://apikey-v2-z2frlgnif66ieg8kweulj9zzsx3exfb79bheve3boa6:16a559585c476da6d94848028b14a1e5@f9fa405b-4f67-44c7-812d-be5a2a9a8a6d-bluemix.cloudantnosqldb.appdomain.cloud";
var URL_pdb = URL_addr + '/' + dbName;
var opts =  {
    // live: true
};

// var pdb_id = 0;

// pdb.changes({
//     since: 'now',
//     live: true
// }).on('change',writeData)

const writeData = async data => {
    // data._id = new Date().toISOString();
    // data._id = pdb_id++;
    data._id = Date.now().toString();
    await pdb.put(data, (err,result) => {
        if (err) {
            console.log('PouchDB > writeData() error:',err);
        } else {
            console.log('Successfully posted data into PouchDB with the following data, result:',data,result);
        }
    })
};

const readAllData = async () => {
  let sortedRows = [];
  await pdb.allDocs({include_docs: true, descending: true}, (err,doc) => {
    if (err) {
      console.log('PouchDB > readAllData() error:',err);
    } else {
      console.log('Successfully read data from PouchDB with the following doc:',doc);
      sortedRows = doc.rows.sort((a,b) => {
        if (typeof a.doc.installStatus == "undefined") {
          return 1;
        } else if (typeof b.doc.installStatus == "undefined") {
          return -1;
        } else {
          return b.doc._id - a.doc._id;
        }
      });
    }
  });
  console.log('Sorted rows from PouchdB:',sortedRows);
  if (sortedRows.length>0 && typeof sortedRows[0].doc.installStatus != "undefined") { // cannot return undefined
    return sortedRows[0].doc.installStatus;
  } else {
    return null;
  }
};

const sync_pdb = () => {
    console.log('***** sync_pdb() > pdb.replicate.to() *****');
    // pdb.sync(URL_pdb, opts, (err,result) => { // standard Node.js callback
    let rep = pdb.replicate.to(URL_pdb, opts, (err,results) => {
        if (!err) {
            console.log('PouchDB replicate result',results);
        } else {
            console.log('PouchDB replicate error',err);
        }
    });
    // rep.cancel(); // need this to remove live updates
}
