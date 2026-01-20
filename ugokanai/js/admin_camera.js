// js/admin_camera.js
document.addEventListener('DOMContentLoaded', () => {
    // 画面タイトルでどの画面か判断し、処理を実行
    if (document.title !== 'アカウント管理' && document.title !== '顔登録・変更') return; 

    const video = document.getElementById('reg-video-stream');
    const captureBtn = document.getElementById('reg-capture-btn');
    const statusMessage = document.getElementById('reg-status-message');
    const form = document.getElementById('student-register-form') || document.getElementById('face-manage-form'); // どちらかのフォームを取得
    const resultMessage = document.getElementById('result-message');
    
    let stream = null; 

    // ----------------------------------------------------
    // 💡 モデルの読み込みとカメラ初期化
    // ----------------------------------------------------
    async function initCameraAndModels() {
        statusMessage.textContent = 'モデルを読み込み中...';
        captureBtn.disabled = true;

        try {
            // 💡 モデルの読み込みパスを 'models' (相対パス) に変更 💡
            await faceapi.nets.tinyFaceDetector.loadFromUri('models'); 
            
            // カメラ起動
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            video.srcObject = stream;
            
            video.onloadedmetadata = () => {
                // 成功時にボタンを有効化
                statusMessage.textContent = '準備完了。顔を中央に合わせ、「撮影・登録」ボタンを押してください。';
                captureBtn.disabled = false;
            };

        } catch (err) {
            statusMessage.textContent = `❌ 初期化エラー: ${err.message} (modelsフォルダの確認やブラウザの許可を確認してください)`;
            console.error('初期化エラー:', err);
        }
    }

    initCameraAndModels(); // ページロード時に実行

    // ----------------------------------------------------
    // 💡 撮影・登録処理
    // ----------------------------------------------------
    captureBtn.addEventListener('click', async () => {
        // IDと名前は、どの画面で使われているかに応じて要素IDを切り替えて取得
        const studentId = document.getElementById('reg-student-id')?.value || document.getElementById('face-student-id')?.value;
        const studentName = document.getElementById('reg-student-name')?.value || document.getElementById('face-student-name')?.value;
        
        if (!studentId || !studentName) {
            resultMessage.textContent = '生徒IDと生徒名を入力してください。';
            resultMessage.style.color = 'red';
            return;
        }

        captureBtn.disabled = true;
        statusMessage.textContent = '撮影し、顔検出チェック中...';
        resultMessage.textContent = ''; 

        const canvas = document.getElementById('reg-canvas-capture');
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Face-api.js による顔検出処理
        const detection = await faceapi.detectSingleFace(
            video, 
            new faceapi.TinyFaceDetectorOptions()
        );

        if (!detection) {
            // ❌ 顔が検出されなかった場合
            statusMessage.textContent = '❌ エラー: 写真の中に顔が一つも検出されませんでした。顔を画面中央に近づけて再度撮影してください。';
            resultMessage.textContent = '';
            captureBtn.disabled = false;
            return; 
        }

        // ✅ 顔が検出されたのでサーバーへ送信
        statusMessage.textContent = '顔検出成功。サーバーに登録データを送信中...';
        const imageDataURL = canvas.toDataURL('image/png');

        // 💡 管理者画面 (admin_account.html) と生徒画面 (student_face_manage.html) で送信先APIを切り替える 💡
        const apiUrl = (document.title === 'アカウント管理') 
            ? 'http://localhost:3000/api/admin/student/register'
            : 'http://localhost:3000/api/student/face/update'; // 生徒用更新API（未実装）

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    studentId: studentId,
                    studentName: studentName,
                    image: imageDataURL, 
                }),
            });
            
            const result = await response.json();

            if (response.ok && result.success) {
                const successMsg = (document.title === 'アカウント管理') 
                    ? `✅ 登録成功！ 生徒: ${studentName} (${studentId}) が登録されました。`
                    : `✅ 顔写真の**変更**が成功しました。`;

                resultMessage.textContent = successMsg;
                resultMessage.style.color = 'green';
                
                // 登録成功時にフォームをクリア 
                form.reset(); 
                
            } else {
                resultMessage.textContent = `❌ 登録失敗: ${result.message}`;
                resultMessage.style.color = 'red';
            }

        } catch (error) {
            resultMessage.textContent = '通信エラーが発生しました。サーバーを確認してください。';
            resultMessage.style.color = 'red';
            console.error('Fetch Error:', error);
        }

        captureBtn.disabled = false;
    });
});