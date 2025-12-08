// js/app.js の全文

// 💡 ログイン情報 (仮の値) - あなたの環境に合わせて必要に応じて変更してください
const VALID_STUDENT_ID = '001'; 
const VALID_STUDENT_PASS = 'studentpass';
const VALID_ADMIN_ID = 'admin';
const VALID_ADMIN_PASS = 'adminpass';

/**
 * 指定されたURLへ画面を遷移させるヘルパー関数
 */
function navigateTo(url) {
    // 🚨 修正点: 遷移しようとしているURLをコンソールに出力します
    console.log("DEBUG: 画面遷移を実行します ->", url); 
    window.location.href = url;
}

/**
 * ログインボタンクリック時に呼び出されるメイン関数
 */
function login() {
    // 必須要素の取得
    const id = document.getElementById('id').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('user-role').value;
    const messageElement = document.getElementById('message');

    // メッセージを初期化
    messageElement.textContent = '';
    messageElement.style.color = 'red'; 
    
    // ===================================
    // 1. 生徒用ログインチェック
    // ===================================
    if (role === 'student' && id === VALID_STUDENT_ID && password === VALID_STUDENT_PASS) {
        messageElement.textContent = '生徒用ログイン成功。出席登録画面へ移動します...';
        messageElement.style.color = 'green';
        
        // 🚨 生徒用の画面へ遷移
        navigateTo('attendance.html'); 
        
    } 
    // ===================================
    // 2. 管理者用ログインチェック
    // ===================================
    else if (role === 'admin' && id === VALID_ADMIN_ID && password === VALID_ADMIN_PASS) {
        messageElement.textContent = '管理者用ログイン成功。管理画面へ移動します...';
        messageElement.style.color = 'green';
        
        // 🚨 管理者用の画面へ遷移
        navigateTo('admin_menu.html'); 
    } 
    // ===================================
    // 3. 認証失敗
    // ===================================
    else {
        messageElement.textContent = 'エラー：ID、パスワード、または役割が正しくありません。';
    }
}