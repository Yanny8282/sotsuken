// js/admin_display.js

document.addEventListener('DOMContentLoaded', () => {
    if (document.title !== '管理者用表示機能') return;

    fetchStudentList();
});

// ----------------------------------------------------
// 💡 APIから生徒リストを取得
// ----------------------------------------------------
async function fetchStudentList() {
    const status = document.getElementById('display-status');
    status.textContent = '生徒リストを読み込み中...';
    
    try {
        // 💡 サーバーで生徒リストのAPIエンドポイントが必要です 💡
        const response = await fetch('http://localhost:3000/api/admin/students'); 
        const data = await response.json();

        if (response.ok && data.success) {
            renderTable(data.students); 
            status.textContent = `${data.students.length} 名の生徒が登録されています。`;
        } else {
            status.textContent = `❌ データの取得に失敗しました: ${data.message}`;
        }

    } catch (error) {
        status.textContent = '❌ 通信エラーが発生しました。サーバーが起動しているか確認してください。';
        console.error('Fetch Error:', error);
    }
}

// ----------------------------------------------------
// 💡 テーブルレンダリング関数
// ----------------------------------------------------
function renderTable(students) {
    const tableBody = document.querySelector('#student-list-table tbody');
    tableBody.innerHTML = ''; 
    
    if (students.length === 0) {
        const row = tableBody.insertRow();
        row.innerHTML = '<td colspan="3">登録されている生徒はいません。</td>';
        return;
    }

    students.forEach(student => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = student.studentId;
        row.insertCell().textContent = student.studentName;
        // 顔写真の有無で登録状況を表示（サーバー実装依存）
        row.insertCell().textContent = student.faceRegistered ? '登録済み' : '未登録'; 
    });
}