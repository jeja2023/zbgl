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
    
    // 检查登录状态并恢复用户信息
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            currentUser = {
                username: payload.sub,
                is_admin: payload.is_admin,
                department: payload.department
            };
            isLoggedIn = true;
        } catch (e) {
            console.error('解析token失败:', e);
            localStorage.removeItem('token');
            currentUser = null;
            isLoggedIn = false;
        }
    }
    
    // 加载初始数据
    loadDutyInfo(today);
    loadDepartments();
    
    // 初始化日期时间显示
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // 显示日期时间控件
    updateDateTimeControls();
    
    // 更新UI状态
    updateUI();
    
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
                    checkLoginStatus();
                    
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

    // 运营中心值班信息编辑相关
    document.getElementById('editOperationDutyBtn').addEventListener('click', async function() {
        try {
            // 获取当前日期和班次
            const currentShift = getCurrentShift(currentDate);
            
            // 获取当前值班信息
            const response = await fetch(`/api/operation-center-duty?date=${currentDate}`);
            
            if (!response.ok) {
                throw new Error('获取运营中心值班信息失败');
            }
            
            const data = await response.json();
            
            // 设置当前班次
            document.getElementById('operationShift').value = currentShift;
            
            // 清空所有人员列表
            document.getElementById('leaderList').innerHTML = '';
            document.getElementById('managerList').innerHTML = '';
            document.getElementById('memberList').innerHTML = '';
            document.getElementById('backupList').innerHTML = '';
            
            // 填充当前班次的值班人员信息
            await fillDutyPersonnel(currentShift, data);
            
            // 显示模态框
            showModal('editOperationDutyModal');
        } catch (error) {
            console.error('加载运营中心值班信息失败:', error);
            alert('加载运营中心值班信息失败: ' + error.message);
        }
    });

    // 添加班次选择事件监听器
    document.getElementById('operationShift').addEventListener('change', async function() {
        try {
            const selectedShift = this.value;
            
            // 获取值班信息
            const response = await fetch(`/api/operation-center-duty?date=${currentDate}`);
            
            if (!response.ok) {
                throw new Error('获取运营中心值班信息失败');
            }
            
            const data = await response.json();
            
            // 清空所有人员列表
            document.getElementById('leaderList').innerHTML = '';
            document.getElementById('managerList').innerHTML = '';
            document.getElementById('memberList').innerHTML = '';
            document.getElementById('backupList').innerHTML = '';
            
            // 填充选中班次的值班人员信息
            await fillDutyPersonnel(selectedShift, data);
        } catch (error) {
            console.error('加载班次值班信息失败:', error);
            alert('加载班次值班信息失败: ' + error.message);
        }
    });

    // 填充值班人员信息的函数
    async function fillDutyPersonnel(shift, data) {
        try {
            const duty = data[shift];
            if (!duty) return;

            // 处理多人数据
            const processPersonnel = (names, phones, containerId) => {
                const container = document.getElementById(containerId);
                container.innerHTML = '';
                
                if (!names || !phones) return;
                
                // 处理不同的分隔符（\n或、）
                const nameList = names.split(/[\n、]/).filter(n => n.trim());
                const phoneList = phones.split(/[\n、]/).filter(p => p.trim());
                
                nameList.forEach((name, index) => {
                    const phone = phoneList[index] || '';
                    const personnelDiv = document.createElement('div');
                    personnelDiv.className = 'personnel-item';
                    personnelDiv.innerHTML = `
                        <input type="text" class="personnel-name" value="${name.trim()}" placeholder="姓名">
                        <input type="text" class="personnel-phone" value="${phone.trim()}" placeholder="电话">
                        <button type="button" class="remove-personnel-btn" onclick="removePersonnel(this)">删除</button>
                    `;
                    container.appendChild(personnelDiv);
                });
            };

            // 填充各类人员信息
            processPersonnel(duty.leader_name, duty.leader_phone, 'leaderList');
            processPersonnel(duty.manager_name, duty.manager_phone, 'managerList');
            processPersonnel(duty.member_name, duty.member_phone, 'memberList');
            processPersonnel(duty.backup_name, duty.backup_phone, 'backupList');
        } catch (error) {
            console.error('填充值班人员信息失败:', error);
            throw error;
        }
    }

    // 添加表单提交事件监听器
    document.getElementById('editOperationDutyForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const shift = document.getElementById('operationShift').value;
        
        // 收集人员信息
        const collectPersonnel = (type) => {
            const items = document.getElementById(`${type}List`).querySelectorAll('.personnel-item');
            const names = [];
            const phones = [];
            items.forEach(item => {
                const name = item.querySelector('.personnel-name').value.trim();
                const phone = item.querySelector('.personnel-phone').value.trim();
                if (name) {
                    names.push(name);
                    phones.push(phone);
                }
            });
            return {
                names: names.join('\n'),
                phones: phones.join('\n')
            };
        };
        
        const leader = collectPersonnel('leader');
        const manager = collectPersonnel('manager');
        const member = collectPersonnel('member');
        const backup = collectPersonnel('backup');
        
        try {
            // 更新固定值班人员信息
            const fixedDutyResponse = await fetch('/api/operation-center-fixed-duty', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    shift: parseInt(shift),
                    leader_name: leader.names,
                    leader_phone: leader.phones,
                    manager_name: manager.names,
                    manager_phone: manager.phones,
                    member_name: member.names,
                    member_phone: member.phones
                })
            });
            
            if (!fixedDutyResponse.ok) {
                throw new Error('更新固定值班人员信息失败');
            }
            
            // 如果有备班人员信息，更新备班人员信息
            if (backup.names) {
                const backupDutyResponse = await fetch('/api/operation-center-duty', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        date: currentDate,
                        shift: parseInt(shift),
                        backup_name: backup.names,
                        backup_phone: backup.phones
                    })
                });
                
                if (!backupDutyResponse.ok) {
                    throw new Error('更新备班人员信息失败');
                }
            }
            
            alert('值班信息更新成功');
            hideModal('editOperationDutyModal');
            loadOperationCenterDuty();
        } catch (error) {
            console.error('更新值班信息失败:', error);
            alert('更新值班信息失败: ' + error.message);
        }
    });
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
    
    // 获取当前日期
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 获取选择的日期
    const selectedDate = new Date(dateInput.value);
    selectedDate.setHours(0, 0, 0, 0);
    
    // 判断是否是当天
    const isToday = selectedDate.getTime() === today.getTime();
    
    // 更新按钮显示状态
    document.getElementById('loginBtn').style.display = isLoggedIn ? 'none' : 'block';
    document.getElementById('logoutBtn').style.display = isLoggedIn ? 'block' : 'none';
    
    // 管理员按钮显示状态
    const adminButtons = [
        'manageDeptBtn',
        'manageUserBtn',
        'importBtn',
        'exportBtn',
        'downloadTemplateBtn',
        'editOperationDutyBtn'
    ];
    
    adminButtons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            // 导入按钮需要额外检查是否是当天
            if (btnId === 'importBtn') {
                btn.style.display = (isLoggedIn && currentUser?.is_admin && isToday) ? 'block' : 'none';
            } else {
                btn.style.display = (isLoggedIn && currentUser?.is_admin) ? 'block' : 'none';
            }
        }
    });
    
    // 更新运营中心值班人员模块的按钮显示状态
    const operationCenterActions = document.getElementById('operationCenterActions');
    if (operationCenterActions) {
        operationCenterActions.style.display = (isLoggedIn && currentUser?.is_admin) ? 'flex' : 'none';
    }
    
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

// 检查登录状态
async function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (token) {
        try {
            const response = await fetch('/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const user = await response.json();
                document.getElementById('userStatus').style.display = 'block';
                document.getElementById('loginBtn').style.display = 'none';
                document.getElementById('username').textContent = user.username;
                
                // 根据用户角色显示/隐藏按钮
                if (user.is_admin) {
                    document.getElementById('manageDeptBtn').style.display = 'block';
                    document.getElementById('manageUserBtn').style.display = 'block';
                    document.getElementById('importBtn').style.display = 'block';
                    document.getElementById('downloadTemplateBtn').style.display = 'block';
                    document.getElementById('exportBtn').style.display = 'block';
                    document.getElementById('operationCenterActions').style.display = 'flex';
                    document.getElementById('leftOperationHeader').style.display = 'table-cell';
                    document.getElementById('rightOperationHeader').style.display = 'table-cell';
                    document.querySelectorAll('.edit-btn').forEach(btn => {
                        btn.style.display = 'block';
                    });
                } else {
                    document.getElementById('manageDeptBtn').style.display = 'none';
                    document.getElementById('manageUserBtn').style.display = 'none';
                    document.getElementById('importBtn').style.display = 'none';
                    document.getElementById('downloadTemplateBtn').style.display = 'none';
                    document.getElementById('exportBtn').style.display = 'none';
                    document.getElementById('operationCenterActions').style.display = 'none';
                    document.getElementById('leftOperationHeader').style.display = 'none';
                    document.getElementById('rightOperationHeader').style.display = 'none';
                    document.querySelectorAll('.edit-btn').forEach(btn => {
                        btn.style.display = 'none';
                    });
                }
            } else {
                // 如果token无效，清除本地存储并更新UI
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                localStorage.removeItem('isAdmin');
                document.getElementById('userStatus').style.display = 'none';
                document.getElementById('loginBtn').style.display = 'block';
                document.getElementById('manageDeptBtn').style.display = 'none';
                document.getElementById('manageUserBtn').style.display = 'none';
                document.getElementById('importBtn').style.display = 'none';
                document.getElementById('downloadTemplateBtn').style.display = 'none';
                document.getElementById('exportBtn').style.display = 'none';
                document.getElementById('operationCenterActions').style.display = 'none';
                document.getElementById('leftOperationHeader').style.display = 'none';
                document.getElementById('rightOperationHeader').style.display = 'none';
                document.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.style.display = 'none';
                });
            }
        } catch (error) {
            console.error('检查登录状态失败:', error);
            // 发生错误时也清除本地存储并更新UI
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('isAdmin');
            document.getElementById('userStatus').style.display = 'none';
            document.getElementById('loginBtn').style.display = 'block';
            document.getElementById('manageDeptBtn').style.display = 'none';
            document.getElementById('manageUserBtn').style.display = 'none';
            document.getElementById('importBtn').style.display = 'none';
            document.getElementById('downloadTemplateBtn').style.display = 'none';
            document.getElementById('exportBtn').style.display = 'none';
            document.getElementById('operationCenterActions').style.display = 'none';
            document.getElementById('leftOperationHeader').style.display = 'none';
            document.getElementById('rightOperationHeader').style.display = 'none';
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.style.display = 'none';
            });
        }
    } else {
        // 未登录状态
        document.getElementById('userStatus').style.display = 'none';
        document.getElementById('loginBtn').style.display = 'block';
        document.getElementById('manageDeptBtn').style.display = 'none';
        document.getElementById('manageUserBtn').style.display = 'none';
        document.getElementById('importBtn').style.display = 'none';
        document.getElementById('downloadTemplateBtn').style.display = 'none';
        document.getElementById('exportBtn').style.display = 'none';
        document.getElementById('operationCenterActions').style.display = 'none';
        document.getElementById('leftOperationHeader').style.display = 'none';
        document.getElementById('rightOperationHeader').style.display = 'none';
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.style.display = 'none';
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

// 退出登录
async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('isAdmin');
            
            // 更新UI
            document.getElementById('userStatus').style.display = 'none';
            document.getElementById('loginBtn').style.display = 'block';
            document.getElementById('manageDeptBtn').style.display = 'none';
            document.getElementById('manageUserBtn').style.display = 'none';
            document.getElementById('importBtn').style.display = 'none';
            document.getElementById('downloadTemplateBtn').style.display = 'none';
            document.getElementById('exportBtn').style.display = 'none';
            document.getElementById('operationCenterActions').style.display = 'none';
            
            // 隐藏操作列
            document.getElementById('leftOperationHeader').style.display = 'none';
            document.getElementById('rightOperationHeader').style.display = 'none';
            
            // 移除所有编辑按钮
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.style.display = 'none';
            });
            
            showToast('退出登录成功', 'success');
            
            // 立即刷新页面
            window.location.reload();
        } else {
            const error = await response.json();
            showToast(error.detail, 'error');
        }
    } catch (error) {
        showToast('退出登录失败', 'error');
    }
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
        
        // 获取普通部门值班信息
        const response = await fetch(`/api/duty-info?date=${displayDate}`, {
            headers: headers
        });
        
        if (!response.ok) {
            throw new Error('获取值班信息失败');
        }
        
        const dutyInfo = await response.json();
        
        // 获取运营中心值班信息（不需要认证）
        const operationCenterResponse = await fetch(`/api/operation-center-duty?date=${displayDate}`);
        
        if (!operationCenterResponse.ok) {
            throw new Error('获取运营中心值班信息失败');
        }
        
        const operationCenterInfo = await operationCenterResponse.json();
        
        // 获取当前班次
        const currentShift = getCurrentShift(displayDate);
        
        // 更新运营中心值班人员信息
        if (operationCenterInfo[currentShift]) {
            const duty = operationCenterInfo[currentShift];
            
            // 处理多人数据
            const formatPersonnel = (names, phones) => {
                if (!names || !phones) return '-';
                const nameList = names.split('\n').filter(n => n.trim());
                const phoneList = phones.split('\n').filter(p => p.trim());
                const formattedList = nameList.map((name, index) => {
                    const phone = phoneList[index] || '-';
                    return `<div>${name.trim()} ${phone.trim()}</div>`;
                });
                return formattedList.join('');
            };
            
            // 更新所有人员信息，包括备班人员
            document.getElementById('operationLeader').innerHTML = formatPersonnel(duty.leader_name, duty.leader_phone);
            document.getElementById('operationManager').innerHTML = formatPersonnel(duty.manager_name, duty.manager_phone);
            document.getElementById('operationMember').innerHTML = formatPersonnel(duty.member_name, duty.member_phone);
            document.getElementById('operationBackup').innerHTML = formatPersonnel(duty.backup_name, duty.backup_phone);
            
            // 更新当前班次显示
            const shiftElement = document.getElementById('currentShift');
            if (shiftElement) {
                shiftElement.textContent = `${currentShift}班`;
            }
        } else {
            // 如果没有找到当前班次的信息，显示默认值
            document.getElementById('operationLeader').innerHTML = '-';
            document.getElementById('operationManager').innerHTML = '-';
            document.getElementById('operationMember').innerHTML = '-';
            document.getElementById('operationBackup').innerHTML = '-';
            document.getElementById('currentShift').textContent = '-';
        }
        
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
        alert(error.message);
    }
}

// 检查是否可以操作
function canOperate(date, department) {
    // 如果未登录，不允许操作
    if (!isLoggedIn || !currentUser) {
        return false;
    }
    
    // 如果是管理员，允许操作所有部门的值班信息
    if (currentUser.is_admin) {
        return true;
    }
    
    // 非管理员用户只能操作自己部门的值班信息
    if (currentUser.department !== department) {
        return false;
    }
    
    // 检查时间权限
    const selectedDate = new Date(date);
    const now = new Date();
    const currentHour = now.getHours();
    
    // 如果当前时间在9:00之前，允许操作前一天的值班信息
    if (currentHour < 9) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        return selectedDate.toDateString() === yesterday.toDateString();
    }
    
    // 如果当前时间在9:00之后，允许操作当天的值班信息
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate.toDateString() === today.toDateString();
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
            ${isLoggedIn ? `<td class="operation-buttons">
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
            ${isLoggedIn ? `<td class="operation-buttons">
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
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('未登录或登录已过期');
        }

        // 获取当前值班信息
        const response = await fetch(`/api/duty-info/${encodeURIComponent(department)}?date=${dateInput.value}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('获取值班信息失败');
        }
        
        const dutyInfo = await response.json();
        
        // 填充表单
        document.getElementById('editDepartment').value = department;
        document.getElementById('leaderName').value = dutyInfo.leader_name || '';
        document.getElementById('leaderPhone').value = dutyInfo.leader_phone || '';
        document.getElementById('managerName').value = dutyInfo.manager_name || '';
        document.getElementById('managerPhone').value = dutyInfo.manager_phone || '';
        document.getElementById('memberName').value = dutyInfo.member_name || '';
        document.getElementById('memberPhone').value = dutyInfo.member_phone || '';
        
        // 显示编辑模态框
        showModal('editModal');
    } catch (error) {
        console.error('编辑值班信息错误:', error);
        showToast(error.message, 'error');
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

// 更新日期时间控件显示
function updateDateTimeControls() {
    const dateTimeControls = document.getElementById('dateTimeControls');
    if (dateTimeControls) {
        dateTimeControls.style.display = 'block';
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

// 获取当前班次
function getCurrentShift(date = null) {
    const now = date ? new Date(date) : new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // 获取目标日期是今年的第几天
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    
    // 计算当前是第几个班次（1-4）
    const shift = (day % 4) + 1;
    
    // 如果是凌晨0点到上午8:59:59，应该显示前一天的班次
    if (hours < 9) {
        // 获取前一天的日期
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // 获取前一天的班次
        const yesterdayStart = new Date(yesterday.getFullYear(), 0, 0);
        const yesterdayDiff = yesterday - yesterdayStart;
        const yesterdayDay = Math.floor(yesterdayDiff / oneDay);
        const yesterdayShift = (yesterdayDay % 4) + 1;
        
        return yesterdayShift;
    }
    
    // 9点以后显示当天的班次
    return shift;
}

// 修改loadOperationCenterDuty函数
async function loadOperationCenterDuty() {
    try {
        const currentDate = new Date().toISOString().split('T')[0];
        const currentShift = getCurrentShift(currentDate);
        
        // 获取运营中心值班信息
        const response = await fetch(`/api/operation-center-duty?date=${currentDate}`);
        if (!response.ok) {
            throw new Error('获取运营中心值班信息失败');
        }
        
        const data = await response.json();
        
        // 更新当前班次显示
        const shiftElement = document.getElementById('currentShift');
        if (shiftElement) {
            shiftElement.textContent = `${currentShift}班`;
        }
        
        if (data[currentShift]) {
            const duty = data[currentShift];
            
            // 处理多人数据
            const formatPersonnel = (names, phones, title) => {
                if (!names || !phones) return '-';
                const nameList = names.split('、').filter(n => n.trim());
                const phoneList = phones.split('、').filter(p => p.trim());
                const formattedList = nameList.map((name, index) => {
                    const phone = phoneList[index] || '-';
                    return `<div><span class="duty-title">${title}：</span><span class="duty-content">${name.trim()} ${phone.trim()}</span></div>`;
                });
                return formattedList.join('');
            };
            
            // 使用innerHTML来确保换行正确显示
            document.getElementById('operationLeader').innerHTML = formatPersonnel(duty.leader_name, duty.leader_phone, '值班领导');
            document.getElementById('operationManager').innerHTML = formatPersonnel(duty.manager_name, duty.manager_phone, '值班主管');
            document.getElementById('operationMember').innerHTML = formatPersonnel(duty.member_name, duty.member_phone, '值班人员');
            document.getElementById('operationBackup').innerHTML = formatPersonnel(duty.backup_name, duty.backup_phone, '备班人员');
        } else {
            // 如果没有找到当前班次的信息，显示默认值
            document.getElementById('operationLeader').innerHTML = '-';
            document.getElementById('operationManager').innerHTML = '-';
            document.getElementById('operationMember').innerHTML = '-';
            document.getElementById('operationBackup').innerHTML = '-';
            document.getElementById('currentShift').textContent = '-';
        }
    } catch (error) {
        console.error('加载运营中心值班信息失败:', error);
        // 发生错误时显示默认值
        document.getElementById('currentShift').textContent = '-';
        document.getElementById('operationLeader').innerHTML = '-';
        document.getElementById('operationManager').innerHTML = '-';
        document.getElementById('operationMember').innerHTML = '-';
        document.getElementById('operationBackup').innerHTML = '-';
    }
}

// 修改checkAdminStatus函数
async function checkAdminStatus() {
    try {
        const response = await fetch('/api/users/me', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('获取用户信息失败');
        }
        
        const user = await response.json();
        const isAdmin = user.is_admin;
        
        // 显示/隐藏编辑按钮
        document.getElementById('editDutyBtn').style.display = isAdmin ? 'block' : 'none';
        document.getElementById('editOperationDutyBtn').style.display = isAdmin ? 'block' : 'none';
        document.getElementById('manageDeptBtn').style.display = isAdmin ? 'block' : 'none';
        document.getElementById('manageUserBtn').style.display = isAdmin ? 'block' : 'none';
        document.getElementById('importBtn').style.display = isAdmin ? 'block' : 'none';
        document.getElementById('downloadTemplateBtn').style.display = isAdmin ? 'block' : 'none';
        document.getElementById('exportBtn').style.display = isAdmin ? 'block' : 'none';
        
        return isAdmin;
    } catch (error) {
        console.error('检查管理员状态失败:', error);
        return false;
    }
}

// 添加人员
function addPersonnel(type) {
    const list = document.getElementById(`${type}List`);
    const item = document.createElement('div');
    item.className = 'personnel-item';
    item.innerHTML = `
        <div class="form-group">
            <input type="text" placeholder="姓名" class="personnel-name">
            <input type="text" placeholder="电话" class="personnel-phone">
            <button type="button" class="delete-personnel-btn" onclick="deletePersonnel(this)">删除</button>
        </div>
    `;
    list.appendChild(item);
}

// 删除人员
function deletePersonnel(button) {
    const item = button.closest('.personnel-item');
    item.remove();
}

// 导入运营中心值班信息
async function importOperationDuty() {
    const fileInput = document.getElementById('importOperationDutyFile');
    const file = fileInput.files[0];
    
    if (!file) {
        return;
    }
    
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        alert('请选择 Excel 文件');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/operation-center-duty/import', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || '导入运营中心值班信息失败');
        }
        
        const result = await response.json();
        alert(result.message || '导入成功');
        loadOperationCenterDuty();
    } catch (error) {
        console.error('导入运营中心值班信息错误:', error);
        alert(error.message);
    } finally {
        fileInput.value = '';
    }
}

// 下载运营中心值班人员导入模板
function downloadOperationTemplate() {
    fetch('/api/operation_center/template')
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = '运营中心值班人员导入模板.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        })
        .catch(error => {
            console.error('下载模板失败:', error);
            alert('下载模板失败，请重试');
        });
} 