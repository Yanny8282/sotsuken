// server.js
const fs = require('fs'); // ファイルシステムモジュール
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// データファイル名
const STUDENTS_FILE = 'students.json';
const ATTENDANCE_FILE = 'attendance.json';
const CONTACTS_FILE = 'contacts.json'; // 💡 新しいファイル名

// ミドルウェアの設定
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // 画像データ対応のためリミットを増加
app.use(express.static('.')); // フロントエンドファイル（HTML/CSS/JS/models）を公開

// ----------------------------------------------------------------------
// 💡 データファイルの初期化関数 (contacts.jsonを追加)
// ----------------------------------------------------------------------

function initializeDataFiles() {
    // 1. students.json の初期化
    if (!fs.existsSync(STUDENTS_FILE)) {
        const initialStudents = {
            students: [
                { studentId: "S001", studentName: "山田太郎", faceRegistered: true },
                { studentId: "S002", studentName: "佐藤花子", faceRegistered: true },
                { studentId: "S003", studentName: "田中一郎", faceRegistered: false }
            ]
        };
        fs.writeFileSync(STUDENTS_FILE, JSON.stringify(initialStudents, null, 2));
    }

    // 2. attendance.json の初期化
    if (!fs.existsSync(ATTENDANCE_FILE)) {
        const initialAttendance = { attendance: [] };
        fs.writeFileSync(ATTENDANCE_FILE, JSON.stringify(initialAttendance, null, 2));
    }
    
    // 3. contacts.json の初期化 💡 新規追加
    if (!fs.existsSync(CONTACTS_FILE)) {
        const initialData = {
            contacts: [
                { id: 1, title: "期末試験の時間割について", message: "詳細は添付ファイルを確認してください。", timestamp: new Date(Date.now() - 86400000).toISOString() }, // 1日前のデータ
                { id: 2, title: "冬季休業中の注意事項", message: "安全に注意して過ごしましょう。", timestamp: new Date().toISOString() }
            ]
        };
        fs.writeFileSync(CONTACTS_FILE, JSON.stringify(initialData, null, 2));
    }
}
initializeDataFiles();

// ----------------------------------------------------------------------
// 🎯 APIエンドポイント (GET リクエスト)
// ----------------------------------------------------------------------

// 出席記録の取得
app.get('/api/attendance/records', (req, res) => {
    try {
        const data = fs.readFileSync(ATTENDANCE_FILE);
        const attendance = JSON.parse(data);
        res.json({ success: true, records: attendance.attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: '出席記録の読み込みに失敗しました。' });
    }
});

// 登録済み生徒リストの取得
app.get('/api/admin/students', (req, res) => {
    try {
        const data = fs.readFileSync(STUDENTS_FILE);
        const students = JSON.parse(data);
        res.json({ success: true, students: students.students });
    } catch (error) {
        res.status(500).json({ success: false, message: '生徒リストの読み込みに失敗しました。' });
    }
});

// 💡 D. 生徒用APIエンドポイントの追加 (GET) 💡
app.get('/api/student/contacts', (req, res) => {
    try {
        if (!fs.existsSync(CONTACTS_FILE)) {
            initializeDataFiles(); // ファイルがない場合は初期化
        }
        
        const data = fs.readFileSync(CONTACTS_FILE);
        const contactsData = JSON.parse(data);
        
        // 新しいものから順に返す
        const sortedContacts = contactsData.contacts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({ success: true, contacts: sortedContacts });
    } catch (error) {
        console.error('連絡事項の読み込みエラー:', error);
        res.status(500).json({ success: false, message: 'サーバーでの読み込み処理に失敗しました。' });
    }
});


// ----------------------------------------------------------------------
// 🎯 APIエンドポイント (POST リクエスト)
// ----------------------------------------------------------------------

// 出席登録
app.post('/api/attendance/register', (req, res) => {
    // ... (既存の出席登録ロジックは省略) ...
    // 現在はランダムな生徒でダミーの認証成功をシミュレート
    
    try {
        const studentsData = JSON.parse(fs.readFileSync(STUDENTS_FILE));
        const registeredStudents = studentsData.students.filter(s => s.faceRegistered);
        
        if (registeredStudents.length === 0) {
            return res.json({ success: false, message: '登録済み生徒がいません。' });
        }

        // ダミー認証成功 (ランダムな生徒を選択)
        const authenticatedStudent = registeredStudents[Math.floor(Math.random() * registeredStudents.length)];
        
        // 記録の保存
        const attendanceData = JSON.parse(fs.readFileSync(ATTENDANCE_FILE));
        const newRecord = {
            studentId: authenticatedStudent.studentId,
            studentName: authenticatedStudent.studentName,
            timestamp: new Date().toISOString()
        };
        attendanceData.attendance.push(newRecord);
        fs.writeFileSync(ATTENDANCE_FILE, JSON.stringify(attendanceData, null, 2));

        res.json({ success: true, message: `${authenticatedStudent.studentName}さんの出席を記録しました。` });

    } catch (error) {
        console.error('Attendance Error:', error);
        res.status(500).json({ success: false, message: 'サーバーエラー。' });
    }
});

// 生徒登録
app.post('/api/admin/student/register', (req, res) => {
    // ... (既存の生徒登録ロジックは省略) ...
    const { studentId, studentName, image } = req.body;
    
    // 画像は実際にはここで保存・解析されるが、今回はシミュレーション
    try {
        const studentsData = JSON.parse(fs.readFileSync(STUDENTS_FILE));
        let studentFound = false;

        const updatedStudents = studentsData.students.map(s => {
            if (s.studentId === studentId) {
                s.studentName = studentName;
                s.faceRegistered = true; // 顔写真を登録したとマーク
                studentFound = true;
            }
            return s;
        });

        if (!studentFound) {
            updatedStudents.push({ studentId, studentName, faceRegistered: true });
        }

        fs.writeFileSync(STUDENTS_FILE, JSON.stringify({ students: updatedStudents }, null, 2));
        res.json({ success: true, message: '生徒情報と顔写真を登録しました。' });

    } catch (error) {
        res.status(500).json({ success: false, message: '生徒登録に失敗しました。' });
    }
});

// 💡 C. 管理者用APIエンドポイントの追加 (POST) 💡
app.post('/api/admin/contact/register', (req, res) => {
    const { title, message } = req.body;
    
    if (!title || !message) {
        return res.status(400).json({ success: false, message: 'タイトルとメッセージは必須です。' });
    }

    try {
        // 1. ファイルから既存データを読み込み
        const data = fs.readFileSync(CONTACTS_FILE);
        const contactsData = JSON.parse(data);

        // 2. 新しい連絡事項オブジェクトを作成
        const newContact = {
            id: contactsData.contacts.length ? contactsData.contacts[contactsData.contacts.length - 1].id + 1 : 1, // IDを自動採番
            title: title,
            message: message,
            timestamp: new Date().toISOString()
        };

        // 3. データを配列に追加
        contactsData.contacts.push(newContact);

        // 4. ファイルに書き戻す (保存)
        fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contactsData, null, 2));

        res.json({ success: true, message: '連絡事項が正常に保存されました。', contact: newContact });

    } catch (error) {
        console.error('連絡事項の保存エラー:', error);
        res.status(500).json({ success: false, message: 'サーバーでの保存処理に失敗しました。' });
    }
});


// ----------------------------------------------------------------------
// 起動
// ----------------------------------------------------------------------
app.listen(port, () => {
    console.log(`✅ サーバーが起動しました: http://localhost:${port}`);
    console.log(`フロントエンドにアクセスするには、Live Serverを使用してください。`);
});