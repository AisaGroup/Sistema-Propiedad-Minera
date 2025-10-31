from jinja2 import Environment, FileSystemLoader

def render_expedientes_html(expedientes):
    env = Environment(loader=FileSystemLoader('backend/templates'))
    template = env.get_template('expedientes_report.html')
    return template.render(expedientes=expedientes)
