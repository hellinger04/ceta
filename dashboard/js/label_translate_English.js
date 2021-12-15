var txtLbl = {
  "CETA_Element": "CETA Element",
  "Username": "Username",
  "Name": "Name",
  "Country": "Country",
  "Region": "Region",
  "Training_date": "Training date",
  "Submit": "Submit",
  "Send_quiz_results": "Send quiz results",
  "Submit_Quiz": "Submit Quiz",
  "Correct_Rate": "Correct Rate",
  "out_of": "out of",
  "are_correct": "are correct",
  "Return_to_Video": "Return to Video",
  "Select_One_Choice": "Select One Choice",
  "Drag_and_drop_quiz": "Drag and drop quiz",
  "Show_question": "Show question",
  "Please_explain_your_card_sort": "Please explain your card sort",
  "Submit_your_response": "Submit your response",
  "Open_ended_Quiz": "Open-ended Quiz",
  "Select_Multiple_Choices": "Select Multiple Choices",
  "Continue": "Continue",
  "IntroToTraining": "IntroToTraining",
  "Please_try_the_quiz": "Please try the quiz",
  "Please_type_your_answer": "Please type your answer",
  "Your_response_is_saved": "Your response is saved",
  "Read": "Read",
  "Role_play": "Role play",
  "step": "step",
  "Yes": "Yes",
  "Complete": "Complete",
  "Please_try_again_with_one_item_per_box": "Please try again with one item per box",
  "Trainer": "Trainer",
  "Submit_your_explanation": "Submit your explanation",
  "Tell_us_why_did_you_choose_these_cards": "Tell us why did you choose these cards",
  "Please_enter_your_response_above": "Please enter your response above",
  "Please_wait_for_your_trainer": "Please wait for your trainer",
  "Your_flow": "Your flow",
  "Our_flow": "Our flow",
  "Your_flow_matches_with_our_flow": "Your flow matches with our flow",
  "Time_for_questions": "Time for questions",
  "Reflection": "Reflection",
  "Supervisor_Elements": "Supervisor Elements",
  "Supervisor": "Supervisor",
  "Select_full_name": "Select full name",
  "Select_region": "Select region",
  "Select_training_date": "Select training date",
  "Cards": "Cards",
  "Live_session": "Live-session",
  "Self_learning": "Self-learning",
  "Facilitator_tips": "Facilitator tips",
  "Go_back_to_video": "Go back to video",
  "All_correct": "All correct",
  "Elements": "Elements",
  "Select_country": "Select country",
  "Click_here_for_next_step": "Click here for next step",
  "Please_complete_the_quiz": "Please complete the quiz",
  "Kiev": "Kiev",
  "Prev": "Prev",
  "Next": "Next",
  "Dropdown_menu": "Dropdown menu",
  "Click_here_to_see_the_CETA_cards": "Click here to see the CETA cards",
  "Select_a_card": "Select a card",
  "The_card_will_turn_green": "The card will turn green",
  "Volume_control": "Volume control",
  "Here_is_the_volume_control": "Here is the volume control",
  "Video_controls": "Video controls",
  "Use_these_buttons_to_go_to_the_previous_card,_play_or_pause_the_video,_or_go_to_the_next_card": "Use these buttons to go to the previous card, play or pause the video, or go to the next card",
  "Progress_bar": "Progress bar",
  "This_shows_you_the_progress_in_the_current_video.__You_can_also_click_here_to_go_to_any_place_in_the_video.": "This shows you the progress in the current video.  You can also click here to go to any place in the video.",
  "Progress_buttons": "Progress buttons",
  "These_buttons_show_where_the_quizzes_are.__If_you_click_on_a_button,_the_quiz_will_soon_appear.": "These buttons show where the quizzes are.  If you click on a button, the quiz will soon appear.",
  "Play": "Play",
  "Pause": "Pause",
  "You_can_also_click_here_to_play_and_pause_the_video": "You can also click here to play and pause the video",
  "Button_for_counselors": "Button for counselors",
  "Use_this_to_switch_between_self_learning_(if_you_are_doing_this_yourself)_or_live_session_(if_a_counselor_is_working_with_you)": "Use this to switch between self-learning (if you are doing this yourself) or live-session (if a counselor is working with you)",
  "Click_here_to_see_the_CETA_elements": "Click here to see the CETA elements",
  "If_you_select_an_element": "If you select an element",
  "Supervisor_elements": "Supervisor elements",
  "Supervisors_will_see_another_dropdown_menu_here": "Supervisors will see another dropdown menu here",
  "User_name": "User name",
  "Type_your_user_name_(click_on_x_to_stop_these_messages)": "Type your user name (click on x to stop these messages)",
  "Instead_of_typing,_you_can_select_name,_date,_region": "Instead of typing, you can select name, date, region",
  "These_are_dropdown_menus": "These are dropdown menus",
  "Login": "Login",
  "When_you_see_the_Submit_button,_click_on_it": "When you see the Submit button, click on it",
  "Supervisor_and_trainer_information": "Supervisor and trainer information",
  "You_will_see_this_if_you_are_a_supervisor_or_trainer": "You will see this if you are a supervisor or trainer",
  "Is_this_you": "Is this you",
  "List_in_order": "List in order",
  "No": "No",
  "Previous": "Previous",
  "Done": "Done"
}

      const translate_tour = (tour) => { 
        const keys = Object.keys(txtLbl); 
        const values = Object.values(txtLbl); 
        tour.steps.forEach( step => { 
          step.i18n = { nextBtn: txtLbl.Next, prevBtn: txtLbl.Previous, doneBtn: txtLbl.Done }; 
          const step_title = step.title.toLowerCase().replace(/\./g,'').replace(/ /g,'_').replace(/-/g,'_'); 
          const idx_title = keys.findIndex(key => { 
            return key.toLowerCase().replace(/\./g,'').replace(/ /g,'_').replace(/-/g,'_') == step_title;
          }); 
          if (idx_title>=0) { 
            step.title = values[idx_title]; 
          } 
          const step_content = step.content.toLowerCase().replace(/\./g,'').replace(/ /g,'_').replace(/-/g,'_'); 
          const idx_content = keys.findIndex(key => { 
            return key.toLowerCase().replace(/\./g,'').replace(/ /g,'_').replace(/-/g,'_') == step_content;
          }); 
          if (idx_content>=0) { 
            step.content = values[idx_content]; 
          } 
        }); 
      }