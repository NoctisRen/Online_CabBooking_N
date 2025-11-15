#!/bin/bash

# 获取所有行程并逐个删除
curl -s -X GET "http://localhost:8989/trips" | jq -r '.[].tripBookingId' | while read id; do
    echo "Deleting trip $id"
    curl -X DELETE "http://localhost:8989/tripdelete/$id"
    sleep 0.5
done

echo "All trips cleared"