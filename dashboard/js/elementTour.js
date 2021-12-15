// Element tour
var elementTour = {
  id: "element-tour",
  steps: [
    {
      title: "Dropdown menu",
      content: "Click here to see the CETA elements",
      target: "elements_dropdown_button",
      placement: "right",
      onNext: function() {
        $('#menu_elements').addClass("show");
        $('.btn-group').addClass("show");
        // $(document).on("click", function(e) { // cleanup any dropdowns that are left open
        //   var $trigger = $(".dropdown-toggle");
        //   if ($trigger !== e.target && !$trigger.has(event.target).length) {
        //     $(".dropdown-menu").removeClass("show");
        //   }
        // });
      }
    },
    {
      title: "If you select an element",
      target: "dropdown_1",
      content: "The card will turn green",
      placement: "right",
      onNext: function() {
        $('#menu_elements').removeClass("show");
        $('.btn-group').removeClass("show");
      },
      onClose: function() {
        $('#menu_elements').removeClass("show");
        $('.btn-group').removeClass("show");
      },
      onEnd: function() {
        $('#menu_elements').removeClass("show");
        $('.btn-group').removeClass("show");
      },
      onError: function() {
        $('#menu_elements').removeClass("show");
        $('.btn-group').removeClass("show");
      }
    },
    {
      title: "Supervisor elements",
      content: "Supervisors will see another dropdown menu here",
      target: "elements_dropdown_button",
      placement: "bottom",
      xOffset: "100px",
    },
  ],
  showCloseButton: true,
}

translate_tour(elementTour);