// js/admin_camera.js の全文 (Geofencing機能付き)

// ===============================================
// 1. 位置情報設定と距離計算関数
// ===============================================

// 💡 【目標座標と許容範囲を設定】新潟情報専門学校の座標（仮）
// js/admin_camera.js の一部
const TARGET_LAT = 37.9175;     
const TARGET_LON = 139.0558;    
const ALLOWED_DISTANCE_METER = 300; // 許容距離（300メートルに修正） 👈 ここを変更
const EARTH_RADIUS_KM = 6371;
/**
 * Haversine公式による2点間（緯度/経度）の距離計算関数 (メートル単位で返す)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const toRad = (x) => x * Math.PI / 180;
    
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // 結果をメートル単位に変換して返す
    return EARTH_RADIUS_KM * c * 1000; 
}


// ===============================================
// 2. メインの出席登録関数 (位置認証チェック)
// ===============================================

function initAttendanceCheck() {
    console.log("出席登録処理を開始: まず位置情報をチェックします。");

    // ブラウザが Geolocation API に対応しているかチェック
    if (!navigator.geolocation) {
        alert("エラー: お使いのブラウザは位置情報機能に対応していません。");
        return;
    }

    // 現在の位置情報を取得
    navigator.geolocation.getCurrentPosition(
        // 成功時のコールバック関数
        (position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            
            // 目標座標とユーザーの現在地との距離を計算
            const distance = calculateDistance(
                userLat, userLon, 
                TARGET_LAT, TARGET_LON
            );

            console.log(`現在地から学校までの距離: ${distance.toFixed(2)}メートル`);

            // 距離が許容範囲内かチェック（Geofencing）
            if (distance <= ALLOWED_DISTANCE_METER) {
                alert(`位置認証OK。距離: ${distance.toFixed(1)}m。顔認証に進みます。`);
                
                // 🚨 位置認証成功時のみ、顔認証・カメラ起動処理を呼び出す
                if (typeof initCameraAndModels === 'function') {
                    initCameraAndModels(); 
                } else {
                    console.error("エラー: initCameraAndModels 関数が見つかりません。既存のカメラロジックをこの関数名で定義してください。");
                }
            } else {
                alert(`出席登録は、学校の敷地内（${ALLOWED_DISTANCE_METER}m以内）でのみ可能です。現在の距離: ${distance.toFixed(1)}m`);
            }
        },
        // 失敗時のコールバック関数 (ユーザー拒否、タイムアウトなど)
        (error) => {
            alert(`位置情報の取得に失敗しました。エラーコード: ${error.code}。位置情報へのアクセスを許可してください。`);
        },
        // オプション (高精度を要求)
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}


// ===============================================
// 3. 実行部分
// ===============================================

// attendance.html がロードされたら、自動で位置認証チェックから開始する
// 🚨 この関数が実行されることで、位置認証が開始され、成功すれば initCameraAndModels() が呼び出されます。
window.onload = initAttendanceCheck;


// ===============================================
// 4. 既存の顔認証・カメラ起動関数 (あなたの既存コードを配置する場所)
// ===============================================

/**
 * 🚨 【重要】ここに、あなたが元々持っていた顔認証モデルのロードとカメラ起動のコードを記述してください。
 * (例: faceapi.nets.tinyFaceDetector.loadFromUri('/models')... の処理)
 */
function initCameraAndModels() {
    console.log("-> 顔認証モデルのロードとカメラ起動を開始...");
    
    // 💡 あなたの既存のカメラ・顔認証ロジックをここに貼り付けてください。
    // 例:
    // const video = document.getElementById('inputVideo');
    // Promise.all([
    //     faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    //     faceapi.nets.faceLandmark68Net.loadFromUri('/models')
    // ]).then(() => {
    //     navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    //         video.srcObject = stream;
    //     });
    // });
}