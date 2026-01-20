// js/camera.js (生徒の出席登録用)
document.addEventListener('DOMContentLoaded', () => {
    if (document.title !== '出席登録') return; 

    const video = document.getElementById('video-stream');
    const captureBtn = document.getElementById('capture-btn');
    const statusMessage = document.getElementById('status-message');
    const resultMessage = document.getElementById('result-message');
    
    let stream = null; 

    // カメラの初期化
    async function initCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            video.srcObject = stream;
            
            video.onloadedmetadata = () => {
                statusMessage.textContent = 'カメラ起動中。顔を中央に合わせ、「撮影・登録」ボタンを押してください。';
                captureBtn.disabled = false;
            };

        } catch (err) {
            statusMessage.textContent = `カメラ起動エラー: ${err.name}。ブラウザの許可を確認してください。`;
            console.error('Camera init error:', err);
        }
    }

    initCamera();

    // 撮影・登録処理
    captureBtn.addEventListener('click', async () => {
        captureBtn.disabled = true;
        statusMessage.textContent = '撮影し、サーバーに送信中...';
        resultMessage.textContent = ''; 

        const canvas = document.getElementById('canvas-capture');
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageDataURL = canvas.toDataURL('image/png');

        try {
            const response = await fetch('http://localhost:3000/api/attendance/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageDataURL }),
            });
            
            const result = await response.json();

            if (response.ok && result.success) {
                resultMessage.textContent = `✅ 出席完了！ ${result.studentName}さんの出席が記録されました。`;
                resultMessage.style.color = 'green';
            } else {
                resultMessage.textContent = `❌ 認証失敗: ${result.message}`;
                resultMessage.style.color = 'red';
            }

        } catch (error) {
            resultMessage.textContent = '通信エラーが発生しました。サーバーが起動しているか確認してください。';
            resultMessage.style.color = 'red';
            console.error('Fetch Error:', error);
        }

        captureBtn.disabled = false;
    });
});