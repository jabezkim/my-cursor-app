document.addEventListener('DOMContentLoaded', () => {
    const gameField = document.getElementById('gameField');
    const bow = document.getElementById('bow');
    const timerDisplay = document.getElementById('timer');
    const scoreDisplay = document.getElementById('score');
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    const result = document.getElementById('result');
    const resultText = document.getElementById('resultText');
    const ranking = document.getElementById('ranking');
    const rankingList = document.getElementById('rankingList');

    let gameActive = false;
    let score = 0;
    let timeLeft = 15;
    let timer;
    let pigIntervals = [];
    let arrows = [];

    // 랭킹 시스템
    function loadRankings() {
        const rankings = JSON.parse(localStorage.getItem('pigGameRankings') || '[]');
        return rankings;
    }

    function saveRanking(newScore) {
        let rankings = loadRankings();
        rankings.push({
            score: newScore,
            date: new Date().toLocaleDateString()
        });
        
        // 점수 내림차순으로 정렬
        rankings.sort((a, b) => b.score - a.score);
        
        // 상위 5개만 유지
        rankings = rankings.slice(0, 5);
        
        localStorage.setItem('pigGameRankings', JSON.stringify(rankings));
        return rankings;
    }

    function updateRankingDisplay(newScore) {
        const rankings = saveRanking(newScore);
        ranking.style.display = 'block';
        rankingList.innerHTML = '';
        
        rankings.forEach((rank, index) => {
            const rankItem = document.createElement('div');
            rankItem.className = 'ranking-item';
            if (rank.score === newScore) {
                rankItem.classList.add('new-record');
            }
            
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎯';
            
            rankItem.innerHTML = `
                <span class="rank">${medal} ${index + 1}위</span>
                <span class="score">${rank.score}마리 (${rank.date})</span>
            `;
            rankingList.appendChild(rankItem);
        });
    }

    // 게임 초기화
    function initGame() {
        gameActive = true;
        score = 0;
        timeLeft = 15;
        updateScore();
        updateTimer();
        startBtn.style.display = 'none';
        result.style.display = 'none';
        ranking.style.display = 'none';
        clearPigsAndArrows();
        startTimer();
        spawnPigs();
    }

    // 타이머 시작
    function startTimer() {
        timer = setInterval(() => {
            timeLeft--;
            updateTimer();
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    // 타이머 업데이트
    function updateTimer() {
        timerDisplay.textContent = `${timeLeft}초`;
    }

    // 점수 업데이트
    function updateScore() {
        scoreDisplay.textContent = `잡은 돼지: ${score}마리`;
    }

    // 게임 종료
    function endGame() {
        gameActive = false;
        clearInterval(timer);
        pigIntervals.forEach(interval => clearInterval(interval));
        pigIntervals = [];
        
        let resultMessage = '';
        if (score >= 30) {
            resultMessage = '🎉 우승! 최고의 명사수시군요! 🎉';
        } else if (score >= 20) {
            resultMessage = '👏 명사수상! 훌륭해요! 👏';
        } else {
            resultMessage = '😢 아쉽네요. 다시 도전해보세요! 😢';
        }
        
        resultText.textContent = `잡은 돼지: ${score}마리\n${resultMessage}`;
        result.style.display = 'block';
        
        // 랭킹 업데이트
        updateRankingDisplay(score);
    }

    // 돼지와 화살 제거
    function clearPigsAndArrows() {
        const pigs = document.querySelectorAll('.pig');
        const arrows = document.querySelectorAll('.arrow');
        const trails = document.querySelectorAll('.arrow-trail');
        const sparkles = document.querySelectorAll('.sparkle');
        
        pigs.forEach(pig => pig.remove());
        arrows.forEach(arrow => arrow.remove());
        trails.forEach(trail => trail.remove());
        sparkles.forEach(sparkle => sparkle.remove());
    }

    // 돼지 생성
    function spawnPigs() {
        const speeds = [5000, 4000, 3000, 2000, 1000];
        speeds.forEach(speed => {
            for (let i = 0; i < 2; i++) {
                const interval = setInterval(() => {
                    if (gameActive) {
                        createPig(speed);
                    }
                }, speed);
                pigIntervals.push(interval);
            }
        });
    }

    // 돼지 생성 함수
    function createPig(speed) {
        const pig = document.createElement('div');
        pig.className = 'pig';
        pig.textContent = '🐷';
        pig.style.top = '20%';  // 모든 돼지가 같은 높이에서 이동
        pig.style.left = '-50px';
        gameField.appendChild(pig);

        const animation = pig.animate([
            { left: '-50px' },
            { left: 'calc(100% + 50px)' }
        ], {
            duration: speed * 2,
            easing: 'linear'
        });

        animation.onfinish = () => pig.remove();
    }

    // 충돌 감지
    function checkCollision(arrow) {
        const arrowRect = arrow.getBoundingClientRect();
        const pigs = document.querySelectorAll('.pig');

        pigs.forEach(pig => {
            if (!pig.classList.contains('hit')) {  // 아직 맞지 않은 돼지만 검사
                const pigRect = pig.getBoundingClientRect();
                
                // 충돌 영역 여유 추가
                const collision = !(
                    arrowRect.right < pigRect.left + 10 || 
                    arrowRect.left > pigRect.right - 10 || 
                    arrowRect.bottom < pigRect.top + 10 || 
                    arrowRect.top > pigRect.bottom - 10
                );

                if (collision) {
                    console.log('충돌 감지!');  // 디버그 로그
                    hitPig(pig);
                }
            }
        });
    }

    // 화살 발사
    function shootArrow() {
        if (!gameActive) return;

        const arrow = document.createElement('div');
        arrow.className = 'arrow';
        arrow.textContent = '💘';
        
        // 화살이 활 위치에서 정확히 발사되도록 조정
        const bowRect = bow.getBoundingClientRect();
        const gameFieldRect = gameField.getBoundingClientRect();
        const arrowLeft = bowRect.left - gameFieldRect.left + (bowRect.width / 2) - 10;
        arrow.style.left = `${arrowLeft}px`;
        arrow.style.bottom = '30px';  // 활 바로 위에서 시작
        gameField.appendChild(arrow);

        // 화살 궤적
        const trail = document.createElement('div');
        trail.className = 'arrow-trail';
        trail.style.left = `${arrowLeft + 10}px`;
        trail.style.bottom = '30px';  // 활 바로 위에서 시작
        trail.style.width = '2px';
        gameField.appendChild(trail);

        let currentBottom = 30;
        const moveArrow = setInterval(() => {
            currentBottom += 10;
            arrow.style.bottom = `${currentBottom}px`;
            trail.style.height = `${currentBottom - 30}px`;
            
            checkCollision(arrow);
            
            if (currentBottom >= gameField.clientHeight) {
                clearInterval(moveArrow);
                arrow.remove();
                trail.remove();
            }
        }, 16);  // 약 60fps

        setTimeout(() => {
            clearInterval(moveArrow);
            arrow.remove();
            trail.remove();
        }, 1000);
    }

    // 돼지 맞춤 효과
    function hitPig(pig) {
        if (pig.classList.contains('hit')) return;
        
        console.log('돼지 맞춤!');  // 디버그 로그
        pig.classList.add('hit');
        pig.textContent = '❤️';
        
        score++;
        console.log('현재 점수:', score);  // 디버그 로그
        updateScore();
        
        // 반짝이 효과 생성
        for (let i = 0; i < 5; i++) {
            createSparkle(pig.offsetLeft, pig.offsetTop);
        }
        
        // 하트가 위로 올라가면서 사라지는 애니메이션
        const animation = pig.animate([
            { transform: 'translateY(0) scale(1)', opacity: 1 },
            { transform: 'translateY(-100px) scale(1.5)', opacity: 0 }
        ], {
            duration: 1000,
            easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
        });
        
        animation.onfinish = () => pig.remove();
    }

    // 반짝이 효과 생성
    function createSparkle(x, y) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.textContent = '💫';
        sparkle.style.left = `${x + Math.random() * 50}px`;
        sparkle.style.top = `${y + Math.random() * 50}px`;
        gameField.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 500);
    }

    // 이벤트 리스너
    bow.addEventListener('click', shootArrow);
    startBtn.addEventListener('click', initGame);
    restartBtn.addEventListener('click', initGame);
}); 