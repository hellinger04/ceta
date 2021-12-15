// Element tour
//   Must be at the end because of jQuery
var loginTour = {
  id: "login-tour",
  steps: [
    {
      title: "User name",
      content: "Type your user name (click on x to stop these messages)",
      target: "userName",
      placement: "right",
      xOffset: Math.round(-$('#userName').width()/2).toString() + "px",
    },
    {
      title: "Instead of typing, you can select name, date, region",
      target: "NameInfoButton",
      content: "These are dropdown menus",
      placement: "bottom",
    },
    {
      title: "Login",
      content: "When you see the Submit button, click on it",
      target: 'NameInfoButton',
      placement: "bottom",
      yOffset: "60px",
    },
    {
      title: "Supervisor and trainer information",
      content: "You will see this if you are a supervisor or trainer",
      target: 'RegionInfoButton',
      placement: "bottom",
      yOffset: "60px",
    }
  ],
  showCloseButton: true,
}

translate_tour(loginTour);