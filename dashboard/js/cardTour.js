// Element tour
var cardTour = {
  id: "card-tour",
  steps: [
    // {
    //   title: "Captions",
    //   content: "This will turn captions on and off.",
    //   target: "btn_cc",
    //   placement: "top",
    //   arrowOffset: "-200px"
    //   // xOffset: "800px",
    //   // xOffset: Math.round($(window).width()*0.95),
    //   // yOffset: "-25px"
    // },
    {
      title: "Dropdown menu",
      content: "Click here to see the CETA cards",
      target: "cards_dropdown_button",
      placement: "bottom",
      onNext: function() {
        $('#cards_dropdown').addClass("show");
        $('.btn-group').addClass("show");
      }
    },
    {
      title: "Select a card",
      target: "dropdown_0",
      content: "The card will turn green",
      placement: "right",
      onNext: function() {
        $('#cards_dropdown').removeClass("show");
        $('.btn-group').removeClass("show");
      },
      onClose: function() {
        $('#cards_dropdown').removeClass("show");        
        $('.btn-group').removeClass("show");
      },
      onEnd: function() {
        $('#cards_dropdown').removeClass("show");        
        $('.btn-group').removeClass("show");
      },
      onError: function() {
        $('#cards_dropdown').removeClass("show");        
        $('.btn-group').removeClass("show");
      },
    },
    {
      title: "Volume control",
      content: "Here is the volume control",
      target: "volume",
      placement: "top"
    },
    {
      title: "Video controls",
      content: "Use these buttons to go to the previous card, play or pause the video, or go to the next card",
      target: "btn_play",
      placement: "top"
    },
    {
      title: "Progress bar",
      content: "This shows you the progress in the current video.  You can also click here to go to any place in the video.",
      target: "progress",
      placement: "top",
      onNext: function() {
        let btn_quiz = document.createElement('BUTTON');
        btn_quiz.id = "hopscotch_progress_btn"
        let progress = document.getElementById('progress');
        const width = 20;
        const progress_start = parseInt(progress.style.left.slice(0,-2)); // start x position in pixels
        const progress_length = parseInt(progress.style.width.slice(0,-2)); // length in pixels
        btn_quiz.setAttribute("style",`position:absolute; top:${progress.style.top}; height:${progress.style.height}; padding: 0px; width: ${width}px;`);
        btn_quiz.style.left = progress_start + 30 + "px";
        $('#progress_quiz_buttons').append(btn_quiz);
      }
    },
    {
      title: "Progress buttons",
      content: "These buttons show where the quizzes are.  If you click on a button, the quiz will soon appear.",
      target: "progress",
      placement: "top",
      xOffset: "10px",
      onNext: function() {
        $('#hopscotch_progress_btn').remove();
      },
      onClose: function() {
        $('#hopscotch_progress_btn').remove();
      },
      onEnd: function() {
        $('#hopscotch_progress_btn').remove();
      },
      onError: function() {
        $('#hopscotch_progress_btn').remove();
      }
    },
    {
      title: "Play-Pause",
      content: "You can also click here to play and pause the video",
      target: "videoPlayer",
      placement: "right",
      xOffset: "center",
      yOffset: "center"
    },
    {
      title: "Button for counselors",
      content: "Use this to switch between self-learning (if you are doing this yourself) or live-session (if a counselor is working with you)",
      target: "facilitator_button",
      placement: "left"
    }
  ],
}

translate_tour(cardTour);