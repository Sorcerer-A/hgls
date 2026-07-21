import logging
from pathlib import Path
from jinja2 import Environment, FileSystemLoader

logger = logging.getLogger(__name__)

_templates_dir = Path(__file__).parent.parent / "templates"
_env = Environment(loader=FileSystemLoader(str(_templates_dir)))


def generate_prompt(template_key: str, fields: dict[str, str]) -> str:
    """根据模板 key 和用户填写的字段，渲染出完整的生成提示词。"""
    template = _env.get_template(f"{template_key}.j2")
    return template.render(fields=fields)


def get_template_info(template_key: str) -> dict:
    """获取模板的元信息（名称、描述、必填字段）。"""
    from config import TEMPLATES
    return TEMPLATES.get(template_key, {})
