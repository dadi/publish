#!/bin/bash
for filename in "$1"/*; do
  curl -F "file=@$filename" -F channels=$SLACK_CHANNEL -H "Authorization: Bearer $SLACK_TOKEN" https://slack.com/api/files.upload
done