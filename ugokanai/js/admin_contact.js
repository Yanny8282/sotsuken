// js/admin_contact.js

async function sendContact() {
    const title = document.getElementById('contact-title').value;
    const message = document.getElementById('contact-message').value;
    const resultMessage = document.getElementById('contact-result');

    if (!title || !message) {
        resultMessage.textContent = 'タイトルと連絡内容をすべて入力してください。';
        resultMessage.style.color = 'red';
        return;
    }

    resultMessage.textContent = '連絡事項をサーバーに送信中...';
    resultMessage.style.color = 'black';
    
    try {
        // 💡 サーバーAPIへPOST送信 💡
        const response = await fetch('http://localhost:3000/api/admin/contact/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, message })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            resultMessage.textContent = `✅ 連絡事項「${title}」を正常に登録しました。`;
            resultMessage.style.color = 'green';
            document.getElementById('contact-form').reset();
        } else {
            resultMessage.textContent = `❌ 登録失敗: ${result.message}`;
            resultMessage.style.color = 'red';
        }

    } catch (error) {
        resultMessage.textContent = '通信エラーが発生しました。サーバーが起動しているか確認してください。';
        resultMessage.style.color = 'red';
        console.error('Fetch Error:', error);
    }
}