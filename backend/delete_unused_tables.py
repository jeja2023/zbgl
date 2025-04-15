import sqlite3
import logging
from pathlib import Path

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('delete_tables.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def delete_unused_tables():
    try:
        # 获取数据库路径
        BASE_DIR = Path(__file__).resolve().parent
        DATABASE = str(BASE_DIR / "duty_system.db")
        
        # 数据库连接参数
        DB_PARAMS = {
            "check_same_thread": False,
            "timeout": 30,
            "isolation_level": None,
            "cached_statements": 100,
            "uri": True
        }
        
        # 连接数据库
        with sqlite3.connect(f"file:{DATABASE}?cache=shared", **DB_PARAMS) as conn:
            cursor = conn.cursor()
            
            # 检查表是否存在
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('departments', 'duty_history')")
            tables = cursor.fetchall()
            
            if not tables:
                logger.info("未找到需要删除的表")
                return
            
            # 删除表
            for table in tables:
                table_name = table[0]
                cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
                logger.info(f"已删除表: {table_name}")
            
            conn.commit()
            logger.info("删除操作完成")
            
    except Exception as e:
        logger.error(f"删除表时发生错误: {str(e)}")
        raise

if __name__ == "__main__":
    logger.info("开始删除未使用的表...")
    delete_unused_tables()
    logger.info("操作完成") 