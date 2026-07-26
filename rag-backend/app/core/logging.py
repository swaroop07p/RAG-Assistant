import logging
import sys

def setup_logging():
    logger = logging.getLogger("rag_app")
    logger.setLevel(logging.INFO)
    
    formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)s in %(module)s (%(lineno)d): %(message)s"
    )

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    
    if not logger.handlers:
        logger.addHandler(console_handler)

    return logger

logger = setup_logging()