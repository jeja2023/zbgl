from datetime import datetime, timedelta
import sqlite3
import random

def create_tables():
    # 连接数据库
    conn = sqlite3.connect('duty_system.db')
    cursor = conn.cursor()
    
    # 创建运营中心固定值班人员表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS operation_center_fixed_duty (
            shift INTEGER PRIMARY KEY,
            leader_name TEXT,
            leader_phone TEXT,
            manager_name TEXT,
            manager_phone TEXT,
            member_name TEXT,
            member_phone TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # 创建运营中心值班人员表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS operation_center_duty (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            shift INTEGER NOT NULL,
            backup_name TEXT,
            backup_phone TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(date, shift)
        )
    """)
    
    conn.commit()
    conn.close()
    print("表创建完成！")

def show_tables():
    # 连接数据库
    conn = sqlite3.connect('duty_system.db')
    cursor = conn.cursor()
    
    # 获取所有表名
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print("\n数据库中的表：")
    for table in tables:
        table_name = table[0]
        print(f"\n表名: {table_name}")
        
        # 获取表结构
        cursor.execute(f"PRAGMA table_info({table_name});")
        columns = cursor.fetchall()
        print("字段结构：")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
            
        # 获取记录数
        cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
        count = cursor.fetchone()[0]
        print(f"记录数: {count}")
    
    conn.close()

def create_test_data():
    # 连接数据库
    conn = sqlite3.connect('duty_system.db')
    cursor = conn.cursor()

    # 清空现有数据
    cursor.execute("DELETE FROM operation_center_fixed_duty")
    cursor.execute("DELETE FROM operation_center_duty")

    # 添加运营中心固定值班人员信息（每个班次3名值班领导、3名值班主管、3名值班人员）
    fixed_duty_data = [
        # 1班
        (1, 
         "张三\n李四\n王五", 
         "13800138001\n13800138002\n13800138003",
         "赵六\n钱七\n孙八",
         "13800138004\n13800138005\n13800138006",
         "周九\n吴十\n郑十一",
         "13800138007\n13800138008\n13800138009"),
        # 2班
        (2,
         "王十二\n李十三\n张十四",
         "13800138010\n13800138011\n13800138012",
         "刘十五\n陈十六\n杨十七",
         "13800138013\n13800138014\n13800138015",
         "黄十八\n赵十九\n吴二十",
         "13800138016\n13800138017\n13800138018"),
        # 3班
        (3,
         "周二十一\n吴二十二\n郑二十三",
         "13800138019\n13800138020\n13800138021",
         "王二十四\n李二十五\n张二十六",
         "13800138022\n13800138023\n13800138024",
         "刘二十七\n陈二十八\n杨二十九",
         "13800138025\n13800138026\n13800138027"),
        # 4班
        (4,
         "黄三十\n赵三十一\n吴三十二",
         "13800138028\n13800138029\n13800138030",
         "周三十三\n吴三十四\n郑三十五",
         "13800138031\n13800138032\n13800138033",
         "王三十六\n李三十七\n张三十八",
         "13800138034\n13800138035\n13800138036")
    ]
    
    cursor.executemany("""
        INSERT INTO operation_center_fixed_duty 
        (shift, leader_name, leader_phone, manager_name, manager_phone, member_name, member_phone)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, fixed_duty_data)

    # 添加运营中心备班人员信息（每个班次3名备班人员）
    today = datetime.now().date()
    for i in range(30):  # 添加最近30天的数据
        date = today - timedelta(days=i)
        for shift in range(1, 5):
            backup_names = []
            backup_phones = []
            for j in range(3):  # 每个班次3名备班人员
                backup_names.append(f"备班人员{shift}-{i}-{j+1}")
                backup_phones.append(f"139{random.randint(10000000, 99999999)}")
            
            cursor.execute("""
                INSERT INTO operation_center_duty 
                (date, shift, backup_name, backup_phone)
                VALUES (?, ?, ?, ?)
            """, (date, shift, "\n".join(backup_names), "\n".join(backup_phones)))

    conn.commit()
    conn.close()
    print("测试数据添加完成！")

def set_today_operation_center_duty():
    """设置今天运营中心1班的值班人员信息"""
    # 连接数据库
    conn = sqlite3.connect('duty_system.db')
    cursor = conn.cursor()
    
    # 获取今天的日期
    today = datetime.now().date()
    
    # 设置1班的固定值班人员信息
    cursor.execute("""
        INSERT OR REPLACE INTO operation_center_fixed_duty 
        (shift, leader_name, leader_phone, manager_name, manager_phone, member_name, member_phone)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        1,  # 1班
        "张三\n李四\n王五",  # 值班领导
        "13800138001\n13800138002\n13800138003",  # 领导电话
        "赵六\n钱七\n孙八",  # 值班主管
        "13800138004\n13800138005\n13800138006",  # 主管电话
        "周九\n吴十\n郑十一",  # 值班人员
        "13800138007\n13800138008\n13800138009"  # 人员电话
    ))
    
    # 设置1班的备班人员信息
    cursor.execute("""
        INSERT OR REPLACE INTO operation_center_duty 
        (date, shift, backup_name, backup_phone)
        VALUES (?, ?, ?, ?)
    """, (
        today,  # 今天
        1,  # 1班
        "备班人员1-1\n备班人员1-2\n备班人员1-3",  # 备班人员
        "13911111111\n13922222222\n13933333333"  # 备班电话
    ))
    
    conn.commit()
    conn.close()
    print("今天运营中心1班的值班人员信息设置完成！")

def create_future_operation_center_duty():
    """创建未来30天的运营中心值班人员测试数据"""
    # 连接数据库
    conn = sqlite3.connect('duty_system.db')
    cursor = conn.cursor()
    
    # 获取今天的日期
    today = datetime.now().date()
    
    # 备班人员名单
    backup_personnel = {
        1: [
            ("张备一", "13901111111"),
            ("李备一", "13901111112"),
            ("王备一", "13901111113"),
            ("赵备一", "13901111114"),
            ("钱备一", "13901111115"),
        ],
        2: [
            ("张备二", "13902222221"),
            ("李备二", "13902222222"),
            ("王备二", "13902222223"),
            ("赵备二", "13902222224"),
            ("钱备二", "13902222225"),
        ],
        3: [
            ("张备三", "13903333331"),
            ("李备三", "13903333332"),
            ("王备三", "13903333333"),
            ("赵备三", "13903333334"),
            ("钱备三", "13903333335"),
        ],
        4: [
            ("张备四", "13904444441"),
            ("李备四", "13904444442"),
            ("王备四", "13904444443"),
            ("赵备四", "13904444444"),
            ("钱备四", "13904444445"),
        ]
    }
    
    # 生成未来30天的日期
    for i in range(30):
        current_date = today + timedelta(days=i)
        date_str = current_date.strftime('%Y-%m-%d')
        
        # 为每个班次添加备班人员信息
        for shift in range(1, 5):
            # 随机选择3名备班人员
            selected_personnel = random.sample(backup_personnel[shift], 3)
            backup_names = [p[0] for p in selected_personnel]
            backup_phones = [p[1] for p in selected_personnel]
            
            # 插入备班人员信息
            cursor.execute("""
                INSERT OR REPLACE INTO operation_center_duty 
                (date, shift, backup_name, backup_phone)
                VALUES (?, ?, ?, ?)
            """, (
                date_str,
                shift,
                '\n'.join(backup_names),
                '\n'.join(backup_phones)
            ))
    
    conn.commit()
    conn.close()
    print("未来30天的运营中心值班人员测试数据创建完成！")

if __name__ == "__main__":
    print("正在检查数据库表结构...")
    show_tables()
    
    print("\n是否要创建缺失的表？(y/n)")
    choice = input().lower()
    if choice == 'y':
        create_tables()
        print("\n创建后的表结构：")
        show_tables()
        
        print("\n是否要添加测试数据？(y/n)")
        choice = input().lower()
        if choice == 'y':
            create_test_data()
            print("测试数据已成功添加到数据库！")
            print("\n添加后的表结构：")
            show_tables()
            set_today_operation_center_duty()
            create_future_operation_center_duty() 