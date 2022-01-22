#!/bin/bash

nginx
gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker
