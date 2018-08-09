var Notification = (function() {
  let queue = [];
  let notificationOpen = false;

  let displayNotification = function(options, callback) {
    if (options === undefined)
      var options = { content: "Default notification" };
    if (typeof options === "string") var options = { content: options };
    let content = options.content || "Default notification";
    let type = options.type || "secondary";
    let delay = options.delay || 0;
    let duration = options.duration || 3000;
    let animationSpeed = options.animationSpeed || 400;
    let position = options.position || "bottom-left";
    let autoHide = options.autoHide || false;

    let alert = Alert(content, type, position);
    let display = function(alert) {
      let vertPos =
        position.substring(0, 6) === "bottom" ? "margin-bottom" : "margin-top";
      alert.css({
        opacity: 0,
        [vertPos]: "-24px"
      });
      $("body").prepend(alert);
      $(document).trigger("displaying.notification");
      alert.animate(
        {
          opacity: 1,
          [vertPos]: 0
        },
        animationSpeed,
        () => {
          $(document).trigger("displayed.notification");
        }
      );
      if (autoHide) {
        setTimeout(function() {
          $(document).trigger("closing.notification");
          alert.animate(
            {
              opacity: 0
            },
            animationSpeed,
            () => {
              alert.alert("close");
            }
          );
        }, duration);
      }
      if (callback) {
        alert.on("closed.bs.alert", () => {
          $(document).trigger("closed.notification");
          callback();
        });
      } else {
        alert.on("closed.bs.alert", () => {
          $(document).trigger("closed.notification");
        });
      }
    };
    if (delay > 0) {
      setTimeout(() => {
        queue.push({ notification: alert, display: display });
      }, delay);
    } else {
      queue.push({ notification: alert, display: display });
    }
    $(document).trigger("added.notification");
  };

  $(document).on("added.notification", function() {
    if (!notificationOpen) {
      notificationOpen = true;
      let alert = queue.shift();
      alert.display(alert.notification);
    }
  });

  $(document).on("closed.notification", function() {
    notificationOpen = false;
    if (queue.length > 0) {
      notificationOpen = true;
      let alert = queue.shift();
      alert.display(alert.notification);
    }
  });

  return {
    create: displayNotification
  };

  function Alert(content, type, position) {
    let innerButton = $("<span>")
      .attr("aria-hidden", "true")
      .html("&times;");
    let closeButton = $("<button>")
      .attr("type", "button")
      .addClass("close")
      .attr("aria-label", "Close")
      .append(innerButton);
    let alert = $("<div>")
      .text(content)
      .addClass(`alert alert-${type} alert-dismissable`)
      .attr("role", "alert")
      .prepend(closeButton)
      .css({
        position: "fixed",
        width: $(window).width() < 800 ? "100%" : "25%",
        "max-width": $(window).width() < 800 ? "100%" : "25%"
      });
    alert.css(getPosition(alert, position));
    innerButton.on("click", () => {
      alert.alert("close");
    });
    return alert;
  }

  function getPosition(alert, position) {
    let padding = 12;
    let paddingPX = padding + "px";
    let posObj = {};
    if ($(window).width() >= 800) {
      if (position.substring(0, 3) === "top") posObj["top"] = paddingPX;
      else if (position.substring(0, 6) === "bottom") {
        posObj["bottom"] = paddingPX;
        posObj["margin-bottom"] = 0;
      }
      if (position.slice(-4) === "left") posObj["left"] = paddingPX;
      if (position.slice(-6) === "middle")
        posObj["left"] = $(window).width() * 0.375 + "px";
      if (position.slice(-5) === "right")
        posObj["left"] = $(window).width() * 0.75 - padding + "px";
      if (posObj.left === undefined) {
        posObj = {
          "margin-bottom": 0,
          bottom: paddingPX,
          left: paddingPX
        };
      }
    } else if (position.substring(0, 6) === "bottom") {
      posObj = {
        "margin-bottom": "0",
        bottom: "0"
      };
    }
    return posObj;
  }
})();
