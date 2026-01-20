// js/app.js
function navigateTo(url) {
    window.location.href = url;
}

function login() {
    // ... (省略)
    const role = document.getElementById('user-role').value; // student または admin
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');
    
    // 管理者ログインロジック
    if (role === 'admin' && password === 'adminpass') { 
        message.textContent = '管理者ログイン成功';
        message.style.color = 'green';
        // ファイル名が admin_menu.html であることを確認してください
        navigateTo('admin_menu.html'); 
    
    // 生徒ログインロジック
    } else if (role === 'student' || password === 'studentpass') {
        // ... (省略)
        navigateTo('student_menu.html');
    } else {
    // ... (省略)
    }
}