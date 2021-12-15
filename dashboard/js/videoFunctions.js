var video_files = [];
var currentVideo = "";
var currentCaptionFile = "";
// var currentFile  = VideoFiles[0][1];
var CETA_Element = "";
const CETA_Element_first = "IntroToTraining"; // used by hopscotch

const play_pause = () => {
  const video_js = document.getElementById("videoPlayer");
  if (video_js != null) {
    if (video_js.paused) {
      video_js.play();
      btn_play.innerText = txtLbl.Pause;
      btn_play.style.backgroundColor = '#e60000';
      btn_play.style.borderColor = '#e60000';
    } else {
      video_js.pause();
      btn_play.innerText = txtLbl.Play;
      btn_play.style.backgroundColor = '#399d36';
      btn_play.style.borderColor = '#399d36';
    }
    // video_js.paused ? video_js.play() : video_js.pause();
  }
}

try { const time_display = document.getElementById('time_display'); } catch {} // currently next to progress bar

const progress_click = (click_event) => { // used by event listener
  const video_js = document.getElementById("videoPlayer");
  console.log('progress click event:',click_event);
  let currentTime = (click_event.clientX - progress_start) / progress_length * video_js.duration; // time in seconds
  currentTime = Math.min(currentTime, video_js.duration - 0.5); // make sure it isn't too large
  currentTime = Math.max(currentTime, 0); // make sure it is not negative
  console.log('progress time:',currentTime);
  video_js.currentTime = currentTime; // set
}

// async function videoGenerate(CETA_Card,file) { // file (e.g. './videos/TDW1.10_Final.mp4') is the argement for src in <video class="video-js"><source src=...></video>
async function videoGenerate(CETA_Card,CETA_Caption_File) {
  const default_color = '#6c757d';
  $('button.card-dropdown').removeClass("active").css('color',default_color).css('background-color','rgba(0,0,0,0)'); // remove active from all dropdown cards
  $(`button.card-dropdown[data-card="${CETA_Card}"]`).addClass("active").css('color','white').css('background-color','#0864cc'); // active card
  // Start

  // set_src(CETA_Card,file);
  const video_entry = await get_video(CETA_Card); // {name: CETA_Card, blob: videoRequest_blob, file: file}
  // document.getElementById("video").innerHTML =
  //   `<video class="video-js" style="${video_area_size}" onplay="PauseVideos('${CETA_Card}')" data-idx0="0" data-idx1="0" controls>
  //   <source src="${file}" type="video/mp4">
  //   Your browser does not support the video tag.
  //   </video>`
  if (video_entry.blob.type != 'video/mp4') {
    console.log(`********** ERROR, ${CETA_Card} video is not mp4`);
    document.getElementById("video").innerHTML = `<h1>${CETA_Card} video is not an mp4 file</h1><p>Try refreshing</p>`;
    return "Error"; // this error should be handled by videoGenerate
  }

  var video_file = video_files.find(video_file => video_file.CETA_Card==CETA_Card); // get the video file
  var quizzes = video_file.quizzes;
  const idxQ = quizzes.findIndex(quiz => quiz.questionType<100);

  const video_dom = `<video id='videoPlayer' class="video-js" style="${video_area_size}" onplay="PauseVideos('${CETA_Card}')" \
    data-idx0="0" data-idx1="0" data-idxQ="${idxQ}" data-idxQ0="${idxQ}" preload="auto">`;
  // const track_en = `<track id="track_ar" kind="captions" label="ARABIC"  srclang="ar" src="./captions/EPINTRO.02_6.1.21_ar.vtt">`;
  // const track_ar = `<track id="track_en" kind="captions" label="ENGLISH" srclang="en" src="./captions/EPINTRO.02_6.1.21.vtt">`;
  const track_dom = `<track id="track" kind="captions" label="ENGLISH" srclang="en" src="./captions/${CETA_Caption_File}">`;

  try {
    document.getElementById("video").innerHTML = video_dom +
    `<source src="${window.URL.createObjectURL(video_entry.blob)}" type="video/mp4">
      Your browser does not support the video tag.` + track_dom +
      `</video>` // free up memory: URL.revokeObjectURL(url)
  } catch (e) {
    document.getElementById("video").innerHTML = video_dom +
      `<source src="${video_file.file}" type="video/mp4">
      Your browser does not support the video tag.` + track_dom +
      `</video>` // free up memory: URL.revokeObjectURL(url)
  }

  // var video_js = document.querySelector(".video-js");
  var video_js = document.getElementById("videoPlayer");
  // $(".video-js").click( play_pause() ); // make sure the video is clickable
  video_js.addEventListener("click", play_pause); // just use function name

  // CAPTIONS BUTTON
  var track = document.getElementById("track");
  track.default = false;

  var btn_cc = document.getElementById('btn_cc');
  video_js.textTracks[0].mode = btn_cc.getAttribute('data-cc'); // need data-cc in btn_cc in index_sandbox.html
  btn_cc.addEventListener('click', () => {
    video_js.textTracks[0].mode = (video_js.textTracks[0].mode == "showing") ? "disabled" : "showing";
  });

  // QUIZ ICONS
  $('#progress_quiz_buttons').empty(); // get rid of old buttons
  // progress.replaceWith(progress.cloneNode(true)); // get rid of event listeners using a deep clone of itself // DOESN'T WORK

  // SHOW QUIZZES BELOW THE IFRAME
  const seconds_before_quiz = 2;
  let QT = create_FORM();
  let video_play = function() {
    video_js.play();
    // video_js.pause();
    setTimeout(function () {
      $('.modal').modal('hide');
    }, 100);
    setTimeout(function () {
      $('.modal').modal('hide');
    }, 500);
    setTimeout(function () {
      $('.modal').modal('hide');
    }, 900);
  }

  video_js.addEventListener('loadedmetadata', async () => { // duration is in metadata
    console.log('video_js loadedmetadata event listener');
    try {progress.removeEventListener('click', progress_click);} catch(e) {console.log('progress remove event listener error');}
    progress.addEventListener('click', progress_click);
    progress.value = 0; // set progress bar to 0
    video_js.volume = volume.value / 100; // need to reset the volume

    let pdb_all_rows;
    await pdb.info().then( info => {console.log('pdb info',info)});
    await pdb.allDocs( {include_docs:true, descending:true},
      (err,docs) => {
        pdb_all_rows = docs.rows;
        // docs.rows.forEach(row=>{console.log('pdb allDocs',row)});
      });
    await pdb.createIndex( {index: { fields: ['CETA_login','CETA_Card','time'] }} ).then( res => { console.log('pdb createIndex',res); } );
    console.log('pdb_all_rows',pdb_all_rows);
    const width = 20;
    // $('#progress').width(progress_length - width);

    quizzes.forEach(async (quiz,idx) => {
      if (typeof quiz.question !== "undefined") {
        let btn_quiz = document.createElement('BUTTON');
        btn_quiz.setAttribute("style",`position:absolute; top:${progress.style.top}; height:${progress.style.height}; padding: 0px; border: solid 1px; width: ${width}px;`);
        btn_quiz.style.left = progress_start + Math.round(( quiz.time / video_js.duration ) * progress_length) + "px";
        btn_quiz.setAttribute("id","time_" + quiz.time);

        btn_quiz.addEventListener('click', () => { // set the time of the video, and close any modals that show up
          console.log(`click btn_quiz ${idx}`);
          video_js.setAttribute("data-idxQ",idx); // update the quiz index
          video_js.currentTime=(quiz.time-seconds_before_quiz)*1;
          video_play();
        });
        let quiz_find = [];
        await pdb.find({
          selector: {
            CETA_login:{$eq: CETA_login},
            CETA_Card:{$eq: CETA_Card},
            time:{$eq: quiz.time},
          },
          fields: ['CETA_login','CETA_Card','time'],
        }).then( res => {
          console.log('pdb find > res',res);
          quiz_find = res.docs;
        });
        console.log('quiz_find',quiz_find);
        if (quiz_find.length > 0) { // at least one submission found in pdb
          btn_quiz.style.backgroundColor = 'blue'; // also set to blue during writeData() > put()
        }

        $('#progress_quiz_buttons').append(btn_quiz);

        if (flag_show_quiz_times && CETA_user[0]=='Y') { // set in main.js or main_local.js, changed by generateFiles.js
          let label = document.createElement("LABEL");
          let quiz_minutes = Math.floor(quiz.time/60);
          let quiz_seconds = quiz.time - 60*quiz_minutes;
          let quiz_seconds_display = `${quiz_seconds<10 ? '0' : ''}${quiz_seconds.toFixed(1)}`;
          let txt = document.createTextNode(`  ${quiz_minutes}:${quiz_seconds_display}  ${quiz.question}`);
          label.setAttribute('for',`radio_quiz_${idx}`);
          label.appendChild(txt);
          QT.appendChild(label);

          let radio = document.createElement("INPUT");
          radio.setAttribute('type','radio');
          radio.setAttribute('name',CETA_Card);
          radio.setAttribute('id',`radio_quiz_${idx}`);

          radio.addEventListener('click',function(){ // set the time of the video, and close any modals that show up
            console.log(`click ${idx}`);
            video_js.setAttribute("data-idxQ",idx); // update the quiz index
            video_js.currentTime=(quiz.time-seconds_before_quiz)*1;
            video_play();
          });
          QT.insertBefore(radio,label);

          let br = document.createElement("BR");
          QT.appendChild(br);
        } // if (flag_show_quiz_times)
      } // if (typeof quiz.question !== "undefined")
    }); // quizzes.forEach
  }); // video_js.addEventListner

  // videoDOM.one.src = window.URL.createObjectURL(video_entry.blob); // free up memory: URL.revokeObjectURL(url)
  currentVideo = CETA_Card;
  currentCaptionFile = CETA_Caption_File;
  // currentFile = file;
  // document.getElementById("CETA_Card_Display").innerText = video_file.cardTitle;
  // document.getElementById("ArrowControlCenterBtn").innerText = CETA_Card;
  // document.getElementById("BVModalLabel").innerText = `${CETA_Card}`;
  $('#collapseMenu').collapse('hide');
  // $('#CETA_navigator').collapse('hide');
  // $('#BVModal').modal();
  document.getElementById("CETA_Card_Display").innerText = video_file.cardTitle; // use card title

  setTimeout(function () {
    // $('#BVModal').modal('hide');
    PlayVideo(CETA_Card,false);
  }, 500); // reduced from 2500
}

function create_FORM() { // show quiz times below the video BUT THIS MAY BE CUTOFF USING RESPONSIVE CSS
  var QT;
  if (flag_show_quiz_times && CETA_user[0]=='Y') {
    try { document.getElementById('quiz_times').remove(); } catch {};
    QT = document.createElement('FORM');
    QT.setAttribute('id','quiz_times');
    QT.setAttribute('style','margin:20px; position:absolute; top:830px; ');
    document.body.appendChild(QT);
  }
  return QT;
}

let dropdown = document.getElementById("VideoSelectionDropdown");


function VideoDropdownGenerate(dropdownId="VideoSelectionDropdown") { // runs only once when the Element is loaded
  let dropdown_count = 0;
  CETA_Element = VideoFiles[0][0].split(".",1)[0]; // set global variable at this stage, may be already set in index_ELEMENT.html
  currentVideo = VideoFiles[0][0];
  currentCaptionFile = VideoFiles[0][2];
  let elementTitle = CETA_Element;
  if (CETA_Element == CETA_Element_first) {
    hopscotch.endTour(); // end previous tour
    hopscotch.startTour(cardTour);
  }
  get_all_static_cards();
  // create_FORM(); // for showing quiz times, if requested [NOT NEEDED, CALLED IN videoGenerate()]
  saveQuizzes(); // generate video_files which is an object with all of the quizzes

  for (let video_file of video_files) {
    let card_title;
    // if (video_file.CETA_Card.split('.')[0] == "Supervisor") {
      card_title = video_file.cardTitle;
    // } else {
    //   card_title = video_file.CETA_Card.split('.')[1]; // number only
    // }
    document.getElementById(dropdownId).innerHTML +=
      `<button id="dropdown_${dropdown_count++}" class="btn btn-outline-secondary card-dropdown" data-card="${video_file.CETA_Card}"
      data-captionFile="${video_file.captionFile}">${card_title}</button>`
      // `<button class="dropdown-item" type="button" onclick="videoGenerate('${video_file.CETA_Card}','${video_file.file}')">
      // ${video_file.CETA_Card}</button>`
    if (video_file.elementTitle != CETA_Element) {
      elementTitle = video_file.elementTitle;
    }
  }

  for (let j=0; j<dropdown_count; j++) {
    document.querySelector("#dropdown_" + j)
    .addEventListener("click", e => {
      // $("button.card-dropdown").removeClass("active").css('color',default_color).css('background-color','rgba(0,0,0,0)'); // remove active from all dropdown cards
      // $(e.target).addClass("active").css('color','white').css('background-color','darkgreen'); // active card
      videoGenerate($(e.target).attr("data-card"),$(e.target).attr("data-captionFile")); // generate the video using the card and caption file
    })
  }

  document.getElementById("CETA_Card_Display").innerText = elementTitle;
  document.getElementById("sendQuizResults").innerHTML +=
      `<button class="btn btn-warning" onclick="sync_pdb()">${txtLbl.Send_quiz_results}</button>`

  // NEXT AND PREVIOUS CONTROLS
  var btn_next = document.getElementById('btn_next');
  var btn_play = document.getElementById('btn_play');
  var btn_prev = document.getElementById('btn_prev');

  btn_next.addEventListener('click', () => {
      NextVideoControl();
  });
  btn_play.addEventListener('click', () => {
      play_pause();
  });
  btn_prev.addEventListener('click', () => {
      PrevVideoControl();
  });

  // VOLUME
  var volume = document.getElementById('volume');
  volume.oninput = function() { // need to use function
    const video_js = document.getElementById('videoPlayer'); // not set at the beginning
    try { video_js.volume = this.value / 100; } catch(e) {} // at the beginning, is not set, value goes up to 100 but volume only to 1.0
  }

  // START WITH FIRST CARD
  videoGenerate(video_files[0].CETA_Card,video_files[0].captionFile);

  // CLICK HERE HELP (replace by hopscoth)
  // let help_div = document.createElement('DIV');
  // help_div.setAttribute("id","help_div");
  // help_div.setAttribute("style","position:absolute; left: 400px; top: 300px; padding: 0px; height: 34px; z-index:1000; ");
  // help_div.innerHTML = "<h3>Click here to begin video</h3>";
  // help_div.addEventListener('click', () => {
  //   hopscotch.endTour();
  //   play_pause();
  //   $('#help_div').remove();
  // });
  // document.getElementById('video_container').appendChild(help_div);
}

function get_all_static_cards() {
  console.log(VideoFiles);
  console.log('Element',CETA_Element);
  var last_Card = '';
  for (let row of All_Excel_rows) {
    try {
      const CETA_Card = row.CETA_Card;
      if (CETA_Card!=last_Card && typeof VideoFiles.find(vf => vf[0]==CETA_Card) == "undefined") { // only if this is a new card
        var VideoFileStatic = [];
        Element_row = CETA_Card.match(/.*\./)[0].slice(0,-1);
        if (Element_row == CETA_Element) {
          if (row && row.questionType>=100) { // if the row matches the Element and questionType, which the Type
            if (row.Type=="WhiteBoard" || row.Type=="Pause") {
              // VideoFiles.push([CETA_Card, "./videos/common_videos/DrS_Whiteboard_3sec.mp4"]);
              VideoFiles.push([CETA_Card, "./videos/common_videos/" + video_3sec + ".mp4",""]);
              last_Card = CETA_Card;
              continue;
            } else if (row.Type.slice(0,8)=='RolePlay') {
              // VideoFiles.push([CETA_Card, './videos/common_videos/TEMPLATE_Role_Play_Instructions.mp4']);
              VideoFiles.push([CETA_Card, "./videos/common_videos/" + video_role_play + ".mp4",""]);
              last_Card = CETA_Card;
              continue;
            }
          }
        }
      }
    } catch {
    }
  }
  VideoFiles.sort((VideoFileA,VideoFileB) => {
    const A = VideoFileA[0].toLowerCase();
    const B = VideoFileB[0].toLowerCase();
    if (A == `${B} intro`) {
      return -1;
    } else if (B == `${A} intro`) {
      return 1;
    } else if (A<B) {
      return -1;
    } else if (B<A) {
      return 1;
    } else {
      return 0;
    }
  })
  console.log(VideoFiles);
}

// PauseVideos() > store whiteboards in dom_whiteboards[] > append and remove from DOM
function PauseVideos(CETA_Card) {
  const video_js = document.querySelector(".video-js"); // class video-js is set in videoGenerate()
  const video_js_window_width = video_js.clientWidth;
  const video_js_window_height = video_js.clientHeight;
  const video_js_original_width = video_js.videoWidth;
  const video_js_original_height = video_js.videoHeight;
  const video_js_aspect_ratio = video_js_original_width / video_js_original_height;
  // initialize
  let video_js_magnification = Math.min(
    video_js_window_width  / video_js_original_width,
    video_js_window_height / video_js_original_height
  ); // max resizing of the video
  // EXAMPLES original: 20 x 10
  //            window: 30 x 20  video: 30 x 15  window width > original, resize height > window, magnfification = 1.5
  //                    30 x  5         10 x  5                                         <                          0.5
  //                    10 x 20         10 x  5  window width < original, resize height > window                   0.5
  //                    10 x  2          4 x  2                                         <                          0.2
  let video_js_width  = video_js_original_width  * video_js_magnification;
  let video_js_height = video_js_original_height * video_js_magnification;
  const video_js_left_padding = (video_js_window_width  - video_js_width) / 2;
  const video_js_top_padding  = (video_js_window_height - video_js_height) / 2;

  const dom_time_delay = 0; // delay of playhead updating to prevent whiteboard changes too soon (0.5 is too much)

  video_js.onended = function () {
    video_js.setAttribute('data-idx0',"0");
    video_js.setAttribute('data-idx1',"0");
    video_js.setAttribute('data-idxQ',video_js.getAttribute('data-idxQ0')); // reset the original values of idxQ
    document.getElementById("AVModalLabel").innerHTML = `End of Video: ${CETA_Card}`;
    $('#AVModal').modal();
    setTimeout(function () {
      $('#AVModal').modal('hide');
      $('#collapseMenu').collapse('show');
      $('#btn_play').text(txtLbl.Play);
    }, 2500);
  }

  var quizzes = video_files.find(video_file => video_file.CETA_Card==CETA_Card).quizzes;

  video_js.addEventListener("timeupdate", () => {
    var time = video_js.currentTime;
    // PROGRESS, TIME
    // var progress = document.getElementById('progress'); // progress is a global
    progress.value = Math.round((video_js.currentTime / video_js.duration) * 100);
    // try { time_display.innerHTML = '<p>' + time.toFixed(1) + '</p>'} catch {}
    try { time_display.innerText = time.toFixed(0) } catch {}
  });

  if (quizzes.length>0) {

    quizzes.sort((quiz_a,quiz_b) => quiz_a.time-quiz_b.time); // (() => statement) is the same as (function() {return statement}), negative=>unchanged

    // if (quizzes[quizzes.length - 1].end_time == 0) { // make sure this is not 0
    //   quizzes[quizzes.length - 1].end_time = Infinity;
    // }

    for (let i=0; i<quizzes.length; i++) { // set end times if necessary
      if (isNaN(quizzes[i].end_time) || quizzes[i].end_time==0) { // if the end time was missing
        if (i<quizzes.length-1) {
          quizzes[i].end_time = quizzes[i+1].time; // use the start time of the next whiteboard
        } else { // for the last whiteboard
          quizzes[i].end_time = Infinity; // use infinity for last end time if improperly set
        }
      }
    }

    // WHITEBOARD
    var dom_whiteboards = [];
    var dom_children = [];

    function create_WB(id) {
      var WB = document.createElement("DIV");
      WB.style.position = "absolute";
      WB.style.color = "black";
      WB.style.fontSize = 'max(13px,0.75rem)'; // change from 13pt
      WB.style.fontWeight = 300; // lighter is 100, too light, normal is 400 may be too heavy
      WB.style.lineHeight = "normal";
      if (font_family=='Sofia') { // font_family is set in index_sandbox.html
        WB.style.fontFamily = "'Sofia Pro', sans-serif";
      }
      WB.style.maxWidth = video_js_width * 22/100 + "px"; // ***** this may result in grey background on some images // increase from 20
      WB.style.maxHeight = video_js_height * 50/100 + "px";
      WB.style.top = video_js_height * 40/100 + "px"; // reduce from 45
      WB.style.overflow = 'auto';
      WB.id = id;
      return WB;
    }

    var WBL = create_WB('WB_L');
    WBL.style.left = video_js_left_padding + video_js_width * 22.5/100 + "px";

    var WBC = create_WB('WB_C'); // WBC.id = 'WB_C'
    WBC.style.left = video_js_left_padding + video_js_width * 48/100 + "px";

    var WBR = create_WB('WB_R');
    WBR.style.left = video_js_left_padding + video_js_width * 73.7/100 + "px";

    const style_maxWidth = 360 * video_js_magnification;
    const style_maxHeight = 250 * video_js_magnification;

    const style_maxWidth_0 = 750 * video_js_magnification;
    const style_maxHeight_0 = 450 * video_js_magnification;
    const style_top_0 = video_js_top_padding + video_js_height * 20/100;
    const style_left_0 = video_js_left_padding + video_js_width * 32/100;

    for (quiz of quizzes) {
      var dom_whiteboard;
      if (quiz.Type=="WhiteBoard") {
        dom_whiteboard = create_WB('whiteboard_0');
        // dom_whiteboard.style.fontSize = "small";
        dom_whiteboard.style.maxWidth = style_maxWidth_0 + "px";   // ***** this may result in grey background on some images
        dom_whiteboard.style.maxHeight = style_maxHeight_0 + "px";
        dom_whiteboard.style.top = style_top_0 + "px";
        dom_whiteboard.style.left = style_left_0 + "px";
        dom_whiteboard.style.width = video_js_width + "px";
        dom_whiteboard.innerHTML = quiz.DisplayHTML;

      } else if (quiz.Type=="WhiteBoardInsert") { // special type of insert with quiz.X_Position and quiz.Y_Position
        dom_whiteboard = create_WB('whiteboard_0'); // sometimes more than one whiteboard_0
        // dom_whiteboard.style.fontSize = "small";
        dom_whiteboard.style.maxWidth = style_maxWidth_0 + "px";
        dom_whiteboard.style.maxHeight = style_maxHeight_0 + "px";
        dom_whiteboard.style.top = video_js_top_padding + video_js_height * quiz.Y_Position / 100 + "px";
        dom_whiteboard.style.left = video_js_left_padding + video_js_width * quiz.X_Position / 100 + 20 + "px";
        if (typeof quiz.Width != "undefined") {
          const q_width = video_js_width * quiz.Width / 100;
          dom_whiteboard.style.width = q_width + "px";
          if (q_width > style_maxWidth) {
            dom_whiteboard.style.maxWidth = dom_whiteboard.style.width;
          }
        }
        dom_whiteboard.innerHTML = quiz.DisplayHTML;

      } else if (quiz.Type == 'RolePlayL') {
        if (!dom_whiteboards.map(x => x.dom.id).includes('WB_L')) {
          dom_whiteboard = WBL;
        }
        dom_whiteboard.innerHTML += quiz.DisplayHTML;

      } else if (quiz.Type == 'RolePlayC') {
        if (!dom_whiteboards.map(x => x.dom.id).includes('WB_C')) {
          dom_whiteboard = WBC; // dom_whiteboard.id = 'WB_C' and later dom_whiteboards[#].dom.id = 'WB_C'
        }
        dom_whiteboard.innerHTML += quiz.DisplayHTML;

      } else if (quiz.Type == 'RolePlayR') {
        if (!dom_whiteboards.map(x => x.dom.id).includes('WB_R')) {
          dom_whiteboard = WBR;
        }
        dom_whiteboard.innerHTML += quiz.DisplayHTML;

      } else if (quiz.Type == "Pause") {
        if (dom_whiteboards.length == 0 || ( // if no other WB or does not include either WB_C or whiteboard_0
          !dom_whiteboards.map(x => (typeof x.dom.id == "undefined") ? "" : x.dom.id).includes('WB_C') &&
          !dom_whiteboards.map(x => (typeof x.dom.id == "undefined") ? "" : x.dom.id).includes('whiteboard_0'))) {
          dom_whiteboard = create_WB("whiteboard_0"); // create whiteboard_0
          // dom_whiteboard.style.fontSize = "small";
          dom_whiteboard.style.maxWidth = style_maxWidth_0 + "px"; // ***** this may result in grey background on some images
          dom_whiteboard.style.maxHeight = style_maxHeight_0 + "px";
          dom_whiteboard.style.top = style_top_0 + "px";
          dom_whiteboard.style.left = style_left_0 + "px";
          // dom_whiteboard.style.top = video_js_top_padding + video_js_height * 25 / 100 + "px";
          // dom_whiteboard.style.left = video_js_left_padding + video_js_width * 35 / 100 + "px";
          dom_whiteboard.style.width = video_js_width + "px";
          dom_whiteboard.innerHTML = quiz.DisplayHTML;
        } else if ( // if includes WB_C but not WB_R
           dom_whiteboards.map(x => (typeof x.dom.id == "undefined") ? "" : x.dom.id).includes('WB_C') &&
          !dom_whiteboards.map(x => (typeof x.dom.id == "undefined") ? "" : x.dom.id).includes('WB_R')) {
          dom_whiteboard = WBR; // WB_R
          dom_whiteboard.innerHTML += quiz.DisplayHTML;
        }
        const dom_continue_button = document.createElement("BUTTON");
        dom_continue_button.innerHTML = txtLbl.Continue;
        dom_continue_button.class = "badge badge-pill";
        dom_continue_button.id = "continue_button";
        dom_continue_button
          .addEventListener("click", event => {
            video_js.play();
          })

        dom_whiteboard.appendChild(dom_continue_button);
        if (quiz.nFacilitator > 0 && (CETA_user[0]=='Y' || CETA_user['Y'])) {
          let dom_facilitator_button = document.createElement("BUTTON");
          dom_facilitator_button.innerHTML = 'Trainer';
          dom_facilitator_button.style.marginLeft = "5px";
          dom_facilitator_button.class = "badge badge-pill";
          const q = quiz; // can't use quiz in event listener because quiz gets updated
          // dom_facilitator_button.id = "trainer_button";
          dom_facilitator_button
            .addEventListener("click", event => {
            facilitatorGenerate(q);
          })
          dom_whiteboard.appendChild(dom_facilitator_button);
        }
      }

      // QUIZZES ALSO INCLUDED, BUT HAVE UNDEFINED dom_whiteboard
      dom_whiteboards.push({
        "time": quiz.time,
        "end_time": quiz.end_time,
        "dom": dom_whiteboard,
        "Type": quiz.Type,
        "quiz": quiz,
        // "X": quiz.X_Position,
        // "Y": quiz.Y_Position,
        // "ChildWidth": quiz.Width
      });
    }

    for (i=0; i<dom_whiteboards.length; i++) {
      // var XPosition = dom_whiteboards[i].X;
      // var YPosition = dom_whiteboards[i].Y;
      // if (dom_whiteboards[i].ChildWidth != null) {
      //   var ChildWidth = dom_whiteboards[i].ChildWidth;
      //   dom_whiteboards[i].dom.style.width = video_js_height * ChildWidth / 100 + "px";
      //   dom_whiteboards[i].dom.style.maxWidth  = "";   // ***** this may result in grey background on some images
      //   dom_whiteboards[i].dom.style.maxHeight = "";
      // }
      // dom_whiteboards[i].dom.style.left = video_js_width * XPosition/100 + 20 + "px";
      // dom_whiteboards[i].dom.style.top  = video_js_height * YPosition/100 + "px";
      // dom_whiteboards[i].dom.id = "whiteboard_" + i;
      dom_children.push(dom_whiteboards[i].dom);
    }

    // QUIZZES AND WHITEBOARDS ARE GENERATED AT THEIR ASSIGNED TIMES
    // typical case:
    //   quizzes[PauseIdx0-1].time < time < quizzes[PauseIdx0].time
    //   quizzes[PauseIdx1-1].endtime < time < quizzes[PauseIdx1].endtime
    //   time < quizzes[PauseIdxQ].time
    //   PauseIdx1 = PauseIdx0 - 1

    video_js.addEventListener("timeupdate", () => {
      var video_dom = document.querySelector("#video"); // not sure why "this" doesn't work
      // console.log('video_dom',video_dom);
      // console.log('video_js',video_js);
      // console.log('dom_children',dom_children);
      // console.log(this.currentTime);
      // console.log(PauseIdx);
      var time = video_js.currentTime;
      var PauseIdx0 = parseInt(video_js.getAttribute("data-idx0")); // data-idx0,1 were initialized to 0
      var PauseIdx1 = parseInt(video_js.getAttribute("data-idx1")); // idx0 satisfies quizzes[idx0-1].time < time <quizzes[idx0].time before update
      var PauseIdxQ = parseInt(video_js.getAttribute("data-idxQ")); // idxQ is similar to idx0 but is restricted to quizzes

      // CHECK IF time IS GREATER THAN quizzes[PauseIdx0].time
      // IF THIS IS A QUIZ: CHECK IF IT IS PAST THE TIME, AND IF SO GENERATE IT AND GET THE NEXT QUIZ
      if (PauseIdxQ != -1 && time>quizzes[PauseIdxQ].time) { // passed the last quiz marker by ordinary playing or skip ahead
        // let PauseIdxQNext = quizzes.findIndex(quiz => (quiz.questionType<100 && time<=quiz.time)); // look for the next quiz
        // FIND THE NEXT QUIZ: quizzes[PauseIdxQ].time < time <= quizzes[PauseIdxQNext].time
        let PauseIdxQNext = quizzes.findIndex((quiz,idx) => (quiz.questionType<100 && idx>PauseIdxQ));
        // let PauseIdxQLast;
        // if (PauseIdxQNext==-1) { // quizzes[PauseIdxQ] is the last quiz
        //   PauseIdxQLast = PauseIdxQ;
        // } else {
        //   PauseIdxQLast = PauseIdxQNext - 1; // get the quiz right before the next quiz
        // }
        // quizGenerate(quizzes[PauseIdxQLast],video_js,PauseIdxQLast); // quiz.js
        console.log('quizGenerate: idx, quizzes[idx]',PauseIdxQ,quizzes[PauseIdxQ]);
        quizGenerate(quizzes[PauseIdxQ],video_js,PauseIdxQ); // quiz.js
        video_js.setAttribute("data-idxQ",PauseIdxQNext); // this will set PauseIdxQ in the next time step
      }

      // IF THIS IS A WHITEBOARD OR PAUSE
      // typical case:
      //   if time > quizzes[PauseIdx0].time || time > quizzes[PauseIdx1].endtime
      //
      if ((PauseIdx0 != -1 && time>quizzes[PauseIdx0].time     && quizzes[PauseIdx0].questionType>=100) || // needed to turn on whiteboards
          (PauseIdx1 != -1 && time>quizzes[PauseIdx1].end_time && quizzes[PauseIdx1].questionType>=100)) { // needed to turn off the last whiteboard
        // console.log('  current time: ' + kdp.evaluate('{video.player.currentTime}'));
        for (i=0; i<dom_whiteboards.length; i++) { // REMOVE ALL WHITEBOARDS
          var wb_i = video_dom.querySelector("div#whiteboard_" + i); // don't use getElementById
          try {
            video_dom.removeChild(wb_i);
          } catch {
            // console.log('wb_i not found for i = ' + i);
          }
        };
        for (let i=0; i<dom_whiteboards.length; i++) {  // add the white board with active time to endtime interval
          var wb_i = video_dom.querySelector("div#whiteboard_" + i); // don't use getElementById
          // console.log('wb_i', wb_i);
          if (time > dom_whiteboards[i].time + dom_time_delay && time < dom_whiteboards[i].end_time + dom_time_delay) {
            if (wb_i == null) {
              if (dom_whiteboards[i].Type == "Pause") {
                video_js.pause();
                // facilitatorGenerate(dom_whiteboards[i].quiz); // use the quiz stored here
              }
              video_dom.appendChild(dom_whiteboards[i].dom); // watch out for variable i
            }
          } else {
            if (wb_i != null) { // remove just in case there is still a white board present [NOT NECESSARY?]
              video_dom.removeChild(wb_i);
            }
          }
        }
      }
      // // INITIAL TIMES
      // if (time > quizzes[quizzes.length - 1].time) { // if time > time of last quiz, Idx0 = -1
      //   PauseIdx0 = -1;
      // } else if (time <= quizzes[0].time) { // if time <= time of first quiz, Idx0 = 0
      //   PauseIdx0 = 0;
      // } else {
      //   for (var i = 0; i < quizzes.length - 1; i++) { // quiz[Idx0-1].time < time <= quiz[Idx0].time
      //     if (time > quizzes[i].time && time <= quizzes[i + 1].time) {
      //       PauseIdx0 = i + 1;
      //       break;
      //     }
      //   }
      // }
      // // INITIAL END TIMES
      // if (time > quizzes[quizzes.length - 1].end_time) {
      //   PauseIdx1 = -1;
      // } else if (time <= quizzes[0].end_time) {
      //   PauseIdx1 = 0;
      // } else {
      //   for (var i = 0; i < quizzes.length - 1; i++) {
      //     if (time > quizzes[i].end_time && time <= quizzes[i + 1].end_time) {
      //       PauseIdx1 = i + 1;
      //       break;
      //     }
      //   }
      // }
      // UPDATE INDICES
      video_js.setAttribute("data-idx0",set_Idx(time,quizzes,"time"));     // 0 if before first, -1 if after last, 1 if between 1st and 2nd
      video_js.setAttribute("data-idx1",set_Idx(time,quizzes,"end_time")); // use end time instead of initial time
    }); // event listener
  } // if at least one quiz or whiteboard
} // function


function set_Idx(time,quizzes,time_type) {
  // time_type = "time" for INITIAL TIMES
  //           = "end_time" for END TIMES
  var PauseIdx;
  if (time > quizzes[quizzes.length - 1][time_type]) { // if time > time of last quiz, Idx0 = -1
    PauseIdx = -1;
  } else if (time <= quizzes[0][time_type]) { // if time <= time of first quiz, Idx0 = 0
    PauseIdx = 0;
  } else {
    for (let i = 0; i < quizzes.length - 1; i++) { // quiz[Idx0-1].time < time <= quiz[Idx0].time
      if (time > quizzes[i][time_type] && time <= quizzes[i + 1][time_type]) {
        PauseIdx = i + 1;
        break;
      }
    }
  }
  return PauseIdx;
}


function PlayVideo(CETA_Card,play=true) {
  try {$('.ui-dialog-content').dialog('destroy');} catch {console.log('no ui-dialog');}
  // $('.ui-dialog').dialog('destroy'); // doesn't work, not initialized
  $('#dialogB').remove();
  if (play) {
    var video_js = document.querySelector(".video-js");
    if (video_js.currentTime < video_js.duration) {
      video_js.play();
    } else { // needed if the quiz is at the end of the video
      video_js.pause();
      $('#btn_play').text(txtLbl.Play);
    }
  }
}

function SelectVideoControl() {
    videoGenerate(currentVideo,currentCaptionFile);
}

function NextVideoControl() {
  for (var i=0; i < VideoFiles.length; i++) {
    if (currentVideo == VideoFiles[i][0] || currentVideo == "") { // found the index i
      if (i < VideoFiles.length - 1) { // not at end
        currentVideo = VideoFiles[i + 1][0]; // get the next video
        currentCaptionFile = VideoFiles[i + 1][2]; // get the next video
        videoGenerate(currentVideo,currentCaptionFile);
        // document.getElementById("ArrowControlCenterBtn").innerText = VideoFiles[i + 1][0];
        document.getElementById('btn_prev').disabled = false; // previous video exists
        break
      } else {
        // document.getElementById("ArrowControlCenterBtn").innerText = VideoFiles[i][0]; // i = VideoFiles.length-1
        document.getElementById('btn_next').disabled = true; // at the end so stop
      }
    }
  }
}

function PrevVideoControl() {
  for (var i=0; i < VideoFiles.length; i++) {
    if (currentVideo == VideoFiles[i][0] || currentVideo == "") { // found the index i
      if (i > 0) { // if not at beginning
        currentVideo = VideoFiles[i - 1][0]; // get the previous video
        currentCaptionFile = VideoFiles[i - 1][2]; // get the previous video
        videoGenerate(currentVideo,currentCaptionFile);
        // document.getElementById("ArrowControlCenterBtn").innerText = VideoFiles[i - 1][0];
        document.getElementById('btn_next').disabled = false; // next video exists
        break
      } else {
        // document.getElementById("ArrowControlCenterBtn").innerText = VideoFiles[i][0]; // i=0
        document.getElementById('btn_prev').disabled = true; // at the beginning so stop
      }
    }
  }
}
