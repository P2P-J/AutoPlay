document.addEventListener("DOMContentLoaded", function () {
  const toggleSwitch = document.getElementById("toggleSwitch");
  const status = document.getElementById("status");
  const loading = document.getElementById("loading");

  console.log("AutoPlay popup이 로드되었습니다.");

  // 초기화
  init();

  function init() {
    showLoading(true);
    loadCurrentState();
    setupEventListeners();
    setTimeout(() => showLoading(false), 300);
  }

  function loadCurrentState() {
    // Chrome storage에서 현재 상태 불러오기
    chrome.storage.local.get(["autoPlayEnabled"], function (result) {
      const isEnabled = result.autoPlayEnabled !== false; // 기본값 true
      toggleSwitch.checked = isEnabled;
      updateStatus(isEnabled);

      console.log(`현재 상태: ${isEnabled ? "활성화" : "비활성화"}`);
    });
  }

  function setupEventListeners() {
    // 토글 스위치 이벤트
    toggleSwitch.addEventListener("change", handleToggleChange);

    // 키보드 단축키 (스페이스바로 토글)
    document.addEventListener("keydown", function (e) {
      if (e.code === "Space") {
        e.preventDefault();
        toggleSwitch.checked = !toggleSwitch.checked;
        handleToggleChange();
      }
    });
  }

  function handleToggleChange() {
    const isEnabled = toggleSwitch.checked;

    console.log(`상태 변경: ${isEnabled ? "활성화" : "비활성화"}`);

    // 로딩 표시
    showLoading(true);

    // 상태 저장
    chrome.storage.local.set({ autoPlayEnabled: isEnabled }, function () {
      console.log("설정이 저장되었습니다.");

      // 현재 탭에 메시지 전송
      sendMessageToCurrentTab(isEnabled);

      // UI 업데이트
      updateStatus(isEnabled);

      // 피드백 효과
      addFeedbackEffect(isEnabled);

      // 로딩 숨김
      setTimeout(() => showLoading(false), 500);
    });
  }

  function sendMessageToCurrentTab(isEnabled) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: "toggle",
            enabled: isEnabled,
          },
          function (response) {
            if (chrome.runtime.lastError) {
              // 메시지 전송 실패 시 (페이지가 지원하지 않는 경우)
              console.log(
                "메시지 전송 결과:",
                chrome.runtime.lastError.message
              );
            } else {
              console.log("메시지가 성공적으로 전송되었습니다.");
            }
          }
        );
      }
    });
  }

  function updateStatus(isEnabled) {
    if (isEnabled) {
      status.textContent = "✅ 활성화됨 - 자동 재생 준비 완료";
      status.className = "status active";
    } else {
      status.textContent = "⏹️ 비활성화됨 - 수동 모드";
      status.className = "status inactive";
    }
  }

  function showLoading(show) {
    loading.style.display = show ? "block" : "none";
  }

  function addFeedbackEffect(isEnabled) {
    // 상태 표시에 펄스 효과 추가
    status.classList.add("pulse");
    setTimeout(() => status.classList.remove("pulse"), 1500);

    // 콘솔에 상태 로그
    if (isEnabled) {
      console.log("🎬 자동 강의 재생이 활성화되었습니다!");
      console.log("📋 기능: 영상 종료 감지 → 다음 강의 이동 → 자동 재생");
    } else {
      console.log("⏸️ 자동 강의 재생이 비활성화되었습니다.");
      console.log("🎯 영상을 일시정지해도 자동 재생되지 않습니다.");
    }
  }

  // 스토리지 변경 감지 (다른 탭에서 변경된 경우)
  chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (areaName === "local" && changes.autoPlayEnabled) {
      const newValue = changes.autoPlayEnabled.newValue;
      toggleSwitch.checked = newValue;
      updateStatus(newValue);
      console.log(
        `다른 탭에서 상태가 변경됨: ${newValue ? "활성화" : "비활성화"}`
      );
    }
  });

  // 현재 탭 정보 확인 (디버그용)
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0]) {
      const url = tabs[0].url;
      const isVideoSite = checkIfVideoSite(url);

      if (isVideoSite) {
        console.log(`🎯 강의 사이트 감지됨: ${url}`);
      } else {
        console.log(`ℹ️ 현재 탭: ${url}`);
      }
    }
  });

  function checkIfVideoSite(url) {
    const videoSitePatterns = [
      "youtube.com",
      "vimeo.com",
      "coursera.org",
      "udemy.com",
      "edx.org",
      "khan",
      "lecture",
      "course",
      "edu",
      "class",
      "inflearn",
      "programmers",
      "elice",
      "goorm",
      "fastcampus",
    ];

    return videoSitePatterns.some((pattern) =>
      url.toLowerCase().includes(pattern)
    );
  }

  // 에러 처리
  window.addEventListener("error", function (e) {
    console.error("Popup 에러:", e.error);
  });

  // 디버그 정보 (개발 시에만)
  const DEBUG = false;
  if (DEBUG) {
    console.log("🔧 디버그 모드 활성화");
    console.log("📊 브라우저 정보:", navigator.userAgent);

    // 확장 프로그램 정보
    if (chrome.runtime && chrome.runtime.getManifest) {
      const manifest = chrome.runtime.getManifest();
      console.log("📋 확장 프로그램 정보:", {
        name: manifest.name,
        version: manifest.version,
      });
    }
  }
});
