var flag_show_quiz_times = true;

// SW_register(): [sw_ELEMENT.js]
//   event install: Add filesToCache to cache
//   event activate: Delete old caches
// initialize_db():
//   init(): initialize db
//   list(): Get current list of videos
//   put_video(): Update files from this list
// put_video():
//   VideoFiles[0][1], VideoFiles[1][1], ... [VideoFiles_ELEMENT.js]
//     which all have the form: ./videos/.../.mp4
//   event fetch: [sw_ELEMENT.js]
//     cache.match(): Find the match to event.request
//     fetch(event.request): Network
//       cache.put(): Store in SW cache [DUPLICATE NOT NEEDED]
//   objectStore.put(): Store video
// get_video(): [videoFunctions.js]
//   objectStore.get(): Get video
// check_videos():
//   video.blob.type: Should be mp4, if not then:
//     put_video(): Force to reload from network 

  async function persistentCheck() {
    let persistent;
    if (navigator.storage && navigator.storage.persist) {
      await navigator.storage.persist().then(granted => {
        if (granted) {
          console.log(`SW_register() > Persisted storage granted`);
        } else {
          console.log(`SW_register() > Persisted storage not granted`);
        }
      }).then(async () => {
        persistent = await navigator.storage.persisted();
        console.log('SW_register() > Persisted storage status:',persistent);
      });
    } else {
      console.log('no storage control');
    }   
    return persistent;
  };

// async function persistentCheck() {
//   let persistent = false;
//   let persistentPromise = await new Promise(async (resolve,reject) => {
//     if (navigator.storage && navigator.storage.persist) {
//       resolve(await navigator.storage.persisted());
//     } else {
//       reject('no storage control');
//     }   
//   });
//   if (persistentPromise) {
//     console.log(`SW_register() > Persisted storage granted: ${persistentPromise}`);
//     let persistent = await new Promise(async (resolve) => {
//       resolve(await navigator.storage.persist());
//     });
//     if (persistent) {
//       console.log("SW_register() > Storage will not be cleared except by explicit user action");
//     } else {
//       console.log("SW_register() > Storage may be cleared by the UA under storage pressure.");
//     };
//   }
//   return persistent;
// }

async function SW_register(SW_file) { // async functions should return a promise
  // Check if site's storage has been marked as persistent
  console.log('SW_register()');
  await new Promise((resolve,reject) => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(SW_file).then(function(registration) {
        console.log('SW_register() > ServiceWorker registration: ', registration);
        console.log('SW_register() > ServiceWorker registration successful with scope: ', registration.scope);
        resolve(registration.scope);
      }).catch(function(e) {
        console.log('SW_register() > ServiceWorker registration failed: ', e);
        reject(e);
      });
    } else {
      alert('serviceWorker is not in navigator');
      reject('serviceWorker is not in navigator');
    }      
  });
  await persistentCheck();
  // if (navigator.storage && navigator.storage.persist) {
  //   navigator.storage.persist().then(function(persistent) {
  //     if (persistent) {
  //       console.log("SW_register() > Storage will not be cleared except by explicit user action");
  //     } else {
  //       console.log("SW_register() > Storage may be cleared by the UA under storage pressure.");
  //     }
  //   });
  // }
  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.register(SW_file).then(function(registration) {
  //     console.log('SW_register() > ServiceWorker registration: ', registration);
  //     console.log('SW_register() > ServiceWorker registration successful with scope: ', registration.scope);
  //   }).catch(function(e) {
  //     console.log('SW_register() > ServiceWorker registration failed: ', e);
  //   });
  // } else {
  //   alert('serviceWorker is not in navigator');
  // }  
}

var OpenWaitModal = function(Title,Body,ShowCloseButton=false,ReturnButton=false,ShowModal=true) {
  return new Promise(async (resolve) => {
    //Change title content of the wait modal
    document.querySelector('#WaitModalLabel').innerText = Title;
    // document.querySelector('#WaitModalLabel').setAttribute("style","font-size:90%;"); // not necessary, <h4> is good
    //Change body content of the wait modal
    document.querySelector('#WaitModalBody').innerHTML = `<p style="font-size:80%;">${Body}</p>`;
    document.querySelector('#WaitModalClose').setAttribute("style","display:none");
    document.querySelector('#WaitModalBack').setAttribute("style","display:none");
    if (ReturnButton) {
      document.querySelector('#WaitModalBack').setAttribute("style","display:block");
    } else if (ShowCloseButton) {
      document.querySelector('#WaitModalClose').setAttribute("style","display:block");
    }
    if (ShowModal) {
      $('#WaitModal').modal('show');
    } else {
      await CloseWaitModal();
    }
    resolve('show is successful');      
  });
}

var CloseWaitModal = () => {
  new Promise((resolve) => {
    setTimeout(() => {
      $('#WaitModal').modal('hide');
      resolve('hide is successful');
    }, 1000);
  });
}

// DB
var db;
const db_name = 'videoIDB';
const db_version = 3; // 2 deprecated Mar 23 11:43 pm

async function initialize_db() {
  console.log("initialize_db");
  await init();
  console.log("initialize_db > init()");
  const video_entries = await list();
  console.log("initialize_db > list()");
  var update_files = false;
  for (VideoFile of VideoFiles) {
    if (!video_entries.id.includes(VideoFile[0] + VideoFile[1])) { // can update video by renaming the file
      update_files = true;
      await OpenWaitModal('Please wait. Currently loading video',`${VideoFile[0]} ...`);
      console.log(`initialize_db > OpenWaitModal(loading video ${VideoFile[0]})`);
      await put_video(VideoFile[0],VideoFile[1],true); // refresh
      console.log(`initialize_db > put_video(${VideoFile[0]})`);
    }
  }
  if (update_files) { // need this or the message will always show when refreshing
  //  const addr = window.location.href;
  //   const URLsearch = window.location.search;
  //   const addr = window.location.origin; // shorter than href, without URL parameters, doesn't work with iFrame
  //   if (URLsearch.search("BackButton=true")==-1) {
  //     await OpenWaitModal(`The app is installed`,`This link will work without Internet/WiFi/Mobile Signal:<br><br>${addr}`,true,false);
  //   } else {
  //     await OpenWaitModal(`This CETA Element is installed`,`Select button to return to the main menu and install the other Elements`,false,true);
  //   }
    // await OpenWaitModal(`CETA Element ${element_name} is installed`,``,false,false,false); // not necessary, check_videos() is better
    console.log(`initialize_db > OpenWaitModal(${element_name} is installed)`);
    await CloseWaitModal();
  }
}

async function init() {
  console.log('init'); // idb documentation: https://github.com/jakearchibald/idb
  db = await idb.openDb(db_name, db_version,
    async (db,oldVersion,newVersion) => {
      console.log('init > openDb > upgrade');
      // switch (oldVersion) {
      //   case 0:
      //     await db.createObjectStore('videos', {keyPath: 'name'}); // cannot have two videos with same name
      //   // default:
        //   await db.deleteObjectStore('videos');
      // }
      if (!db.objectStoreNames.contains('videos')) { // check if the object store already exists
        await db.createObjectStore('videos', {keyPath: 'name'}); // older store does not need to be deleted (unless store name changes)
      }
    },
    async () => {
      console.log('init > openDb > blocked');
    },
    async () => {
      console.log('init > openDb > blocking');
    },
    async () => {
      console.log('init > openDb > terminated');
    }
  );
}

async function DeleteIDB(database) {
  const DBDeleteRequest = window.indexedDB.deleteDatabase(database);
  DBDeleteRequest.onerror = function (event) {
    console.log("Error deleting database: "+event);
  };
  DBDeleteRequest.onsuccess = function (event) {
    console.log("Database deleted successfully: "+event); // should be undefined
  };
}


async function DEBUG_replace_blob(CETA_Card_get,CETA_Card_put,replace_blob_type=false) {
  const video_entry_get = await get_video(CETA_Card_get); // {name: CETA_Card, blob: videoRequest_blob, file: file}
  var video_entry_put = await get_video(CETA_Card_put);
  video_entry_put.blob = video_entry_get.blob;
  if (replace_blob_type) {
    video_entry_put.blob = "";
  }
  let tx = await db.transaction('videos', 'readwrite');
  await tx.objectStore('videos').put(video_entry_put); // free up memory: URL.revokeObjectURL(url), put->update, add->error
  console.log('Done DEBUG_replace_blob, blob.type = ' + video_entry_put.blob.type);
}


async function get_video(CETA_Card) {
  console.log(`get_video(${CETA_Card})`);
  const transaction = await db.transaction(['videos']); // initiate a transaction to the db with a list of objectStore names
  const objectStore = await transaction.objectStore('videos'); // get ready for a transaction with the specific objectStore
  const video_entry = await objectStore.get(CETA_Card); // get('name_of_blob') and put(blob,'name_of_blob') are examples of db transations
  console.log('get_video(${CETA_Card}) > video_entry',video_entry);
  return video_entry;
}


async function put_video(CETA_Card,file,refresh=true) { // set refresh=true always, including in check_videos() 
  console.log(`put_video(${CETA_Card})`);
  if (refresh) {
    await (async () => {
      console.log(`put_video(${CETA_Card}) > postMessage(${file})`);
      navigator.serviceWorker.ready.then( registration => {
        registration.active.postMessage(file); // message to the SW event listener (sw_ELEMENT.js), which will delete the file
      })
    })();
    try {
      const videoRequest_blob = await fetch(file).then(response => response.blob()); // response.blob() returned after it is evaluated
      console.log(`put_video(${CETA_Card}) > fetch()`);
      let tx = await db.transaction('videos', 'readwrite');
      let video_entry = {name: CETA_Card, blob: videoRequest_blob, file: file};
      // console.log('put_video -> fetch: ', videoRequest_blob); // doesn't display videoRequest_blob
      try {
        await tx.objectStore('videos').put(video_entry); // free up memory: URL.revokeObjectURL(url), put->update, add->error
        console.log(`put_video(${CETA_Card}) > objectStore.put(video_entry)`, video_entry);
      } catch (err) {
        if (err.name == 'ConstraintError') {
          console.log(`put_video -> objectStore.put: video ${CETA_Card} exists already`); // only happens with add
        } else {
          console.log(`********** ERROR IN IndexedDB.put for ${CETA_Card} file ${file} **********`);
          console.log(err);
          throw err;
        }
      }
    } catch (e) {
      console.log(`put_video(${CETA_Card}) > error`,e);
    }
  }
}

async function list() {
  console.log('list()');
  let tx = db.transaction('videos', 'readwrite');
  let videoStore = tx.objectStore('videos');

  let videos = await videoStore.getAll();
  var video_entries = {
    names: [],
    files: [],
    id: []
  };

  if (videos.length) {
    // listElem.innerHTML = videos.map(video => `<li onclick="get_video('${video.name}')">
    //     ${video.name}
    //   </li>`).join('');
    for (video of videos) {
      if (typeof video.name === "undefined") { video.name = ""; };
      if (typeof video.file === "undefined") { video.file = ""; };
      video_entries.names.push(video.name);
      video_entries.files.push(video.file);
      video_entries.id.push(video.name + video.file);
    }
  } else {
    // listElem.innerHTML = '<li>No videos yet. Please add videos.</li>'
  }
  return video_entries;
}

async function check_videos() { // will reload videos that were not loaded properly after checking, but only checks existing db entries
  console.log('check_videos()');
  const check_videos_DOM = document.getElementById('check_videos'); // is null if not defined
  // const check_videos_button = document.getElementById('check_videos_button');
  console.log('check_videos_DOM',check_videos_DOM);
  // console.log('check_videos_button',check_videos_button);

  let tx = db.transaction('videos', 'readwrite');
  let videoStore = tx.objectStore('videos');

  let videos = await videoStore.getAll();

  var check_videos_loaded = true;
  var check_videos_results_div = "";
  for (VideoFile of VideoFiles) {
    let VideoFile_saved = false; // initially not known if it is saved in db
    if (videos.length) { // if no videos, then videos is not iterable
      for (video of videos) {
        if (video.file == VideoFile[1]) { // found the file in db
          if (video.blob.type == 'video/mp4') {
            VideoFile_saved = true; // file in db is good, continue with next file in VideoFiles
          }
        }
      }
    }
    if (!VideoFile_saved) {
      if (check_videos_results_div=="") { // if this is the first NG file, was initialized to "", is added to pre-existing heading
        check_videos_results_div = "<ul>"
      }
      check_videos_loaded = false; // mark at least one NG file
      console.log('check_videos(): video ' + VideoFile[0] + ' is not loaded properly');
      check_videos_results_div += `<li>video ${VideoFile[0]} not loaded</li>`;
      put_video(VideoFile[0],VideoFile[1],true); // true forces network reload
    }
  }
  if (check_videos_loaded) {
    check_videos_results_div = `<h3>All ${element_name} videos are loaded</h3>`;
    check_videos_DOM.style.display = "block";
    check_videos_DOM.style.background = "rgba(0,0,128,1.0)";
    // check_videos_button.style.display = "none";
  } else {
    check_videos_results_div += "</ul>";
    check_videos_DOM.style.display = "block";
    check_videos_DOM.style.background = "rgba(128,0,0,1.0)";
    // check_videos_button.style.display = "block";
  }
  document.getElementById('check_videos_results').innerHTML = check_videos_results_div;
}

window.addEventListener('unhandledrejection', function(event) {
  // the event object has two special properties:
  console.log('unhandled rejection, event.promise',event.promise); // [object Promise] - the promise that generated the error
  console.log('unhandled rejection, event.reason',event.reason); // Error: Whoops! - the unhandled error object
});

