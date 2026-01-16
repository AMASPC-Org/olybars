# Deployment Safety

**Pre-flight Check:** Before any `gcloud` command, you MUST run `cat server/package.json` to verify the file exists and contains a valid `start` script. If missing, ABORT.

**Standard Protocol:** ALWAYS run `cat server/package.json` before `gcloud run deploy`.
