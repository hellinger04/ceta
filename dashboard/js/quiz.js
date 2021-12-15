let currentSlide = 0;
const questionTypes = {
  multiple_choice: [1,2,10], // 1-Single choice, 2-TF, 10-Multiple selection
  with_answers: [1,2,4,8,10],  // 4-Reflection, 8-Open Ended
  drag_and_drop: [11,12,13,21,22], // 11-Drag and drop, 12-Ordering, 13-Matching, 21-Card Sort, 22-Card Sort Simple
}

// look at global array video_files[] to see quizzes
//   this array is set in videoFunctions.js > VideoDropdownGenerate() > saveQuizzes() [see below]
// Quiz_Generate() called from videoFunctions.js > PauseVideos() > EventListener:timeupdate
// const modalBackdrop = {
//   backdrop: 'static',
//   keyboard: false
// }

const returnButton = document.createElement('button');
returnButton.setAttribute('style',"display:inline-block");
returnButton.setAttribute('data-dismiss',"modal");
returnButton.setAttribute('aria-label',"Close");
returnButton.addEventListener("click",PlayVideo);
returnButton.innerHTML = txtLbl.Return_to_Video;

function saveQuizzes() { // video_files is an object created for each element with all of the quizzes
  console.log('saveQuizzes');
  for (let videoFile of VideoFiles) {
    let video_file = {
      CETA_Card: videoFile[0],
      file: videoFile[1],
      captionFile: videoFile[2],
      quizzes: [],
      elementTitle: CETA_Element, // default titles
      cardTitle: videoFile[0],
    };

    for (let quiz_row of All_Excel_rows) {
      if (quiz_row && quiz_row.CETA_Card==videoFile[0]) {
        if (quiz_row.Type == 'CardTitle') { // if title, save
          video_file.cardTitle = quiz_row.question;
        } else if (quiz_row.Type == 'ElementTitle') {
          video_file.elementTitle = quiz_row.question;
        } else {
          let quiz = {
            Type: quiz_row.Type, // text
            questionType: quiz_row.questionType, // number, set in Excel_to_JS.html > MakeKalturaQuestionCuePoint()
            time: quiz_row.startTime/1000 + 0.5,
            end_time: quiz_row.endTime/1000,
          };
          if (questionTypes.with_answers.includes(quiz_row.questionType)) { // Single choice, TF, Multiple selection
            quiz.question = quiz_row.question;
            quiz.answers = {};
            quiz.correctAnswers = {};
            for (let answer of quiz_row.optionalAnswers) { // optionalAnswers = [answer,answer,...]
              quiz.answers[answer.key] = answer.text; // answer = {key:key of answer, isCorrect:true or false, text:text of answer}
              quiz.correctAnswers[answer.key] = answer.isCorrect; // quiz.answers[key] = text, quiz.correctAnswers[key] = true or false
            }
          } else if (questionTypes.drag_and_drop.includes(quiz_row.questionType)) { // DragAndDrop, Ordering, Matching
            quiz.question = quiz_row.question;
            quiz.items = quiz_row.items;
            quiz.buckets = [];
            if (quiz_row.Width && quiz_row.Width>0) {
              quiz.Width = quiz_row.Width;
            }
            quiz_row.buckets.forEach((bucket,b_idx) => {
              quiz.buckets.push(bucket); // allow for buckets with the same name in Card sort
            })
            // quiz.buckets = quiz_row.buckets;

          } else if (quiz_row.questionType>100) { // whiteboards or pauses
            quiz.DisplayHTML = quiz_row.DisplayHTML;
            quiz.DisplayImage = quiz_row.DisplayImage;
            if (quiz_row.questionType==120) {
              quiz.X_Position = quiz_row.X_Position;
              quiz.Y_Position = quiz_row.Y_Position;
              quiz.Width = quiz_row.Width;            
            }
          }
          if (typeof quiz_row.Explanation !== "undefined") {
            quiz.Explanation = quiz_row.Explanation;
          } 
          quiz.nFacilitator = quiz_row.nFacilitator; // set in excelToJS.js -> MakeQuizRow()
          for (i=1; i<=quiz_row.nFacilitator; i++) { // start from 1
            quiz['Facilitator' + i] = quiz_row['Facilitator' + i];
          }
          quiz.CETA_Card = quiz_row.CETA_Card;
          video_file.quizzes.push(quiz);
        }
      }        
    }
    video_files.push(video_file);
  }
}

function quizGenerate(quiz,video_js,PauseIdx0) {
  console.log('quizGenerate > quiz,PauseIdx0',quiz,PauseIdx0);
  // $('.explanation').remove();
  if (questionTypes.multiple_choice.includes(quiz.questionType)) {
    video_js.pause();
    scGenerate(quiz,quiz.questionType);
  } else if (quiz.questionType==8) { // Open ended
    video_js.pause();
    oeGenerate(quiz);
  } else if (quiz.questionType==4) { // Reflection
    oeGenerate(quiz);
  } else if (questionTypes.drag_and_drop.includes(quiz.questionType)) { // Drag and drop, Order, Matching
    video_js.pause();
    GenerateDragAndDrop(quiz);
  }
  facilitatorGenerate(quiz,true);
}

function facilitatorGenerate(quiz,initialize=false) {
  if (quiz.nFacilitator > 0 && (CETA_user[0]=='Y' || CETA_user[1]=='Y')) {
    try {$('#dialogF').remove();} catch { }; // if it exists, remove
    let dialogF = document.createElement('DIV');
    dialogF.id = 'dialogF';
    dialogF.title = txtLbl.Facilitator_tips;
    let dialogAF = document.createElement('DIV');
    
    for (let i=1; i<=quiz.nFacilitator; i++) {
      console.log('Facilitator' + i,quiz['Facilitator' + i]);
      let para = document.createElement('P');
      para.innerText = quiz['Facilitator' + i];
      para.setAttribute('style','margin-bottom: 0; margin-top: 1rem')
      dialogAF.appendChild(para);
    }
    dialogF.appendChild(dialogAF);

    document.body.appendChild(dialogF);

    let dialogBF = document.getElementById('facilitator_button');
    dialogBF.onclick = displayDialogF;

    $('#dialogF').dialog({
      autoOpen: false,
    }); // needed to initialize the dialog

    $('#dialogF').dialog({
      position: ['leftc','bottom'],
      minWidth: "800px",
      minHeight: "600px",
      width: "800px",
    }); // after initialization

    if (!initialize) {
      displayDialogF(); // do not display dialog for initialization
    }

    function displayDialogF() {
      $('#dialogF').dialog('open');
      $('.ui-dialog').css({'z-index':'9990','top':'50px'});
      $('#dialogF').dialog({
        buttons: [{
          text: txtLbl.Go_back_to_video,
          style: "display:inline-block",
          click: function () {
            $('#dialogF').dialog('destroy');
            // $('.modal').modal('hide'); // want to keep the modal
            // PlayVideo(); // don't use or it will override the pause button
            // try {$('#dialogF').remove();} catch { }
          }
        }],
      });
    }
  }  
}

function oeGenerate(Quiz) {
  const OEModalBody = document.querySelector('#OEModalBody');
  OEModalBody.innerHTML = `
  <div class="container">
    <h5>${Quiz.question}</h5>
    <textarea class="form-control rounded-12" rows="0" id="OEAnswer"></textarea>
  </div>
  `
  const submitButton = document.createElement('button');
  submitButton.setAttribute('style',"display:inline-block");
  submitButton.className += 'submit-button';
  submitButton.addEventListener("click",showResults);
  submitButton.innerHTML = txtLbl.Submit;
  $('#OEModalLabel').text(
    (q => {
      if (q==8) {return txtLbl.Time_for_questions;}
        else if (q==4) {return txtLbl.Reflection;}
    })(Quiz.questionType)
  );

  function showResults() { // better to use setAttribute to prevent multiple event listeners
    var OEAnswer = document.getElementById('OEAnswer').value;
    console.log('OEGenerate > OEAnswer',OEAnswer);
    if (OEAnswer=="") {
      const txt = document.createTextNode('\xa0\xa0\xa0\xa0' + txtLbl.Please_type_your_answer);
      resultsContainer.appendChild(txt);
    } else {
      writeData({
        CETA_login: CETA_login,
        CETA_Card: Quiz.CETA_Card,
        Type: Quiz.Type,
        time: Quiz.time,
        questionType: Quiz.questionType,
        question: Quiz.question,
        userAnswers: [OEAnswer]
      });
      resultsContainer.removeChild(submitButton);
      resultsContainer.innerHTML = "";
      resultsContainer.appendChild(returnButton);
      resultsContainer.appendChild(document.createTextNode(`\xa0\xa0\xa0\xa0` + txtLbl.Your_response_is_saved));    
    }
  };
  const resultsContainer = document.getElementById('OEModalFooterResults');
  resultsContainer.innerHTML = "";
  resultsContainer.appendChild(submitButton);

  $('#OEModal').modal();
}

function scGenerate(Quiz,questionType) {
  console.log('scGenerate > Quiz',Quiz);
  const SCQuizModalBody = document.querySelector("#SCModalBody");
  const SCQuizModalFooter = document.querySelector("#SCModalFooter");
  const SCModalLabel = document.querySelector("#SCModalLabel");
  const CETA_Card = Quiz.CETA_Card;
  const question = Quiz.question;
  const submitButton = document.createElement('button');
  submitButton.setAttribute('style',"display:inline-block");
  submitButton.addEventListener("click",showResults);
  submitButton.className += 'submit-button';
  submitButton.innerHTML = txtLbl.Submit;

  const input_type = (questionType==10) ? 'checkbox' : 'radio';
  SCModalLabel.innerText = (q => {
    if (q==1 || q==2) {return txtLbl.Select_One_Choice;}
      else if (q==10) {return txtLbl.Select_Multiple_Choices;}
    })(questionType);

// FUNCTIONS
  function buildQuiz(){
    console.log('scGenerate > buildQuiz > Quiz',Quiz);
    // variable to store the HTML output
    const output = [];
    // variable to store the list of possible answers
    const answers = [];
    // and for each available answer...
    for(letter in Quiz.answers){
      // ...add an HTML radio button, with the label encompassing the radio button
      answers.push( // use template literals and special quotes `` and carriage returns
        `<label>
              <input type="${input_type}" name="question0" value="${letter}">
              ${letter} :
              ${Quiz.answers[letter]}
              </label>`
      );
    }
    // add this question and its answers to the output, using join to join strings in an array
    output.push(
      `     <div class="question"> ${Quiz.question} </div>
            <div id="answers" class="answers"> ${answers.join('')} </div>`
    );
    // finally combine our output list into one string of HTML and put it on the page
    SCModalBody.innerHTML = output.join('');
    $('#SCModal').modal();
  }

  function showResults(){
    // gather answer containers from our quiz
    console.log('scGenerate > showResults > Quiz',Quiz);
    const answerContainers = SCModalBody.querySelectorAll('.answers');
    // const answerContainers = quizContainer.querySelectorAll('.answers')[0].children;
    // keep track of user's answers
    let numCorrect = 0;
    var num_correctAnswers = 0;
    // for each question...
    // find selected answer
    const answerContainer = answerContainers[0]; // quizContainer.querySelectorAll('.answers')[0].children
    // const answerContainer = answerContainers[Quiz_Number].children[0];
    const selector = `input[name=question0]:checked`;
    // code if only one input is checked: answerContainer.querySelector(input:checked).value
    // for multiple checked input, need to specify name of input element:
    //   answerContainer.querySelector(input[name=question1]:checked).value
    // also if none are selected, make sure we don't have undefined
    const user_selections = answerContainer.querySelectorAll(selector); // array, can be empty
    let userAnswers = [];
    if (user_selections.length==0) {
      const txt = document.createTextNode('\xa0\xa0\xa0\xa0' + txtLbl.Please_try_the_quiz);
      resultsContainer.appendChild(txt);
    } else {
      for (user_selection of user_selections) {
        userAnswers.push(user_selection.value); // array of keys
      }
      // const userAnswers = (answerContainer.querySelectorAll(selector)[0] || {}).value; // key values of selected answers
      // quizContainer.querySelectorAll('.answers')[0].children.querySelectorAll(selector)
      // if answer is correct
      for (key in Quiz.correctAnswers) {
        if (Quiz.correctAnswers[key]) { // correct answer
          num_correctAnswers++; // count true
          if (userAnswers.includes(key)) {numCorrect++}
        } else if (questionType==10) {
          num_correctAnswers++; // count false
          if (!userAnswers.includes(key)) {numCorrect++}
        }
      }
      if (numCorrect==num_correctAnswers) {
        // color the answers green
        answerContainer.style.color = 'lightgreen';
      } else { // if answer is wrong or blank
        // color the answers red
        answerContainer.style.color = 'red';
      }
      writeData({
        CETA_login: CETA_login,
        CETA_Card: CETA_Card,
        Type: Quiz.Type,
        time: Quiz.time,
        questionType: questionType,
        question: question,
        answers: Quiz.answers,
        correctAnswers: Quiz.correctAnswers,
        userAnswers: userAnswers,
        numCorrect: numCorrect,
        numCorrectAnswers: num_correctAnswers,
      });
      resultsContainer.removeChild(submitButton);
      resultsContainer.innerHTML = "";
      resultsContainer.appendChild(returnButton);
      var txt_results;
      if (numCorrect==num_correctAnswers) {
        txt_results = txtLbl.All_correct;
      } else {
        txt_results = numCorrect + txtLbl.out_of + num_correctAnswers + txtLbl.are_correct;
      }
      resultsContainer.appendChild(document.createTextNode('\xa0\xa0\xa0\xa0' + txt_results));
      if (typeof Quiz.Explanation !== "undefined") {
        let explanation = $('<div>').html(Quiz.Explanation).css('color','white');
        // explanation.addClass('explanation');
        $('#answers').append(explanation);
      }
    }
  }

// VARIABLES
  const resultsContainer = document.getElementById('SCModalFooterResults');
  resultsContainer.innerHTML = "";
  resultsContainer.appendChild(submitButton);

  buildQuiz();
}
