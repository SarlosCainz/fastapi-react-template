#!/bin/bash

nginx
exec gunicorn app:app -w 2 -k uvicorn.workers.UvicornWorker
