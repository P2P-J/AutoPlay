// 프로그래머스 데브코스 풀스택 8기 친구들아. 이 프로그램으로 좀 더 너희가 강의를 편하게 들을 수 있다면 좋겠어. 강의 열심히 듣고 우리 꼭 끝까지 해보자! 화이팅!!! - 보근
(function () {
  let isEnabled = true; // 확장 프로그램 활성화 상태
  let isMuted = false; // 음소거 상태
  let isRunning = false; // 스크립트 실행 상태
  let mainInterval = null; // 인터벌 ID

  console.log("🎬 AutoPlay가 시작되었습니다! - Make Aen");

  // 초기화
  init();

  function init() {
    // Chrome storage에서 설정 확인
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(["autoPlayEnabled", "soundMuted"], function (result) {
        isEnabled = result.autoPlayEnabled !== false; // 기본값 true
        isMuted = result.soundMuted === true; // 기본값 false
        console.log(`🔧 초기 설정: ${isEnabled ? "활성화" : "비활성화"}, 소리: ${isMuted ? "음소거" : "켜짐"}`);

        if (isEnabled) {
          startAutoPlay();
        }
        
        // 초기 음소거 상태 적용
        applyMuteState();
      });

      // popup으로부터 메시지 받기
      chrome.runtime.onMessage.addListener(function (
        request,
        sender,
        sendResponse
      ) {
        if (request.action === "toggle") {
          isEnabled = request.enabled;
          if (isEnabled) {
            startAutoPlay();
            console.log("✅ 자동 재생 기능이 활성화되었습니다!");
          } else {
            stopAutoPlay();
            console.log("⏹️ 자동 재생 기능이 비활성화되었습니다!");
          }
        } else if (request.action === "toggleMute") {
          isMuted = request.muted;
          applyMuteState();
          console.log(`🔊 소리 상태: ${isMuted ? "음소거" : "켜짐"}`);
        }
      });
    } else {
      // chrome 객체가 없는 경우 (콘솔에서 직접 실행)
      startAutoPlay();
    }
  }

  // 음소거 상태 적용
  function applyMuteState() {
    const video = document.querySelector("video");
    if (video) {
      video.muted = isMuted;
      console.log(`🔊 비디오 음소거 상태: ${isMuted ? "음소거됨" : "소리 켜짐"}`);
    }
  }

  function startAutoPlay() {
    if (isRunning) return; // 이미 실행 중이면 중복 실행 방지

    isRunning = true;
    console.log("🚀 자동 재생 시작");

    // 영상 자동 재생 함수
    function autoPlayVideo() {
      if (!isEnabled || !isRunning) return; // 비활성화되면 중단

      const video = document.querySelector("video");
      if (video) {
        // 음소거 상태 적용
        video.muted = isMuted;

        // 영상이 일시정지 상태라면 재생
        if (video.paused) {
          video.play().catch((e) => {
            console.log("⚠️ 자동 재생 실패 (브라우저 정책): ", e.message);
            console.log("💡 페이지를 한 번 클릭하면 자동 재생이 활성화됩니다.");
          });
        }

        // 재생 버튼도 찾아서 클릭
        const playButtons = [
          ...document.querySelectorAll('[class*="play"]'),
          ...document.querySelectorAll('[id*="play"]'),
          ...Array.from(document.querySelectorAll("button")).filter(
            (btn) =>
              btn.textContent.includes("재생") ||
              btn.textContent.includes("Play") ||
              btn.innerHTML.includes("play")
          ),
        ];

        for (let playBtn of playButtons) {
          if (playBtn && playBtn.offsetParent !== null && !playBtn.disabled) {
            playBtn.click();
            break;
          }
        }
      }
    }

    // 다음 강의 버튼 찾기 함수
    function findNextButton() {
      const buttonSelectors = [
        // 텍스트로 찾기
        ...Array.from(document.querySelectorAll("button, a")).filter(
          (el) =>
            el.textContent.includes("다음 강의 보기") ||
            el.textContent.includes("다음 강의") ||
            el.textContent.includes("Next") ||
            el.textContent.includes("계속") ||
            el.textContent.includes("Continue")
        ),
        // 클래스명으로 찾기
        ...document.querySelectorAll('[class*="next"]'),
        ...document.querySelectorAll('[class*="continue"]'),
        ...document.querySelectorAll('[id*="next"]'),
        ...document.querySelectorAll('[data-*="next"]'),
      ];

      return buttonSelectors.find(
        (button) => button && button.offsetParent !== null && !button.disabled
      );
    }

    // 메인 체크 함수
    function checkAndProcess() {
      if (!isEnabled || !isRunning) return; // 비활성화되면 중단

      const video = document.querySelector("video");

      // 음소거 상태 지속적으로 적용 (사이트에서 변경할 수 있으므로)
      if (video) {
        video.muted = isMuted;
      }

      // 영상이 있고 끝났다면
      if (video && video.ended) {
        const nextButton = findNextButton();
        if (nextButton) {
          nextButton.click();

          // 페이지 이동 후 영상 재생 대기
          setTimeout(() => {
            if (!isEnabled || !isRunning) return; // 여전히 활성화되어 있는지 확인

            autoPlayVideo();

            // 추가로 몇 번 더 시도 (로딩 시간 고려)
            setTimeout(() => isEnabled && isRunning && autoPlayVideo(), 2000);
            setTimeout(() => isEnabled && isRunning && autoPlayVideo(), 4000);
            setTimeout(() => isEnabled && isRunning && autoPlayVideo(), 6000);
          }, 3000);
        }
      }

      // 현재 영상이 일시정지 상태라면 재생 시도
      if (video && video.paused && video.currentTime > 0) {
        setTimeout(() => {
          if (isEnabled && isRunning) autoPlayVideo();
        }, 1000);
      }
    }

    // 페이지 변화 감지 (SPA 대응)
    let currentUrl = location.href;
    function detectPageChange() {
      if (!isEnabled || !isRunning) return; // 비활성화되면 중단

      if (location.href !== currentUrl) {
        currentUrl = location.href;
        console.log("🌐 페이지가 변경되었습니다. 새 영상을 찾는 중...");

        setTimeout(() => {
          if (!isEnabled || !isRunning) return;

          autoPlayVideo();
          setTimeout(() => isEnabled && isRunning && autoPlayVideo(), 2000);
        }, 2000);
      }
    }

    // 기존 인터벌이 있으면 제거
    if (mainInterval) {
      clearInterval(mainInterval);
      mainInterval = null;
    }

    // 정기적 체크 시작
    mainInterval = setInterval(() => {
      if (!isEnabled || !isRunning) {
        // 비활성화되면 인터벌 중단
        clearInterval(mainInterval);
        mainInterval = null;
        return;
      }
      checkAndProcess();
      detectPageChange();
    }, 3000);

    // 초기 영상 재생 시도
    setTimeout(() => {
      if (isEnabled && isRunning) autoPlayVideo();
    }, 2000);
  }

  function stopAutoPlay() {
    isRunning = false;

    if (mainInterval) {
      clearInterval(mainInterval);
      mainInterval = null;
    }
  }
})();

/* 혹여 이런 오류가 뜬다면 무시해도 괜찮소!
'fb3b40a68c6f4ebed8dc.js:2 Error processing XMLHttpRequest response: InvalidStateError: Failed to read the 'responseText' property from 'XMLHttpRequest': The value is only accessible if the object's 'responseType' is '' or 'text' (was 'arraybuffer').
    at XMLHttpRequest.<anonymous> (inspector.js:7:2902)
    at XMLHttpRequest.o (fb3b40a68c6f4ebed8dc.js:2:1075900)'

    이 오류는 웹 개발자 도구에서 발생하는 내부적인 오류라서, AutoPlay와는 관련이 없어용(무시해도 괜춘!)
*/