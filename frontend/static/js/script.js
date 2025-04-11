// 全局变量
let currentUser = null;
let isLoggedIn = false;
let currentDate = new Date().toISOString().split('T')[0];
let departments = [];  // 初始化为空数组，将从后端获取

// DOM元素
let dateInput;
let loginBtn;
let logoutBtn;
let manageDeptBtn;
let loginModal;
let loginForm;
let closeLoginBtn;
let userStatus;
let usernameDisplay;
let dutyTableBody;
let operationColumn;
let addDepartmentBtn;
let closeDepartmentBtn;
let editModal;
let editForm;
let closeEditBtn;
let newDepartmentInput;

// 用户管理相关变量
let userModal;
let editUserModal;
let addUserBtn;
let closeUserBtn;
let closeEditUserBtn;
let editUserForm;
let userTableBody;
let userDepartmentSelect;
let manageUserBtn;
let importBtn;
let exportBtn;
let downloadTemplateBtn;

// 模态框管理
const modals = {};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    dateInput = document.getElementById('date');
    loginBtn = document.getElementById('loginBtn');
    logoutBtn = document.getElementById('logoutBtn');
    manageDeptBtn = document.getElementById('manageDeptBtn');
    loginModal = document.getElementById('loginModal');
    loginForm = document.getElementById('loginForm');
    closeLoginBtn = document.getElementById('closeLogin');
    userStatus = document.getElementById('userStatus');
    usernameDisplay = document.getElementById('usernameDisplay');
    dutyTableBody = document.getElementById('dutyTableBody');
    operationColumn = document.querySelector('.operation-column');
    addDepartmentBtn = document.getElementById('addDepartment');
    closeDepartmentBtn = document.getElementById('closeDepartment');
    editModal = document.getElementById('editModal');
    editForm = document.getElementById('editForm');
    closeEditBtn = document.getElementById('closeEdit');
    newDepartmentInput = document.getElementById('newDepartment');

    // 用户管理相关元素
    userModal = document.getElementById('userModal');
    editUserModal = document.getElementById('editUserModal');
    addUserBtn = document.getElementById('addUserBtn');
    closeUserBtn = document.getElementById('closeUserBtn');
    closeEditUserBtn = document.getElementById('closeEditUserBtn');
    editUserForm = document.getElementById('editUserForm');
    userTableBody = document.getElementById('userTableBody');
    userDepartmentSelect = document.getElementById('userDepartment');
    manageUserBtn = document.getElementById('manageUserBtn');
    importBtn = document.getElementById('importBtn');
    exportBtn = document.getElementById('exportBtn');
    downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
    
    // 初始化模态框
    const modalIds = ['loginModal', 'departmentModal', 'editModal', 'userModal', 'editUserModal'];
    modalIds.forEach(id => {
        const modal = document.getElementById(id);
        if (modal) {
            modals[id] = modal;
        } else {
            console.warn(`模态框 ${id} 不存在`);
        }
    });
    
    // 设置日期选择器的默认值和最大值
    const today = new Date().toISOString().split('T')[0];
    if (dateInput) {
        dateInput.value = today;
    }
    
    // 初始化时隐藏所有模态框
    Object.keys(modals).forEach(modalId => {
        if (modals[modalId]) {
            modals[modalId].style.display = 'none';
        }
    });
    
    // 加载初始数据
    loadDutyInfo(today);
    loadDepartments();
    
    // 检查是否已登录
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            currentUser = {
                username: payload.sub,
                is_admin: payload.is_admin,
                department: payload.department
            };
            updateUI();
        } catch (error) {
            console.error('Token解析错误:', error);
            localStorage.removeItem('token');
        }
    }

    // 事件监听器
    if (loginBtn) loginBtn.addEventListener('click', () => showModal('loginModal'));
    if (closeLoginBtn) closeLoginBtn.addEventListener('click', () => hideModal('loginModal'));
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    if (manageDeptBtn) manageDeptBtn.addEventListener('click', () => showModal('departmentModal'));
    if (closeDepartmentBtn) closeDepartmentBtn.addEventListener('click', () => hideModal('departmentModal'));
    if (closeEditBtn) closeEditBtn.addEventListener('click', () => hideModal('editModal'));
    if (addDepartmentBtn) addDepartmentBtn.addEventListener('click', addDepartment);
    if (dateInput) {
        dateInput.addEventListener('change', function() {
            loadDutyInfo(dateInput.value);
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                const formData = new FormData();
                formData.append('username', username);
                formData.append('password', password);
                
                const response = await fetch('/token', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('token', data.access_token);
                    
                    const payload = JSON.parse(atob(data.access_token.split('.')[1]));
                    currentUser = {
                        username: payload.sub,
                        is_admin: payload.is_admin,
                        department: payload.department
                    };
                    
                    hideModal('loginModal');
                    updateUI();
                    
                    // 重新加载数据
                    const dateInputElement = document.getElementById('date');
                    if (dateInputElement) {
                        loadDutyInfo(dateInputElement.value);
                    } else {
                        // 如果找不到日期输入元素，使用当前日期
                        const today = new Date().toISOString().split('T')[0];
                        loadDutyInfo(today);
                    }
                    loadDepartments();
                } else {
                    const errorData = await response.json();
                    alert(errorData.detail || '登录失败，请检查用户名和密码');
                }
            } catch (error) {
                console.error('登录错误:', error);
                alert('登录失败，请稍后重试');
            }
        });
    }

    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                date: dateInput.value,
                department: document.getElementById('editDepartment').value,
                leader_name: document.getElementById('leaderName').value,
                leader_phone: document.getElementById('leaderPhone').value,
                manager_name: document.getElementById('managerName').value,
                manager_phone: document.getElementById('managerPhone').value,
                member_name: document.getElementById('memberName').value,
                member_phone: document.getElementById('memberPhone').value
            };

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('未登录或登录已过期');
                }

                const response = await fetch('/api/duty-info', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || '保存失败');
                }

                hideModal('editModal');
                await loadDutyInfo(dateInput.value);
                showToast('保存成功');
            } catch (error) {
                console.error('保存错误:', error);
                showToast(error.message || '保存失败，请稍后重试', 'error');
            }
        });
    }

    // 用户管理相关事件监听
    if (manageUserBtn) manageUserBtn.addEventListener('click', () => {
        showModal('userModal');
        loadUsers();
    });
    
    if (addUserBtn) addUserBtn.addEventListener('click', async () => {
        document.getElementById('editUserTitle').textContent = '添加用户';
        document.getElementById('editUsername').value = '';
        document.getElementById('newUsername').value = '';
        document.getElementById('editPassword').value = '';
        document.getElementById('userDepartment').value = '';
        document.getElementById('isAdmin').checked = false;
        
        // 加载部门列表
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('未登录');
            
            const deptResponse = await fetch('/api/departments', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!deptResponse.ok) throw new Error('获取部门列表失败');
            
            const departments = await deptResponse.json();
            const departmentSelect = document.getElementById('userDepartment');
            departmentSelect.innerHTML = '<option value="">请选择部门</option>';
            
            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept;
                option.textContent = dept;
                departmentSelect.appendChild(option);
            });
            
            showModal('editUserModal');
        } catch (error) {
            console.error('加载部门列表错误:', error);
            showToast('加载部门列表失败', 'error');
        }
    });
    
    if (closeUserBtn) closeUserBtn.addEventListener('click', () => hideModal('userModal'));
    if (closeEditUserBtn) closeEditUserBtn.addEventListener('click', () => hideModal('editUserModal'));
    
    // 为所有关闭按钮添加事件监听
    const closeButtons = document.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                hideModal(modal.id);
            }
        });
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            hideModal(e.target.id);
        }
    });
    
    if (editUserForm) {
        editUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const oldUsername = document.getElementById('editUsername').value;
            const newUsername = document.getElementById('newUsername').value;
            const password = document.getElementById('editPassword').value;
            const department = document.getElementById('userDepartment').value;
            const isAdmin = document.getElementById('isAdmin').checked;
            
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('未登录');
                
                const userData = {
                    username: newUsername,
                    department: department,
                    is_admin: isAdmin
                };
                
                // 如果输入了新密码，则添加到请求数据中
                if (password) {
                    userData.password = password;
                }
                
                // 如果是编辑现有用户
                if (oldUsername) {
                    const response = await fetch(`/api/users/${oldUsername}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(userData)
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.detail || '更新用户失败');
                    }
                    
                    hideModal('editUserModal');
                    await loadUsers();
                    showToast('更新用户成功');
                } else {
                    // 如果是添加新用户
                    if (!password) {
                        throw new Error('添加新用户时必须设置密码');
                    }
                    
                    const response = await fetch('/api/users', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(userData)
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.detail || '添加用户失败');
                    }
                    
                    hideModal('editUserModal');
                    await loadUsers();
                    showToast('添加用户成功');
                }
            } catch (error) {
                console.error('用户操作错误:', error);
                showToast(error.message, 'error');
            }
        });
    }

    // 添加个人信息按钮事件监听
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
        profileBtn.addEventListener('click', showProfile);
    }
    
    // 添加修改密码表单事件监听
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('profileNewPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // 验证新密码和确认密码是否一致
            if (newPassword !== confirmPassword) {
                showToast('新密码和确认密码不一致', 'error');
                return;
            }
            
            // 验证新密码长度
            if (newPassword.length < 6) {
                showToast('新密码长度不能少于6位', 'error');
                return;
            }
            
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('未登录');
                
                const response = await fetch('/api/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        current_password: currentPassword,
                        new_password: newPassword
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || '修改密码失败');
                }
                
                showToast('密码修改成功');
                hideModal('profileModal');
                changePasswordForm.reset();
            } catch (error) {
                console.error('修改密码错误:', error);
                showToast(error.message, 'error');
            }
        });
    }

    // 导入导出按钮事件监听
    if (importBtn) importBtn.addEventListener('click', importDutyInfo);
    if (exportBtn) exportBtn.addEventListener('click', exportDutyInfo);
    if (downloadTemplateBtn) downloadTemplateBtn.addEventListener('click', downloadTemplate);
});

// 更新UI状态
function updateUI() {
    const token = localStorage.getItem('token');
    isLoggedIn = !!token;
    
    if (isLoggedIn && !currentUser) {
        // 只有在currentUser为空时才解析token获取用户信息
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            currentUser = {
                username: payload.sub,
                is_admin: payload.is_admin,
                department: payload.department
            };
            console.log('当前用户信息:', currentUser);
        } catch (e) {
            console.error('解析token失败:', e);
            isLoggedIn = false;
            currentUser = null;
            localStorage.removeItem('token');
        }
    } else if (!isLoggedIn) {
        currentUser = null;
    }
    
    // 更新按钮显示状态
    document.getElementById('loginBtn').style.display = isLoggedIn ? 'none' : 'block';
    document.getElementById('logoutBtn').style.display = isLoggedIn ? 'block' : 'none';
    document.getElementById('manageDeptBtn').style.display = (isLoggedIn && currentUser?.is_admin) ? 'block' : 'none';
    document.getElementById('manageUserBtn').style.display = (isLoggedIn && currentUser?.is_admin) ? 'block' : 'none';
    document.getElementById('importBtn').style.display = (isLoggedIn && currentUser?.is_admin) ? 'block' : 'none';
    document.getElementById('exportBtn').style.display = (isLoggedIn && currentUser?.is_admin) ? 'block' : 'none';
    document.getElementById('downloadTemplateBtn').style.display = (isLoggedIn && currentUser?.is_admin) ? 'block' : 'none';
    
    // 更新用户状态显示
    const userStatus = document.getElementById('userStatus');
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (isLoggedIn) {
        userStatus.style.display = 'flex';
        usernameDisplay.textContent = currentUser.username;
    } else {
        userStatus.style.display = 'none';
        usernameDisplay.textContent = '';
    }
    
    // 更新操作列显示状态
    const operationColumns = document.querySelectorAll('.operation-column');
    operationColumns.forEach(col => {
        col.style.display = isLoggedIn ? 'table-cell' : 'none';
    });
    
    // 更新操作按钮显示状态
    const operationButtons = document.querySelectorAll('.operation-buttons');
    operationButtons.forEach(btn => {
        if (btn) {
            btn.style.display = isLoggedIn ? 'table-cell' : 'none';
        }
    });
    
    // 不再自动关闭所有模态框
    // 只在登出时关闭模态框
    if (!isLoggedIn) {
        Object.keys(modals).forEach(modalId => {
            hideModal(modalId);
        });
    }
}

// 登录函数
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        alert('请输入用户名和密码');
        return;
    }
    
    try {
        const response = await fetch('/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || '登录失败');
        }
        
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        
        // 更新UI状态
        updateUI();
        
        // 重新加载数据
        const dateInputElement = document.getElementById('date');
        if (dateInputElement) {
            loadDutyInfo(dateInputElement.value);
        } else {
            // 如果找不到日期输入元素，使用当前日期
            const today = new Date().toISOString().split('T')[0];
            loadDutyInfo(today);
        }
        loadDepartments();
        
        // 关闭登录模态框
        hideModal('loginModal');
    } catch (error) {
        console.error('登录错误:', error);
        alert(error.message);
    }
}

// 登出函数
function logout() {
    localStorage.removeItem('token');
    updateUI();
    
    // 获取日期输入元素，添加空值检查
    const dateInputElement = document.getElementById('date');
    if (dateInputElement) {
        loadDutyInfo(dateInputElement.value);
    } else {
        // 如果找不到日期输入元素，使用当前日期
        const today = new Date().toISOString().split('T')[0];
        loadDutyInfo(today);
    }
    
    loadDepartments();
}

// 加载值班信息
async function loadDutyInfo(date) {
    try {
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // 获取当前时间
        const now = new Date();
        const currentHour = now.getHours();
        
        // 如果当前时间在9:00之前，显示前一天的值班信息
        let displayDate = date;
        if (currentHour < 9) {
            const yesterday = new Date(date);
            yesterday.setDate(yesterday.getDate() - 1);
            displayDate = yesterday.toISOString().split('T')[0];
        }
        
        const response = await fetch(`/api/duty-info?date=${displayDate}`, {
            headers: headers
        });
        
        if (!response.ok) {
            throw new Error('获取值班信息失败');
        }
        
        const dutyInfo = await response.json();
        
        // 如果是非管理员用户，只显示自己部门的信息
        if (currentUser && !currentUser.is_admin) {
            const filteredDutyInfo = {};
            for (const [dept, info] of Object.entries(dutyInfo)) {
                if (dept === currentUser.department) {
                    filteredDutyInfo[dept] = info;
                }
            }
            renderDutyTable(filteredDutyInfo);
        } else {
            renderDutyTable(dutyInfo);
        }
    } catch (error) {
        console.error('加载值班信息错误:', error);
        alert('加载值班信息失败');
    }
}

// 检查是否可以操作
function canOperate(date, department) {
    const selectedDate = new Date(date);
    const now = new Date();
    
    // 检查部门权限
    if (!currentUser.is_admin && currentUser.department !== department) {
        return false;
    }
    
    // 检查时间权限
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentSeconds = now.getSeconds();
    
    // 如果当前时间在9:00之前，允许操作前一天的值班信息
    if (currentHour < 9) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        return selectedDate.getTime() === yesterday.getTime();
    }
    
    // 如果当前时间在9:00之后，允许操作当天的值班信息
    return selectedDate.getTime() === now.setHours(0, 0, 0, 0);
}

// 删除值班信息
async function deleteDuty(department) {
    if (!isLoggedIn) {
        alert('请先登录');
        return;
    }

    if (!confirm(`确定要清空 ${department} 的值班人员信息吗？`)) {
        return;
    }

    const date = document.getElementById('date').value;
    if (!date) {
        alert('请先选择日期');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('未登录');

        // 使用 PUT 方法更新值班信息，只清空人员信息
        const response = await fetch(`/api/duty-info/${encodeURIComponent(department)}?date=${date}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                department: department,
                date: date,
                leader_name: '',
                leader_phone: '',
                manager_name: '',
                manager_phone: '',
                member_name: '',
                member_phone: ''
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || '清空值班信息失败');
        }

        // 重新加载值班信息
        await loadDutyInfo(date);
        showToast('值班人员信息已清空');
    } catch (error) {
        console.error('清空值班信息错误:', error);
        alert(error.message);
    }
}

// 渲染值班表格
function renderDutyTable(dutyInfo) {
    const leftTableBody = document.getElementById('leftDutyTableBody');
    const rightTableBody = document.getElementById('rightDutyTableBody');
    leftTableBody.innerHTML = '';
    rightTableBody.innerHTML = '';
    
    // 判断用户是否已登录
    const isLoggedIn = !!currentUser;
    
    // 将部门列表分为两半
    const departments = Object.keys(dutyInfo);
    const midIndex = Math.ceil(departments.length / 2);
    const leftDepartments = departments.slice(0, midIndex);
    const rightDepartments = departments.slice(midIndex);
    
    // 渲染左侧表格
    leftDepartments.forEach(dept => {
        const info = dutyInfo[dept];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${dept}</td>
            <td>${info.leader_name || '-'}<br>${info.leader_phone || '-'}</td>
            <td>${info.manager_name || '-'}<br>${info.manager_phone || '-'}</td>
            <td>${info.member_name || '-'}<br>${info.member_phone || '-'}</td>
            ${isLoggedIn && canOperate(dateInput.value, dept) ? `<td class="operation-buttons">
                <button class="edit-btn" onclick="editDuty('${dept}')">编辑</button>
                <button class="delete-btn" onclick="deleteDuty('${dept}')">清空</button>
            </td>` : ''}
        `;
        leftTableBody.appendChild(row);
    });
    
    // 渲染右侧表格
    rightDepartments.forEach(dept => {
        const info = dutyInfo[dept];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${dept}</td>
            <td>${info.leader_name || '-'}<br>${info.leader_phone || '-'}</td>
            <td>${info.manager_name || '-'}<br>${info.manager_phone || '-'}</td>
            <td>${info.member_name || '-'}<br>${info.member_phone || '-'}</td>
            ${isLoggedIn && canOperate(dateInput.value, dept) ? `<td class="operation-buttons">
                <button class="edit-btn" onclick="editDuty('${dept}')">编辑</button>
                <button class="delete-btn" onclick="deleteDuty('${dept}')">清空</button>
            </td>` : ''}
        `;
        rightTableBody.appendChild(row);
    });
    
    // 更新 UI 状态
    updateUI();
}

// 检查是否可以编辑
function canEdit(dept) {
    if (!currentUser) return false;
    if (currentUser.is_admin) return true;
    return currentUser.department === dept;
}

// 加载部门列表
async function loadDepartments() {
    try {
        const response = await fetch('/api/departments');
        if (response.ok) {
            departments = await response.json();
            renderDepartmentTable(departments);
        } else {
            console.error('加载部门列表失败:', response.status);
        }
    } catch (error) {
        console.error('加载部门列表错误:', error);
    }
}

// 渲染部门表格
function renderDepartmentTable(departments) {
    const leftColumn = document.getElementById('leftColumn');
    const rightColumn = document.getElementById('rightColumn');
    if (!leftColumn || !rightColumn) {
        console.error('找不到部门列表容器元素');
        return;
    }
    
    leftColumn.innerHTML = '';
    rightColumn.innerHTML = '';
    
    if (!departments || departments.length === 0) {
        console.log('没有部门数据');
        return;
    }
    
    departments.forEach((dept, index) => {
        const deptElement = document.createElement('div');
        deptElement.className = 'department-item';
        deptElement.innerHTML = `
            <span>${dept}</span>
            <div class="department-actions">
                <button onclick="editDepartment('${dept}')">编辑</button>
                <button class="delete-department-btn" onclick="deleteDepartment('${dept}')">删除</button>
            </div>
        `;
        
        // 将部门分配到左右两栏
        if (index < 9) {
            leftColumn.appendChild(deptElement);
        } else {
            rightColumn.appendChild(deptElement);
        }
    });
}

// 编辑部门
async function editDepartment(departmentId) {
    const newName = prompt('请输入新的部门名称：', departmentId);
    if (!newName || newName.trim() === '') return;

    try {
        const response = await fetch(`/api/departments/${encodeURIComponent(departmentId)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name: newName.trim() })
        });

        if (response.ok) {
            alert('部门修改成功！');
            await loadDepartments(); // 重新加载部门列表
            loadDutyInfo(dateInput.value); // 重新加载值班信息
        } else {
            const errorData = await response.json();
            alert(errorData.detail || '部门修改失败，请重试！');
        }
    } catch (error) {
        console.error('编辑部门错误:', error);
        alert('部门修改失败，请重试！');
    }
}

// 删除部门
async function deleteDepartment(departmentId) {
    if (!confirm(`确定要删除部门"${departmentId}"吗？\n注意：删除部门将只影响当天及以后的值班信息。`)) return;

    try {
        const response = await fetch(`/api/departments/${encodeURIComponent(departmentId)}?date=${dateInput.value}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            alert('部门删除成功！');
            // 重新加载部门列表，但不关闭模态框
            await loadDepartments();
            // 重新加载值班信息
            loadDutyInfo(dateInput.value);
            // 更新部门管理模态框中的部门列表
            const leftColumn = document.getElementById('leftColumn');
            const rightColumn = document.getElementById('rightColumn');
            if (leftColumn && rightColumn) {
                leftColumn.innerHTML = '';
                rightColumn.innerHTML = '';
                renderDepartmentTable(departments);
            }
        } else {
            const errorData = await response.json();
            alert(errorData.detail || '部门删除失败，请重试！');
        }
    } catch (error) {
        console.error('删除部门错误:', error);
        alert('部门删除失败，请重试！');
    }
}

// 添加部门
async function addDepartment() {
    const name = newDepartmentInput.value.trim();
    if (!name) {
        alert('请输入部门名称');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/departments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                name,
                start_date: dateInput.value  // 添加开始日期
            })
        });

        if (response.ok) {
            newDepartmentInput.value = ''; // 清空输入框
            // 重新加载部门列表
            await loadDepartments();
            // 重新加载值班信息
            loadDutyInfo(dateInput.value);
            // 更新部门管理模态框中的部门列表
            const leftColumn = document.getElementById('leftColumn');
            const rightColumn = document.getElementById('rightColumn');
            if (leftColumn && rightColumn) {
                leftColumn.innerHTML = '';
                rightColumn.innerHTML = '';
                renderDepartmentTable(departments);
            }
        } else {
            const errorData = await response.json();
            alert(errorData.detail || '添加部门失败');
        }
    } catch (error) {
        console.error('添加部门错误:', error);
        alert('添加部门失败，请稍后重试');
    }
}

// 显示模态框
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
    } else {
        console.error(`模态框 ${modalId} 不存在`);
    }
}

// 隐藏模态框
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    } else {
        console.error(`模态框 ${modalId} 不存在`);
    }
}

// 编辑值班信息
async function editDuty(department) {
    if (!isLoggedIn) {
        alert('请先登录');
        return;
    }

    const date = document.getElementById('date').value;
    if (!date) {
        alert('请先选择日期');
        return;
    }

    try {
        console.log(`获取值班信息: 部门=${department}, 日期=${date}`);
        const response = await fetch(`/api/duty-info/${encodeURIComponent(department)}?date=${date}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`获取值班信息失败: ${errorData.detail || response.status}`);
        }

        const data = await response.json();
        console.log('获取到的值班信息:', data);

        // 填充表单
        document.getElementById('editDepartment').value = department;
        document.getElementById('leaderName').value = data.leader_name || '';
        document.getElementById('leaderPhone').value = data.leader_phone || '';
        document.getElementById('managerName').value = data.manager_name || '';
        document.getElementById('managerPhone').value = data.manager_phone || '';
        document.getElementById('memberName').value = data.member_name || '';
        document.getElementById('memberPhone').value = data.member_phone || '';

        // 显示模态框
        showModal('editModal');
    } catch (error) {
        console.error('编辑值班信息错误:', error);
        alert(error.message);
    }
}

// 加载用户列表
async function loadUsers() {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('未登录');
        
        console.log('开始加载用户列表');
        
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('用户列表响应状态:', response.status);
        
        if (!response.ok) {
            let errorMessage = '获取用户列表失败';
            try {
                const errorText = await response.text();
                console.error(`获取用户列表失败: ${response.status} ${errorText}`);
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.detail || errorMessage;
                } catch (parseError) {
                    console.error('解析错误响应失败:', parseError);
                    errorMessage = `${errorMessage} (${response.status})`;
                }
            } catch (e) {
                console.error('读取错误响应失败:', e);
            }
            throw new Error(errorMessage);
        }
        
        const users = await response.json();
        console.log('获取到的用户列表:', users);
        renderUserTable(users);
    } catch (error) {
        console.error('加载用户列表错误:', error);
        userTableBody.innerHTML = `<tr><td colspan="4">加载失败: ${error.message}</td></tr>`;
    }
}

// 渲染用户表格
function renderUserTable(users) {
    userTableBody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.department || '-'}</td>
            <td>${user.is_admin ? '是' : '否'}</td>
            <td>
                <button class="edit-btn" onclick="editUser('${user.username}')">编辑</button>
                <button class="delete-btn" onclick="deleteUser('${user.username}')">删除</button>
            </td>
        `;
        userTableBody.appendChild(row);
    });
}

// 编辑用户
async function editUser(username) {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('未登录');
        
        // 加载部门列表
        const deptResponse = await fetch('/api/departments', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!deptResponse.ok) {
            const errorData = await deptResponse.json();
            throw new Error(errorData.detail || '获取部门列表失败');
        }
        const departments = await deptResponse.json();
        
        // 填充部门下拉框
        const deptSelect = document.getElementById('userDepartment');
        deptSelect.innerHTML = '<option value="">请选择部门</option>';
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            deptSelect.appendChild(option);
        });
        
        // 获取用户信息
        const userResponse = await fetch(`/api/users/${username}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!userResponse.ok) {
            const errorData = await userResponse.json();
            throw new Error(errorData.detail || '获取用户信息失败');
        }
        
        const user = await userResponse.json();
        
        document.getElementById('editUserTitle').textContent = '编辑用户';
        document.getElementById('editUsername').value = user.username;
        document.getElementById('newUsername').value = user.username;
        document.getElementById('userDepartment').value = user.department || '';
        document.getElementById('isAdmin').checked = user.is_admin;
        
        // 显示密码输入框但不是必填
        const passwordInput = document.getElementById('editPassword');
        if (passwordInput) {
            passwordInput.parentElement.style.display = 'block';
            passwordInput.required = false;
        }
        
        // 允许修改用户名
        document.getElementById('newUsername').disabled = false;
        
        showModal('editUserModal');
    } catch (error) {
        console.error('编辑用户错误:', error);
        showToast(error.message, 'error');
    }
}

// 删除用户
async function deleteUser(username) {
    if (!confirm(`确定要删除用户 ${username} 吗？`)) return;
    
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('未登录');
        
        const response = await fetch(`/api/users/${username}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || '删除用户失败');
        }
        
        loadUsers();
    } catch (error) {
        console.error('删除用户错误:', error);
        alert(error.message);
    }
}

// 显示提示消息
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // 添加显示类名触发动画
    setTimeout(() => toast.classList.add('show'), 10);

    // 3秒后移除提示
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 显示个人信息
function showProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        showToast('请先登录', 'error');
        return;
    }
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        document.getElementById('profileUsername').textContent = payload.sub;
        document.getElementById('profileDepartment').textContent = payload.department || '-';
        document.getElementById('profileIsAdmin').textContent = payload.is_admin ? '是' : '否';
        
        // 重置密码表单
        const changePasswordForm = document.getElementById('changePasswordForm');
        if (changePasswordForm) {
            changePasswordForm.reset();
        }
        
        showModal('profileModal');
    } catch (error) {
        console.error('显示个人信息错误:', error);
        showToast('获取个人信息失败', 'error');
    }
}

// 导入值班信息
async function importDutyInfo() {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('未登录');

        // 创建文件输入元素
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls,.csv';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('date', dateInput.value);

            try {
                const response = await fetch('/api/import-duty-info', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || '导入失败');
                }

                showToast('导入成功');
                loadDutyInfo(dateInput.value);
            } catch (error) {
                console.error('导入错误:', error);
                showToast(error.message, 'error');
            }
        };

        input.click();
    } catch (error) {
        console.error('导入错误:', error);
        showToast(error.message, 'error');
    }
}

// 导出值班信息
async function exportDutyInfo() {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('未登录');

        const response = await fetch(`/api/export-duty-info?date=${dateInput.value}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || '导出失败');
        }

        // 获取文件名
        const filename = response.headers.get('Content-Disposition')?.split('filename=')[1] || '值班信息.xlsx';
        
        // 下载文件
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = decodeURIComponent(filename);
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showToast('导出成功');
    } catch (error) {
        console.error('导出错误:', error);
        showToast(error.message, 'error');
    }
}

// 下载导入模板
async function downloadTemplate() {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('未登录');

        const response = await fetch('/api/export-template', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || '下载模板失败');
        }

        // 获取文件名
        const filename = response.headers.get('Content-Disposition')?.split('filename=')[1] || '值班信息导入模板.xlsx';
        
        // 下载文件
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = decodeURIComponent(filename);
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showToast('模板下载成功');
    } catch (error) {
        console.error('下载模板错误:', error);
        showToast(error.message, 'error');
    }
}

function updateDateTime() {
    const now = new Date();
    const currentHour = now.getHours();
    
    // 更新日期显示
    const dateString = `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日\n${now.toLocaleDateString('zh-CN', {
        weekday: 'long'
    })}`;
    document.getElementById('currentDate').textContent = dateString;
    
    // 更新时间显示
    const timeString = now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    document.getElementById('currentTime').textContent = timeString;
    
    // 更新值班时间说明
    const timeInfo = document.querySelector('.time-info');
    if (timeInfo) {
        // 如果当前时间在9:00之前，显示前一天的值班信息
        let displayDate = new Date();
        if (currentHour < 9) {
            displayDate.setDate(displayDate.getDate() - 1);
        }
        
        const formattedDate = `${displayDate.getFullYear()}/${String(displayDate.getMonth() + 1).padStart(2, '0')}/${String(displayDate.getDate()).padStart(2, '0')}`;
        const nextDate = new Date(displayDate.getTime() + 24 * 60 * 60 * 1000);
        const nextFormattedDate = `${nextDate.getFullYear()}/${String(nextDate.getMonth() + 1).padStart(2, '0')}/${String(nextDate.getDate()).padStart(2, '0')}`;
        timeInfo.textContent = `值班时间：\n${formattedDate} 09:00:00 - ${nextFormattedDate} 08:59:59`;
    }
}

// 初始更新时间
updateDateTime();

// 每秒更新一次时间
setInterval(updateDateTime, 1000); 