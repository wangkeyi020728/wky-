// 认证服务相关功能
const API_URL = 'http://localhost:3000/api';

// 在页面加载时检查登录状态
window.addEventListener('DOMContentLoaded', () => {
    console.log("DOM加载完成，检查登录状态");
    const token = localStorage.getItem('token');
    if (token) {
        document.getElementById('loginBtn').textContent = '👤 退出';
        document.getElementById('loginBtn').onclick = handleLogout;
    } else {
        // 如果没有登录，显示登录框并禁用所有功能
        toggleAuthModal(true);
        disableAllTools(true);
    }
});

// 切换登录模态框显示状态
function toggleAuthModal(show) {
    console.log("切换登录框显示:", show);
    const modal = document.getElementById('authModal');
    modal.style.display = show ? 'flex' : 'none';
    
    // 禁用或启用所有工具
    disableAllTools(show);
}

// 禁用所有工具按钮
function disableAllTools(disable) {
    // 禁用所有工具按钮
    const buttons = document.querySelectorAll('.tool-btn');
    buttons.forEach(btn => {
        if (btn.id !== 'loginBtn') { // 不禁用登录按钮
            btn.disabled = disable;
            if (disable) {
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            } else {
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            }
        }
    });
}

// 检查登录状态
function checkLoginStatus() {
    // 直接返回，不做任何检查
    return;
}

function handleLogin() {
    // 直接返回，不做任何处理
    return;
}

function handleLogout() {
    // 直接返回，不做任何处理
    return;
}

function toggleAuthModal(show) {
    // 直接隐藏模态框
    const modal = document.getElementById('authModal');
    modal.style.display = 'none';
}

// 处理注册请求
async function handleRegister() {
    console.log("处理注册请求");
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('用户名和密码不能为空');
        return;
    }

    if (username.length < 3) {
        alert('用户名至少需要3个字符');
        return;
    }

    if (password.length < 6) {
        alert('密码至少需要6个字符');
        return;
    }

    try {
        console.log("发送注册请求");
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log("注册响应:", data);
        
        if (data.success) {
            alert('注册成功！请登录');
            document.getElementById('username').value = username;
            // 不自动登录，让用户手动点击登录按钮
        } else {
            alert('注册失败：' + data.message);
        }
    } catch (error) {
        console.error('注册请求出错:', error);
        alert('注册失败：' + error.message);
    }
}

// 处理退出登录
function handleLogout() {
    console.log("处理退出登录");
    localStorage.removeItem('token');
    document.getElementById('loginBtn').textContent = '👤 登录';
    document.getElementById('loginBtn').onclick = checkLoginStatus;
    toggleAuthModal(true);
    alert('已退出登录');
}

// 确保关闭按钮可以正常工作
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.querySelector('.auth-content h3 span');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => toggleAuthModal(false));
    }
});