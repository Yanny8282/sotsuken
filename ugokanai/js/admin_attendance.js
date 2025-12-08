// js/admin_attendance.js
let allRecords = []; // 全ての記録を保持するためのグローバル変数

document.addEventListener('DOMContentLoaded', () => {
    if (document.title !== '出席管理') return;

    fetchAttendanceRecords();
});

// ----------------------------------------------------
// 💡 APIから記録を取得し、グローバル変数に保存
// ----------------------------------------------------
async function fetchAttendanceRecords() {
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = '出席記録を読み込み中...';
    
    try {
        const response = await fetch('http://localhost:3000/api/attendance/records');
        const data = await response.json();

        if (response.ok && data.success) {
            allRecords = data.records; // 全ての記録を保存
            renderTable(allRecords); // 全て表示
            statusMessage.textContent = `全 ${data.records.length} 件の記録を表示中。`;
        } else {
            statusMessage.textContent = `❌ データの取得に失敗しました: ${data.message}`;
        }

    } catch (error) {
        statusMessage.textContent = '❌ 通信エラーが発生しました。サーバーが起動しているか確認してください。';
        console.error('Fetch Error:', error);
    }
}

// ----------------------------------------------------
// 💡 テーブルレンダリング関数
// ----------------------------------------------------
function renderTable(records) {
    const tableBody = document.querySelector('#attendance-table tbody');
    tableBody.innerHTML = ''; // 既存の行をクリア
    
    if (records.length === 0) {
        const row = tableBody.insertRow();
        row.innerHTML = '<td colspan="3">該当する記録はありません。</td>';
        return;
    }

    records.forEach(record => {
        const row = tableBody.insertRow();
        
        const date = new Date(record.timestamp);
        const formattedTime = date.toLocaleString('ja-JP', { 
            year: 'numeric', month: '2-digit', day: '2-digit', 
            hour: '2-digit', minute: '2-digit', second: '2-digit' 
        });

        row.insertCell().textContent = record.studentId;
        row.insertCell().textContent = record.studentName;
        row.insertCell().textContent = formattedTime;
    });
}


// ----------------------------------------------------
// 💡 検索＆日付フィルタリングロジック
// ----------------------------------------------------
function filterRecords() {
    const searchInput = document.getElementById('search-input');
    const dateInput = document.getElementById('date-input'); 
    
    const searchTerm = searchInput.value.toLowerCase(); 
    const selectedDate = dateInput.value; // 'YYYY-MM-DD' 形式の文字列
    
    // 検索語句と日付の両方でフィルタリング
    const filtered = allRecords.filter(record => {
        const studentId = record.studentId.toLowerCase();
        const studentName = record.studentName.toLowerCase();
        
        // 1. 検索語句によるフィルタリングチェック
        const matchesSearchTerm = studentId.includes(searchTerm) || studentName.includes(searchTerm);
        
        // 2. 日付によるフィルタリングチェック
        // selectedDateが空でない場合のみ、日付を比較する
        const recordDate = record.timestamp.substring(0, 10); // 記録のタイムスタンプから 'YYYY-MM-DD' を抽出
        const matchesDate = !selectedDate || recordDate === selectedDate; 
        
        // 両方の条件に一致する場合のみ true を返す
        return matchesSearchTerm && matchesDate;
    });

    renderTable(filtered); // フィルタリングされた記録でテーブルを再描画
    
    // ステータスメッセージを更新
    document.getElementById('status-message').textContent = 
        `${filtered.length} 件 / 全 ${allRecords.length} 件の記録を表示中。`;
}