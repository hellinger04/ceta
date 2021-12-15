function OnDrag(event){
  event
    .dataTransfer
    .setData('text/plain', event.target.id);

  event
    .currentTarget
    .style
    .backgroundColor = 'yellow'
    .color = '#255962';
}

function OnDragEnd(event,q) {
  const draggableDiv = event.path[0];
  const destinationDiv = event.path[1];
  // console.log('OnDragEnd > draggableDiv,destinationDiv',draggableDiv,destinationDiv);
  // SET THE COLOR
  if (destinationDiv.id && destinationDiv.id=='divZoneA') {
    draggableDiv.style.backgroundColor = '#02BFC4'; // if returning to div zone A, then reset the color
  } else {
    const match = draggableDiv.getAttribute("data-match"); // draggable div correct bucket destination
    const correct = destinationDiv.getAttribute("data-correct"); // destination div bucket identifier
    if (match==correct || q.questionType==13 || q.questionType==21 || q.questionType==22) { // 13-Matching, 21-Card sort
      event.currentTarget.style.backgroundColor = '#255962'; // changed from white
    } else {
      event.currentTarget.style.backgroundColor = 'red';
    }
    console.log('OnDragEnd: event',event);
  }
  if (q.questionType==21 || q.questionType==22) {
    // GET ALL DRAGGABLES AND SET THE MARGINS ACCORDING TO ZONE
    let draggablesAll = Array.from(document.getElementsByClassName('example-draggable'));
    draggablesAll.forEach((dragAll) => {
      dragAll.style.margin = (dragAll.parentElement.id == 'divZoneA') ? "0.4rem" : "0px";
    });
    // LOOK FOR DRAGGABLES IN ZONE A WITH SAME TEXT
    let draggablesSame = draggablesAll.filter((draggable) => {
      return (draggable.parentElement.id == 'divZoneA' && draggable.innerText == draggableDiv.innerText);
    });
    if (q.questionType!=22) {
      // IF ONE OR MORE, SET FIRST ONE TO BLOCK, OTHERS TO NONE
      if (draggablesSame.length>0) {
        draggablesSame.forEach((dragSame,idx) => {
          if (idx==0) {
            dragSame.style.display = 'block'; // there should only be one, all carry the answers in "data-matchess"
          } else {
            dragSame.style.display = 'none';
          }
        })
      // IF NONE, CREATE A NEW ONE, WITH SAME data-matches, BLANK data-match
      } else {
        var divItem = document.createElement("DIV");
        divItem.id = 'draggable-' + (draggablesAll.length + document.getElementsByClassName('draggable').length); // unique identifier
        divItem.innerText = draggableDiv.innerText; // same as the one that was moved
        divItem.className = "example-draggable";
        divItem.draggable = true;
        divItem.setAttribute("data-match","none"); // placeholder
        divItem.setAttribute("data-matches",draggableDiv.getAttribute("data-matches")); // make sure we keep the same data-matches
        divItem.addEventListener("dragstart", event => {OnDrag(event)});
        divItem.addEventListener("dragend", event => {OnDragEnd(event,q)});
        document.getElementById('divZoneA').appendChild(divItem);
      }      
    }
    // CANNOT HAVE MORE THAN ONE VISIBLE DRAGGABLE IN A DIV ZONE
    const destinationDraggables = Array.from(destinationDiv.children).filter(div => 
        (div.style.display != 'none' && div.className.endsWith('draggable'))); // visible draggables in the drop zone
    // IF A DRAGGABLE ALREADY EXISTS, SET THE DRAGGABLE DISPLAY TO NONE AND CLASS TO draggable
    if (destinationDiv.id != 'divZoneA' && destinationDraggables.length > 1) { // cannot have more than one (draggableDiv is counted)
      // draggableDiv.className = 'draggable'; // need to use this name for the divItem.id counter
      // draggableDiv.style.display = 'none';
      // draggableDiv.innerText = '(should be invisible)';
      destinationDraggables.forEach(drag => {
        drag.style.marginTop = '0.2rem';
        drag.style.marginBottom = '0.2rem';
      })
    }
  }
}

function SortElements() {
}


function onDragOver(event) {
  event.preventDefault();
}

function onDrop(event,q) {
  const id = event
    .dataTransfer
    .getData('text');
  let last_element = true; // default is the last element
  const draggableElement = document.getElementById(id);
  const dropzone = event.currentTarget; // in general, there can be multiple dropzones
  console.log('onDrop: dropzone',dropzone);
  // const dropzone = event.target; // this sometimes is a draggable that is already in the dropzone
  if (q.questionType==12) { // order
    const draggables = dropzone.getElementsByClassName('example-draggable'); // all draggables in the dropzone
    if (draggables.length>0) { // if at least one
      let positions = [];
      for (let i=0; i<draggables.length; i++) {
        draggableElement.className = 'example-draggable';
        if (draggableElement!==draggables[i]) {
          positions.push({
            idx: i,
            position_relative: draggables[i].offsetTop - event.layerY,
          });
        }
      }      
      positions.sort((p1,p2) => {return p1.position_relative-p2.position_relative;}); // ascending order (going down the dropzone)
      const position = positions.find(position => {return position.position_relative>0;});
      if (typeof position != "undefined") { // if at least one below draggableElement
        draggables[position.idx].insertAdjacentElement("beforebegin",draggableElement);
        last_element = false;
      }
    }
  }
  if (last_element) {
    console.log('onDrop: dropzone',dropzone);
    console.log('onDrop: draggableElement',draggableElement);
    dropzone.appendChild(draggableElement);
  }
  event
    .dataTransfer
    .clearData();
}

function GenerateDragAndDrop(q,shuffle=true) { // added shuffle option (May 10, 2021)
  // INITIALIZE
  const items = q.items;
  if (q.questionType==12) {
    // q.buckets = ['List in order'];
    q.buckets = [txtLbl.List_in_order];
  }
  const buckets = q.buckets;
  q.correctAnswers = [];
  var items_shuffled = [];

  // RESULTS CONTAINER
  const submitButton = document.createElement('button');
  submitButton.setAttribute('style',"display:inline-block");
  submitButton.addEventListener("click",event => {showResults()});
  // submitButton.innerHTML = "Show our results";
  submitButton.innerHTML = txtLbl.Click_here_for_next_step;
  submitButton.id = "submitButton";
  // submitButton.title = "Click here after you finished.";
  // $('#submitButton').tooltip('toggle');
  const resultsText = document.createElement('span');
  resultsText.id = 'resultsText';
  resultsText.innerText = '';
  const resultsContainer = document.getElementById('DragAndDropModalFooterResults');
  resultsContainer.innerHTML = "";
  if (q.questionType==12 || q.questionType==13 || q.questionType==21 || q.questionType==22) { // 12-order, 13-matching, 21-card sort, 22-cs simple
    resultsContainer.appendChild(submitButton);
    // submitButton.setAttribute("style","display:block"); // block-inline will block some of the quiz questions
    // submitButton.addEventListener('click', showResults);
  } else if (q.questionType==11) { // 11-drag and drop
    resultsContainer.appendChild(returnButton); // no grading
  }
  resultsContainer.appendChild(resultsText);
  if (q.nFacilitator > 0 && (CETA_user[0]=='Y' || CETA_user[1]=='Y')) { // COPIED FROM videoFunctions.js
    let dom_facilitator_button = document.createElement("BUTTON");
    dom_facilitator_button.innerHTML = txtLbl.Trainer;
    dom_facilitator_button.class = "badge badge-pill";
    // dom_facilitator_button.id = "trainer_button";
    dom_facilitator_button
      .addEventListener("click", event => {
      facilitatorGenerate(q); // USE q INSTEAD OF quiz
    })
    resultsContainer.appendChild(dom_facilitator_button);    
  }
  // HEADER
  const modalTitle = document.getElementById('DragAndDropModalLabel');
  modalTitle.style.width = "90%";
  modalTitle.innerText = txtLbl.Drag_and_drop_quiz + '\xa0\xa0\xa0\xa0';
  $('#DragAndDropModalHeader').css('width','90%').css('padding','0px');
  $('#DragAndDropModalContent').css('padding','1rem');
  $('#DragAndDropModalBody').css('padding','0px').css('padding-top','0.5rem');

  // DIALOG
  const dialogQ = document.createElement('DIV');
  dialogQ.id = 'dialogQ';
  dialogQ.title = txtLbl.Drag_and_drop_quiz;
  // const dialogQ_question = q.question +
  const dialogQ_question = 
        '<div id="dialogA">' +
        '<textarea id="dialogI" class="dialogI" type="text" value="" style="display:none" rows="3" cols="70"></textarea>' +
        '<div id="dialogInotes"></div>' +
        '</div>';
        // '<div id="dialogA"><textarea id="dialogI" class="dialogI" type="text" value="" style="border:white; height:1px" rows="3" cols="70"></textarea></div>';
        // '<div id="dialogA" style="height:1px; width:90%"><input id="dialogI" type="text" value="Hello"></div>';
  dialogQ.innerHTML = dialogQ_question;
  resultsContainer.appendChild(dialogQ);

  // BUTTON FOR SHOWING THE DIALOG
  const dialogB  = document.createElement('button');
  dialogB.addEventListener("click",event => {displayDialogQ()}); // need anonymous function or it will pass arguments from event listener
  dialogB.innerHTML = txtLbl.Submit_your_explanation;
  dialogB.id  = "dialogB";
  dialogB.style.display  = "none"; // turn off button in modal
  modalTitle.appendChild(dialogB);

  $('#dialogQ').dialog({
    autoOpen: false,
  }); // needed to initialize the dialog

  // $('#dialogQ').dialog('open');
  const dialogQwidth = $(window).width*0.5;
  const dialogQheight = $(window).height*0.5;
  $('#dialogQ').dialog({
    position: ['leftc','bottom'],
    minWidth: dialogQwidth, // 800
    minHeight: dialogQheight, // 500
    width: (q.Width && q.Width>0) ? q.Width : dialogQwidth, // 400
    beforeClose: function() {dialogB.style.display = "inline-block";}, // show button in modal before closing
  }); // after initialization

  // displayDialogQ();

  function displayDialogQ(inputText=false,writeDataResponse={}) {
    $('#dialogQ').dialog('open');
    // $('#dialogQ').dialog('moveToTop'); // probably only in relation to other dialogs
    // $('#dialogQ').css('z-index',9999); // Doesn't work, cannot access this DOM element
    $('.ui-dialog').css({'z-index':'9990','top':'4rem','width':'75%'}); // top 50px, width 800px
    dialogB.style.display = "none"; // turn off button in modal
    if (inputText) {
      // $('#dialogQ').html(q.question + 
      //   '<div id="dialogA" style="display:inline-block"><input id="dialogI" type="text" value="Hello"></div>');
      // dialogA.style.display = "inline-block";     
      $('#dialogA').prepend(`<h5>${txtLbl.Tell_us_why_did_you_choose_these_cards}</h5>`); // see dialogQ_question
      $('#dialogI').attr('style','display: block; border:black solid 1px; height:auto;');
      $('#dialogI').attr('rows','4');
      $('.dialogI').focus();
      $('#dialogQ').dialog({
        buttons: [{
          text: txtLbl.Submit_your_explanation,
          style: "display:inline-block",
          // 'data-dismiss': "modal",
          // 'aria-label': "Close",
          click: function () {
            const dialogI = $("#dialogI").val();
            if (dialogI=="") {
              dialogInotes.innerHTML = `<p>${txtLbl.Please_enter_your_response_above}</p>`;
              $('.dialogI').focus();
              return;
            } else {
              dialogInotes.innerHTML = "";
            }
            console.log(dialogI);
            q.userAnswers.push(dialogI); // writeDataResponse.userAnswers is updated
            $('#dialogQ').remove();
            $('#dialogQ').dialog('destroy'); // $('this') doesn't work
            writeData(writeDataResponse); // COMMENTED OUT IN EARLIER VERSION
            // NEW VERSION, GO TO EXPLANATION
            if (CETA_user[0] != "L") {
              document.getElementById('divZoneB').styleName = 'col';
              document.getElementById('divZoneC').styleName = 'col';
              divZoneB.style.width = '40%';
              divZoneC.style.width = '40%';
              divZoneB.style.overflow = 'auto';
              divZoneC.style.overflow = 'auto';
              // divZoneB.style.maxHeight = '100%';
              // divZoneC.style.maxHeight = '100%';
              divZoneC.style.display = 'block'; // can access divZoneC by variable name because it is declared with var
              divZoneBH.style.display = 'block';
              divZoneCH.style.display = 'block';
              if (typeof q.Explanation !== "undefined") {
                divZoneQ.innerHTML += `<div style="color: blue; font-size: 0.75rem; ">${q.Explanation}</div>`;
              }
            } else {
                divZoneQ.innerHTML += `<div style="color: blue; font-size: 0.74rem; ">${txtLbl.Please_wait_for_your_trainer}</div>`;
            }
            // PREVIOUS VERSION, GO BACK TO VIDEO
            // $('#DragAndDropModal').modal('hide');
            // PlayVideo();
          }
        }],
        dragStop: function () {
          $('.dialogI').focus();
          // $(this).find('.dialogI').focus();
        },
        focus: function () {
          $('.dialogI').focus();
          // $(this).find('.dialogI').focus();
        },
        resizeStop: function () {
          $('.dialogI').focus();
          // $(this).find('.dialogI').focus();
        },
      });   
    }
  }  
  
  // CREATE DRAGGABLE ITEMS
  items.forEach((item_object,idx) => { // draggables
    var divItem = document.createElement("DIV");
    divItem.className = "example-draggable"; // use className, not class
    // divItem.setAttribute("data-background-color",getComputedStyle(divItem).backgroundColor); // getComputedStyle doesn't work at this stage
    divItem.setAttribute("data-match",item_object.bucket); // in quiz.js the text in Excel Bucket_# was appended with #
    divItem.draggable = true;
    divItem.addEventListener("dragstart", event => {OnDrag(event)});
    divItem.addEventListener("dragend", event => {OnDragEnd(event,q)});
    divItem.id = 'draggable-' + idx; // can set id directly, but not class
    divItem.setAttribute("data-order",idx);
    divItem.setAttribute("data-matches","0"); // initialize multiple matches, can't use divItem["data-matches"] = "0";
    divItem.innerText = item_object.item; // Bucket_Ans_#
    items_shuffled.push(divItem);
    q.correctAnswers.push(item_object.item); // save the text
  });

  // SHUFFLE
  if (shuffle) { // added shuffle option (May 10, 2021) 
    for (let i=items_shuffled.length-1; i>0; i--) {
      const j = Math.floor(Math.random()*i);
      const temp = items_shuffled[i];
      items_shuffled[i] = items_shuffled[j];
      items_shuffled[j] = temp;
    }
  }

  // SET data-matches
  items_shuffled.forEach((divItemA,idxA) => {
    if (divItemA.getAttribute("data-matches")=="0" && !divItemA.innerText.endsWith('///')) { // not set yet, don't include '///'
      let dataMatchesA = []; // initialize
      // GET DRAGGABLES WITH SAME TEXT, HIGHER INDEX AND PUSH TO dataMatchesA
      let divItemsB = items_shuffled.filter((divItemB,idxB) => {
        if (idxB>=idxA && divItemB.innerText==divItemA.innerText) { // found a match, must have divItemB["data-matches"]==""
          dataMatchesA.push(divItemB.getAttribute("data-match")); // add bucket of div item B
          return true;
        } else {
          return false;
        }
      });
      // ADD dataMatchesA TO THESE DRAGGABLES, SET DISPLAY TO none
      divItemsB.forEach((divItemB,idxB) => {
        divItemB.setAttribute("data-matches",JSON.stringify(dataMatchesA));
        if (idxB>0 && q.questionType!=22) {
          divItemB.style.display = "none" // initially not visible
        }
      })
    }
  });

  // CREATE DIV ZONE A
  var divZoneA = document.createElement("DIV"); // contains all of the draggables in the beginning
  divZoneA.className = "example-origin";
  divZoneA.id = "divZoneA";
  divZoneA.addEventListener("dragover", event => {onDragOver(event)});
  divZoneA.addEventListener("drop", event => {onDrop(event,q)});
  divZoneA.innerText = "";
  if (q.questionType==21 || q.questionType==22) {
    divZoneA.setAttribute("style","display: table-cell; text-align: center; vertical-align: middle; width: 33%");
  }

  // PUT DRAGGABLES IN DIV ZONE A OR STORE IN draggablesMoved IF MARKED BY ///
  let draggablesMoved = [];
  let draggablesMovedAll = [];
  items_shuffled.forEach(divItem => {
    if (divItem.innerText.endsWith('///')) { // don't put the ones with '///' in divZoneA, move it to a bucket (see below)
      divItem.innerText = divItem.innerText.slice(0,-3); // remove last 3 characters, '///'
      divItem.style.display = 'block'; // make it visible in case it was set to none earlier
      draggablesMoved.push(divItem); // save the item, no need to clone
      // draggablesMoved.push(divItem.cloneNode(true));
      // draggablesMoved.push(divItem.cloneNode(true)); // make sure we have repeated nodes (3 is more than enough)
    } else {
      divZoneA.appendChild(divItem); // add the items to divZoneA      
    }
    // CREATE DRAGGABLES FOR DIV ZONE C
    var divItemC = document.createElement("DIV"); // later will be set to class draggable
    divItemC.setAttribute("data-match",divItem.getAttribute("data-match"));
    divItemC.innerText = divItem.innerText;
    draggablesMovedAll.push(divItemC);
    // let divItemAll = divItem.cloneNode(true);
    // divItemAll.style.display = 'block';
    // draggablesMovedAll.push(divItemAll);
    // draggablesMovedAll.push(divItemAll.cloneNode(true));
    // draggablesMovedAll.push(divItemAll.cloneNode(true));
  });

  // CREATE DIV PARENT
  var divParent = document.createElement("DIV"); // contains everything
  divParent.setAttribute("class","example-parent");
  divParent.id = "divZoneParent";
  // var divQuestion = document.createElement("DIV"); // DOESN'T FIT, ESPECIALLY WITH TABLE QUESTIONS
  // divQuestion.innerHTML = q.question;
  // divQuestion.className = "container";
  // divQuestion.setAttribute("style","display: text-align; width: 200px");
  // divParent.appendChild(divQuestion);
  divParent.appendChild(divZoneA);

  if (q.questionType==21 || q.questionType==22) { // div parent display is a table, div zones B,C are table cells, width 67%
    divParent.setAttribute("style","display: table; text-align: center");
    divParent.setAttribute("class","example-parent container flex");
    var divZoneB = document.createElement("DIV"); // all of the card sort destination divs
    divZoneB.setAttribute("style","display: table-cell; text-align: center; width: 67%");
    divZoneB.className = "container";
    divZoneB.id = "divZoneB";
    var divZoneC = divZoneB.cloneNode(false); // not a deep clone
    divZoneC.id = "divZoneC";
    var divZoneBH = document.createElement("H4");
    var divZoneCH = document.createElement("H4");
    divZoneBH.innerText = txtLbl.Your_flow;
    divZoneCH.innerText = txtLbl.Our_flow;
    divZoneBH.setAttribute("style","display: none;");
    divZoneCH.setAttribute("style","display: none;");
    divZoneBH.id = 'divZoneBH';
    divZoneCH.id = 'divZoneCH';
    divZoneB.appendChild(divZoneBH);
    divZoneC.appendChild(divZoneCH);
  }
  divParent.style.width = "60%"; // 700 px
  divParent.style.maxWidth = "60%";

  // CREATE BUCKET DIV ZONES
  function bucketDivZones(buckets,divParent,divZoneB,draggablesMoved,className) {
    buckets.forEach((bucket,idx) => {
      var divZone = document.createElement("DIV");
      divZone.className = className;
      divZone.id = 'dropzone-' + idx;
      divZone.addEventListener("dragover", event => {onDragOver(event)});
      divZone.addEventListener("drop", event => {onDrop(event,q)});
      divZone.setAttribute("data-correct",bucket);
      divZone.setAttribute("style","background-color: lightgray")
      if (q.questionType==21 || q.questionType==22) {
        divZone.className += " col your-flow";
        divZone.setAttribute("style","text-align: center; border: solid 1px black; background-color: lightgray;"); // overwrites example-dropzone style
        divZone.style.flexBasis = (bucket.search('C')>-1) ? '100%' : '50%'; // 50% if L or R
        // divZone.innerText = '\xa0\xa0\xa0\xa0';
        divZone.innerText = '';
        if (bucket.search('R')>-1) { // right
          divZoneB.lastElementChild.appendChild(divZone); // last child element should be a divRow
        } else if (bucket.search('N')>-1) { // no drop zone
          console.log('N option');
        } else { // left or center
          var divRow = document.createElement("DIV"); // create a row div
          divRow.setAttribute("class","row");
          divRow.appendChild(divZone); // append the divZone into the row div
          divZoneB.appendChild(divRow); // append the row div into parent div
        }

        // MOVE SOME OF THE DRAGGABLES
        draggablesMoved.every((draggable) => { // look through the draggables to see if one should be moved into the divZone
          if (draggable.getAttribute('data-match')==bucket && draggable.className!='draggable') { // found the match, make sure it is not already matched
            draggable.style.margin = "0px"; // get it ready for a divZone
            draggable.className = 'draggable'; // make it a draggable so that it is not counted in the points and is not moved again
            draggable.draggable = false; // disable it
            divZone.appendChild(draggable); // move the draggable
            divZone.className = 'dropzone col'; // 
            return false;
          } else {
            return true;
          }
        })

      } else {
        if (q.question != 'Choose login names') { // don't delete numbers for admin drag and drop quiz
          divZone.innerText = bucket.replace(/[0-9]*$/,'');
        } else {
          divZone.innerText = bucket;
        }
        divParent.appendChild(divZone);
      }
    });
  }

  bucketDivZones(buckets,divParent,divZoneB,draggablesMoved,"example-dropzone");

  var div = document.createElement("DIV");
  div.setAttribute("class","container");
  div.style.maxWidth = "100%";
  div.style.width = "100%"; // 1260px
  div.style.display = "flex";
  if (q.questionType==21 || q.questionType==22) { // div row contains div zones B,C, C is not displayed yet
    bucketDivZones(buckets,divParent,divZoneC,draggablesMovedAll,"dropzone"); // don't use example-dropzone because of point counting
    let divRow = document.createElement("DIV");
    divRow.className = "row";
    divRow.appendChild(divZoneC);
    divZoneC.style.display = 'none';
    divRow.appendChild(divZoneB);
    divParent.appendChild(divRow);
  }
  var divZoneQ = document.createElement("DIV");
  divZoneQ.innerHTML = formatQuestion(q);
  divZoneQ.style.width = "40%"; // 340px
  divZoneQ.class = "col";
  divZoneQ.id = 'divZoneQ';
  div.appendChild(divZoneQ);
  div.appendChild(divParent);
  const modal_body = document.querySelector('#DragAndDropModalBody');
  modal_body.childNodes.forEach((node) => modal_body.removeChild(node))
  modal_body.appendChild(div);
  
  $('#DragAndDropModal').modal();

  // PROCESS +++ SYNTAX
  function formatQuestion(q) {
    let Q = q.question;
    let R = '';
    const p = /\+\+\+/;
    const fs = ' style="font-size:smaller; "'
    let j = Q.search(p);
    let Rs = [];
    if (j>-1) {
      while (j>-1) {
        Q = Q.slice(j+3); // get rid of +++ in the beginning of each segment
        j = Q.search(p); // find the next +++
        if (j>-1) { // not the last segment
          Rs.push(Q.slice(0,j)); // save the segment
        } else { // j=-1, last segment
          Rs.push(Q); // save the last segment
        }
      }
      R += '<h5>' + Rs[0] + '</h5>'; // header
      R += '<p' + fs + '>' + Rs[1] + '</p>'; // sentence about scores
      R += '<ul>'; // start list
      for (i=2; i<Rs.length-2; i++) { // skip header, sentence about scores, description, question
        R += '<li' + fs + '>' + Rs[i] + '</li>';
      }
      R += '</ul>'; // end list
      R += '<p' + fs + '>' + Rs[Rs.length-2] + '</p><br>';
      R += '<p' + fs + '><b>' + Rs[Rs.length-1] + '</b></p>';
    } else {
      R += '<p' + fs + '>' + Q + '</p>';
    }
    return R;
  }

  // GRADE AND REPORT RESULTS
  function showResults() { // callback for Submit button, does not apply to Drag and Drop game
    const draggables_all = modal_body.getElementsByClassName('example-draggable'); // get all the draggables
    const dropzones = document.getElementsByClassName('example-dropzone');
    let num_total = (q.questionType!=21 && q.questionType!=22) ? draggables_all.length : dropzones.length;
    let num_correct = 0;
    let num_dragged = 0;
    let draggablesAll = [];
    for (let j=0; j<dropzones.length; j++) {
      draggablesAll.push(dropzones[j].getElementsByClassName('example-draggable')); // all draggables in the dropzone
      num_dragged += draggablesAll[j].length;
    }
    if (num_dragged<num_total && q.questionType!=21 && q.questionType!=22) { // if user didn't put all draggables in the dropzone
      resultsText.innerText = '\xa0\xa0\xa0\xa0' + txtLbl.Please_complete_the_quiz; // give message and return
    } else {
      q.userAnswers = [];
      let q_correctAnswers = [];
      if (q.questionType==13 || q.questionType==21 || q.questionType==22) { // 13-matching, 21-card sort
        let q_buckets = [];
        for (let j=0; j<q.buckets.length; j++) {
          if (!q.correctAnswers[j].endsWith('///')) {
            q_buckets.push(q.buckets[j]);
            q_correctAnswers.push(q.correctAnswers[j] + ': ' + q.buckets[j]); // copy the answers and buckets
          }
        }
        for (let j=0; j<dropzones.length; j++) {
          // NEED ONE PER DROPZONE
          if (draggablesAll[j].length != 1) {
            resultsText.innerText = '\xa0\xa0\xa0\xa0' + txtLbl.Please_try_again_with_one_item_per_box; // give message and return
            return;
          }
          // q.userAnswers.push(draggablesAll[j][0].getAttribute("data-match")); // should be only one
          q.userAnswers.push(JSON.parse(draggablesAll[j][0].getAttribute("data-matches"))); // should be only one

          // if (q.buckets[j] == q.userAnswers[j]) {
          if (q.userAnswers[j].includes(q_buckets[j])) {
            num_correct++;
          }
        }
      } else { // ordering, drag and drop
        let positions = [];
        const draggables = draggablesAll[0]; // only for matching quiz
        q_correctAnswers = q.correctAnswers; // copy the answers
        for (let i=0; i<draggables.length; i++) { // for each draggable in the dropzone
          positions.push({ // push each draggable
            true_idx: draggables[i].getAttribute("data-order"), // get the true position index
            position: draggables[i].offsetTop, // get the distance from the top to be sorted in the next step
            item: draggables[i].innerText,
          });
        }              
        positions.sort((p1,p2) => {return p1.position-p2.position;}); // ascending order of the draggables (going down the dropzone)
        for (let i=0; i<positions.length; i++) { // start from the draggable at the top
          q.userAnswers.push(positions[i].item);
          if (i==positions[i].true_idx) { // see if the index of the draggables are the same as the true index
            num_correct++;
          }
        }
      }
      var writeDataResponse = { // response that will be sent to writeData
        CETA_login: CETA_login,
        CETA_Card: q.CETA_Card,
        Type: q.Type,
        time: q.time,
        questionType: q.questionType,
        question: q.question,
        correctAnswers: q_correctAnswers, // correct answers
        userAnswers: q.userAnswers, // user answers
        numCorrect: num_correct,
        numCorrectAnswers: num_total,
      }

      resultsContainer.removeChild(submitButton); // replace submit with return
      resultsContainer.innerHTML = "";
      resultsContainer.appendChild(returnButton);
      resultsContainer.appendChild(resultsText);
      resultsText.innerText = '';
      var txt_results;
      if (num_correct==num_total) {
        txt_results = txtLbl.Your_flow_matches_with_our_flow;
      } else {
        txt_results = num_correct + ' ' + txtLbl.out_of + ' ' + num_total + ' ' + txtLbl.are_correct;
      }
      resultsText.innerText = '\xa0\xa0\xa0\xa0' + txt_results;

      if (q.questionType==21 || q.questionType==22) {
        document.getElementById('divZoneA').remove();
        displayDialogQ(true,writeDataResponse); // writeData called by display dialog

        // OLD VERSION SHOW RESULTS BEFORE EXPLANATION, MOVED TO displayDialogQ()
        // document.getElementById('divZoneB').styleName = 'col';
        // document.getElementById('divZoneC').styleName = 'col';
        // divZoneB.style.width = '40%';
        // divZoneC.style.width = '40%';
        // divZoneC.style.display = 'block'; // can access divZoneC by variable name because it is declared with var
        // divZoneBH.style.display = 'block';
        // divZoneCH.style.display = 'block';
        // divZoneC.style.marginRight = '10px';
        // divZoneB.style.marginLeft = '10px';
        // displayDialogQ(true,writeDataResponse); // writeData called by display dialog
      } else {
        if (typeof q.Explanation !== "undefined") {
          divZoneQ.innerHTML += `<div style="color: blue; font-size: 0.75rem; ">${q.Explanation}</div>`;
        }
        writeData(writeDataResponse);
      }
    }
  }
}