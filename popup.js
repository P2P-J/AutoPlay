document.addEventListener('DOMContentLoaded', function() {
    const toggleSwitch = document.getElementById('toggleSwitch');
    const status = document.getElementById('status');
    
    // 현재 상태 로드
    chrome.storage.local.get(['autoPlayEnabled'], function(result) {
        const isEnabled = result.autoPlayEnabled !== false;
        toggleSwitch.checked = isEnabled;
        updateStatus(isEnabled);
    });
    
    // 토글 스위치 이벤트
    toggleSwitch.addEventListener('change', function() {
        const isEnabled = toggleSwitch.checked;
        
        // 상태 저장
        chrome.storage.local.set({autoPlayEnabled: isEnabled});
        
        // 현재 탭에 메시지 전송
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'toggle',
                enabled: isEnabled
            });
        });
        
        updateStatus(isEnabled);
    });
    
    function updateStatus(isEnabled) {
        if (isEnabled) {
            status.textContent = '✅ 활성화됨';
            status.className = 'status active';
        } else {
            status.textContent = '⏹️ 비활성화됨';
            status.className = 'status inactive';
        }
    }
});