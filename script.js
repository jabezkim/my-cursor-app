// DOM 요소들
const timer = document.getElementById('timer');
const gameBtn = document.getElementById('gameBtn');
const result = document.getElementById('result');
const resultText = document.getElementById('resultText');
const rankingList = document.getElementById('rankingList');
const fireworksContainer = document.getElementById('fireworks');

let startTime;
let timerInterval;
let isRunning = false;
let rankings = JSON.parse(localStorage.getItem('rankings')) || [];

// 시간을 소수점 한자리까지 표시하는 함수
function formatTime(time) {
    return time.toFixed(1);
}

// 섬광 효과 생성
function createFlash() {
    const flash = document.createElement('div');
    flash.className = 'flash';
    document.body.appendChild(flash);
    
    // 섬광 애니메이션
    flash.style.animation = 'flash 0.5s ease-out';
    setTimeout(() => flash.remove(), 500);
}

// 폭죽 이미지 생성
function createFireworkImage() {
    const images = [
        '🎆', '🎇', '✨', '💫', '⭐', '🌟'
    ];
    
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const img = document.createElement('div');
            img.className = 'firework-image';
            img.textContent = images[Math.floor(Math.random() * images.length)];
            img.style.fontSize = Math.random() * 40 + 30 + 'px';
            img.style.left = Math.random() * 100 + '%';
            img.style.top = Math.random() * 100 + '%';
            fireworksContainer.appendChild(img);

            setTimeout(() => img.remove(), 2000);
        }, i * 100);
    }
}

// 폭죽 효과 생성
function createFireworks() {
    createFlash(); // 섬광 효과
    
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.left = Math.random() * 100 + '%';
            firework.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            fireworksContainer.appendChild(firework);

            setTimeout(() => firework.remove(), 2000);
        }, i * 200);
    }

    createFireworkImage(); // 폭죽 이모지 효과
}

// 게임 토글 (시작/정지)
function toggleGame() {
    if (!isRunning) {
        // 게임 시작
        startTime = Date.now();
        isRunning = true;
        gameBtn.textContent = '멈춤!';
        gameBtn.classList.add('running');
        result.classList.add('hidden');
        fireworksContainer.classList.add('hidden');
        fireworksContainer.innerHTML = '';

        // 0.1초마다 타이머 업데이트
        timerInterval = setInterval(() => {
            const currentTime = (Date.now() - startTime) / 1000;
            timer.textContent = formatTime(currentTime);
        }, 100);
    } else {
        // 게임 종료
        const endTime = (Date.now() - startTime) / 1000;
        clearInterval(timerInterval);
        isRunning = false;
        gameBtn.textContent = '시작!';
        gameBtn.classList.remove('running');

        // 결과 판정
        const timeDiff = Math.abs(7 - endTime);
        let message;
        let isSuccess = false;

        if (timeDiff === 0) {
            message = '🎉 완벽한 성공! 정확히 7초를 맞추셨습니다! 🎉';
            isSuccess = true;
        } else if (timeDiff <= 0.1) {
            message = '🎉 대성공! ' + formatTime(endTime) + '초를 기록했어요!';
            isSuccess = true;
        } else if (timeDiff <= 0.5) {
            message = '🎈 성공! ' + formatTime(endTime) + '초를 기록했어요!';
            isSuccess = true;
        } else {
            message = '❌ ' + formatTime(endTime) + '초를 기록했어요. 다시 도전해보세요!';
        }

        // 결과 표시
        resultText.textContent = message;
        result.classList.remove('hidden');

        // 성공시 폭죽 효과
        if (isSuccess) {
            fireworksContainer.classList.remove('hidden');
            createFireworks();
        }

        // 랭킹 업데이트
        updateRanking(endTime);
    }
}

// 랭킹 업데이트
function updateRanking(time) {
    const timeDiff = Math.abs(7 - time);
    rankings.push({
        time: time,
        difference: timeDiff,
        date: new Date().toLocaleDateString()
    });

    // 차이가 적은 순으로 정렬
    rankings.sort((a, b) => a.difference - b.difference);
    
    // 상위 5개만 유지
    rankings = rankings.slice(0, 5);
    
    // 로컬 스토리지에 저장
    localStorage.setItem('rankings', JSON.stringify(rankings));
    
    // 랭킹 표시
    displayRankings();
}

// 랭킹 표시
function displayRankings() {
    rankingList.innerHTML = '';
    rankings.forEach((rank, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}등: ${formatTime(rank.time)}초 (${rank.date})`;
        rankingList.appendChild(li);
    });
}

// 이벤트 리스너
gameBtn.addEventListener('click', toggleGame);

// 초기 랭킹 표시
displayRankings(); 