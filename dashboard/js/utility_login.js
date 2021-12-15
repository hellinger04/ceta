function DB_User_Names(dbName_user_names = 'user-names') {
  this.dbName_user_names = dbName_user_names;

  this.pdb_user_names = new PouchDB(this.dbName_user_names); // create the database or opens an existing one
  this.URL_user_names = "https://apikey-v2-z2frlgnif66ieg8kweulj9zzsx3exfb79bheve3boa6:16a559585c476da6d94848028b14a1e5@f9fa405b-4f67-44c7-812d-be5a2a9a8a6d-bluemix.cloudantnosqldb.appdomain.cloud";
  this.URL_pdb_user_names = this.URL_user_names + '/' + this.dbName_user_names;
  this.opts =  {
      // live: true
  };

  this.generate_pdb_id = (u_userName,u_fullName,u_region,u_country,u_month,u_year) => {
      return jQuery.param({
        userName: u_userName, fullName: u_fullName, region: u_region, country: u_country, month: u_month, year: u_year
      }); // replaces special characters including accent, use aa_URL = new URLSearchParams(aa_str); aa_obj = Object.fromEntries(aa_URL);
    }

  // POUCHDB METHODS
  this.readAllData_user_names = async () => { // copied from utility.js
    let doc = await this.pdb_user_names.allDocs({include_docs: true, descending: true, deleted: 'ok'}, (err,doc) => {
      if (err) {
          console.log('PouchDB > readAllData() error:',err);
      } else {
          console.log('Successfully read data from PouchDB with the following doc:',doc);
          // return doc; // do not use return
      }
    });
    return doc.rows;
  }

  this.replicate_from_db_user_names = async () => {
    console.log('***** GetUserNames() > pdb_user_names.replicate.from() *****');
    let rep = await this.pdb_user_names.replicate.from(this.URL_pdb_user_names, this.opts, (err,results) => {
      if (!err) {
          console.log('pdb_user_names.replicate.from() > PouchDB replicate result',results);
      } else {
          console.log('!!!!!!!!!! pdb_user_names replicate from error',err);
      }
    });
  }

  // TEMPORARY: WRITE TO COUCHDB TO INITIALIZE THE DATABASE
  this.writeData_user_names = async (data,id) => { // add option for id for update option
    console.log('writeData_user_names > data',data);
    data._id = id; // save the id and then look for existing data
    this.pdb_user_names.get(id).then(async doc => { // DON'T USE AWAIT
      data._rev = doc._rev; // found it, use _rev to update
      // await this.put_user_names();
      this.pdb_user_names.put(data).then(result => {
        console.log('Successfully posted data into PouchDB with the following data, result:',data,result);
      }).catch(err => {
        console.log('!!!!!!!!!! writeData_user_names() > pdb_user_names.put() > data,error:',data,err);
      });        
    }).catch(async err => {
      if (err.status == 404 && err.message == 'missing') {
        // this.put_user_names(); // id does not exist, so create new doc
        console.log('catch > data',data)
        this.pdb_user_names.put(data).then(result => {
          console.log('Successfully posted data into PouchDB with the following data, result:',data,result);
        }).catch(err => {
          console.log('!!!!!!!!!! writeData_user_names() > pdb_user_names.put() > data,error:',data,err);
        });        
      } else {
        console.log('!!!!!!!!!! writeData_user_names(data,id) > pdb_user_names.get() > err',data,id,err)
      }
    });

    // this.put_user_names = async () => {
    //   console.log('put_user_names > data',data)
    //   await this.pdb_user_names.put(data).then(result => {
    //     // console.log('Successfully posted data into PouchDB with the following data, result:',data,result);
    //   }).catch(err => {
    //     console.log('!!!!!!!!!! writeData_user_names() > pdb_user_names.put() > data,error:',data,err);
    //   });
    // }
  };

  this.replicate_to_db_user_names = async () => {
    console.log('***** GetUserNames() > pdb_user_names.replicate.to() *****');
    let rep = await this.pdb_user_names.replicate.to(this.URL_pdb_user_names, this.opts, (err,results) => {
      if (!err) {
          console.log('pdb_user_names.replicate.to() > CouchDB replicate result',results);
      } else {
          console.log('!!!!!!!!!! pdb_user_names replicate to error',err);
      }
    });
  }
}