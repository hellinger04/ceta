function convert_to_JS(fileName,quiz_rows=[],checkInsert=true) {
  return new Promise ((resolve,reject) => {  
      let Quiz_Excel_JsonData = [];
      fetch(fileName, {cache: "no-cache"}).then(function (res) {
        /* get the data as a Blob */
        if (!res.ok) throw new Error("fetch failed");
        return res.arrayBuffer();
      }).then(function (ab) {
        /* parse the data when it is received */
        var data = new Uint8Array(ab);
        var workbook = XLSX.read(data, {
          type: "array"
        });
    /********************************************************************
     * DO SOMETHING WITH workbook: Converting Excel value to Json       *
     ********************************************************************/
        for (var sheet_name of workbook.SheetNames) {
          var worksheet = workbook.Sheets[sheet_name];
          var JsonWorkSheet = XLSX.utils.sheet_to_json(worksheet, {raw: true});
          Quiz_Excel_JsonData.push(JsonWorkSheet);
        }
        /************************ End of conversion ************************/
        console.log(Quiz_Excel_JsonData);
        if (checkInsert) {
          for (var rowObject of Quiz_Excel_JsonData) {
            for (var rowObj_orig of rowObject) {
              var rowObj = Excel_row_clean(rowObj_orig);
              if(rowObj.Insert == "Y") {
                var quiz_row = MakeQuizRow(rowObj,true);
                quiz_rows.push(quiz_row);
              } else if (rowObj.insert == "D") {
                //
              }              
            }
          }
          resolve(quiz_rows);
        } else {
          resolve(Quiz_Excel_JsonData);
        }
      });
    });
  }

async function generateVideoJS(fileName) {
  let fileObject = await fetch(fileName);
  let fileText = await fileObject.text();
  let fileTexts = fileText.split("="); // var VideoFiles = [...]
  let videoArray = JSON.parse(fileTexts[1]);
  return videoArray;
}

async function generateQuizData() {
  var quiz_rows = await convert_to_JS('./excel/Quiz_data_consolidated.xlsx'); // push onto quiz_rows
  quiz_rows = convert_to_JS('./excel/Static_data_consolidated.xlsx',quiz_rows); // push onto quiz_rows
  return quiz_rows; // saved in All_Excel_rows in index_ELEMENT.html
}

function Excel_row_clean(row_orig) {
  var row = row_orig;
  if (row.Explanation!==undefined) {
    try {
      const slash = '\\';
      if (row.Explanation.search(/\\/)>0) {
        row.Explanation = row.Explanation.replaceAll(slash,'/');
        error_table(`********** Minor error in ${row.CETA_Card}: explanation contains "${slash}".  This was fixed, "${slash}" was replaced by "/".  Here is the fixed explanation in the Excel sheet: ${row.Explanation}`);
      }
    } catch {            
    }
  }
  return row;
}

function downloadQuizData(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function error_table(error) {
  // document.getElementById('no_errors').setAttribute('style','display:none');
  // var node = document.createElement("LI");
  // var textnode = document.createTextNode(error);
  // node.appendChild(textnode);
  // document.getElementById('List_of_errors').appendChild(node);
  console.log('error_table:',error);
}

// rowObject[0] is an object with keys:
// Video, Minutes, Seconds, Type, Question, Insert, CorrectAnswer, Explanation, Hint,
//   Answer1, Answer2, Answer3, Answer4, Answer5, Answer6, BookWidgetsCode, DisplayKey, DisplayHTML
// Type (questionType) can be MultipleChoice (1), TrueOrFalse (2), ReflectionPoint (3), OpenEnded (8)
// BookWidgetsCode for TrueOrFalse only
// DisplayKey for TrueOrFalse only, will be used to display DisplayHTML
function MakeQuizRow(q,isQuiz) { // q is a row (rowObj) from the Excel workbook (rowObject)
  // object property = name:value pair (property name:property value) accessed using value = object.name = object["name"]
  var quiz_row = {CETA_Card: q.CETA_Card};
  var num_answers = 0;
  // const BookWidgetsCode = "BookWidgetsCode";
  // const DisplayKey = "DisplayKey";
  if (q.Width && q.Width>0) {
    quiz_row.Width = q.Width;
  }

  if (q.Type == 'MultipleChoice' || q.Type == 'MultipleSelection') {
    if (q.Type == 'MultipleChoice') {
      quiz_row.questionType = 1;
    };
    if (q.Type == 'MultipleSelection') {
      quiz_row.questionType = 10;
    };
    for (var i=1; i<100; i++) { // count the number of answers
      if (typeof q["Answer" + i]==="undefined") {
        if (num_answers<2) {
          return [];
        };
        break; 
      };
      num_answers += 1;
    }

  } else if (q.Type == 'TrueOrFalse') {
    quiz_row.questionType = 2;
    num_answers = 2;
    // if (typeof q[BookWidgetsCode]!=="undefined") {
    //   q.Question += '##### ' + BookWidgetsCode + ' #####' + q[BookWidgetsCode];
    // } else if (typeof q[DisplayKey]!=="undefined") {
    //   q.Question += '##### ' + DisplayKey + ' #####' + q[DisplayKey];
    // }

  } else if (q.Type == 'ReflectionPoint') {
    quiz_row.questionType = 3;
    num_answers = 0;

  } else if (q.Type == 'OpenEnded') {
    quiz_row.questionType = 8;
    num_answers = 0;

  } else if (q.Type == 'DragAndDrop' || q.Type == 'Matching' || q.Type == 'CardSort' || q.Type == 'CardSortSimple') {
    if (q.Type == 'DragAndDrop' || q.Type == 'CardSort' || q.Type == 'CardSortSimple') {
      var bucket_from_heading = "Bucket_Ans";
      var bucket_to_heading = "Bucket ";
      quiz_row.questionType = (q.Type == 'DragAndDrop') ? 11 : (q.Type == 'CardSort') ? 21 : 22;
    } else if (q.Type == 'Matching') {
      quiz_row.questionType = 13;
      var bucket_from_heading = "Left ";
      var bucket_to_heading = "Right ";
    }
    quiz_row.items = [];
    let bucket_n = 0;
    quiz_row.buckets = [];
    const nbsp = String.fromCharCode(160); // blank Excel cell
    for (q_var in q) { // look at all property names, q_var = property name (originally an Excel column heading)
      if (q_var.toString().includes(bucket_from_heading)) { // look at each Excel heading and check if there is a match with bucket_from
        bucket_n++; // will check all buckets
        let bucket_to = q[bucket_to_heading + bucket_n]; // get the Excel cell value under the bucket_to heading
        if (bucket_to != nbsp && bucket_to != "" && typeof bucket_to != "undefined") { // make sure it is not blank
          bucket_to += bucket_n; // add number
          quiz_row.buckets.push(bucket_to); // push the bucket_to cell into set of buckets
          q_items = q[q_var].split(' /// '); // convert into an array of items [item,item,...]
          q_items.forEach((item,index) => {
            quiz_row.items.push({
              item: item, // item that goes to bucket_to
              bucket: bucket_to, // this is the right answer
            });
          });              
        }
      }
    }
    // console.log('quiz_row.items for Drag and Drop',quiz_row.items);
    // quiz_row.items = [
    //   {item:"a1", bucket:"1"},
    //   {item:"b1", bucket:"2"},
    //   {item:"c1", bucket:"1"},
    // ];

  } else if (q.Type == 'Ordering') {
    quiz_row.questionType = 12;
    quiz_row.items = [];
    let answer_n = 0;
    quiz_row.buckets = ['List in order'];
    for (q_var in q) {
      if (q_var.toString().includes("Answer")) {
        answer_n++;
        quiz_row.items.push({
          item: q[`Answer${answer_n}`],
          bucket: quiz_row.buckets,
        });
      }
    }
    // console.log('quiz_row.items for Order',quiz_row.items);
    
  } else if (q.Type == 'WhiteBoard') {
    quiz_row.questionType = 101; // must be >100
    num_answers = 0;

  } else if (q.Type == 'WhiteBoardInsert') {
    quiz_row.questionType = 120; // X_position and Y_position are read in quiz.js > Save_Quizzes()
    quiz_row.X_Position = q.X_Position;
    quiz_row.Y_Position = q.Y_Position;
    num_answers = 0;

  } else if (q.Type == 'Pause') {
    quiz_row.questionType = 102;
    num_answers = 0;

  } else if (q.Type == 'RolePlayL') {
    quiz_row.questionType = 110;
    num_answers = 0;

  } else if (q.Type == 'RolePlayC') {
    quiz_row.questionType = 111;
    num_answers = 0;

  } else if (q.Type == 'RolePlayR') {
    quiz_row.questionType = 112;
    num_answers = 0;

  } else if (q.Type != 'CardTitle' && q.Type != 'ElementTitle') {
    console.log("Undefined question type: " + q.Type); // Title image is read in Kaltura_Play_Quizzes.html, play_after_delay()
    return null;
  };

  quiz_row.question = q.Question;
  quiz_row.startTime = (q.Minutes*60 + q.Seconds)*1000;  // time in milliseconds
  quiz_row.endTime = (q.Minutes_End*60 + q.Seconds_End)*1000;

  if (quiz_row.questionType<=100 && quiz_row.StartTime < 500) {
    quiz_row.StartTime = 500; // minimum start time for quiz questions
  }
  if (isQuiz) {
    quiz_row.Explanation = q.Explanation; // if this column is not present, this will be undefined, which is okay
    quiz_row.hint = q.Hint;
    // quiz_row.DisplayKey = q.DisplayKey;        
  }
  quiz_row.Type = q.Type;
  quiz_row.optionalAnswers = [];
  quiz_row.DisplayHTML = q.DisplayHTML;''
  quiz_row.DisplayImage = q.DisplayImage;
  quiz_row.nFacilitator = 0;
  while (typeof q['Facilitator' + (quiz_row.nFacilitator + 1)] != "undefined" && q['Facilitator' + (quiz_row.nFacilitator + 1)] != '') { // if defined
    quiz_row.nFacilitator += 1;
    quiz_row['Facilitator' + quiz_row.nFacilitator] = q['Facilitator' + quiz_row.nFacilitator];
  }
  if (q.CorrectAnswer) {
    const answer_array = q.CorrectAnswer.toString().split(',');
    for (var i=1; i<=num_answers; i++) {
      const iStr = i.toString();
      var optA = {
        "key": iStr,
        "isCorrect": answer_array.includes(iStr),
        "text": q["Answer" + i],
      };
      quiz_row.optionalAnswers.push(optA);
    };
  };
  return quiz_row;
}
