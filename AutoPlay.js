// 프로그래머스 데브코스 풀스택 8기 친구들아. 이 프로그램으로 좀 더 너희가 강의를 편하게 들을 수 있다면 좋겠어. 강의 열심히 듣고 우리 꼭 끝까지 해보자! 화이팅!!! - 보근
(function () {
  console.log("🎓 완전 자동화 강의 스크립트가 시작되었습니다! - Make Aen");
  console.log("📋 기능: 영상 종료 감지 → 다음 강의 이동 → 자동 재생");

  let isRunning = true;

  // 영상 자동 재생 함수
  function autoPlayVideo() {
    const video = document.querySelector("video");
    if (video) {
      // 영상이 일시정지 상태라면 재생
      if (video.paused) {
        console.log("▶️ 영상을 자동 재생합니다!");
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
          console.log("🎮 재생 버튼을 클릭합니다!");
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
    if (!isRunning) return;

    const video = document.querySelector("video");

    // 영상이 있고 끝났다면
    if (video && video.ended) {
      console.log("📺 영상이 끝났습니다!");

      const nextButton = findNextButton();
      if (nextButton) {
        console.log("🔄 다음 강의 버튼을 클릭합니다!");
        nextButton.click();

        // 페이지 이동 후 영상 재생 대기
        setTimeout(() => {
          console.log("⏳ 새 페이지 로딩 대기 중...");
          autoPlayVideo();

          // 추가로 몇 번 더 시도 (로딩 시간 고려)
          setTimeout(autoPlayVideo, 2000);
          setTimeout(autoPlayVideo, 4000);
          setTimeout(autoPlayVideo, 6000);
        }, 3000);
      } else {
        console.log("❌ 다음 강의 버튼을 찾을 수 없습니다.");
      }
    }

    // 현재 영상이 일시정지 상태라면 재생 시도
    if (video && video.paused && video.currentTime > 0) {
      setTimeout(autoPlayVideo, 1000);
    }
  }

  // 페이지 변화 감지 (SPA 대응)
  let currentUrl = location.href;
  function detectPageChange() {
    if (location.href !== currentUrl) {
      currentUrl = location.href;
      console.log("🌐 페이지가 변경되었습니다. 새 영상을 찾는 중...");

      setTimeout(() => {
        autoPlayVideo();
        setTimeout(autoPlayVideo, 2000);
      }, 2000);
    }
  }

  // 정기적 체크 시작
  const mainInterval = setInterval(() => {
    checkAndProcess();
    detectPageChange();
  }, 3000);

  // 초기 영상 재생 시도
  setTimeout(autoPlayVideo, 2000);

  // 전역 변수로 중단 함수 제공
  window.stopAutoLecture = function () {
    isRunning = false;
    clearInterval(mainInterval);
    console.log("🛑 자동 강의 스크립트가 중단되었습니다.");
  };

  console.log("✅ 완전 자동화 모드가 활성화되었습니다!");
  console.log("⏹️ 중단하려면: stopAutoLecture() 입력 또는 페이지 새로고침");
  console.log(
    "💡 팁: 브라우저 자동재생 정책으로 인해 첫 번째 영상은 수동 클릭이 필요할 수 있습니다."
  );
})();

/* 혹여 이런 오류가 뜬다면 무시해도 괜찮소!
'fb3b40a68c6f4ebed8dc.js:2 Error processing XMLHttpRequest response: InvalidStateError: Failed to read the 'responseText' property from 'XMLHttpRequest': The value is only accessible if the object's 'responseType' is '' or 'text' (was 'arraybuffer').
    at XMLHttpRequest.<anonymous> (inspector.js:7:2902)
    at XMLHttpRequest.o (fb3b40a68c6f4ebed8dc.js:2:1075900)'

    이 오류는 웹 개발자 도구에서 발생하는 내부적인 오류라서, AutoPlay와는 관련이 없어용(무시해도 괜춘!)
*/
