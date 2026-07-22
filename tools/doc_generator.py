from __future__ import annotations
import logging
from pathlib import Path
from jinja2 import Environment, BaseLoader, Template

logger = logging.getLogger(__name__)

_templates_dir = Path(__file__).parent.parent / "templates"
# 文件系统加载器用于默认模板
_file_env = Environment(loader=FileSystemLoader(str(_templates_dir)))

# 自定义模板缓存（从 settings 加载后缓存于此）
_custom_templates: dict[str, str] = {}


def set_custom_template(key: str, prompt: str):
    """注入用户自定义模板"""
    _custom_templates[key] = prompt


def _load_template(key: str) -> Template:
    """加载模板：优先自定义，回退默认 .j2 文件"""
    if key in _custom_templates and _custom_templates[key].strip():
        return Environment(loader=BaseLoader()).from_string(_custom_templates[key])
    return _file_env.get_template(f"{key}.j2")


def generate_prompt(template_key: str, fields: dict[str, str]) -> str:
    """根据模板 key 和用户填写的字段，渲染出完整的生成提示词。"""
    template = _load_template(template_key)
    return template.render(fields=fields)


def get_template_info(template_key: str) -> dict:
    """获取模板的元信息（名称、描述、必填字段）。"""
    from config import TEMPLATES
    return TEMPLATES.get(template_key, {})
