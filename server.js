// server.js
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// ====================================================
// 💡 データ構造の定義（データベースの代わり） 💡
// ====================================================

// 1. 生徒データ (生徒のIDと名前)
const students = {
    'S001': { name: '山田 太郎', faceDescriptor: 'dummy_feature_s001' }, 
    'S002': { name: '佐藤 花子', faceDescriptor: 'dummy_feature_s002' },
    'S003': { name: '田中 一郎', faceDescriptor: 'dummy_feature_s003' }
};

// 2. 出席記録データ (ログ)
let attendanceRecords = [];

// ====================================================

// ミドルウェアの設定
app.use(bodyParser.json({ limit: '50mb' })); 

// CORS対応 (ブラウザとサーバーが異なるポートで動く場合に必要)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); 
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// ----------------------------------------------------
// 💡 出席登録APIエンドポイント (POST) 💡
// ----------------------------------------------------
app.post('/api/attendance/register', (req, res) => {
    const imageDataURL = req.body.image; 
    
    if (!imageDataURL) {
        return res.status(400).json({ success: false, message: '画像データが提供されていません。' });
    }

    const base64Data = imageDataURL.replace(/^data:image\/(png|jpeg);base64,/, '');
    
    // --- 【認証ロジックのシミュレーション】 ---
    const isAuthentic = Math.random() < 0.7; // 70%の確率で成功と仮定
    
    if (isAuthentic) {
        // 1. 現在登録されている生徒IDのリストを取得
        const studentIds = Object.keys(students);

        if (studentIds.length === 0) {
            // 登録生徒がいない場合は認証失敗として返す
            return res.json({ 
                success: false, 
                message: '認証対象の生徒が登録されていません。',
                studentName: null
            });
        }
        
        // 2. 登録されている生徒の中からランダムに認証成功した生徒を選ぶ
        const randomIndex = Math.floor(Math.random() * studentIds.length);
        const authenticatedStudentId = studentIds[randomIndex];
        
        const student = students[authenticatedStudentId];

        if (student) {
            const now = new Date();
            
            const record = {
                studentId: authenticatedStudentId,
                studentName: student.name,
                timestamp: now.toISOString(),
            };
            
            attendanceRecords.push(record);
            
            console.log(`✅ 出席記録追加: ${student.name} (${record.timestamp})`);
            
            res.json({ 
                success: true, 
                message: '出席登録が完了しました。', 
                studentName: student.name 
            });
        } else {
            res.status(500).json({ success: false, message: '内部エラー: 生徒情報が見つかりません。' });
        }
    } else {
        res.json({ 
            success: false, 
            message: '登録された生徒の顔と一致しませんでした。',
            studentName: null
        });
    }
});

// ----------------------------------------------------
// 💡 出席記録取得APIエンドポイント (GET) 💡
// ----------------------------------------------------
app.get('/api/attendance/records', (req, res) => {
    res.json({
        success: true,
        records: attendanceRecords
    });
});

// ----------------------------------------------------
// 💡 生徒登録APIエンドポイント (POST) 💡
// ----------------------------------------------------
app.post('/api/admin/student/register', (req, res) => {
    const { studentId, studentName, image } = req.body;

    if (!studentId || !studentName || !image) {
        return res.status(400).json({ success: false, message: '必須データが不足しています。' });
    }

    if (students[studentId]) {
        return res.status(409).json({ success: false, message: 'この生徒IDはすでに登録されています。' });
    }
    
    // Base64から純粋な画像データ部分を抽出
    const base64Data = image.replace(/^data:image\/(png|jpeg);base64,/, '');

    // --- 【生徒データの登録シミュレーション】 ---
    students[studentId] = { 
        name: studentName, 
        registrationDate: new Date().toISOString(),
        faceDescriptor: `dummy_feature_${studentId}` // 登録時にダミーの特徴量を保存
    };
    
    console.log(`👤 新しい生徒を登録しました: ${studentName} (${studentId})`);

    res.json({ 
        success: true, 
        message: '生徒情報と顔写真の登録が完了しました。',
        studentId: studentId
    });
});

// 静的ファイルの提供 (jsフォルダとmodelsフォルダは/js/...や/models/...でアクセス可能になる)
app.use(express.static(__dirname));

// サーバー起動
app.listen(port, () => {
    console.log(`サーバーが起動しました: http://localhost:${port}`);
});