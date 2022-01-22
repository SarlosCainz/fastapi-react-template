import logging


def get_logger(name, level):
    logger = logging.getLogger(name)
    if not logger.hasHandlers():
        handler = logging.StreamHandler()
        handler.setLevel(level)
        handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(funcName)s: %(message)s"))
        logger.addHandler(handler)
    logger.setLevel(level)
    logger.propagate = False

    return logger
