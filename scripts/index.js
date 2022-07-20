window.addEventListener("load", (event) => {
  let Storage = {
    score1: parseInt(localStorage.getItem("score-1")) || 0,
    score2: parseInt(localStorage.getItem("score-2")) || 0,
  }

  function start() {
    drawArena()
    drawWinner()
    drawBallEffect()
    setEvents()
    loop()
  }

  function drawArena() {
    $("<div/>", { id: "pong-game" }).css(CSS.arena).appendTo("body")
    $("<div/>", { id: "pong-line" }).css(CSS.line).appendTo("#pong-game")
    $("<div/>", { id: "pong-ball" }).css(CSS.ball).appendTo("#pong-game")
    $("<div/>", { id: "stick-1" })
      .css($.extend(CSS.stick1, CSS.stick))
      .appendTo("#pong-game")
    $("<div/>", { id: "stick-2" })
      .css($.extend(CSS.stick2, CSS.stick))
      .appendTo("#pong-game")
    $("<div/>", { id: "score-1" })
      .css($.extend(CSS.score1, CSS.scoreTable))
      .appendTo("#pong-game")
    $("<div/>", { id: "score-2" })
      .css($.extend(CSS.score2, CSS.scoreTable))
      .appendTo("#pong-game")
    $("<div/>", { id: "pong-menu" }).css(CSS.menu).appendTo("#pong-game")
    $("<button/>", { id: "2players" })
      .css(CSS.menuButton)
      .appendTo("#pong-menu")
      .html("TWO PLAYERS")
      .attr("game-mode", "2players")
    $("<button/>", { id: "1player" })
      .css(CSS.menuButton)
      .appendTo("#pong-menu")
      .html("SINGLE PLAYER")
      .attr("game-mode", "1player")
    $("<button/>", { id: "cpu2cpu" })
      .css(CSS.menuButton)
      .appendTo("#pong-menu")
      .html("TWO CPU")
      .attr("game-mode", "cpu2cpu")
  }

  function drawWinner() {
    $("<div/>", { id: "pong-winner" }).css(CSS.winner).appendTo("#pong-game")
    $("<div/>", { id: "text-area" })
      .css(CSS.winnerText)
      .appendTo("#pong-winner")
    $("<button/>", { id: "play-again" })
      .css(CSS.winnerButton)
      .appendTo("#pong-winner")
      .html("PLAY AGAIN")

    $("#play-again").hover(function () {
      $(this).css({ backgroundColor: "#81C14B", color: "#fff" })
    })

    $("#play-again").mouseleave(function () {
      $(this).css({ backgroundColor: "#fff", color: "#000" })
    })

    $("#play-again").click(function () {
      $("#pong-winner").hide()

      winner_text_size = 0
      Storage.score2 = 0
      Storage.score1 = 0

      showScores()
      setEvents()
      loop()
    })
  }

  function showScores() {
    $("#score-1").html(Storage.score1)
    $("#score-2").html(Storage.score2)
  }

  function setEvents() {
    $("#pong-menu > button").click(function () {
      CONSTS.game_mode = $(this).attr("game-mode")

      roll()

      $("#pong-menu").hide()
    })

    $("#pong-menu > button").hover(function () {
      $(this).css({ backgroundColor: "#81C14B", color: "#fff" })
    })

    $("#pong-menu > button").mouseleave(function () {
      $(this).css({ backgroundColor: "#000", color: "#fff" })
    })

    $(document).on("keydown", function (e) {
      switch (e.keyCode) {
        case 87:
          CONSTS.stick1Speed = -10
          break
        case 83:
          CONSTS.stick1Speed = 10
          break
        case 38:
          CONSTS.stick2Speed = -10
          break
        case 40:
          CONSTS.stick2Speed = 10
          break
        case 80:
          CONSTS.paused ? loop() : clearInterval(window.gameLoop)
          CONSTS.paused = !CONSTS.paused
          break
        case 32:
          CONSTS.ballCount++

          $("<div/>", { id: "pong-ball" + CONSTS.ballCount })
            .css(CSS.ball)
            .appendTo("#pong-game")
          break
        default:
      }
    })

    $(document).on("keyup", function (e) {
      switch (e.keyCode) {
        case 87:
          CONSTS.stick1Speed = 0
          break
        case 83:
          CONSTS.stick1Speed = 0
          break
        case 38:
          CONSTS.stick2Speed = 0
          break
        case 40:
          CONSTS.stick2Speed = 0
      }
    })
  }

  function loop() {
    window.gameLoop = setInterval(gameStart, CONSTS.gameSpeed)
  }

  function gameStart() {
    stickControl()
    ballControl()
    showScores()

    if (CONSTS.game_mode === "cpu2cpu") {
      if (CONSTS.ballTopSpeed < 0) {
        CONSTS.stick1Speed = -4
        CONSTS.stick2Speed = 6
      } else {
        CONSTS.stick1Speed = 6
        CONSTS.stick2Speed = -4
      }
    } else if (CONSTS.game_mode === "1player") {
      if (CONSTS.ballTopSpeed < 0) {
        CONSTS.stick2Speed = -4
      } else {
        CONSTS.stick2Speed = 4
      }
    }

    $("#pong-winner").hide()

    if (Storage.score1 >= 5 || Storage.score2 >= 5) {
      winner()
    }
  }

  function stickControl() {
    CSS.stick1.top += CONSTS.stick1Speed
    $("#stick-1").css("top", CSS.stick1.top)

    CSS.stick2.top += CONSTS.stick2Speed
    $("#stick-2").css("top", CSS.stick2.top)

    if (CSS.stick1.top <= 1) CSS.stick1.top = 1

    if (CSS.stick2.top <= 1) CSS.stick2.top = 1

    if (CSS.stick1.top >= CSS.arena.height - CSS.stick.height)
      CSS.stick1.top = CSS.arena.height - CSS.stick.height

    if (CSS.stick2.top >= CSS.arena.height - CSS.stick.height)
      CSS.stick2.top = CSS.arena.height - CSS.stick.height

    if (CSS.ball.left <= CSS.stick.width) {
      if (
        CSS.ball.top > CSS.stick1.top &&
        CSS.ball.top < CSS.stick1.top + CSS.stick.height
      ) {
        CONSTS.ballLeftSpeed = CONSTS.ballLeftSpeed * -1
      } else {
        Storage.score2++

        localStorage.setItem("score-2", JSON.stringify(Storage.score2))

        roll()
      }
    }

    if (CSS.ball.left >= CSS.arena.width - CSS.stick.width - CSS.ball.width) {
      if (
        CSS.ball.top > CSS.stick2.top &&
        CSS.ball.top < CSS.stick2.top + CSS.stick.height
      ) {
        CONSTS.ballLeftSpeed = CONSTS.ballLeftSpeed * -1
      } else {
        Storage.score1++

        localStorage.setItem("score-1", JSON.stringify(Storage.score1))

        roll()
      }
    }
  }

  function ballControl() {
    CSS.ball.top += CONSTS.ballTopSpeed
    CSS.ball.left += CONSTS.ballLeftSpeed

    if (
      CSS.ball.top <= 0 ||
      CSS.ball.top >= CSS.arena.height - CSS.ball.height
    ) {
      CONSTS.ballTopSpeed = CONSTS.ballTopSpeed * -1
    }

    $("#pong-ball").css({ top: CSS.ball.top, left: CSS.ball.left })

    for (let pointerCount = 1; pointerCount < 7; pointerCount++) {
      $("#pointer" + pointerCount).css({
        top: CSS.ball.top,
        left: CSS.ball.left,
      })
    }
  }

  function drawBallEffect() {
    for (let pointerCount = 1; pointerCount < 7; pointerCount++) {
      $("<div/>", { id: "pointer" + pointerCount })
        .css($.extend(CSS.pointer, CSS["pointer" + pointerCount]))
        .appendTo("#pong-game")
    }
  }

  function roll() {
    CSS.ball.top = 250
    CSS.ball.left = 350

    let side = -1

    if (Math.random() < 0.5) {
      side = 1
    }

    CONSTS.ballTopSpeed = Math.random() * -2 - 3
    CONSTS.ballLeftSpeed = side * (Math.random() * 2 + 3)
  }

  function winner() {
    winnerEfect()

    Storage.score1 >= 5
      ? $("#text-area").html("PLAYER 1<br> WINNER").css(CSS.winnerText)
      : $("#text-area").html("PLAYER 2<br> WINNER").css(CSS.winnerText)

    $("#pong-winner").show()

    localStorage.removeItem("score-1")
    localStorage.removeItem("score-2")

    clearInterval(window.gameLoop)
  }

  function winnerEfect() {
    confetti({
      particleCount: 619,
      spread: 200,
      zIndex: 999,
    })

    setTimeout(() => {
      confetti.reset()
    }, 2000)
  }

  start()
})
